import * as React from 'react';

import { SettingsBackupRestore } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
    Alert, alpha, Button, Card, CardContent, IconButton, Paper, Snackbar, Stack, TextField, Tooltip,
    Typography
} from '@mui/material';

import { MarkdownText } from '../../components/MarkdownText/MarkdownText';
import { breakIosUrlHeuristic } from './volunteerHours.utils';

type Props = {
   matchedMinutes: number;
   formattedHoursMinutes: string;
   dateRange?: string;

   hasSelection: boolean;
   draftOutput: string;
   onDraftChange: (next: string) => void;

   canCopy: boolean;

   showStaleWarning: boolean;
   onRegenerate: () => void;
};

export const GeneratedResultCard = ({
   matchedMinutes,
   formattedHoursMinutes,
   dateRange,
   hasSelection,
   draftOutput,
   onDraftChange,
   canCopy,
   showStaleWarning,
   onRegenerate,
}: Props) => {
   const [copiedOpen, setCopiedOpen] = React.useState(false);

   const handleCopy = async () => {
      const safeText = breakIosUrlHeuristic(draftOutput);
      await navigator.clipboard.writeText(safeText);
      setCopiedOpen(true);
   };

   return (
      <Card>
         <CardContent>
            <Stack spacing={2}>
               <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={700}>{`Paste-ready text`}</Typography>
                  <Tooltip title="Restore generated text">
                     <IconButton size="small" onClick={onRegenerate}>
                        <SettingsBackupRestore fontSize="small" />
                     </IconButton>
                  </Tooltip>
               </Stack>
               <Paper
                  variant="outlined"
                  sx={(theme) => ({
                     p: 2,
                     borderRadius: 2,
                     bgcolor: alpha(theme.palette.primary.main, 0.06),
                     borderColor: alpha(theme.palette.primary.main, 0.28),
                  })}
               >
                  {dateRange && (
                     <Typography variant="body2" color="text.secondary" gutterBottom>
                        <MarkdownText>{`**${dateRange}**`}</MarkdownText>
                     </Typography>
                  )}
                  <Stack direction="row" alignItems="baseline" sx={{ gap: 1, flexWrap: 'wrap' }}>
                     <Typography variant="h3" fontWeight={900} color="primary" sx={{ lineHeight: 1 }}>
                        {matchedMinutes.toLocaleString()}
                     </Typography>
                     <Typography variant="subtitle1" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {`minutes volunteered`}
                     </Typography>
                     <Typography variant="subtitle1" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {`(${formattedHoursMinutes})`}
                     </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                     {`Excludes reported downtime`}
                  </Typography>
               </Paper>
               {showStaleWarning && (
                  <Alert
                     severity="warning"
                     action={
                        <Button
                           color="inherit"
                           size="small"
                           startIcon={<SettingsBackupRestore />}
                           onClick={onRegenerate}
                           sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                           {`Regenerate text`}
                        </Button>
                     }
                     sx={{
                        alignItems: 'center',
                        '& .MuiAlert-action': {
                           alignSelf: { xs: 'stretch', sm: 'center' },
                           marginLeft: { xs: 0, sm: 2 },
                           paddingTop: { xs: 1, sm: 0 },
                        },
                     }}
                  >
                     {`The edited text below does not reflect your latest form selections. Please regenerate to pull in the latest details.`}
                  </Alert>
               )}
               {!hasSelection ? (
                  <Alert severity="info">
                     {`Select one or more events above. Your paste-ready text will appear here automatically.`}
                  </Alert>
               ) : (
                  <TextField
                     value={draftOutput}
                     onChange={(e) => onDraftChange(e.target.value)}
                     fullWidth
                     multiline
                     minRows={10}
                  />
               )}
               <Stack direction="row" spacing={1} justifyContent="center">
                  <Button
                     color="primary"
                     variant="contained"
                     size="large"
                     startIcon={<ContentCopyIcon />}
                     disabled={!canCopy}
                     onClick={handleCopy}
                  >
                     {`Copy text`}
                  </Button>
               </Stack>
               <Snackbar
                  open={copiedOpen}
                  autoHideDuration={1400}
                  onClose={() => setCopiedOpen(false)}
                  message="Copied!"
               />
            </Stack>
         </CardContent>
      </Card>
   );
};
