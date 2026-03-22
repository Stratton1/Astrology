'use client';

import type { PlanetPosition } from '@cosmos/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀',
  Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '⛢',
  Neptune: '♆', Pluto: '♇', NorthNode: '☊', SouthNode: '☋',
  Chiron: '⚷',
};

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

// Conventional planet display order
const PLANET_ORDER = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'NorthNode', 'SouthNode', 'Chiron',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDMS(decimal: number): string {
  const deg = Math.floor(decimal);
  const rawMin = (decimal - deg) * 60;
  const min = Math.floor(rawMin);
  const sec = Math.floor((rawMin - min) * 60);
  return `${deg}°${String(min).padStart(2, '0')}'${String(sec).padStart(2, '0')}"`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlanetTableProps {
  planets: PlanetPosition[];
  /** Show the absolute ecliptic longitude column. Default: false */
  showLongitude?: boolean;
  /** Optional CSS class for the wrapping div */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlanetTable({
  planets,
  showLongitude = false,
  className,
}: PlanetTableProps) {
  // Sort planets by conventional order; unrecognised planets go to the end
  const sorted = [...planets].sort((a, b) => {
    const ai = PLANET_ORDER.indexOf(a.planet);
    const bi = PLANET_ORDER.indexOf(b.planet);
    if (ai === -1 && bi === -1) return a.planet.localeCompare(b.planet);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className={`overflow-x-auto ${className ?? ''}`}>
      <table className="w-full text-sm" aria-label="Planet positions">
        <thead>
          <tr className="border-b border-cosmos-midnight text-left">
            <th className="pb-3 pr-4 text-cosmos-silver/60 font-medium w-8" aria-label="Glyph" />
            <th className="pb-3 pr-4 text-cosmos-silver/60 font-medium">Planet</th>
            <th className="pb-3 pr-4 text-cosmos-silver/60 font-medium">Sign</th>
            <th className="pb-3 pr-4 text-cosmos-silver/60 font-medium">Degree</th>
            {showLongitude && (
              <th className="pb-3 pr-4 text-cosmos-silver/60 font-medium">λ</th>
            )}
            <th className="pb-3 pr-4 text-cosmos-silver/60 font-medium">House</th>
            <th className="pb-3 text-cosmos-silver/60 font-medium text-center">℞</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cosmos-midnight/50">
          {sorted.map((p) => (
            <tr
              key={p.planet}
              className="hover:bg-cosmos-midnight/20 transition-colors"
            >
              {/* Glyph */}
              <td className="py-2.5 pr-4 text-cosmos-gold font-serif text-base text-center">
                {PLANET_GLYPHS[p.planet] ?? '·'}
              </td>

              {/* Planet name */}
              <td className="py-2.5 pr-4 text-cosmos-mist font-medium">
                {p.planet}
              </td>

              {/* Sign (glyph + name) */}
              <td className="py-2.5 pr-4">
                <span className="text-cosmos-sky font-serif mr-1" aria-hidden="true">
                  {SIGN_GLYPHS[p.sign] ?? ''}
                </span>
                <span className="text-cosmos-silver">{p.sign}</span>
              </td>

              {/* Sign degree in DMS */}
              <td className="py-2.5 pr-4 text-cosmos-silver font-mono text-xs tabular-nums">
                {formatDMS(p.signDegree)}
              </td>

              {/* Absolute longitude (optional) */}
              {showLongitude && (
                <td className="py-2.5 pr-4 text-cosmos-silver/60 font-mono text-xs tabular-nums">
                  {p.longitude.toFixed(4)}°
                </td>
              )}

              {/* House */}
              <td className="py-2.5 pr-4 text-cosmos-silver text-center">
                {p.house !== undefined ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cosmos-midnight/60 text-xs text-cosmos-sky">
                    {p.house}
                  </span>
                ) : (
                  <span className="text-cosmos-silver/30">—</span>
                )}
              </td>

              {/* Retrograde */}
              <td className="py-2.5 text-center">
                {p.retrograde ? (
                  <span
                    className="text-cosmos-gold font-serif text-base"
                    title={`${p.planet} is retrograde`}
                    aria-label="retrograde"
                  >
                    ℞
                  </span>
                ) : (
                  <span className="text-cosmos-silver/20 text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <p className="text-cosmos-silver/40 text-sm text-center py-8">
          No planet data available.
        </p>
      )}
    </div>
  );
}
