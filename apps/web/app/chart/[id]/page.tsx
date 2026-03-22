'use client';

import Link from 'next/link';
import { useChart } from '@/lib/hooks';
import { ChartWheel } from '@/components/ChartWheel';
import { PlanetTable } from '@/components/PlanetTable';
import { SynthesisPanel } from '@/components/SynthesisPanel';
import type { Tradition } from '@cosmos/types';

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  sextile: '⚹',
  square: '□',
  trine: '△',
  opposition: '☍',
};

export default function ChartDisplayPage({ params }: { params: { id: string } }) {
  const { data: chart, isLoading, error } = useChart(params.id);

  if (isLoading) {
    return (
      <main className="min-h-[80vh] px-6 py-12 flex items-center justify-center">
        <div className="text-cosmos-silver/60">Loading chart...</div>
      </main>
    );
  }

  // The chart data may come with calculatedData nested or flat — handle both
  const calc = (chart as unknown as { calculatedData?: unknown })?.calculatedData ?? chart;
  const chartMeta = chart as unknown as {
    id?: string;
    tradition?: string;
    houseSystem?: string;
    coordinateSystem?: string;
  };
  const calcData = calc as {
    planets?: Array<{
      planet: string;
      longitude: number;
      latitude: number;
      speed: number;
      retrograde: boolean;
      sign: string;
      signDegree: number;
      house: number | null;
    }>;
    houses?: Array<{
      house: number;
      longitude?: number;
      cuspLongitude?: number;
      sign: string;
      signDegree: number;
    }>;
    aspects?: Array<{
      planet1: string;
      planet2: string;
      aspectType: string;
      exactAngle: number;
      orb: number;
      applying: boolean;
    }>;
    ascendant?: number;
    midheaven?: number;
    coordinateSystem?: string;
    houseSystem?: string;
  };

  return (
    <main className="min-h-[80vh] px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-cosmos-silver/60 hover:text-cosmos-sky text-sm inline-flex items-center gap-1 transition-colors mb-4"
          >
            ← Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <h1 className="font-display text-3xl font-bold text-gradient-cosmos">
                {chart ? 'Natal Chart' : 'Chart Not Found'}
              </h1>
              {chartMeta.tradition && (
                <p className="text-cosmos-silver/60 text-sm mt-1">
                  {chartMeta.tradition.charAt(0).toUpperCase() + chartMeta.tradition.slice(1)} &middot;{' '}
                  {(chartMeta.houseSystem ?? '').replace('_', ' ')} houses &middot;{' '}
                  {chartMeta.coordinateSystem} zodiac
                </p>
              )}
            </div>
            <Link href="/chart" className="btn-secondary text-sm py-2 shrink-0">
              New Chart
            </Link>
          </div>
        </div>

        {error || !chart || !calcData.planets ? (
          <div className="cosmos-card text-center py-16">
            <p className="text-cosmos-silver/60 text-lg mb-4">
              {error instanceof Error ? error.message : 'Chart could not be loaded.'}
            </p>
            <Link href="/chart" className="btn-primary">
              Calculate a Chart
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart Wheel */}
              <div className="cosmos-card flex flex-col items-center">
                <h2 className="font-display text-lg font-semibold text-cosmos-sky mb-6 self-start">
                  Chart Wheel
                </h2>
                <ChartWheel
                  planets={calcData.planets as Parameters<typeof ChartWheel>[0]['planets']}
                  houses={(calcData.houses ?? []).map((h) => ({
                    house: h.house,
                    cuspLongitude: h.cuspLongitude ?? h.longitude ?? 0,
                    sign: h.sign,
                    signDegree: h.signDegree,
                  })) as Parameters<typeof ChartWheel>[0]['houses']}
                  ascendant={calcData.ascendant ?? 0}
                  midheaven={calcData.midheaven ?? 0}
                  size={500}
                />
              </div>

              {/* Planet Positions */}
              <div className="cosmos-card">
                <h2 className="font-display text-lg font-semibold text-cosmos-gold mb-6">
                  Planet Positions
                </h2>
                <PlanetTable
                  planets={calcData.planets as Parameters<typeof PlanetTable>[0]['planets']}
                />
              </div>
            </div>

            {/* Aspects Table */}
            {calcData.aspects && calcData.aspects.length > 0 && (
              <div className="cosmos-card">
                <h2 className="font-display text-lg font-semibold text-cosmos-lavender mb-6">
                  Aspects ({calcData.aspects.length})
                </h2>
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
                      {calcData.aspects.map((a, i) => (
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
              </div>
            )}

            {/* Chart Details */}
            <div className="cosmos-card">
              <h2 className="font-display text-lg font-semibold text-cosmos-silver mb-4">
                Chart Details
              </h2>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-cosmos-silver/50">Ascendant</dt>
                  <dd className="text-cosmos-mist font-medium">
                    {(calcData.ascendant ?? 0).toFixed(2)}°
                  </dd>
                </div>
                <div>
                  <dt className="text-cosmos-silver/50">Midheaven</dt>
                  <dd className="text-cosmos-mist font-medium">
                    {(calcData.midheaven ?? 0).toFixed(2)}°
                  </dd>
                </div>
                <div>
                  <dt className="text-cosmos-silver/50">Coordinate System</dt>
                  <dd className="text-cosmos-mist font-medium">
                    {calcData.coordinateSystem ?? chartMeta.coordinateSystem}
                  </dd>
                </div>
                <div>
                  <dt className="text-cosmos-silver/50">House System</dt>
                  <dd className="text-cosmos-mist font-medium">
                    {calcData.houseSystem ?? chartMeta.houseSystem}
                  </dd>
                </div>
              </dl>
            </div>

            {/* AI Synthesis */}
            {chartMeta.id && chartMeta.tradition && (
              <SynthesisPanel
                chartId={chartMeta.id}
                tradition={chartMeta.tradition as Tradition}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
