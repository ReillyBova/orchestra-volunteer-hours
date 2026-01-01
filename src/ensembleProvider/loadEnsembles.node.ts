import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { buildRegistryFromRaw } from './loadEnsembles.core';

import type { EnsembleRegistry } from './ensemble.types';
// In Node/CI we don't have BASE_URL. For validation, we just produce a stable public path.
const resolvePublicUrlNode = (maybePath?: string) => {
   if (!maybePath) return undefined;
   const normalizedPath = maybePath.startsWith('/') ? maybePath.slice(1) : maybePath;
   return `/assets/logos/${normalizedPath}`;
};

const readJson = async (filePath: string): Promise<unknown> => {
   const text = await readFile(filePath, 'utf8');
   return JSON.parse(text);
};

export const loadEnsemblesNode = async (): Promise<EnsembleRegistry> => {
   const manifestPaths = await fg('src/content/ensembles/*/manifest.json', { dot: false });
   const cyclePaths = await fg('src/content/ensembles/*/cycles/*.json', { dot: false });

   const manifests = await Promise.all(
      manifestPaths.map(async (p) => {
         const ensembleDir = path.basename(path.dirname(p)); // .../EnsembleName/manifest.json
         const raw = await readJson(p);
         return { ensembleDir, raw };
      })
   );

   const cycles = await Promise.all(
      cyclePaths.map(async (p) => {
         const cyclesDir = path.dirname(p); // .../EnsembleName/cycles
         const ensembleDir = path.basename(path.dirname(cyclesDir)); // EnsembleName
         const cycleId = path.basename(p, '.json');
         const raw = await readJson(p);
         return { ensembleDir, cycleId, raw };
      })
   );

   return buildRegistryFromRaw({ manifests, cycles }, resolvePublicUrlNode);
};
