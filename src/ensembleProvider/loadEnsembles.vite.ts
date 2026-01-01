import type { EnsembleRegistry } from './ensemble.types';
import { buildRegistryFromRaw } from './loadEnsembles.core';

const manifestModules = import.meta.glob('../content/ensembles/*/manifest.json');
const cycleModules = import.meta.glob('../content/ensembles/*/cycles/*.json');

type ParsedPath = { kind: 'manifest'; ensembleDir: string } | { kind: 'cycle'; ensembleDir: string; cycleId: string };

const parseEnsemblePath = (path: string): ParsedPath => {
   const manifestMatch = path.match(/\/content\/ensembles\/([^/]+)\/manifest\.json$/);
   if (manifestMatch) return { kind: 'manifest', ensembleDir: manifestMatch[1] };

   const cycleMatch = path.match(/\/content\/ensembles\/([^/]+)\/cycles\/([^/]+)\.json$/);
   if (cycleMatch) return { kind: 'cycle', ensembleDir: cycleMatch[1], cycleId: cycleMatch[2] };

   throw new Error(`Unrecognized ensembles content path: ${path}`);
};

const resolvePublicUrlVite = (maybePath?: string) => {
   if (!maybePath) return undefined;

   const base = import.meta.env.BASE_URL || '/';
   const normalizedBase = base.endsWith('/') ? base : `${base}/`;
   const normalizedPath = maybePath.startsWith('/') ? maybePath.slice(1) : maybePath;

   return `${normalizedBase}assets/logos/${normalizedPath}`;
};

export const loadEnsembles = async (): Promise<EnsembleRegistry> => {
   const manifests = await Promise.all(
      Object.entries(manifestModules).map(async ([path, loader]) => {
         const parsed = parseEnsemblePath(path);
         if (parsed.kind !== 'manifest') throw new Error(`Expected manifest path, got: ${path}`);

         const raw = (await loader()) as { default: unknown };
         return { ensembleDir: parsed.ensembleDir, raw: raw.default };
      })
   );

   const cycles = await Promise.all(
      Object.entries(cycleModules).map(async ([path, loader]) => {
         const parsed = parseEnsemblePath(path);
         if (parsed.kind !== 'cycle') throw new Error(`Expected cycle path, got: ${path}`);

         const raw = (await loader()) as { default: unknown };
         return { ensembleDir: parsed.ensembleDir, cycleId: parsed.cycleId, raw: raw.default };
      })
   );

   return buildRegistryFromRaw({ manifests, cycles }, resolvePublicUrlVite);
};
