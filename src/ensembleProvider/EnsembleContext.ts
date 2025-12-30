import * as React from 'react';

import type { EnsembleRegistry, EnsembleSelection } from './ensemble.types';

export type EnsembleContextType = {
   registry: EnsembleRegistry;
   selection?: EnsembleSelection;

   selectEnsemble: (ensembleId: string) => void;
   selectCycle: (cycleId: string) => void;

   clearEnsembleSelection: () => void;
   clearCycleSelection: () => void;
};

export const EnsembleContext = React.createContext<EnsembleContextType | undefined>(undefined);

export const useEnsembleContext = () => {
   const ctx = React.useContext(EnsembleContext);
   if (!ctx) throw new Error('useEnsembleContext must be used within <EnsembleProvider />');
   return ctx;
};
