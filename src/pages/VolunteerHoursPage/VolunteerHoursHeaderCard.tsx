import { Box, Stack, Typography } from '@mui/material';

export const VolunteerHoursHeaderCard = ({ logoUrl, ensembleName }: { logoUrl?: string; ensembleName?: string }) => (
   <Stack spacing={1}>
      <Stack direction="row" alignItems="center" flexWrap="wrap" columnGap={2} rowGap={1}>
         {logoUrl && (
            <Box
               component="img"
               src={logoUrl}
               alt={`${ensembleName ?? 'Ensemble'} logo`}
               sx={{ maxHeight: 44, maxWidth: 220, objectFit: 'contain', flex: '0 0 auto' }}
            />
         )}
         <Typography
            variant="h4"
            color="secondary"
            sx={{ lineHeight: 1.05, fontWeight: 900, flex: { xs: '1 1 100%', sm: '1 1 auto' } }}
         >
            {`Volunteer Hours Helper`}
         </Typography>
      </Stack>
      <Typography variant="subtitle1" color="text.secondary">
         {`Select the rehearsals and events you attended, and we'll help you prepare a ready-to-paste description for your employer's giving portal.`}
      </Typography>
   </Stack>
);
