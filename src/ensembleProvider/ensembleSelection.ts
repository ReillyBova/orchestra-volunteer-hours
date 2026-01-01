import * as React from 'react';

import type { EnsembleSelection } from './ensemble.types';

const ENSEMBLE_KEY = 'ensemble';
const CYCLE_KEY = 'cycle';

export const readSelectionFromQuery = (): EnsembleSelection | undefined => {
   const params = new URLSearchParams(window.location.search);
   const ensembleId = params.get(ENSEMBLE_KEY)?.trim();
   const cycleId = params.get(CYCLE_KEY)?.trim();

   if (!ensembleId) return undefined;
   return { ensembleId, cycleId: cycleId || undefined };
};

type HistoryMode = 'push' | 'replace';

export const writeSelectionToQuery = (next?: EnsembleSelection, mode: HistoryMode = 'push') => {
   const params = new URLSearchParams(window.location.search);

   if (next?.ensembleId) params.set(ENSEMBLE_KEY, next.ensembleId);
   else params.delete(ENSEMBLE_KEY);

   if (next?.cycleId) params.set(CYCLE_KEY, next.cycleId);
   else params.delete(CYCLE_KEY);
   const qs = params.toString();
   const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;

   if (mode === 'push') window.history.pushState(null, '', url);
   else window.history.replaceState(null, '', url);
};

export const useQuerySelection = () => {
   const [selection, setSelection] = React.useState<EnsembleSelection | undefined>(() => readSelectionFromQuery());

   React.useEffect(() => {
      const onPop = () => setSelection(readSelectionFromQuery());
      window.addEventListener('popstate', onPop);
      return () => window.removeEventListener('popstate', onPop);
   }, []);

   const setAndWrite = React.useCallback((next?: EnsembleSelection, mode: HistoryMode = 'push') => {
      setSelection(next);
      writeSelectionToQuery(next, mode);
   }, []);

   return { selection, setAndWrite };
};
