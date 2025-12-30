import { Navigate, Route, Routes } from 'react-router-dom';

import { useEnsembleContext } from '../ensembleProvider/EnsembleContext';
import { EnsembleSelectionPage } from './EnsembleSelectionPage';
import { VolunteerHoursPage } from './VolunteerHoursPage';

export const AppRoutes = () => {
   const { selection } = useEnsembleContext();

   const isEnsembleSelected = !!selection?.ensembleId;

   return (
      <Routes>
         <Route path="/" element={isEnsembleSelected ? <VolunteerHoursPage /> : <EnsembleSelectionPage />} />
         <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
   );
};
