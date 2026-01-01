import * as React from 'react';

import { clamp, formatDay, minMaxIsoDate, minutesBetween } from './volunteerHours.utils';

import type { EnsembleConfig } from '../../ensembleProvider/ensemble.types';

export type Participation = { selected: boolean; downtimeMinutes: number; downtimeDraft?: string };
export type ParticipationByIndex = Record<number, Participation>;

export type SelectedCredit = {
   idx: number;
   label: string;
   date: string;
   credited: number;
   downtime: number;
};

const DEFAULT_ROLE = 'Musician';

const createDefaultParticipation = (cycle?: EnsembleConfig['cycles'][number]): ParticipationByIndex => {
   if (!cycle) return {};

   return Object.fromEntries(
      cycle.events.map((e, idx) => [
         idx,
         { selected: false, downtimeMinutes: e.breakTime ?? 0, downtimeDraft: String(e.breakTime ?? '') },
      ])
   );
};

const computeCreditedMinutes = (args: {
   start: string;
   stop: string;
   downtimeMinutes: number | undefined;
}): { duration: number; downtime: number; credited: number } => {
   const duration = minutesBetween(args.start, args.stop);
   const downtime = clamp(args.downtimeMinutes ?? 0, 0, duration);
   const credited = Math.max(0, duration - downtime);
   return { duration, downtime, credited };
};

const computeSelectedCredits = (args: {
   cycle?: EnsembleConfig['cycles'][number];
   participation: ParticipationByIndex;
}): SelectedCredit[] => {
   const { cycle, participation } = args;
   if (!cycle) return [];

   const out: SelectedCredit[] = [];

   cycle.events.forEach((e, idx) => {
      const state = participation[idx];
      if (!state?.selected) return;

      const { downtime, credited } = computeCreditedMinutes({
         start: e.start,
         stop: e.stop,
         downtimeMinutes: state.downtimeMinutes,
      });

      out.push({
         idx,
         label: e.label,
         date: e.date,
         credited,
         downtime,
      });
   });

   return out;
};

const computeMatchedMinutes = (selectedCredits: SelectedCredit[]) =>
   selectedCredits.reduce((sum, x) => sum + x.credited, 0);

const computeDateRange = (selectedCredits: SelectedCredit[]) => {
   const mm = minMaxIsoDate(selectedCredits.map((x) => x.date));
   if (!mm) return undefined;
   return `${formatDay(mm.min)} – ${formatDay(mm.max)}`;
};

const computeMathLine = (selectedCredits: SelectedCredit[], matchedMinutes: number) => {
   if (!selectedCredits.length) return `Total = 0 min`;
   const parts = selectedCredits.map((x) => `${x.credited}`);
   return `Total${parts.length > 1 ? ` = ${parts.join(' + ')}` : ``} = ${matchedMinutes} min`;
};

const buildSelectedLines = (args: {
   cycle: EnsembleConfig['cycles'][number];
   participation: ParticipationByIndex;
}): string => {
   const { cycle, participation } = args;

   const lines: string[] = [];

   cycle.events.forEach((e, idx) => {
      const state = participation[idx];
      if (!state?.selected) return;

      const { downtime, credited } = computeCreditedMinutes({
         start: e.start,
         stop: e.stop,
         downtimeMinutes: state.downtimeMinutes,
      });

      lines.push(
         [
            `• ${e.label}: ${formatDay(e.date)} (${e.start}–${e.stop})`,
            `  - Duration: ${credited} min${downtime ? ` (excludes ${downtime} min break)` : ''};`,
         ].join('\n')
      );
   });

   return lines.join('\n');
};

const buildGeneratedOutput = (args: {
   ensemble: EnsembleConfig;
   cycle: EnsembleConfig['cycles'][number];
   orgName: string;
   eventName: string;
   description: string;
   role: string;
   instrument: string;
   participation: ParticipationByIndex;
   mathLine: string;
}): string => {
   const roleLine = args.instrument.trim() ? `${args.role.trim()} (${args.instrument.trim()})` : args.role.trim();

   const selectedLines = buildSelectedLines({
      cycle: args.cycle,
      participation: args.participation,
   });

   return [
      `Memo: ${args.orgName} — ${args.eventName}`,
      `Role: Volunteer ${roleLine}`,
      `\nDescription: ${args.description}`,
      `\nEvents: \n ${selectedLines || `• (no events selected)`}\n\n${args.mathLine}`,
   ].join(';\n');
};

