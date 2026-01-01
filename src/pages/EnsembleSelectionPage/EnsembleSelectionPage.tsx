import { Box, Container, Grid, Stack, Typography } from '@mui/material';

import { StaggeredGrow } from '../../components/StaggeredGrow/StaggeredGrow';
import { useEnsembleContext } from '../../ensembleProvider/EnsembleContext';
import { EnsembleCard } from './EnsembleCard';

export const EnsembleSelectionPage = () => {
   const { registry } = useEnsembleContext();
   const ensembles = registry.ensembles;

   return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'text.primary', color: 'background.paper' }}>
         <Container maxWidth="lg" sx={{ py: 6 }}>
            <Stack spacing={1} sx={{ mb: 3 }}>
               <Typography variant="h4" fontWeight={800}>
                  {`Choose your ensemble`}
               </Typography>
               <Typography>{`Select an ensemble to generate volunteer-hours text for your employer portal`}</Typography>
            </Stack>
            <Grid container spacing={2}>
               {[...ensembles, ...ensembles, ...ensembles, ...ensembles, ...ensembles].map((e, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                     <StaggeredGrow index={index}>
                        <EnsembleCard ensemble={e} />
                     </StaggeredGrow>
                  </Grid>
               ))}
            </Grid>
         </Container>
      </Box>
   );
};
