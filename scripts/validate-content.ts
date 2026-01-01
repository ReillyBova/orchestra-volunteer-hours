import { loadEnsemblesNode } from '../src/ensembleProvider/loadEnsembles.node';

loadEnsemblesNode()
   .then(() => {
      console.log('Ensembles content OK');
      process.exit(0);
   })
   .catch((e) => {
      console.error(e);
      process.exit(1);
   });
