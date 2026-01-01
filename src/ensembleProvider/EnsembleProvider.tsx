import * as React from 'react';

import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { LoadingScreen } from '../components/LoadingScreen/LoadingScreen';
import { EnsembleContext } from './EnsembleContext';
import { useQuerySelection } from './ensembleSelection';
import { loadEnsembles } from './loadEnsembles';
import { makeMuiTheme } from './theme';

import type { EnsembleContextType } from './EnsembleContext';

import type { EnsembleRegistry } from './ensemble.types';

export const EnsembleProvider = ({ children }: React.PropsWithChildren) => {
   const [registry, setRegistry] = React.useState<EnsembleRegistry>();
   const [error, setError] = React.useState<string>();

   const { selection, setAndWrite } = useQuerySelection();

   // Load registry on mount
   React.useEffect(() => {
      let cancelled = false;

      loadEnsembles()
         .then((r) => {
            if (cancelled) return;
            setRegistry(r);
         })
         .catch((e) => {
            if (cancelled) return;
            setError(e instanceof Error ? e.message : String(e));
         });

      return () => {
         cancelled = true;
      };
   }, []);

   // Resolve selection -> actual objects (validation)
   const selectedEnsemble = selection && registry ? registry.byId[selection.ensembleId] : undefined;

   // Reconcile invalid IDs (once registry exists)
   React.useEffect(() => {
      if (!selection || !registry) return;

      const ensemble = registry.byId[selection.ensembleId];
      if (!ensemble) {
         setAndWrite(undefined, 'replace');
         return;
      }

      if (selection.cycleId && !ensemble.cycles.some((c) => c.id === selection.cycleId)) {
         setAndWrite({ ensembleId: selection.ensembleId }, 'replace');
      }
   }, [registry, selection, setAndWrite]);

   const selectEnsemble = React.useCallback((ensembleId: string) => setAndWrite({ ensembleId }, 'push'), [setAndWrite]);

   const selectCycle = React.useCallback(
      (cycleId: string) => {
         if (!selection) return;
         setAndWrite({ ensembleId: selection.ensembleId, cycleId }, 'push');
      },
      [selection, setAndWrite]
   );

   const clearEnsembleSelection = React.useCallback(() => setAndWrite(undefined, 'push'), [setAndWrite]);

   const clearCycleSelection = React.useCallback(() => {
      if (!selection) return;
      setAndWrite({ ensembleId: selection.ensembleId }, 'push');
   }, [selection, setAndWrite]);

   const theme = React.useMemo(() => makeMuiTheme(selectedEnsemble?.theme), [selectedEnsemble]);

   const ensembleContext: EnsembleContextType | undefined = React.useMemo(
      () =>
         registry
            ? {
                 registry,
                 selection,
                 selectEnsemble,
                 selectCycle,
                 clearEnsembleSelection,
                 clearCycleSelection,
              }
            : undefined,
      [registry, selection, selectEnsemble, selectCycle, clearEnsembleSelection, clearCycleSelection]
   );

   // Error state
   if (error) return <div style={{ padding: 16 }}>{`Ensemble registration error: ${error}`}</div>;

   // While loading: show loading UI (and avoid providing invalid context)
   if (!ensembleContext) return <LoadingScreen />;

   return (
      <ThemeProvider theme={theme}>
         <CssBaseline />
         {error && <div style={{ padding: 16 }}>{`Ensemble registration error: ${error}`}</div>}
         {!ensembleContext && !error && <LoadingScreen />}
         {ensembleContext && <EnsembleContext.Provider value={ensembleContext}>{children}</EnsembleContext.Provider>}
      </ThemeProvider>
   );
};
