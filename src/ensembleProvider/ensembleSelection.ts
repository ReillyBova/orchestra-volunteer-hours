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

export const writeSelectionToQuery = (next?: EnsembleSelection) => {
   const params = new URLSearchParams(window.location.search);

   if (next?.ensembleId) params.set(ENSEMBLE_KEY, next.ensembleId);
   else params.delete(ENSEMBLE_KEY);

   if (next?.cycleId) params.set(CYCLE_KEY, next.cycleId);
   else params.delete(CYCLE_KEY);

   const qs = params.toString();
   const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
   window.history.replaceState(null, '', url);
};

export const useQuerySelection = () => {
   const [selection, setSelection] = React.useState<EnsembleSelection | undefined>(() => readSelectionFromQuery());

   React.useEffect(() => {
      const onPop = () => setSelection(readSelectionFromQuery());
      window.addEventListener('popstate', onPop);
      return () => window.removeEventListener('popstate', onPop);
   }, []);

   const setAndWrite = React.useCallback((next?: EnsembleSelection) => {
      setSelection(next);
      writeSelectionToQuery(next);
   }, []);

   return { selection, setAndWrite };
};
