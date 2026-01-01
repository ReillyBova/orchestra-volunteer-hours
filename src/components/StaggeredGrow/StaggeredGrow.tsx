import * as React from 'react';

import Grow from '@mui/material/Grow';

import type { GrowProps } from '@mui/material/Grow';

type StaggerGrowProps = React.PropsWithChildren<{
   index?: number;
   staggerMs?: number;
   durationMs?: number;
   origin?: string;
}> &
   Omit<GrowProps, 'in' | 'timeout' | 'children'>;

export const StaggeredGrow = ({
   index = 0,
   staggerMs = 180,
   durationMs = 1000,
   origin = '50% 100%',
   children,
   ...growProps
}: StaggerGrowProps) => {
   const [mounted, setMounted] = React.useState(false);
   React.useEffect(() => setMounted(true), []);

   const [ready, setReady] = React.useState(false);

   React.useEffect(() => {
      if (!mounted) return;
      const id = window.setTimeout(() => setReady(true), index * staggerMs);
      return () => window.clearTimeout(id);
   }, [mounted, index, staggerMs]);

   return (
      <Grow
         in={ready}
         timeout={durationMs}
         style={{ transformOrigin: origin }}
         mountOnEnter
         unmountOnExit
         {...growProps}
      >
         <div>{children}</div>
      </Grow>
   );
};
