import Link from 'next/link';
import type { ChartCalculation } from '@cosmos/types';

interface ChartPageProps {
  params: { id: string };
}

async function fetchChart(id: string): Promise<ChartCalculation | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  try {
    const res = await fetch(`${apiUrl}/api/v1/charts/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: ChartCalculation };
    return json.data;
  } catch {
    return null;
  }
}

export default async function ChartDisplayPage({ params }: ChartPageProps) {
  const chart = await fetchChart(params.id);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/chart"
            className="text-cosmos-silver/60 hover:text-cosmos-sky text-sm inline-flex items-center gap-1 transition-colors mb-4"
          >
            ← New Chart
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-gradient-cosmos">
                {chart ? 'Natal Chart' : 'Chart Not Found'}
              </h1>
              {chart && (
                <p className="text-cosmos-silver/60 text-sm mt-1">
                  {chart.tradition.charAt(0).toUpperCase() + chart.tradition.slice(1)} •{' '}
                  {chart.houseSystem.replace('_', ' ')} houses •{' '}
                  {chart.coordinateSystem} zodiac
                </p>
              )}
            </div>
            {chart && (
              <span className="text-xs text-cosmos-silver/40 mt-1">
                ID: {params.id}
              </span>
            )}
          </div>
        </div>

        {!chart ? (
          <div className="cosmos-card text-center py-16">
            <p className="text-cosmos-silver/60 text-lg mb-4">
              {params.id === 'new'
                ? 'Chart calculation pending — connect the API to see results.'
                : `Chart "${params.id}" could not be loaded.`}
            </p>
            <Link href="/chart" className="btn-primary">
              Calculate a Chart
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Chart Wheel + Planet Table layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart Wheel */}
              <div className="cosmos-card flex flex-col items-center">
                <h2 className="font-display text-lg font-semibold text-cosmos-sky mb-6 self-start">
                  Chart Wheel
                </h2>
                <ChartWheelPlaceholder
                  ascendant={chart.ascendant}
                  midheaven={chart.midheaven}
                  planetCount={chart.planets.length}
                />
              </div>

              {/* Planet Positions */}
              <div className="cosmos-card">
                <h2 className="font-display text-lg font-semibold text-cosmos-gold mb-6">
                  Planet Positions
                </h2>
                <PlanetTablePlaceholder planets={chart.planets} />
              </div>
            </div>

            {/* Aspects Table */}
            <div className="cosmos-card">
              <h2 className="font-display text-lg font-semibold text-cosmos-lavender mb-6">
                Aspects
              </h2>
              <AspectsTablePlaceholder aspects={chart.aspects} />
            </div>

            {/* Birth Data Summary */}
            <div className="cosmos-card">
              <h2 className="font-display text-lg font-semibold text-cosmos-silver mb-4">
                Birth Data
              </h2>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-cosmos-silver/50">Date</dt>
                  <dd className="text-cosmos-mist font-medium">{chart.birthData.date}</dd>
                </div>
                {chart.birthData.time && (
                  <div>
                    <dt className="text-cosmos-silver/50">Time</dt>
                    <dd className="text-cosmos-mist font-medium">{chart.birthData.time}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-cosmos-silver/50">Location</dt>
                  <dd className="text-cosmos-mist font-medium">{chart.birthData.locationName}</dd>
                </div>
                <div>
                  <dt className="text-cosmos-silver/50">Timezone</dt>
                  <dd className="text-cosmos-mist font-medium">{chart.birthData.timezoneId}</dd>
                </div>
                <div>
                  <dt className="text-cosmos-silver/50">Ascendant</dt>
                  <dd className="text-cosmos-mist font-medium">{chart.ascendant.toFixed(2)}°</dd>
                </div>
                <div>
                  <dt className="text-cosmos-silver/50">Midheaven</dt>
                  <dd className="text-cosmos-mist font-medium">{chart.midheaven.toFixed(2)}°</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Inline placeholder sub-components (server-renderable, no client deps)
// ---------------------------------------------------------------------------

function ChartWheelPlaceholder({
  ascendant,
  midheaven,
  planetCount,
}: {
  ascendant: number;
  midheaven: number;
  planetCount: number;
}) {
  const cx = 150;
  const cy = 150;
  const outerR = 130;
  const innerR = 90;
  const coreR = 40;

  // Render 12 sign divisions
  const signLines = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const x1 = cx + innerR * Math.cos(angle);
    const y1 = cy + innerR * Math.sin(angle);
    const x2 = cx + outerR * Math.cos(angle);
    const y2 = cy + outerR * Math.sin(angle);
    return { x1, y1, x2, y2 };
  });

  // Ascendant line
  const ascAngle = ((ascendant - 90) * Math.PI) / 180;
  const ascX = cx + outerR * Math.cos(ascAngle);
  const ascY = cy + outerR * Math.sin(ascAngle);

  // MC line
  const mcAngle = ((midheaven - 90) * Math.PI) / 180;
  const mcX = cx + outerR * Math.cos(mcAngle);
  const mcY = cy + outerR * Math.sin(mcAngle);

  return (
    <svg
      viewBox="0 0 300 300"
      width="280"
      height="280"
      aria-label="Chart wheel"
      className="opacity-90"
    >
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#1e2d5a" strokeWidth="1.5" />
      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#2d3a8c" strokeWidth="1" />
      {/* Core circle */}
      <circle cx={cx} cy={cy} r={coreR} fill="rgba(13,17,23,0.8)" stroke="#3b5bdb" strokeWidth="1" />

      {/* Sign division lines */}
      {signLines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="#2d3a8c"
          strokeWidth="0.75"
        />
      ))}

      {/* Ascendant axis */}
      <line
        x1={cx - outerR * Math.cos(ascAngle)}
        y1={cy - outerR * Math.sin(ascAngle)}
        x2={ascX}
        y2={ascY}
        stroke="#4dabf7"
        strokeWidth="1.5"
        strokeDasharray="4 2"
        opacity="0.8"
      />

      {/* MC axis */}
      <line
        x1={cx - outerR * Math.cos(mcAngle)}
        y1={cy - outerR * Math.sin(mcAngle)}
        x2={mcX}
        y2={mcY}
        stroke="#ffd43b"
        strokeWidth="1.5"
        strokeDasharray="4 2"
        opacity="0.7"
      />

      {/* ASC label */}
      <text x={ascX + 4} y={ascY - 4} fill="#4dabf7" fontSize="9" fontFamily="serif">
        ASC
      </text>

      {/* MC label */}
      <text x={mcX + 4} y={mcY - 4} fill="#ffd43b" fontSize="9" fontFamily="serif">
        MC
      </text>

      {/* Planet count indicator */}
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fill="#adb5bd"
        fontSize="10"
        fontFamily="serif"
      >
        {planetCount} planets
      </text>
    </svg>
  );
}

type PlanetEntry = {
  planet: string;
  sign: string;
  signDegree: number;
  house?: number;
  retrograde: boolean;
};

function PlanetTablePlaceholder({ planets }: { planets: PlanetEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cosmos-midnight text-left">
            <th className="pb-3 text-cosmos-silver/60 font-medium">Planet</th>
            <th className="pb-3 text-cosmos-silver/60 font-medium">Sign</th>
            <th className="pb-3 text-cosmos-silver/60 font-medium">Degree</th>
            <th className="pb-3 text-cosmos-silver/60 font-medium">House</th>
            <th className="pb-3 text-cosmos-silver/60 font-medium">R</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cosmos-midnight/50">
          {planets.map((p) => (
            <tr key={p.planet} className="hover:bg-cosmos-midnight/20 transition-colors">
              <td className="py-2.5 text-cosmos-mist font-medium">{p.planet}</td>
              <td className="py-2.5 text-cosmos-sky">{p.sign}</td>
              <td className="py-2.5 text-cosmos-silver font-mono">
                {p.signDegree.toFixed(2)}°
              </td>
              <td className="py-2.5 text-cosmos-silver">
                {p.house !== undefined ? p.house : '—'}
              </td>
              <td className="py-2.5 text-cosmos-gold">
                {p.retrograde ? '℞' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type AspectEntry = {
  planet1: string;
  planet2: string;
  aspectType: string;
  orb: number;
  applying: boolean;
};

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  sextile: '⚹',
  square: '□',
  trine: '△',
  opposition: '☍',
  semisextile: '⚺',
  semisquare: '∠',
  sesquiquadrate: '⚼',
  quincunx: '⚻',
  quintile: 'Q',
  biquintile: 'bQ',
};

function AspectsTablePlaceholder({ aspects }: { aspects: AspectEntry[] }) {
  if (aspects.length === 0) {
    return <p className="text-cosmos-silver/50 text-sm">No aspects calculated.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cosmos-midnight text-left">
            <th className="pb-3 text-cosmos-silver/60 font-medium">Planet 1</th>
            <th className="pb-3 text-cosmos-silver/60 font-medium">Aspect</th>
            <th className="pb-3 text-cosmos-silver/60 font-medium">Planet 2</th>
            <th className="pb-3 text-cosmos-silver/60 font-medium">Orb</th>
            <th className="pb-3 text-cosmos-silver/60 font-medium">A/S</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cosmos-midnight/50">
          {aspects.map((a, i) => (
            <tr key={i} className="hover:bg-cosmos-midnight/20 transition-colors">
              <td className="py-2 text-cosmos-mist">{a.planet1}</td>
              <td className="py-2 text-cosmos-gold font-serif text-base">
                {ASPECT_SYMBOLS[a.aspectType] ?? a.aspectType}
                <span className="text-cosmos-silver/50 text-xs ml-1">
                  ({a.aspectType})
                </span>
              </td>
              <td className="py-2 text-cosmos-mist">{a.planet2}</td>
              <td className="py-2 text-cosmos-silver font-mono">{a.orb.toFixed(2)}°</td>
              <td className="py-2 text-cosmos-silver/60 text-xs">
                {a.applying ? 'A' : 'S'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
