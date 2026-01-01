import { SettingsBackupRestore } from '@mui/icons-material';
import {
    Card, CardContent, Divider, IconButton, Stack, TextField, Tooltip, Typography
} from '@mui/material';

type Props = {
   role: string;
   instrument: string;
   onRoleChange: (v: string) => void;
   onInstrumentChange: (v: string) => void;
   onResetUserInfo: () => void;

   orgName: string;
   eventName: string;
   description: string;
   onOrgNameChange: (v: string) => void;
   onEventNameChange: (v: string) => void;
   onDescriptionChange: (v: string) => void;
   onResetOrg: () => void;
};

export const UserInfoCard = ({
   role,
   instrument,
   onRoleChange,
   onInstrumentChange,
   onResetUserInfo,
   orgName,
   eventName,
   description,
   onOrgNameChange,
   onEventNameChange,
   onDescriptionChange,
   onResetOrg,
}: Props) => (
   <Card>
      <CardContent>
         <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
               <Typography variant="h6" fontWeight={700}>{`Your info`}</Typography>
               <Tooltip title="Restore defaults">
                  <IconButton size="small" onClick={onResetUserInfo}>
                     <SettingsBackupRestore fontSize="small" />
                  </IconButton>
               </Tooltip>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
               <TextField label="Role" value={role} onChange={(e) => onRoleChange(e.target.value)} fullWidth />
               <TextField
                  label="Instrument (optional)"
                  value={instrument}
                  onChange={(e) => onInstrumentChange(e.target.value)}
                  fullWidth
               />
            </Stack>
            <Divider />
            <Stack direction="row" alignItems="center" justifyContent="space-between">
               <Typography variant="h6" fontWeight={700}>{`Organization`}</Typography>
               <Tooltip title="Restore defaults">
                  <IconButton size="small" onClick={onResetOrg}>
                     <SettingsBackupRestore fontSize="small" />
                  </IconButton>
               </Tooltip>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
               <TextField
                  label="Organization name"
                  value={orgName}
                  onChange={(e) => onOrgNameChange(e.target.value)}
                  fullWidth
               />
               <TextField
                  label="Activity / event name"
                  value={eventName}
                  onChange={(e) => onEventNameChange(e.target.value)}
                  fullWidth
               />
            </Stack>
            <TextField
               label="Description"
               value={description}
               onChange={(e) => onDescriptionChange(e.target.value)}
               fullWidth
               multiline
               minRows={2}
            />
         </Stack>
      </CardContent>
   </Card>
);
