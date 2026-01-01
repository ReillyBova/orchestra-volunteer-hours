import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Link, Typography } from '@mui/material';

import type { TypographyProps } from '@mui/material';

type Props = {
   children: string;
   typographyProps?: TypographyProps;
};

export const MarkdownText = ({ children, typographyProps }: Props) => (
   <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
         p: ({ children }) => <Typography {...{ ...typographyProps, component: 'p' }}>{children}</Typography>,
         strong: ({ children }) => <strong>{children}</strong>,
         em: ({ children }) => <em>{children}</em>,
         a: ({ href, children }) => (
            <Link href={href ?? '#'} target="_blank" rel="noreferrer">
               {children}
            </Link>
         ),
      }}
   >
      {children}
   </ReactMarkdown>
);
