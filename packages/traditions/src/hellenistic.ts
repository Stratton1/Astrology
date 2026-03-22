import type { TraditionConfig } from './types.js';

/**
 * Hellenistic Astrology configuration.
 *
 * Hellenistic astrology (roughly 1st century BCE – 7th century CE) is the
 * foundational tradition from which Western and Medieval astrology descend.
 * Key sources: Dorotheus of Sidon, Vettius Valens, Claudius Ptolemy,
 * Paulus Alexandrinus, and Firmicus Maternus.
 *
 * Coordinate system: Tropical (Ptolemy codified tropical positions in
 * the Almagest, anchoring the vernal equinox at 0° Aries).
 *
 * House system: Whole Sign houses — the original Greek house system where
 * each sign of the zodiac constitutes an entire house. The Ascendant sign
 * becomes the first house regardless of degree.
 *
 * Aspects (sundesmos / schēmata): Only five Ptolemaic aspects are
 * recognised — conjunction, sextile, square, trine, and opposition.
 * Inconjunct (quincunx) and semi-sextile are explicitly excluded as
 * they were considered "aversions" (apostrophe) rather than true aspects.
 *
 * Rulerships: Seven visible planets (Luminaries + Mercury through Saturn)
 * using the classical thema mundi / chaldean order assignment.
 *
 * Dignities: Standard five-fold dignity scheme:
 *   domicile (included via rulerships), exaltation, detriment, fall.
 *   Bounds (Egyptian terms / Ptolemaic terms) and trigon lords are
 *   referenced via the 'bounds' and 'sect' features.
 *
 * Sect: Each planet belongs to a sect (diurnal or nocturnal).
 *   Diurnal sect: Sun, Jupiter, Saturn (and Mercury when oriental).
 *   Nocturnal sect: Moon, Venus, Mars (and Mercury when occidental).
 *   The chart itself is diurnal (Sun above horizon) or nocturnal.
 *
 * Lots (Arabic Parts): Hellenistic astrology uses numerous lots calculated
 * from three chart points. The Lot of Fortune is the most important.
 */

/**
 * Sect membership for the seven classical planets.
 * Mercury is haíresis-neutral (joins the sect of the luminary it is
 * configured with by phase), so it is listed under both with a note.
 */
export interface SectData {
  diurnal: string[];
  nocturnal: string[];
  /** Mercury is sect-adaptable; listed here for completeness */
  adaptable: string[];
}

export const hellenisticSect: SectData = {
  diurnal: ['Sun', 'Jupiter', 'Saturn'],
  nocturnal: ['Moon', 'Venus', 'Mars'],
  adaptable: ['Mercury'],
};

/**
 * Egyptian / Ptolemaic bounds (terms) for each sign.
 *
 * Each sign is divided into five unequal arcs each ruled by one of the five
 * star planets (Mercury, Venus, Mars, Jupiter, Saturn — never the Luminaries).
 * The data below uses the Egyptian bounds as recorded by Ptolemy in
 * Tetrabiblos I.20 and widely used in Hellenistic practice.
 *
 * Format: array of { planet, start, end } where start/end are degrees
 * within the sign (0–30).
 */
export interface BoundSegment {
  planet: string;
  start: number;
  end: number;
}

export type SignBounds = BoundSegment[];

