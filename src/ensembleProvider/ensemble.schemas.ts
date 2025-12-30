import { z } from 'zod';

import type { BrandTheme, ConcertCycle, EnsembleManifest, Event } from './ensemble.types';

export const BrandThemeSchema = z.object({
   primary: z.string(),
   secondary: z.string().optional(),
   ink: z.string().optional(),
   background: z.string().optional(),
   onPrimary: z.string().optional(),
   onSecondary: z.string().optional(),
}) satisfies z.ZodType<BrandTheme>;

export const EnsembleManifestSchema = z.object({
   // id comes from folder name
   name: z.string(),
   shortName: z.string(),
   logoUrl: z.string().optional(),
   theme: BrandThemeSchema,
}) satisfies z.ZodType<Omit<EnsembleManifest, 'id'>>;

export const EventSchema = z.object({
   label: z.string(),
   date: z.string(), // ISO date string
   start: z.string(), // "19:30"
   stop: z.string(), // "21:50"
   breakTime: z.number().optional(), // minutes
}) satisfies z.ZodType<Event>;

export const ConcertCycleSchema = z.object({
   // id comes from filename
   label: z.string(),
   defaultDescription: z.string(),
   cycleDate: z.string(), // ISO date string for sorting/display
   events: z.array(EventSchema),
}) satisfies z.ZodType<Omit<ConcertCycle, 'id'>>;
