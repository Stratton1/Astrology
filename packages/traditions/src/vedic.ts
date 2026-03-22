import type { TraditionConfig } from './types.js';

/**
 * Vedic / Jyotish tradition configuration.
 *
 * Uses sidereal coordinates corrected with the Lahiri (Chitrapaksha)
 * ayanamsha, which is the standard adopted by the Indian Government's
 * Rashtriya Panchang and is the most widely used in Jyotish practice.
 *
 * House system: Whole Sign (each rasi = one bhava).
 *
 * Rulerships follow the classical Parashari system:
 *   Seven graha (Sun through Saturn) rule the twelve rashis.
 *   Mercury and Venus each rule two signs; so do the Luminaries
 *   and Mars/Jupiter/Saturn.
 *   Rahu and Ketu (lunar nodes) are not domicile lords in classical
 *   Jyotish but are included in the planets list as shadowy planets.
 *
 * Nakshatra list: 27 nakshatras in order, each with its Nakshatra
 * lord (following the Vimshottari dasha sequence).
 */

export interface Nakshatra {
  number: number;       // 1–27
  name: string;
  sanskrit: string;
  lord: string;         // Vimshottari dasha lord
  degrees: {
    start: number;      // sidereal longitude where nakshatra begins
    end: number;
  };
}

export const nakshatras: Nakshatra[] = [
  { number: 1,  name: 'Ashwini',      sanskrit: 'Aśvinī',     lord: 'Ketu',    degrees: { start: 0,      end: 13.333  } },
  { number: 2,  name: 'Bharani',      sanskrit: 'Bharaṇī',    lord: 'Venus',   degrees: { start: 13.333, end: 26.667  } },
  { number: 3,  name: 'Krittika',     sanskrit: 'Kṛttikā',    lord: 'Sun',     degrees: { start: 26.667, end: 40      } },
  { number: 4,  name: 'Rohini',       sanskrit: 'Rohiṇī',     lord: 'Moon',    degrees: { start: 40,     end: 53.333  } },
  { number: 5,  name: 'Mrigashira',   sanskrit: 'Mṛgaśīrṣa',  lord: 'Mars',    degrees: { start: 53.333, end: 66.667  } },
  { number: 6,  name: 'Ardra',        sanskrit: 'Ārdrā',      lord: 'Rahu',    degrees: { start: 66.667, end: 80      } },
  { number: 7,  name: 'Punarvasu',    sanskrit: 'Punarvasu',  lord: 'Jupiter', degrees: { start: 80,     end: 93.333  } },
  { number: 8,  name: 'Pushya',       sanskrit: 'Puṣya',      lord: 'Saturn',  degrees: { start: 93.333, end: 106.667 } },
  { number: 9,  name: 'Ashlesha',     sanskrit: 'Āśleṣā',     lord: 'Mercury', degrees: { start: 106.667, end: 120   } },
  { number: 10, name: 'Magha',        sanskrit: 'Maghā',      lord: 'Ketu',    degrees: { start: 120,    end: 133.333 } },
  { number: 11, name: 'Purva Phalguni', sanskrit: 'Pūrva Phalgunī', lord: 'Venus', degrees: { start: 133.333, end: 146.667 } },
  { number: 12, name: 'Uttara Phalguni', sanskrit: 'Uttara Phalgunī', lord: 'Sun', degrees: { start: 146.667, end: 160   } },
  { number: 13, name: 'Hasta',        sanskrit: 'Hasta',      lord: 'Moon',    degrees: { start: 160,    end: 173.333 } },
  { number: 14, name: 'Chitra',       sanskrit: 'Citrā',      lord: 'Mars',    degrees: { start: 173.333, end: 186.667 } },
  { number: 15, name: 'Swati',        sanskrit: 'Svātī',      lord: 'Rahu',    degrees: { start: 186.667, end: 200   } },
  { number: 16, name: 'Vishakha',     sanskrit: 'Viśākhā',    lord: 'Jupiter', degrees: { start: 200,    end: 213.333 } },
  { number: 17, name: 'Anuradha',     sanskrit: 'Anurādhā',   lord: 'Saturn',  degrees: { start: 213.333, end: 226.667 } },
  { number: 18, name: 'Jyeshtha',     sanskrit: 'Jyeṣṭhā',    lord: 'Mercury', degrees: { start: 226.667, end: 240   } },
  { number: 19, name: 'Mula',         sanskrit: 'Mūla',       lord: 'Ketu',    degrees: { start: 240,    end: 253.333 } },
  { number: 20, name: 'Purva Ashadha', sanskrit: 'Pūrvāṣāḍhā', lord: 'Venus',  degrees: { start: 253.333, end: 266.667 } },
  { number: 21, name: 'Uttara Ashadha', sanskrit: 'Uttarāṣāḍhā', lord: 'Sun', degrees: { start: 266.667, end: 280   } },
  { number: 22, name: 'Shravana',     sanskrit: 'Śravaṇa',    lord: 'Moon',    degrees: { start: 280,    end: 293.333 } },
  { number: 23, name: 'Dhanishtha',   sanskrit: 'Dhaniṣṭhā',  lord: 'Mars',    degrees: { start: 293.333, end: 306.667 } },
  { number: 24, name: 'Shatabhisha',  sanskrit: 'Śatabhiṣā',  lord: 'Rahu',    degrees: { start: 306.667, end: 320   } },
  { number: 25, name: 'Purva Bhadrapada', sanskrit: 'Pūrva Bhādrapadā', lord: 'Jupiter', degrees: { start: 320, end: 333.333 } },
  { number: 26, name: 'Uttara Bhadrapada', sanskrit: 'Uttara Bhādrapadā', lord: 'Saturn', degrees: { start: 333.333, end: 346.667 } },
  { number: 27, name: 'Revati',       sanskrit: 'Revatī',     lord: 'Mercury', degrees: { start: 346.667, end: 360   } },
];