export const useVolunteerHoursModel = ({
   ensemble,
   cycle,
}: {
   ensemble?: EnsembleConfig;
   cycle?: EnsembleConfig['cycles'][number];
}) => {
   const [role, setRole] = React.useState(DEFAULT_ROLE);
   const [instrument, setInstrument] = React.useState('');

   const [orgName, setOrgName] = React.useState('');
   const [eventName, setEventName] = React.useState('');
   const [description, setDescription] = React.useState('');

   const [participation, setParticipation] = React.useState<ParticipationByIndex>({});

   // Hydrate org defaults on selection change (use stable deps, not whole objects)
   React.useEffect(() => {
      if (!ensemble || !cycle) return;
      setOrgName(ensemble.name);
      setEventName(cycle.memo ?? cycle.label);
      setDescription(cycle.defaultDescription);
   }, [ensemble, cycle]);

   // Hydrate participation defaults on cycle change
   React.useEffect(() => {
      if (!cycle) return;
      setParticipation(createDefaultParticipation(cycle));
   }, [cycle]);

   // Derived: selectedCredits => matchedMinutes/dateRange/mathLine
   // These are cheap, but memo keeps referential stability for consumers.
   const selectedCredits = React.useMemo(
      () => computeSelectedCredits({ cycle, participation }),
      [cycle, participation]
   );

   const matchedMinutes = React.useMemo(() => computeMatchedMinutes(selectedCredits), [selectedCredits]);

   const hasSelection = selectedCredits.length > 0;

   const dateRange = React.useMemo(() => computeDateRange(selectedCredits), [selectedCredits]);

   const mathLine = React.useMemo(
      () => computeMathLine(selectedCredits, matchedMinutes),
      [selectedCredits, matchedMinutes]
   );

   const generatedOutput = React.useMemo(() => {
      if (!ensemble || !cycle) return '';

      return buildGeneratedOutput({
         ensemble,
         cycle,
         orgName,
         eventName,
         description,
         role,
         instrument,
         participation,
         mathLine,
      });
   }, [ensemble, cycle, orgName, eventName, description, role, instrument, participation, mathLine]);

   // Draft sync state machine
   const [draftOutput, setDraftOutput] = React.useState('');
   const [hasManualEdits, setHasManualEdits] = React.useState(false);
   const [lastGeneratedApplied, setLastGeneratedApplied] = React.useState('');

   React.useEffect(() => {
      if (!hasSelection) {
         setDraftOutput('');
         setHasManualEdits(false);
         setLastGeneratedApplied('');
         return;
      }

      if (!hasManualEdits) {
         setDraftOutput(generatedOutput);
         setLastGeneratedApplied(generatedOutput);
      }
   }, [hasSelection, hasManualEdits, generatedOutput]);

   const showStaleWarning = hasManualEdits && !!lastGeneratedApplied && generatedOutput !== lastGeneratedApplied;

   const onDraftChange = React.useCallback(
      (next: string) => {
         setDraftOutput(next);
         const nowManual = next !== generatedOutput;
         setHasManualEdits(nowManual);
         if (!nowManual) setLastGeneratedApplied(generatedOutput);
      },
      [generatedOutput]
   );

   const regenerateText = React.useCallback(() => {
      setDraftOutput(generatedOutput);
      setHasManualEdits(false);
      setLastGeneratedApplied(generatedOutput);
   }, [generatedOutput]);

   const resetUserInfoDefaults = React.useCallback(() => {
      setRole(DEFAULT_ROLE);
      setInstrument('');
   }, []);

   const resetOrganizationDefaults = React.useCallback(() => {
      setOrgName(ensemble?.name ?? '');
      setEventName(cycle?.label ?? '');
      setDescription(cycle?.defaultDescription ?? '');
   }, [ensemble?.name, cycle?.label, cycle?.defaultDescription]);

   const resetParticipationDefaults = React.useCallback(() => {
      if (!cycle) return;
      setParticipation(createDefaultParticipation(cycle));
   }, [cycle]);

   return {
      // inputs
      role,
      setRole,
      instrument,
      setInstrument,
      orgName,
      setOrgName,
      eventName,
      setEventName,
      description,
      setDescription,
      participation,
      setParticipation,

      // resets
      resetUserInfoDefaults,
      resetOrganizationDefaults,
      resetParticipationDefaults,

      // derived
      selectedCredits,
      matchedMinutes,
      hasSelection,
      dateRange,
      mathLine,
      generatedOutput,

      // draft
      draftOutput,
      onDraftChange,
      showStaleWarning,
      regenerateText,
      canCopy: hasSelection && draftOutput.length > 0,
   };
};
