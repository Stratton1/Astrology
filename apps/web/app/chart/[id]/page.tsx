'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCosmosStore } from '@/lib/store';
import { ChartWheel } from '@/components/ChartWheel';
import { PlanetTable } from '@/components/PlanetTable';

interface ChartData {
  id: string;
  tradition: string;
  chartType: string;
  coordinateSystem: string;
  houseSystem: string;
  ayanamsha: string | null;
  calculatedData: {
    coordinateSystem: string;
    houseSystem: string;
    ayanamsha: string | null;
    planets: Array<{
      planet: string;
      longitude: number;
      latitude: number;
      speed: number;
      retrograde: boolean;
      sign: string;
      signDegree: number;
      house: number | null;
    }>;
    houses: Array<{
      house: number;
      longitude: number;
      sign: string;
      signDegree: number;
    }>;
    aspects: Array<{
      planet1: string;
      planet2: string;
      aspectType: string;
      exactAngle: number;
      orb: number;
      applying: boolean;
    }>;
    ascendant: number;
    midheaven: number;
    calculatedAt: string;
  };
  createdAt: string;
}

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  sextile: '⚹',
  square: '□',
  trine: '△',
  opposition: '☍',
};

export default function ChartDisplayPage({ params }: { params: { id: string } }) {
  const { accessToken } = useCosmosStore();
  const [chart, setChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChart() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
      try {
        const headers: Record<string, string> = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const res = await fetch(`${apiUrl}/api/v1/charts/${params.id}`, { headers });
        if (!res.ok) {
          setError(`Failed to load chart (${res.status})`);
          return;
        }

        const json = (await res.json()) as { chart: ChartData };
        setChart(json.chart);
      } catch {
        setError('Failed to load chart');
      } finally {
        setLoading(false);
      }
    }

    fetchChart();
  }, [params.id, accessToken]);

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-12 flex items-center justify-center">
        <div className="text-cosmos-silver/60">Loading chart...</div>
      </main>
    );
  }

  const calc = chart?.calculatedData;

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
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
          </div>
        </div>

        {error || !chart || !calc ? (
          <div className="cosmos-card text-center py-16">
            <p className="text-cosmos-silver/60 text-lg mb-4">
              {error || 'Chart could not be loaded.'}
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
                  planets={calc.planets as Parameters<typeof ChartWheel>[0]['planets']}
                  houses={calc.houses.map((h) => ({
                    house: h.house,
                    cuspLongitude: h.longitude,
                    sign: h.sign,
                    signDegree: h.signDegree,
                  })) as Parameters<typeof ChartWheel>[0]['houses']}
                  ascendant={calc.ascendant}
                  midheaven={calc.midheaven}
                  size={500}
                />
              </div>

              {/* Planet Positions */}
              <div className="cosmos-card">
                <h2 className="font-display text-lg font-semibold text-cosmos-gold mb-6">
                  Planet Positions
                </h2>
                <PlanetTable
                  planets={calc.planets as Parameters<typeof PlanetTable>[0]['planets']}
                />
              </div>
            </div>

            {/* Aspects Table */}
            <div className="cosmos-card">
              <h2 className="font-display text-lg font-semibold text-cosmos-lavender mb-6">
                Aspects ({calc.aspects.length})
              </h2>
              {calc.aspects.length === 0 ? (
                <p className="text-cosmos-silver/50 text-sm">No aspects calculated.</p>
              ) : (
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
                      {calc.aspects.map((a, i) => (
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
              )}
            </div>

            {/* Chart Info */}
            <div className="cosmos-card">
              <h2 className="font-display text-lg font-semibold text-cosmos-silver mb-4">
                Chart Details
              </h2>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-cosmos-silver/50">Ascendant</dt>
                  <dd className="text-cosmos-mist font-medium">{calc.ascendant.toFixed(2)}°</dd>
                </div>
                <div>
                  <dt className="text-cosmos-silver/50">Midheaven</dt>
                  <dd className="text-cosmos-mist font-medium">{calc.midheaven.toFixed(2)}°</dd>
                </div>
                <div>
                  <dt className="text-cosmos-silver/50">Coordinate System</dt>
                  <dd className="text-cosmos-mist font-medium">{calc.coordinateSystem}</dd>
                </div>
                <div>
                  <dt className="text-cosmos-silver/50">House System</dt>
                  <dd className="text-cosmos-mist font-medium">{calc.houseSystem}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