export const egyptianBounds: Record<string, SignBounds> = {
  Aries:       [ { planet: 'Jupiter', start: 0,  end: 6  }, { planet: 'Venus',   start: 6,  end: 14 }, { planet: 'Mercury', start: 14, end: 21 }, { planet: 'Mars',    start: 21, end: 26 }, { planet: 'Saturn',  start: 26, end: 30 } ],
  Taurus:      [ { planet: 'Venus',   start: 0,  end: 8  }, { planet: 'Mercury', start: 8,  end: 15 }, { planet: 'Jupiter', start: 15, end: 22 }, { planet: 'Saturn',  start: 22, end: 26 }, { planet: 'Mars',    start: 26, end: 30 } ],
  Gemini:      [ { planet: 'Mercury', start: 0,  end: 7  }, { planet: 'Jupiter', start: 7,  end: 14 }, { planet: 'Venus',   start: 14, end: 21 }, { planet: 'Saturn',  start: 21, end: 25 }, { planet: 'Mars',    start: 25, end: 30 } ],
  Cancer:      [ { planet: 'Mars',    start: 0,  end: 6  }, { planet: 'Jupiter', start: 6,  end: 13 }, { planet: 'Mercury', start: 13, end: 20 }, { planet: 'Venus',   start: 20, end: 27 }, { planet: 'Saturn',  start: 27, end: 30 } ],
  Leo:         [ { planet: 'Jupiter', start: 0,  end: 6  }, { planet: 'Venus',   start: 6,  end: 11 }, { planet: 'Saturn',  start: 11, end: 18 }, { planet: 'Mercury', start: 18, end: 24 }, { planet: 'Mars',    start: 24, end: 30 } ],
  Virgo:       [ { planet: 'Mercury', start: 0,  end: 7  }, { planet: 'Venus',   start: 7,  end: 17 }, { planet: 'Jupiter', start: 17, end: 21 }, { planet: 'Mars',    start: 21, end: 28 }, { planet: 'Saturn',  start: 28, end: 30 } ],
  Libra:       [ { planet: 'Saturn',  start: 0,  end: 6  }, { planet: 'Mercury', start: 6,  end: 14 }, { planet: 'Jupiter', start: 14, end: 21 }, { planet: 'Venus',   start: 21, end: 28 }, { planet: 'Mars',    start: 28, end: 30 } ],
  Scorpio:     [ { planet: 'Mars',    start: 0,  end: 7  }, { planet: 'Venus',   start: 7,  end: 11 }, { planet: 'Mercury', start: 11, end: 19 }, { planet: 'Jupiter', start: 19, end: 24 }, { planet: 'Saturn',  start: 24, end: 30 } ],
  Sagittarius: [ { planet: 'Jupiter', start: 0,  end: 12 }, { planet: 'Venus',   start: 12, end: 17 }, { planet: 'Mercury', start: 17, end: 21 }, { planet: 'Saturn',  start: 21, end: 26 }, { planet: 'Mars',    start: 26, end: 30 } ],
  Capricorn:   [ { planet: 'Mercury', start: 0,  end: 7  }, { planet: 'Jupiter', start: 7,  end: 14 }, { planet: 'Venus',   start: 14, end: 22 }, { planet: 'Saturn',  start: 22, end: 26 }, { planet: 'Mars',    start: 26, end: 30 } ],
  Aquarius:    [ { planet: 'Mercury', start: 0,  end: 7  }, { planet: 'Venus',   start: 7,  end: 13 }, { planet: 'Jupiter', start: 13, end: 20 }, { planet: 'Mars',    start: 20, end: 25 }, { planet: 'Saturn',  start: 25, end: 30 } ],
  Pisces:      [ { planet: 'Venus',   start: 0,  end: 12 }, { planet: 'Jupiter', start: 12, end: 16 }, { planet: 'Mercury', start: 16, end: 19 }, { planet: 'Mars',    start: 19, end: 28 }, { planet: 'Saturn',  start: 28, end: 30 } ],
};

/**
 * Lots (Klēroi) — formulaic points derived from the Ascendant and two planets.
 *
 * Each lot has a diurnal and nocturnal formula (the formula reverses between
 * day and night charts). Format: "Asc + A - B" means start at the Ascendant,
 * add the arc from B to A, project from the Ascendant.
 *
 * The Lot of Fortune (Klēros Tychēs) is the single most important lot.
 */
export interface Lot {
  name: string;
  greek: string;
  diurnal: string;   // e.g. "Asc + Moon - Sun"
  nocturnal: string; // reversed formula
}

export const hellenisticLots: Lot[] = [
  {
    name: 'Fortune',
    greek: 'Κλῆρος Τύχης',
    diurnal:   'Asc + Moon - Sun',
    nocturnal: 'Asc + Sun - Moon',
  },
  {
    name: 'Spirit',
    greek: 'Κλῆρος Δαίμονος',
    diurnal:   'Asc + Sun - Moon',
    nocturnal: 'Asc + Moon - Sun',
  },
  {
    name: 'Eros',
    greek: 'Κλῆρος Ἔρωτος',
    diurnal:   'Asc + Venus - Spirit',
    nocturnal: 'Asc + Spirit - Venus',
  },
  {
    name: 'Necessity',
    greek: 'Κλῆρος Ἀνάγκης',
    diurnal:   'Asc + Fortune - Mercury',
    nocturnal: 'Asc + Mercury - Fortune',
  },
  {
    name: 'Courage',
    greek: 'Κλῆρος Τόλμης',
    diurnal:   'Asc + Fortune - Mars',
    nocturnal: 'Asc + Mars - Fortune',
  },
  {
    name: 'Victory',
    greek: 'Κλῆρος Νίκης',
    diurnal:   'Asc + Jupiter - Spirit',
    nocturnal: 'Asc + Spirit - Jupiter',
  },
  {
    name: 'Nemesis',
    greek: 'Κλῆρος Νεμέσεως',
    diurnal:   'Asc + Saturn - Fortune',
    nocturnal: 'Asc + Fortune - Saturn',
  },
];

