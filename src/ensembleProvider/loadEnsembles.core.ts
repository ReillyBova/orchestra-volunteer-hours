import type { ConcertCycle, EnsembleConfig, EnsembleManifest, EnsembleRegistry } from './ensemble.types';
import { ConcertCycleSchema, EnsembleManifestSchema } from './ensemble.schemas';

type ManifestEntry = { ensembleDir: string; raw: unknown };
type CycleEntry = { ensembleDir: string; cycleId: string; raw: unknown };

type ResolveLogoUrl = (maybePath?: string) => string | undefined;

type Parsed = {
   manifests: ManifestEntry[];
   cycles: CycleEntry[];
};

const sortCycles = (cycles: ConcertCycle[]) =>
   [...cycles].sort((a, b) => b.cycleDate.localeCompare(a.cycleDate) || a.label.localeCompare(b.label));

export const buildRegistryFromRaw = (
   { manifests, cycles }: Parsed,
   resolveLogoUrl: ResolveLogoUrl
): EnsembleRegistry => {
   const parsedManifests = manifests.map(({ ensembleDir, raw }) => {
      const parsedManifest = EnsembleManifestSchema.parse(raw);

      const manifest: EnsembleManifest = {
         ...parsedManifest,
         id: ensembleDir,
         logoUrl: resolveLogoUrl(parsedManifest.logoUrl),
      };

      return { ensembleDir, manifest };
   });

   const parsedCycles = cycles.map(({ ensembleDir, cycleId, raw }) => {
      const parsedCycle = ConcertCycleSchema.parse(raw);
      const cycle: ConcertCycle = { ...parsedCycle, id: cycleId };
      return { ensembleDir, cycle };
   });

   const cyclesByEnsembleDir = parsedCycles.reduce<Record<string, ConcertCycle[]>>((acc, { ensembleDir, cycle }) => {
      (acc[ensembleDir] ??= []).push(cycle);
      return acc;
   }, {});

   const ensembles: EnsembleConfig[] = parsedManifests.map(({ ensembleDir, manifest }) => {
      const ensembleCycles = sortCycles(cyclesByEnsembleDir[ensembleDir] ?? []);
      return { ...manifest, cycles: ensembleCycles };
   });

   const byId = Object.fromEntries(ensembles.map((e) => [e.id, e]));
   return { ensembles, byId };
};
