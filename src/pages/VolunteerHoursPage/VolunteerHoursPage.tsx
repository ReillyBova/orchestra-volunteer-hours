import { Box, Container, Stack } from '@mui/material';

import { StaggeredGrow } from '../../components/StaggeredGrow/StaggeredGrow';
import { useEnsembleContext } from '../../ensembleProvider/EnsembleContext';
import { EnsembleCycleSelector } from './EnsembleCycleSelector';
import { GeneratedResultCard } from './GeneratedResultCard';
import { MatchingPortalsCard } from './MatchingPortalsCard';
import { ParticipationCard } from './ParticipationCard';
import { UserInfoCard } from './UserInfoCard';
import { useVolunteerHoursModel } from './volunteerHours.model';
import { clamp, formatDay, formatHoursMinutes, minutesBetween } from './volunteerHours.utils';
import { VolunteerHoursHeaderCard } from './VolunteerHoursHeaderCard';

export const VolunteerHoursPage = () => {
   const { selection, registry } = useEnsembleContext();

   const ensemble = selection ? registry.byId[selection.ensembleId] : undefined;
   const availableCycles = ensemble?.cycles ?? [];
   const cycle = selection?.cycleId ? availableCycles.find((c) => c.id === selection.cycleId) : undefined;

   const model = useVolunteerHoursModel({ ensemble, cycle });

   return (
      <Box sx={{ p: 4 }}>
         <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={2}>
               <VolunteerHoursHeaderCard logoUrl={ensemble?.logoUrl} ensembleName={ensemble?.name} />
               <EnsembleCycleSelector />
               {cycle && (
                  <>
                     <StaggeredGrow index={0}>
                        <UserInfoCard
                           role={model.role}
                           instrument={model.instrument}
                           onRoleChange={model.setRole}
                           onInstrumentChange={model.setInstrument}
                           onResetUserInfo={model.resetUserInfoDefaults}
                           orgName={model.orgName}
                           eventName={model.eventName}
                           description={model.description}
                           onOrgNameChange={model.setOrgName}
                           onEventNameChange={model.setEventName}
                           onDescriptionChange={model.setDescription}
                           onResetOrg={model.resetOrganizationDefaults}
                        />
                     </StaggeredGrow>
                     <StaggeredGrow index={1}>
                        <ParticipationCard
                           events={cycle.events}
                           participation={model.participation}
                           onChangeParticipation={(idx, next) =>
                              model.setParticipation((prev) => ({
                                 ...prev,
                                 [idx]: next,
                              }))
                           }
                           onReset={model.resetParticipationDefaults}
                           formatDay={formatDay}
                           minutesBetween={minutesBetween}
                           clamp={clamp}
                        />
                     </StaggeredGrow>
                     <StaggeredGrow index={2}>
                        <GeneratedResultCard
                           matchedMinutes={model.matchedMinutes}
                           formattedHoursMinutes={formatHoursMinutes(model.matchedMinutes)}
                           dateRange={model.dateRange}
                           hasSelection={model.hasSelection}
                           draftOutput={model.draftOutput}
                           onDraftChange={model.onDraftChange}
                           canCopy={model.canCopy}
                           onCopy={async () => {
                              await navigator.clipboard.writeText(model.draftOutput);
                           }}
                           showStaleWarning={model.showStaleWarning}
                           onRegenerate={model.regenerateText}
                        />
                     </StaggeredGrow>
                     <StaggeredGrow index={3}>
                        <MatchingPortalsCard ensemble={ensemble} />
                     </StaggeredGrow>
                  </>
               )}
            </Stack>
         </Container>
      </Box>
   );
};
