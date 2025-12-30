import type { ConcertCycle, EnsembleConfig, EnsembleManifest, EnsembleRegistry } from './ensemble.types';

import { ConcertCycleSchema, EnsembleManifestSchema } from './ensemble.schemas';

const manifestModules = import.meta.glob('../content/ensembles/*/manifest.json');
const cycleModules = import.meta.glob('../content/ensembles/*/cycles/*.json');

type ParsedPath = { kind: 'manifest'; ensembleDir: string } | { kind: 'cycle'; ensembleDir: string; cycleId: string };

const resolvePublicUrl = (maybePath?: string) => {
   if (!maybePath) return undefined;

   const base = import.meta.env.BASE_URL || '/';
   const normalizedBase = base.endsWith('/') ? base : `${base}/`;
   const normalizedPath = maybePath.startsWith('/') ? maybePath.slice(1) : maybePath;

   return `${normalizedBase}assets/logos/${normalizedPath}`;
};

const parseEnsemblePath = (path: string): ParsedPath => {
   // ../content/ensembles/Solstice/manifest.json
   const manifestMatch = path.match(/\/content\/ensembles\/([^/]+)\/manifest\.json$/);
   if (manifestMatch) return { kind: 'manifest', ensembleDir: manifestMatch[1] };

   // ../content/ensembles/Solstice/cycles/summer-2025.json
   const cycleMatch = path.match(/\/content\/ensembles\/([^/]+)\/cycles\/([^/]+)\.json$/);
   if (cycleMatch) return { kind: 'cycle', ensembleDir: cycleMatch[1], cycleId: cycleMatch[2] };

   throw new Error(`Unrecognized ensembles content path: ${path}`);
};

const sortCycles = (cycles: ConcertCycle[]) =>
   [...cycles].sort((a, b) => b.cycleDate.localeCompare(a.cycleDate) || a.label.localeCompare(b.label));

export const loadEnsembles = async (): Promise<EnsembleRegistry> => {
   const manifests = await Promise.all(
      Object.entries(manifestModules).map(async ([path, loader]) => {
         const parsed = parseEnsemblePath(path);
         if (parsed.kind !== 'manifest') throw new Error(`Expected manifest path, got: ${path}`);

         const raw = (await loader()) as { default: unknown };
         const parsedManifest = EnsembleManifestSchema.parse(raw.default);

         const manifest: EnsembleManifest = {
            ...parsedManifest,
            id: parsed.ensembleDir,
            logoUrl: resolvePublicUrl(parsedManifest.logoUrl),
         };
         return { ensembleDir: parsed.ensembleDir, manifest };
      })
   );

   const cycles = await Promise.all(
      Object.entries(cycleModules).map(async ([path, loader]) => {
         const parsed = parseEnsemblePath(path);
         if (parsed.kind !== 'cycle') throw new Error(`Expected cycle path, got: ${path}`);

         const raw = (await loader()) as { default: unknown };
         const parsedCycle = ConcertCycleSchema.parse(raw.default);

         const cycle: ConcertCycle = { ...parsedCycle, id: parsed.cycleId };
         return { ensembleDir: parsed.ensembleDir, cycle };
      })
   );

   const cyclesByEnsembleDir = cycles.reduce<Record<string, ConcertCycle[]>>((acc, { ensembleDir, cycle }) => {
      const existing = acc[ensembleDir] ?? [];
      return { ...acc, [ensembleDir]: [...existing, cycle] };
   }, {});

   const ensembles: EnsembleConfig[] = manifests.map(({ ensembleDir, manifest }) => {
      const ensembleCycles = sortCycles(cyclesByEnsembleDir[ensembleDir] ?? []);
      return { ...manifest, cycles: ensembleCycles };
   });

   const byId = Object.fromEntries(ensembles.map((e) => [e.id, e]));
   return { ensembles, byId };
};
