'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { PlanetPosition, HousePosition } from '@cosmos/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀',
  Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '⛢',
  Neptune: '♆', Pluto: '♇', NorthNode: '☊', SouthNode: '☋',
  Chiron: '⚷',
};

// Element colors (Fire=red, Earth=green, Air=amber, Water=blue)
const SIGN_COLORS: Record<string, string> = {
  Aries: '#e03131', Taurus: '#2f9e44', Gemini: '#f59f00', Cancer: '#1971c2',
  Leo: '#e03131', Virgo: '#2f9e44', Libra: '#f59f00', Scorpio: '#1971c2',
  Sagittarius: '#e03131', Capricorn: '#2f9e44', Aquarius: '#f59f00', Pisces: '#1971c2',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChartWheelProps {
  planets: PlanetPosition[];
  houses: HousePosition[];
  ascendant: number;
  midheaven: number;
  /** Size of the SVG in pixels (square). Default: 500 */
  size?: number;
  /** Optional CSS class */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Convert ecliptic longitude to SVG angle.
 * Oriented so the Ascendant sits at the 9 o'clock position (left).
 */
function eclipticToSvg(longitude: number, ascendant: number): number {
  return longitude - ascendant + 180;
}

function polarToXY(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): [number, number] {
  const rad = toRadians(angleDeg - 90); // -90 so 0° is at top
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChartWheel({
  planets,
  houses,
  ascendant,
  midheaven,
  size = 500,
  className,
}: ChartWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const svg = d3.select(el);
    svg.selectAll('*').remove();

    const cx = size / 2;
    const cy = size / 2;

    // Ring radii
    const outerR = size * 0.455;    // zodiac band outer
    const zodiacInR = size * 0.375; // zodiac band inner
    const houseOutR = size * 0.295; // house band outer
    const houseInR = size * 0.185;  // house band inner / planet ring
    const coreR = size * 0.12;      // central disc

    const root = svg.append('g');

    // ------------------------------------------------------------------
    // Background disc
    // ------------------------------------------------------------------
    root.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', outerR)
      .attr('fill', '#0d1117')
      .attr('stroke', '#1e2d5a')
      .attr('stroke-width', 1.5);

    // ------------------------------------------------------------------
    // Zodiac sign band (outerR → zodiacInR)
    // ------------------------------------------------------------------
    ZODIAC_SIGNS.forEach((sign, i) => {
      const startLng = i * 30;
      const endLng = (i + 1) * 30;
      const startA = toRadians(eclipticToSvg(startLng, ascendant) - 90);
      const endA = toRadians(eclipticToSvg(endLng, ascendant) - 90);

      const arc = d3.arc<unknown>()
        .innerRadius(zodiacInR)
        .outerRadius(outerR)
        .startAngle(startA)
        .endAngle(endA);

      root.append('path')
        .attr('d', arc(null as unknown)!)
        .attr('transform', `translate(${cx},${cy})`)
        .attr('fill', 'rgba(15,23,42,0.6)')
        .attr('stroke', '#2d3a8c')
        .attr('stroke-width', 0.75);

      // Sign glyph at arc midpoint
      const midA = eclipticToSvg(startLng + 15, ascendant);
      const [gx, gy] = polarToXY(cx, cy, (zodiacInR + outerR) / 2, midA);

      root.append('text')
        .attr('x', gx).attr('y', gy)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', SIGN_COLORS[sign] ?? '#adb5bd')
        .attr('font-size', Math.round(size * 0.033))
        .attr('font-family', 'serif')
        .text(ZODIAC_GLYPHS[sign] ?? sign.slice(0, 3));
    });

    // ------------------------------------------------------------------
    // House ring
    // ------------------------------------------------------------------
    root.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', zodiacInR)
      .attr('fill', 'none').attr('stroke', '#2d3a8c').attr('stroke-width', 1);

    root.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', houseOutR)
      .attr('fill', 'rgba(10,10,26,0.5)').attr('stroke', '#3b5bdb').attr('stroke-width', 1);

    root.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', houseInR)
      .attr('fill', 'rgba(13,17,23,0.85)').attr('stroke', '#1e2d5a').attr('stroke-width', 0.75);

    // House cusp lines
    const sortedHouses = [...houses].sort((a, b) => a.house - b.house);
    sortedHouses.forEach((house, idx) => {
      const angle = eclipticToSvg(house.cuspLongitude, ascendant);
      const [ox, oy] = polarToXY(cx, cy, zodiacInR, angle);
      const [ix, iy] = polarToXY(cx, cy, coreR, angle);
      const isAngular = [1, 4, 7, 10].includes(house.house);

      root.append('line')
        .attr('x1', ox).attr('y1', oy)
        .attr('x2', ix).attr('y2', iy)
        .attr('stroke', isAngular ? '#4dabf7' : '#1e2d5a')
        .attr('stroke-width', isAngular ? 1.5 : 0.6)
        .attr('opacity', isAngular ? 0.9 : 0.6);

      // House number between houseInR and houseOutR
      const nextHouse = sortedHouses[(idx + 1) % 12];
      if (nextHouse) {
        const diff = (nextHouse.cuspLongitude - house.cuspLongitude + 360) % 360;
        const midLng = (house.cuspLongitude + diff / 2) % 360;
        const midA = eclipticToSvg(midLng, ascendant);
        const [lx, ly] = polarToXY(cx, cy, (houseInR + houseOutR) / 2, midA);

        root.append('text')
          .attr('x', lx).attr('y', ly)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', '#4dabf7')
          .attr('font-size', Math.round(size * 0.022))
          .attr('opacity', 0.7)
          .text(String(house.house));
      }
    });

    // ------------------------------------------------------------------
    // Core disc
    // ------------------------------------------------------------------
    root.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', coreR)
      .attr('fill', 'rgba(10,10,26,0.95)')
      .attr('stroke', '#3b5bdb')
      .attr('stroke-width', 1);

    // ------------------------------------------------------------------
    // Planet glyphs (on ring at houseInR inner edge)
    // ------------------------------------------------------------------
    const planetRingR = houseInR - size * 0.015;

    [...planets]
      .sort((a, b) => a.longitude - b.longitude)
      .forEach((planet) => {
        const angle = eclipticToSvg(planet.longitude, ascendant);
        const [px, py] = polarToXY(cx, cy, planetRingR, angle);

        // Tick line from zodiac inner ring inward
        const [tx1, ty1] = polarToXY(cx, cy, zodiacInR, angle);
        const [tx2, ty2] = polarToXY(cx, cy, zodiacInR - size * 0.022, angle);
        root.append('line')
          .attr('x1', tx1).attr('y1', ty1)
          .attr('x2', tx2).attr('y2', ty2)
          .attr('stroke', '#4dabf7').attr('stroke-width', 0.75).attr('opacity', 0.5);

        // Planet glyph
        root.append('text')
          .attr('x', px).attr('y', py)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', planet.retrograde ? '#f59f00' : '#dee2e6')
          .attr('font-size', Math.round(size * 0.036))
          .attr('font-family', 'serif')
          .text(PLANET_GLYPHS[planet.planet] ?? planet.planet.slice(0, 2));

        // Retrograde indicator
        if (planet.retrograde) {
          const [rx, ry] = polarToXY(cx, cy, planetRingR - size * 0.038, angle);
          root.append('text')
            .attr('x', rx).attr('y', ry)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('fill', '#f59f00')
            .attr('font-size', Math.round(size * 0.018))
            .text('℞');
        }
      });

    // ------------------------------------------------------------------
    // Cardinal axes (ASC / DSC / MC / IC)
    // ------------------------------------------------------------------
    const ascA = eclipticToSvg(ascendant, ascendant);         // = 180
    const dscA = eclipticToSvg(ascendant + 180, ascendant);   // = 0
    const mcA = eclipticToSvg(midheaven, ascendant);
    const icA = eclipticToSvg(midheaven + 180, ascendant);

    const axes = [
      { angle: ascA, label: 'ASC', color: '#4dabf7' },
      { angle: dscA, label: 'DSC', color: '#4dabf7' },
      { angle: mcA, label: 'MC', color: '#ffd43b' },
      { angle: icA, label: 'IC', color: '#ffd43b' },
    ];

    axes.forEach(({ angle, label, color }) => {
      const [ox, oy] = polarToXY(cx, cy, outerR, angle);
      const [ix, iy] = polarToXY(cx, cy, coreR, angle);
      const [lx, ly] = polarToXY(cx, cy, outerR + size * 0.042, angle);

      root.append('line')
        .attr('x1', ox).attr('y1', oy)
        .attr('x2', ix).attr('y2', iy)
        .attr('stroke', color).attr('stroke-width', 1.5).attr('opacity', 0.85);

      root.append('text')
        .attr('x', lx).attr('y', ly)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', color)
        .attr('font-size', Math.round(size * 0.028))
        .attr('font-weight', 'bold')
        .text(label);
    });
  }, [planets, houses, ascendant, midheaven, size]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-label="Astrological chart wheel"
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}
