import type { EnsembleRegistry } from './ensemble.types';
import { buildRegistryFromSources } from './loadEnsembles.core';

const manifestModules = import.meta.glob('../content/ensembles/*/manifest.json');
const cycleModules = import.meta.glob('../content/ensembles/*/cycles/*.json');

const resolvePublicUrlVite = (maybePath?: string) => {
   if (!maybePath) return undefined;

   const base = import.meta.env.BASE_URL || '/';
   const normalizedBase = base.endsWith('/') ? base : `${base}/`;
   const normalizedPath = maybePath.startsWith('/') ? maybePath.slice(1) : maybePath;

   return `${normalizedBase}assets/logos/${normalizedPath}`;
};

export const loadEnsembles = async (): Promise<EnsembleRegistry> => {
   const manifestSources = Object.entries(manifestModules).map(([path, loader]) => ({
      path,
      load: async () => {
         const m = (await (loader as () => Promise<{ default: unknown }>)()) as { default: unknown };
         return m.default;
      },
   }));

   const cycleSources = Object.entries(cycleModules).map(([path, loader]) => ({
      path,
      load: async () => {
         const m = (await (loader as () => Promise<{ default: unknown }>)()) as { default: unknown };
         return m.default;
      },
   }));

   return buildRegistryFromSources(manifestSources, cycleSources, resolvePublicUrlVite);
};