export const hellenisticConfig: TraditionConfig = {
  id: 'hellenistic',
  name: 'Hellenistic Astrology',
  coordinateSystem: 'tropical',
  defaultHouseSystem: 'whole-sign',

  // Ptolemaic orbs — Hellenistic sources do not specify orbs in the modern
  // sense; they speak of a planet "casting a ray" into a sign. These orb
  // values represent reasonable modern approximations for Hellenistic practice
  // as discussed by Schmidt, Hand, and Brennan.
  aspectOrbs: {
    conjunction:  8,
    sextile:      6,
    square:       7,
    trine:        8,
    opposition:   8,
  },

  // Seven visible (classical) planets only. Outer planets (Uranus, Neptune,
  // Pluto) were unknown in antiquity and are excluded from this tradition.
  planets: [
    'Sun',      // Helios
    'Moon',     // Selene / Mene
    'Mercury',  // Hermes / Stilbon
    'Venus',    // Aphrodite / Phosphoros / Hesperos
    'Mars',     // Ares / Pyroeis
    'Jupiter',  // Zeus / Phaethon
    'Saturn',   // Kronos / Phainon
  ],

  // Domicile rulerships (oikodespotēs) following the thema mundi assignment.
  // The Luminaries rule one sign each (Leo/Cancer); the five star planets
  // each rule two signs symmetrically about the Leo/Cancer axis.
  rulerships: {
    Aries:       'Mars',
    Taurus:      'Venus',
    Gemini:      'Mercury',
    Cancer:      'Moon',
    Leo:         'Sun',
    Virgo:       'Mercury',
    Libra:       'Venus',
    Scorpio:     'Mars',
    Sagittarius: 'Jupiter',
    Capricorn:   'Saturn',
    Aquarius:    'Saturn',
    Pisces:      'Jupiter',
  },

  dignities: {
    // Hypsōma (exaltation): planet -> sign of greatest power
    // Classical sources: Dorotheus, Porphyry, Paulus Alexandrinus
    exaltation: {
      Sun:     'Aries',       // 19° Aries per Dorotheus
      Moon:    'Taurus',      // 3° Taurus
      Mercury: 'Virgo',       // 15° Virgo
      Venus:   'Pisces',      // 27° Pisces
      Mars:    'Capricorn',   // 28° Capricorn
      Jupiter: 'Cancer',      // 15° Cancer
      Saturn:  'Libra',       // 21° Libra
    },

    // Tapeinōma (depression / detriment) — sign opposite domicile
    // In Hellenistic usage this is called "adversity" or "exile".
    detriment: {
      Sun:     'Aquarius',
      Moon:    'Capricorn',
      Mercury: 'Sagittarius/Pisces',
      Venus:   'Aries/Scorpio',
      Mars:    'Taurus/Libra',
      Jupiter: 'Gemini/Virgo',
      Saturn:  'Cancer/Leo',
    },

    // Tapeinōma (fall) — sign opposite exaltation
    fall: {
      Sun:     'Libra',
      Moon:    'Scorpio',
      Mercury: 'Pisces',
      Venus:   'Virgo',
      Mars:    'Cancer',
      Jupiter: 'Capricorn',
      Saturn:  'Aries',
    },
  },

  // Hellenistic-specific techniques supported by this tradition
  features: [
    'natal',
    'transit',
    'sect',          // Diurnal / nocturnal sect analysis
    'bounds',        // Egyptian / Ptolemaic terms (bounds of the planets)
    'lots',          // Hermetic lots (Klēroi): Fortune, Spirit, etc.
    'profections',   // Annual profections (one sign per year)
  ],
};
