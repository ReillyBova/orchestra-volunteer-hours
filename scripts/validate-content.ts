import { loadEnsembles } from '../src/ensembleProvider/loadEnsembles';

loadEnsembles()
   .then(() => {
      console.log('Ensembles content OK');
      process.exit(0);
   })
   .catch((e) => {
      console.error(e);
      process.exit(1);
   });
