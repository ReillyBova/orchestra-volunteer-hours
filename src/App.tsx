import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
    Alert, Button, Card, CardContent, Checkbox, Container, Divider, FormControlLabel, FormGroup,
    IconButton, InputAdornment, Stack, TextField, Typography
} from '@mui/material';

import { EnsembleProvider } from './ensembleProvider/EnsembleProvider';
import { AppRoutes } from './pages/AppRoutes';

type Rehearsal = {
   id: string;
   label: string; // what users see
   date: string; // ISO date for sorting / optional portal use
   defaultHours: number;
};

const REHEARSALS: Rehearsal[] = [
   { id: 'r1', label: 'Rehearsal — Tue Jan 7, 2026 (7–10pm)', date: '2026-01-07', defaultHours: 3 },
   { id: 'r2', label: 'Rehearsal — Tue Jan 14, 2026 (7–10pm)', date: '2026-01-14', defaultHours: 3 },
   { id: 'r3', label: 'Rehearsal — Tue Jan 21, 2026 (7–10pm)', date: '2026-01-21', defaultHours: 3 },
   { id: 'c1', label: 'Concert Day — Sat Jan 25, 2026 (call + concert)', date: '2026-01-25', defaultHours: 5 },
];

const formatSelected = (rehearsals: Rehearsal[], selected: Record<string, boolean>) => {
   return rehearsals
      .filter((r) => selected[r.id])
      .map((r) => `• ${r.label}`)
      .join('\n');
};

export const OldApp = () => {
   const [orgName, setOrgName] = React.useState('Seattle Philharmonic Orchestra');
   const [eventName, setEventName] = React.useState('Rehearsals and Concert');
   const [memberName, setMemberName] = React.useState('');
   const [role, setRole] = React.useState('Musician');
   const [notes, setNotes] = React.useState(
      'Community orchestra rehearsal and performance time. Unpaid volunteer service.'
   );

   const [selected, setSelected] = React.useState<Record<string, boolean>>(
      Object.fromEntries(REHEARSALS.map((r) => [r.id, false]))
   );

   const selectedRehearsals = React.useMemo(() => REHEARSALS.filter((r) => selected[r.id]), [selected]);

   const totalHours = React.useMemo(
      () => selectedRehearsals.reduce((sum, r) => sum + r.defaultHours, 0),
      [selectedRehearsals]
   );

   const output = React.useMemo(() => {
      const bullets = formatSelected(REHEARSALS, selected) || '• (none selected)';
      const who = memberName.trim() ? `${memberName.trim()} — ` : '';
      return [
         `${who}${orgName} — Volunteer Hours`,
         ``,
         `Activity: ${eventName}`,
         `Role: ${role}`,
         `Hours claimed: ${totalHours}`,
         ``,
         `Dates attended:`,
         bullets,
         ``,
         `Notes: ${notes}`,
      ].join('\n');
   }, [orgName, eventName, role, totalHours, selected, notes, memberName]);

   const [copied, setCopied] = React.useState(false);

   async function copyToClipboard() {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
   }

   return (
      <Container maxWidth="md" sx={{ py: 4 }}>
         <Stack spacing={2}>
            <Typography variant="h4" fontWeight={700}>
               Volunteer Hours Helper
            </Typography>
            <Typography color="text.secondary">
               Select the rehearsals you attended and copy a ready-to-paste description for your employer’s portal.
            </Typography>

            <Card>
               <CardContent>
                  <Stack spacing={2}>
                     <Typography variant="h6" fontWeight={700}>
                        Your info
                     </Typography>

                     <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                           label="Your name (optional)"
                           value={memberName}
                           onChange={(e) => setMemberName(e.target.value)}
                           fullWidth
                        />
                        <TextField label="Role" value={role} onChange={(e) => setRole(e.target.value)} fullWidth />
                     </Stack>

                     <Divider />

                     <Typography variant="h6" fontWeight={700}>
                        Organization
                     </Typography>
                     <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                           label="Organization name"
                           value={orgName}
                           onChange={(e) => setOrgName(e.target.value)}
                           fullWidth
                        />
                        <TextField
                           label="Activity / event name"
                           value={eventName}
                           onChange={(e) => setEventName(e.target.value)}
                           fullWidth
                        />
                     </Stack>

                     <TextField
                        label="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                     />
                  </Stack>
               </CardContent>
            </Card>

            <Card>
               <CardContent>
                  <Stack spacing={2}>
                     <Typography variant="h6" fontWeight={700}>
                        Attendance
                     </Typography>
                     <FormGroup>
                        {REHEARSALS.map((r) => (
                           <FormControlLabel
                              key={r.id}
                              control={
                                 <Checkbox
                                    checked={!!selected[r.id]}
                                    onChange={(e) => setSelected((prev) => ({ ...prev, [r.id]: e.target.checked }))}
                                 />
                              }
                              label={`${r.label}  (${r.defaultHours}h)`}
                           />
                        ))}
                     </FormGroup>

                     <TextField
                        label="Total hours"
                        value={totalHours}
                        InputProps={{
                           readOnly: true,
                           endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                        }}
                     />
                  </Stack>
               </CardContent>
            </Card>

            <Card>
               <CardContent>
                  <Stack spacing={2}>
                     <Typography variant="h6" fontWeight={700}>
                        Paste-ready text
                     </Typography>

                     {copied && <Alert severity="success">Copied!</Alert>}

                     <TextField
                        value={output}
                        fullWidth
                        multiline
                        minRows={10}
                        InputProps={{
                           endAdornment: (
                              <InputAdornment position="end">
                                 <IconButton onClick={copyToClipboard} edge="end" aria-label="copy">
                                    <ContentCopyIcon />
                                 </IconButton>
                              </InputAdornment>
                           ),
                        }}
                     />

                     <Button variant="contained" onClick={copyToClipboard}>
                        Copy to clipboard
                     </Button>
                  </Stack>
               </CardContent>
            </Card>

            <Typography variant="body2" color="text.secondary">
               Tip: edit the rehearsal list in <code>App.tsx</code> (the <code>REHEARSALS</code> array).
            </Typography>
         </Stack>
      </Container>
   );
};

export const App = () => {
   return (
      <BrowserRouter>
         <EnsembleProvider>
            <AppRoutes />
         </EnsembleProvider>
      </BrowserRouter>
   );
};
