import { Box, Typography } from '@mui/material';

import { useEnsembleContext } from '../ensembleProvider/EnsembleContext';

export const VolunteerHoursPage = () => {
   const { selection, registry } = useEnsembleContext();
   const ensemble = selection ? registry.byId[selection.ensembleId] : null;

   return (
      <Box sx={{ p: 4 }}>
         <Typography variant="h4" gutterBottom>
            Volunteer Hours
         </Typography>

         <Typography variant="subtitle1" color="text.secondary">
            {ensemble?.name}
         </Typography>

         {/* your questionnaire goes here */}
      </Box>
   );
};
