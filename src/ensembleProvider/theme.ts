import { alpha, createTheme } from '@mui/material/styles';

import type { BrandTheme } from './ensemble.types';

const DEFAULT_BRAND: BrandTheme = {
   primary: '#FFB024',
   secondary: '#171A39',
   ink: '#2B2B2B',
   background: '#FCF8EF',
   onPrimary: '#171A39',
   onSecondary: '#FCF8EF',
};

export const makeMuiTheme = (brand = DEFAULT_BRAND) => {
   const { primary, ink = '#000000', background = '#FFFFFF' } = brand;
   const onPrimary = brand.onPrimary ?? ink;
   const secondaryAccent = brand.secondary ?? brand.onPrimary ?? ink;
   const onSecondary = brand.onSecondary ?? brand.primary ?? ink;

   return createTheme({
      palette: {
         mode: 'light',
         primary: { main: primary, contrastText: onPrimary },
         secondary: { main: secondaryAccent, contrastText: onSecondary },
         background: {
            default: background,
            paper: '#FFFFFF',
         },
         text: {
            primary: ink,
            secondary: alpha(ink, 0.72),
         },
         divider: alpha(ink, 0.12),
         action: {
            hover: alpha(primary, 0.1),
            selected: alpha(primary, 0.16),
            disabled: alpha(ink, 0.35),
            disabledBackground: alpha(ink, 0.06),
            focus: alpha(primary, 0.2),
         },
      },
      shape: { borderRadius: 14 },
      typography: {
         fontFamily: 'Nunito, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
         h4: { fontWeight: 800 },
         h6: { fontWeight: 800 },
      },
      components: {
         MuiCard: {
            styleOverrides: {
               root: {
                  border: `1px solid ${alpha(ink, 0.1)}`,
                  boxShadow: `0 10px 30px ${alpha(onPrimary, 0.08)}`,
               },
            },
         },
         MuiButton: {
            defaultProps: { disableElevation: true },
         },
         MuiTextField: {
            defaultProps: { size: 'small' },
         },
         MuiSelect: {
            defaultProps: { size: 'small' },
         },
         MuiInputBase: {
            styleOverrides: {
               root: {
                  backgroundColor: alpha(ink, 0.02),
               },
            },
         },
      },
   });
};
