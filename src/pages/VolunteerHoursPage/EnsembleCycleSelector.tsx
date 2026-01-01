import { Alert, MenuItem, Stack, TextField } from '@mui/material';

import { MarkdownText } from '../../components/MarkdownText/MarkdownText';
import { useEnsembleContext } from '../../ensembleProvider/EnsembleContext';

export const EnsembleCycleSelector = () => {
   const { selection, registry, selectEnsemble, selectCycle } = useEnsembleContext();

   const ensemble = selection ? registry.byId[selection.ensembleId] : undefined;
   const availableCycles = ensemble?.cycles ?? [];
   const cycle = selection?.cycleId ? availableCycles.find((c) => c.id === selection.cycleId) : undefined;

   return (
      <Stack spacing={2}>
         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
               select
               fullWidth
               label="Ensemble"
               value={ensemble?.id ?? ''}
               onChange={(e) => {
                  const next = e.target.value;
                  if (next) selectEnsemble(next);
               }}
            >
               {registry.ensembles.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                     {e.shortName}
                  </MenuItem>
               ))}
            </TextField>
            <TextField
               select
               fullWidth
               label="Concert cycle / series"
               value={cycle?.id ?? ''}
               onChange={(e) => selectCycle(e.target.value)}
               disabled={!ensemble}
            >
               {availableCycles.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                     {c.label}
                  </MenuItem>
               ))}
            </TextField>
         </Stack>
         {(!ensemble || !cycle) && (
            <Alert severity="info">
               <MarkdownText typographyProps={{ variant: 'body2' }}>
                  {`Please choose an **ensemble** and **concert cycle / series** to continue.`}
               </MarkdownText>
            </Alert>
         )}
      </Stack>
   );
};
