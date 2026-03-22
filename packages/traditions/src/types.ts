export interface AspectOrbs {
  conjunction: number;
  sextile: number;
  square: number;
  trine: number;
  opposition: number;
}

export interface TraditionConfig {
  id: string;
  name: string;
  coordinateSystem: 'tropical' | 'sidereal';
  defaultHouseSystem: string;
  defaultAyanamsha?: string;
  aspectOrbs: AspectOrbs;
  planets: string[]; // Which planets this tradition uses
  rulerships: Record<string, string>; // sign -> ruling planet
  dignities: {
    exaltation: Record<string, string>; // planet -> sign
    detriment: Record<string, string>;
    fall: Record<string, string>;
  };
  features: string[]; // Which features this tradition supports
}
