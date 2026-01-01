import {
    Box, Card, CardActionArea, CardContent, CardMedia, Stack, Typography
} from '@mui/material';

import { useEnsembleContext } from '../../ensembleProvider/EnsembleContext';

import type { EnsembleConfig } from '../../ensembleProvider/ensemble.types';

export const EnsembleCard = ({ ensemble }: { ensemble: EnsembleConfig }) => {
   const { selectEnsemble } = useEnsembleContext();

   return (
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
            onClick={() => selectEnsemble(ensemble.id)}
            sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}
         >
            <Stack sx={{ width: '100%' }}>
               {ensemble.logoUrl ? (
                  <CardMedia
                     component="img"
                     src={ensemble.logoUrl}
                     alt={`${ensemble.name} logo`}
                     sx={{
                        height: 140,
                        objectFit: 'contain',
                        p: 2,
                        bgcolor: ensemble.theme.primary,
                     }}
                  />
               ) : (
                  <Box
                     sx={{
                        height: 140,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: ensemble.theme.onPrimary,
                        bgcolor: ensemble.theme.primary,
                     }}
                  >
                     <Typography variant="h6" fontWeight={800}>
                        {ensemble.shortName}
                     </Typography>
                  </Box>
               )}
               <CardContent>
                  <Typography variant="h6" fontWeight={800} gutterBottom>
                     {ensemble.shortName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     {ensemble.name}
                  </Typography>
               </CardContent>
            </Stack>
         </CardActionArea>
      </Card>
   );
};
