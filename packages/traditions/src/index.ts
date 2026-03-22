/**
 * @cosmos/traditions
 *
 * Tradition-specific configuration data for Western, Vedic, and Hellenistic
 * astrology. Each tradition exports a TraditionConfig object plus any
 * tradition-specific supplementary data (nakshatras, lots, bounds, sect).
 */

// ── Types ──────────────────────────────────────────────────────────────────
export type { AspectOrbs, TraditionConfig } from './types.js';

// ── Western ────────────────────────────────────────────────────────────────
export { westernConfig } from './western.js';

// ── Vedic ──────────────────────────────────────────────────────────────────
export { vedicConfig, nakshatras } from './vedic.js';
export type { Nakshatra } from './vedic.js';

// ── Hellenistic ────────────────────────────────────────────────────────────
export {
  hellenisticConfig,
  hellenisticSect,
  egyptianBounds,
  hellenisticLots,
} from './hellenistic.js';
export type { SectData, BoundSegment, SignBounds, Lot } from './hellenistic.js';

// ── Tradition registry ─────────────────────────────────────────────────────

import type { TraditionConfig } from './types.js';
import { westernConfig } from './western.js';
import { vedicConfig } from './vedic.js';
import { hellenisticConfig } from './hellenistic.js';

/**
 * A map of all available traditions keyed by their string id.
 *
 * @example
 * import { TRADITIONS } from '@cosmos/traditions';
 * const config = TRADITIONS['vedic']; // vedicConfig
 */
export const TRADITIONS: Readonly<Record<string, TraditionConfig>> = {
  western:     westernConfig,
  vedic:       vedicConfig,
  hellenistic: hellenisticConfig,
} as const;

/**
 * Retrieve the configuration object for a tradition by its id.
 *
 * @param id - One of `'western'`, `'vedic'`, or `'hellenistic'`.
 * @returns The corresponding {@link TraditionConfig}, or `undefined` if the
 *          id is not recognised.
 *
 * @example
 * import { getTraditionConfig } from '@cosmos/traditions';
 *
 * const western = getTraditionConfig('western');
 * if (western) {
 *   console.log(western.defaultHouseSystem); // 'placidus'
 * }
 */
export function getTraditionConfig(id: string): TraditionConfig | undefined {
  return TRADITIONS[id];
}

/**
 * Return all registered tradition ids.
 *
 * @example
 * import { getTraditionIds } from '@cosmos/traditions';
 * getTraditionIds(); // ['western', 'vedic', 'hellenistic']
 */
export function getTraditionIds(): string[] {
  return Object.keys(TRADITIONS);
}
