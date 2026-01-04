import type { ConcertCycle, EnsembleConfig, EnsembleManifest, EnsembleRegistry } from './ensemble.types';
import { ConcertCycleSchema, EnsembleManifestSchema } from './ensemble.schemas';

type ManifestEntry = { ensembleDir: string; raw: unknown };
type CycleEntry = { ensembleDir: string; cycleId: string; raw: unknown };

type ResolveLogoUrl = (maybePath?: string) => string | undefined;

type Parsed = {
   manifests: ManifestEntry[];
   cycles: CycleEntry[];
};

type SourceLoader = { path: string; load: () => Promise<unknown> };

type ParsedPath = { kind: 'manifest'; ensembleDir: string } | { kind: 'cycle'; ensembleDir: string; cycleId: string };

const parseEnsemblePath = (path: string): ParsedPath => {
   const manifestMatch = path.match(/[/]content[/]ensembles[/]([^/]+)[/][^/]*manifest\.json$/);
   if (manifestMatch) return { kind: 'manifest', ensembleDir: manifestMatch[1] };

   const cycleMatch = path.match(/[/]content[/]ensembles[/]([^/]+)[/]cycles[/]([^/]+)\.json$/);
   if (cycleMatch) return { kind: 'cycle', ensembleDir: cycleMatch[1], cycleId: cycleMatch[2] };

   throw new Error(`Unrecognized ensembles content path: ${path}`);
};

/**
 * Generic loader that accepts arbitrary source loaders (filepaths or Vite import loaders)
 * and converts them into the normalized raw manifests/cycles shape expected by
 * `buildRegistryFromRaw`.
 */
export const buildRegistryFromSources = async (
   manifestSources: SourceLoader[],
   cycleSources: SourceLoader[],
   resolveLogoUrl: ResolveLogoUrl
): Promise<EnsembleRegistry> => {
   const manifests: ManifestEntry[] = await Promise.all(
      manifestSources.map(async ({ path, load }) => {
         const parsed = parseEnsemblePath(path);
         if (parsed.kind !== 'manifest') throw new Error(`Expected manifest path, got: ${path}`);
         const raw = await load();
         return { ensembleDir: parsed.ensembleDir, raw };
      })
   );

   const cycles: CycleEntry[] = await Promise.all(
      cycleSources.map(async ({ path, load }) => {
         const parsed = parseEnsemblePath(path);
         if (parsed.kind !== 'cycle') throw new Error(`Expected cycle path, got: ${path}`);
         const raw = await load();
         return { ensembleDir: parsed.ensembleDir, cycleId: parsed.cycleId, raw };
      })
   );

   return buildRegistryFromRaw({ manifests, cycles }, resolveLogoUrl);
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

   const ensembles: EnsembleConfig[] = parsedManifests
      .map(({ ensembleDir, manifest }) => {
         const ensembleCycles = sortCycles(cyclesByEnsembleDir[ensembleDir] ?? []);
         return { ...manifest, cycles: ensembleCycles };
      })
      .sort((a, b) => a.dateAdded.localeCompare(b.dateAdded));

   const byId = Object.fromEntries(ensembles.map((e) => [e.id, e]));
   return { ensembles, byId };
};
