import type { TraditionConfig } from './types.js';

/**
 * Western Tropical Astrology configuration.
 *
 * Rulerships follow the modern system that assigns outer planets
 * (Uranus, Neptune, Pluto) as primary rulers of Aquarius, Pisces,
 * and Scorpio respectively, with the traditional rulers (Saturn,
 * Jupiter, Mars) retained as co-rulers in parenthetical convention
 * — but in this data structure only the primary modern ruler is
 * stored per sign.
 *
 * Dignities encode:
 *   exaltation  – the sign where a planet expresses its highest potential
 *   detriment   – the sign(s) opposite a planet's domicile(s)
 *   fall        – the sign opposite a planet's exaltation
 */
export const westernConfig: TraditionConfig = {
  id: 'western',
  name: 'Western Tropical Astrology',
  coordinateSystem: 'tropical',
  defaultHouseSystem: 'placidus',

  aspectOrbs: {
    conjunction: 8,
    sextile: 6,
    square: 7,
    trine: 8,
    opposition: 8,
  },

  // Includes classical seven plus modern outer planets and lunar nodes
  planets: [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
    'NorthNode',
    'SouthNode',
    'Chiron',
  ],

  // Modern rulerships: sign -> primary ruling planet
  rulerships: {
    Aries: 'Mars',
    Taurus: 'Venus',
    Gemini: 'Mercury',
    Cancer: 'Moon',
    Leo: 'Sun',
    Virgo: 'Mercury',
    Libra: 'Venus',
    Scorpio: 'Pluto',       // traditional co-ruler: Mars
    Sagittarius: 'Jupiter',
    Capricorn: 'Saturn',
    Aquarius: 'Uranus',     // traditional co-ruler: Saturn
    Pisces: 'Neptune',      // traditional co-ruler: Jupiter
  },

  dignities: {
    // Exaltation: planet -> sign of exaltation
    exaltation: {
      Sun: 'Aries',
      Moon: 'Taurus',
      Mercury: 'Virgo',
      Venus: 'Pisces',
      Mars: 'Capricorn',
      Jupiter: 'Cancer',
      Saturn: 'Libra',
      Uranus: 'Scorpio',
      Neptune: 'Leo',
      Pluto: 'Aries',       // modern attribution, debated
      NorthNode: 'Gemini',
    },

    // Detriment: planet -> sign(s) opposite its domicile
    // Where a planet rules two signs both opposite signs are listed
    // separated by '/'.
    detriment: {
      Sun: 'Aquarius',
      Moon: 'Capricorn',
      Mercury: 'Sagittarius/Pisces',
      Venus: 'Aries/Scorpio',
      Mars: 'Taurus/Libra',
      Jupiter: 'Gemini/Virgo',
      Saturn: 'Cancer/Leo',
      Uranus: 'Leo',
      Neptune: 'Virgo',
      Pluto: 'Taurus',
    },

    // Fall: planet -> sign opposite its exaltation
    fall: {
      Sun: 'Libra',
      Moon: 'Scorpio',
      Mercury: 'Pisces',
      Venus: 'Virgo',
      Mars: 'Cancer',
      Jupiter: 'Capricorn',
      Saturn: 'Aries',
      Uranus: 'Taurus',
      Neptune: 'Aquarius',
      Pluto: 'Libra',       // modern attribution, debated
      NorthNode: 'Sagittarius',
    },
  },

  features: [
    'natal',
    'transit',
    'synastry',
    'composite',
    'solar_return',
    'progressions',
  ],
};
