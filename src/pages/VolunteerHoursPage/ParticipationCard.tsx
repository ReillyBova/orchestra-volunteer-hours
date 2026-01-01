import * as React from 'react';

import { SettingsBackupRestore } from '@mui/icons-material';
import {
    alpha, Card, CardContent, Grid, IconButton, Paper, Stack, TextField, ToggleButton,
    ToggleButtonGroup, Tooltip, Typography
} from '@mui/material';

import { MarkdownText } from '../../components/MarkdownText/MarkdownText';

import type { Participation } from './volunteerHours.model';

export type ParticipationByIndex = Record<number, Participation>;

type Props = {
   events: Array<{ label: string; date: string; start: string; stop: string; breakTime?: number }>;
   participation: ParticipationByIndex;
   onChangeParticipation: (idx: number, next: Participation) => void;
   onReset: () => void;

   formatDay: (iso: string) => string;
   minutesBetween: (start: string, stop: string) => number;
   clamp: (n: number, min: number, max: number) => number;
};

type DraftByIndex = Record<number, string>;

const normalizeDigits = (s: string) => {
   // allow empty and digits only
   if (!/^\d*$/.test(s)) return null;
   // optional: strip leading zeros while typing (keep single "0" if that's all they typed)
   if (s.length > 1) return s.replace(/^0+/, '') || '0';
   return s;
};

export const ParticipationCard = ({
   events,
   participation,
   onChangeParticipation,
   onReset,
   formatDay,
   minutesBetween,
   clamp,
}: Props) => {
   // Local draft strings so the user can clear the field without React forcing "0"
   const [draftByIdx, setDraftByIdx] = React.useState<DraftByIndex>({});

   // Ensure drafts exist for current events (and prune old indices)
   React.useEffect(() => {
      setDraftByIdx((prev) => {
         const next: DraftByIndex = { ...prev };

         events.forEach((e, idx) => {
            if (next[idx] !== undefined) return;
            const committed = participation[idx]?.downtimeMinutes ?? e.breakTime ?? 0;
            next[idx] = committed === 0 ? '' : String(committed);
         });

         Object.keys(next).forEach((k) => {
            const i = Number(k);
            if (!Number.isFinite(i) || i < 0 || i >= events.length) delete next[i];
         });

         return next;
      });
   }, [events, participation]);

   const handleReset = () => {
      onReset();
      // also reset drafts to the committed/default values
      setDraftByIdx(() => {
         const next: DraftByIndex = {};
         events.forEach((e, idx) => {
            const committed = participation[idx]?.downtimeMinutes ?? e.breakTime ?? 0;
            next[idx] = committed === 0 ? '' : String(committed);
         });
         return next;
      });
   };

   return (
      <Card>
         <CardContent>
            <Stack spacing={2}>
               <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={700}>{`Participation`}</Typography>
                  <Tooltip title="Restore defaults">
                     <IconButton size="small" onClick={handleReset}>
                        <SettingsBackupRestore fontSize="small" />
                     </IconButton>
                  </Tooltip>
               </Stack>

               <MarkdownText typographyProps={{ variant: 'body2', color: 'text.secondary' }}>
                  {`For employer matching, only include time you were actually needed on-site for the event. Use **Downtime** for stretches when the ensemble was on break or you were not called.`}
               </MarkdownText>

               <Grid container spacing={1}>
                  {events.map((e, idx) => {
                     const state = participation[idx] ?? { selected: false, downtimeMinutes: e.breakTime ?? 0 };

                     const durationMin = minutesBetween(e.start, e.stop);
                     const breakMin = e.breakTime ?? 0;

                     const draft =
                        draftByIdx[idx] ?? (state.downtimeMinutes === 0 ? '' : String(state.downtimeMinutes));

                     return (
                        <Grid key={idx} size={{ xs: 12, lg: 6 }}>
                           <Paper
                              variant="outlined"
                              sx={(theme) => ({
                                 p: 2,
                                 borderRadius: 2,
                                 height: '100%',
                                 boxShadow: state.selected
                                    ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.18)}`
                                    : 'none',
                                 borderColor: state.selected ? theme.palette.primary.main : theme.palette.divider,
                                 transition: theme.transitions.create(['border-color', 'box-shadow'], {
                                    duration: theme.transitions.duration.shortest,
                                    easing: theme.transitions.easing.easeOut,
                                 }),
                              })}
                           >
                              <Stack spacing={1.25} sx={{ height: '100%' }}>
                                 <Stack spacing={0.25}>
                                    <Typography variant="body1" fontWeight={800}>
                                       {e.label}
                                    </Typography>
                                    <Typography>{formatDay(e.date)}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                       {`${e.start}–${e.stop}`}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                       {`${durationMin} min duration${breakMin ? ` / ${breakMin} min break` : ''}`}
                                    </Typography>
                                 </Stack>

                                 <div style={{ flexGrow: 1 }} />

                                 <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={1.5}
                                    alignItems={{ xs: 'stretch', sm: 'center' }}
                                 >
                                    <ToggleButtonGroup
                                       exclusive
                                       value={state.selected ? 'yes' : 'no'}
                                       onChange={(_, next) => {
                                          if (!next) return;

                                          const selected = next === 'yes';
                                          const downtimeMinutes = state.downtimeMinutes ?? e.breakTime ?? 0;

                                          onChangeParticipation(idx, { selected, downtimeMinutes });

                                          // seed the draft when turning ON so it doesn't jump to undefined/old values
                                          if (selected) {
                                             setDraftByIdx((prev) => ({
                                                ...prev,
                                                [idx]: downtimeMinutes === 0 ? '' : String(downtimeMinutes),
                                             }));
                                          }
                                       }}
                                       size="small"
                                       sx={{ '& .MuiToggleButton-root': { px: 2 } }}
                                    >
                                       <ToggleButton value="yes" color="primary">{`Yes`}</ToggleButton>
                                       <ToggleButton value="no">{`No`}</ToggleButton>
                                    </ToggleButtonGroup>

                                    <TextField
                                       label="Downtime (min)"
                                       type="text"
                                       inputMode="numeric"
                                       value={draft}
                                       disabled={!state.selected}
                                       onChange={(e) => {
                                          const normalized = normalizeDigits(e.target.value);
                                          if (normalized === null) return;
                                          setDraftByIdx((prev) => ({ ...prev, [idx]: normalized }));
                                       }}
                                       onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                             e.preventDefault();
                                             (e.target as HTMLInputElement).blur();
                                          }
                                       }}
                                       onBlur={() => {
                                          const raw = draft === '' ? 0 : Number(draft);
                                          const clampedVal = clamp(Number.isFinite(raw) ? raw : 0, 0, durationMin);

                                          onChangeParticipation(idx, {
                                             selected: state.selected,
                                             downtimeMinutes: clampedVal,
                                          });

                                          setDraftByIdx((prev) => ({
                                             ...prev,
                                             [idx]: clampedVal === 0 ? '' : String(clampedVal),
                                          }));
                                       }}
                                       sx={{ width: { xs: '100%', sm: 180 } }}
                                    />
                                 </Stack>
                              </Stack>
                           </Paper>
                        </Grid>
                     );
                  })}
               </Grid>
            </Stack>
         </CardContent>
      </Card>
   );
};
