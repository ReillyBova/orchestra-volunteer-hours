import React from 'react';

import {
    Box, Card, CardActionArea, CardContent, CardMedia, Container, Grid, Grow, Stack, Typography
} from '@mui/material';

import { useEnsembleContext } from '../ensembleProvider/EnsembleContext';

export const EnsembleSelectionPage = () => {
   const { registry, selectEnsemble } = useEnsembleContext();
   const ensembles = registry.ensembles;

   const [mounted, setMounted] = React.useState(false);
   React.useEffect(() => setMounted(true), []);

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
               {ensembles.map((e, index) => (
                  <Grid key={e.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                     <Grow
                        in={mounted}
                        style={{ transformOrigin: '50% 100%' }}
                        {...(mounted ? { timeout: (index + 1) * 1000 } : {})}
                     >
                        <Box>
                           <Card
                              variant="outlined"
                              sx={{
                                 height: '100%',
                                 borderWidth: 2,
                                 borderColor: 'text.secondary',
                                 bgcolor: 'background.paper',
                                 transition: (t) =>
                                    t.transitions.create(['border-color', 'outline', 'outline-offset'], {
                                       duration: t.transitions.duration.shortest,
                                    }),
                                 '&:hover': {
                                    borderColor: 'primary.main',
                                 },
                                 '&:focus-within': {
                                    outline: (t) => `2px solid ${t.palette.primary.main}`,
                                    outlineOffset: 2,
                                    borderColor: 'primary.main',
                                 },
                              }}
                           >
                              <CardActionArea
                                 onClick={() => selectEnsemble(e.id)}
                                 sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}
                              >
                                 <Stack sx={{ width: '100%' }}>
                                    {e.logoUrl ? (
                                       <CardMedia
                                          component="img"
                                          src={e.logoUrl}
                                          alt={`${e.name} logo`}
                                          sx={{
                                             height: 140,
                                             objectFit: 'contain',
                                             p: 2,
                                             bgcolor: e.theme.primary,
                                          }}
                                       />
                                    ) : (
                                       <Box
                                          sx={{
                                             height: 140,
                                             display: 'flex',
                                             alignItems: 'center',
                                             justifyContent: 'center',
                                             color: e.theme.onPrimary,
                                             bgcolor: e.theme.primary,
                                          }}
                                       >
                                          <Typography variant="h6" fontWeight={800}>
                                             {e.shortName}
                                          </Typography>
                                       </Box>
                                    )}
                                    <CardContent>
                                       <Typography variant="h6" fontWeight={800} gutterBottom>
                                          {e.shortName}
                                       </Typography>
                                       <Typography variant="body2" color="text.secondary">
                                          {e.name}
                                       </Typography>
                                    </CardContent>
                                 </Stack>
                              </CardActionArea>
                           </Card>
                        </Box>
                     </Grow>
                  </Grid>
               ))}
            </Grid>
         </Container>
      </Box>
   );
};
