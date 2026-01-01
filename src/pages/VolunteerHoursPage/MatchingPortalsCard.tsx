import { BusinessOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Divider, Paper, Stack, Typography } from '@mui/material';

import MicrosoftLogo from '../../assets/logos/microsoft.png';

import type { EnsembleConfig } from '../../ensembleProvider/ensemble.types';

type Portal = {
   label: string;
   description?: string;
   icon?: string;
   getLink: (ensemble?: EnsembleConfig) => string;
};

const MATCHING_PORTALS: Portal[] = [
   {
      label: 'Microsoft Give (Benevity)',
      getLink: (ensemble?: EnsembleConfig) =>
         `https://microsoft.benevity.org/volunteer/external/track/${
            ensemble?.benevityId ? `?cause_id=${ensemble.benevityId}` : ''
         }`,
      description: 'Log volunteer time for matching / recognition.',
      icon: MicrosoftLogo,
   },
];

export const MatchingPortalsCard = ({ ensemble }: { ensemble?: EnsembleConfig }) => (
   <Card>
      <CardContent>
         <Stack spacing={1.5}>
            <Typography variant="h6" fontWeight={700}>{`Quick links`}</Typography>
            <Typography variant="body2" color="text.secondary">
               {`Open your employer’s matching portal in a new tab.`}
            </Typography>
            <Stack spacing={1}>
               {MATCHING_PORTALS.map((p) => (
                  <Paper key={p.label} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                     <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        alignItems={{ sm: 'center' }}
                        justifyContent="space-between"
                     >
                        <Stack direction="row" spacing={1.25} alignItems="center">
                           {p.icon ? (
                              <Box
                                 component="img"
                                 src={p.icon}
                                 alt={`${p.label} logo`}
                                 sx={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
                              />
                           ) : (
                              <Box
                                 sx={{
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'text.secondary',
                                 }}
                              >
                                 <BusinessOutlined fontSize="small" />
                              </Box>
                           )}
                           <Box>
                              <Typography fontWeight={800}>{p.label}</Typography>
                              {p.description && (
                                 <Typography variant="body2" color="text.secondary">
                                    {p.description}
                                 </Typography>
                              )}
                           </Box>
                        </Stack>
                        <Button
                           component="a"
                           href={p.getLink(ensemble)}
                           target="_blank"
                           rel="noopener noreferrer"
                           variant="outlined"
                           sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                           {`Open`}
                        </Button>
                     </Stack>
                  </Paper>
               ))}
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary">
               {`Missing your employer? `}
               <Box
                  component="a"
                  href="mailto:info@solsticesymphonyorchestra.org"
                  sx={{ color: 'inherit', textDecoration: 'underline' }}
               >
                  {`Contact us`}
               </Box>
               {` and we'll happily add it.`}
            </Typography>
         </Stack>
      </CardContent>
   </Card>
);
