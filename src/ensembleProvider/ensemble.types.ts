export type Event = {
   label: string;
   date: string;
   start: string;
   stop: string;
   breakTime?: number;
};

export type ConcertCycle = {
   id: string;
   label: string;
   defaultDescription: string;
   cycleDate: string;
   events: Event[];
};

export type BrandTheme = {
   primary: string;
   secondary?: string;
   ink?: string;
   background?: string;
   onPrimary?: string;
   onSecondary?: string;
};

export type EnsembleManifest = {
   id: string;
   name: string;
   shortName: string;
   logoUrl?: string;
   theme: BrandTheme;
};

export type EnsembleConfig = EnsembleManifest & {
   cycles: ConcertCycle[];
};

export type EnsembleRegistry = {
   ensembles: EnsembleConfig[];
   byId: Record<string, EnsembleConfig>;
};

export type EnsembleSelection = {
   ensembleId: string;
   cycleId?: string;
};
