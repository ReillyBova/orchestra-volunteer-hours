import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';

import { buildRegistryFromSources } from './loadEnsembles.core';

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

   const manifestSources = manifestPaths.map((p) => ({ path: p, load: async () => readJson(p) }));

   const cycleSources = cyclePaths.map((p) => ({ path: p, load: async () => readJson(p) }));

   return buildRegistryFromSources(manifestSources, cycleSources, resolvePublicUrlNode);
};