export const vedicConfig: TraditionConfig = {
  id: 'vedic',
  name: 'Vedic / Jyotish Astrology',
  coordinateSystem: 'sidereal',
  defaultHouseSystem: 'whole-sign',
  defaultAyanamsha: 'lahiri',

  // Tighter orbs reflect Jyotish graha drishti (aspect) conventions.
  // Classical Jyotish uses full and partial aspects rather than orbs,
  // but when orb-based approximation is needed these values are standard.
  aspectOrbs: {
    conjunction: 6,
    sextile: 4,
    square: 5,
    trine: 6,
    opposition: 6,
  },

  // Classical seven graha plus Rahu and Ketu (shadow planets)
  planets: [
    'Sun',      // Surya
    'Moon',     // Chandra
    'Mercury',  // Budha
    'Venus',    // Shukra
    'Mars',     // Mangal
    'Jupiter',  // Guru / Brihaspati
    'Saturn',   // Shani
    'Rahu',     // North Node (ascending)
    'Ketu',     // South Node (descending)
  ],

  // Classical Parashari domicile rulerships (rashi -> graha)
  rulerships: {
    Aries: 'Mars',
    Taurus: 'Venus',
    Gemini: 'Mercury',
    Cancer: 'Moon',
    Leo: 'Sun',
    Virgo: 'Mercury',
    Libra: 'Venus',
    Scorpio: 'Mars',
    Sagittarius: 'Jupiter',
    Capricorn: 'Saturn',
    Aquarius: 'Saturn',
    Pisces: 'Jupiter',
  },

  dignities: {
    // Uccha (exaltation): graha -> rashi
    exaltation: {
      Sun: 'Aries',         // exact exaltation at 10° Aries
      Moon: 'Taurus',       // exact at 3° Taurus
      Mercury: 'Virgo',     // exact at 15° Virgo
      Venus: 'Pisces',      // exact at 27° Pisces
      Mars: 'Capricorn',    // exact at 28° Capricorn
      Jupiter: 'Cancer',    // exact at 5° Cancer
      Saturn: 'Libra',      // exact at 20° Libra
      Rahu: 'Gemini',       // Taurus per some schools; Gemini per Parashari
      Ketu: 'Sagittarius',  // Scorpio per some schools
    },

    // Neecha (debilitation / detriment) — opposite to uccha rashi
    detriment: {
      Sun: 'Libra',
      Moon: 'Scorpio',
      Mercury: 'Pisces',
      Venus: 'Virgo',
      Mars: 'Cancer',
      Jupiter: 'Capricorn',
      Saturn: 'Aries',
      Rahu: 'Sagittarius',
      Ketu: 'Gemini',
    },

    // Fall is identical to debilitation in Jyotish
    fall: {
      Sun: 'Libra',
      Moon: 'Scorpio',
      Mercury: 'Pisces',
      Venus: 'Virgo',
      Mars: 'Cancer',
      Jupiter: 'Capricorn',
      Saturn: 'Aries',
      Rahu: 'Sagittarius',
      Ketu: 'Gemini',
    },
  },

  features: [
    'natal',
    'transit',
    'dashas',        // Vimshottari and other dasha systems
    'nakshatras',    // Lunar mansion analysis
    'yogas',         // Planetary combinations
  ],
};
