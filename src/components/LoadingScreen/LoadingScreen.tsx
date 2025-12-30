import { Box, CircularProgress, Stack, Typography } from '@mui/material';

export const LoadingScreen = () => (
   <Box
      sx={{
         minHeight: '100vh',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
      }}
   >
      <Stack spacing={2} alignItems="center">
         <CircularProgress />
         <Typography variant="body2" color="text.secondary">
            {`Loading…`}
         </Typography>
      </Stack>
   </Box>
);
