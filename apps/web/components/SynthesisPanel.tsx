'use client';

import { useState, useEffect } from 'react';
import { useGenerateSynthesis, useSynthesis, useSynthesesForChart } from '@/lib/hooks';
import type { Synthesis, Tradition } from '@cosmos/types';

// ─── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] ?? styles['pending']}`}
    >
      {status === 'processing' && (
        <span className="w-2 h-2 mr-1.5 rounded-full bg-blue-400 animate-pulse" />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Markdown-ish renderer (basic) ──────────────────────────────────────────

function SynthesisContent({ content }: { content: string }) {
  // Simple markdown: headers, bold, paragraphs
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={key++} className="text-cosmos-gold font-display font-semibold text-base mt-6 mb-2">
          {line.slice(4)}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={key++} className="text-cosmos-sky font-display font-semibold text-lg mt-8 mb-3">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={key++} className="text-gradient-cosmos font-display font-bold text-xl mt-8 mb-4">
          {line.slice(2)}
        </h2>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={key++} className="text-cosmos-silver ml-4 list-disc mb-1">
          {line.slice(2)}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<br key={key++} />);
    } else {
      // Render bold text within paragraphs
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <p key={key++} className="text-cosmos-silver leading-relaxed mb-2">
          {parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={i} className="text-cosmos-mist font-medium">
                {part.slice(2, -2)}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    }
  }

  return <div className="prose-cosmos">{elements}</div>;
}

// ─── Loading animation ──────────────────────────────────────────────────────

function SynthesisLoading() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-cosmos-sky/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-cosmos-sky animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-cosmos-lavender/20" />
        <div className="absolute inset-2 rounded-full border-2 border-t-cosmos-lavender animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="text-cosmos-silver/60 text-sm">
        Synthesizing your chart interpretation{dots}
      </p>
      <p className="text-cosmos-silver/40 text-xs">
        This may take 15-30 seconds
      </p>
    </div>
  );
}

// ─── Main panel ─────────────────────────────────────────────────────────────

interface SynthesisPanelProps {
  chartId: string;
  tradition: Tradition;
}

export function SynthesisPanel({ chartId, tradition }: SynthesisPanelProps) {
  const [activeSynthesisId, setActiveSynthesisId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const generateMutation = useGenerateSynthesis();
  const { data: syntheses, isLoading: listLoading } = useSynthesesForChart(chartId);
  const { data: pollingSynthesis } = useSynthesis(activeSynthesisId ?? '', isPolling);

  // Find existing synthesis for this tradition
  const existingSynthesis = syntheses?.find(
    (s: Synthesis) => s.tradition === tradition && s.status === 'completed'
  );
  const pendingSynthesis = syntheses?.find(
    (s: Synthesis) => s.tradition === tradition && (s.status === 'pending' || s.status === 'processing')
  );

  // If we discover a pending synthesis on load, start polling it
  useEffect(() => {
    if (pendingSynthesis && !activeSynthesisId) {
      setActiveSynthesisId(pendingSynthesis.id);
      setIsPolling(true);
    }
  }, [pendingSynthesis, activeSynthesisId]);

  // Stop polling when synthesis completes or fails
  useEffect(() => {
    if (
      pollingSynthesis &&
      (pollingSynthesis.status === 'completed' || pollingSynthesis.status === 'failed')
    ) {
      setIsPolling(false);
    }
  }, [pollingSynthesis]);

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync({ chartId, tradition });
      const synthesis = result.synthesis;

      if (synthesis.status === 'completed') {
        // Already had a cached result
        setActiveSynthesisId(null);
        setIsPolling(false);
      } else {
        // Job queued, start polling
        setActiveSynthesisId(synthesis.id);
        setIsPolling(true);
      }
    } catch {
      // Error handled by mutation state
    }
  };

  // Determine what to display
  const displaySynthesis =
    pollingSynthesis?.status === 'completed'
      ? pollingSynthesis
      : existingSynthesis ?? pollingSynthesis;

  const isGenerating =
    generateMutation.isPending ||
    isPolling ||
    displaySynthesis?.status === 'processing' ||
    displaySynthesis?.status === 'pending';

  if (listLoading) {
    return (
      <div className="cosmos-card">
        <div className="text-cosmos-silver/40 text-sm py-8 text-center">
          Loading synthesis data...
        </div>
      </div>
    );
  }

  return (
    <div className="cosmos-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg font-semibold text-cosmos-lavender">
          AI Interpretation
        </h2>
        {displaySynthesis && <StatusBadge status={displaySynthesis.status} />}
      </div>

      {/* No synthesis yet — show generate button */}
      {!displaySynthesis && !isGenerating && (
        <div className="text-center py-8">
          <p className="text-cosmos-silver/60 text-sm mb-4">
            Get an AI-powered interpretation of your natal chart using the{' '}
            <span className="text-cosmos-gold">
              {tradition.charAt(0).toUpperCase() + tradition.slice(1)}
            </span>{' '}
            tradition.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="btn-primary"
          >
            Generate Interpretation
          </button>
        </div>
      )}

      {/* Generation error */}
      {generateMutation.isError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">
            {generateMutation.error instanceof Error
              ? generateMutation.error.message
              : 'Failed to generate synthesis. Please try again.'}
          </p>
          <button
            onClick={handleGenerate}
            className="mt-2 text-sm text-cosmos-sky hover:text-cosmos-sky/80 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isGenerating && !displaySynthesis?.content && <SynthesisLoading />}

      {/* Failed synthesis */}
      {displaySynthesis?.status === 'failed' && (
        <div className="text-center py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">
              {displaySynthesis.error ?? 'Synthesis failed. Please try again.'}
            </p>
          </div>
          <button onClick={handleGenerate} className="btn-primary">
            Retry Interpretation
          </button>
        </div>
      )}

      {/* Completed synthesis */}
      {displaySynthesis?.status === 'completed' && displaySynthesis.content && (
        <div>
          <SynthesisContent content={displaySynthesis.content} />

          {/* Meta info */}
          <div className="mt-8 pt-4 border-t border-cosmos-midnight/50 flex flex-wrap gap-4 text-xs text-cosmos-silver/40">
            {displaySynthesis.model && (
              <span>Model: {displaySynthesis.model}</span>
            )}
            {displaySynthesis.tokensUsed && (
              <span>Tokens: {displaySynthesis.tokensUsed.toLocaleString()}</span>
            )}
            {displaySynthesis.completedAt && (
              <span>
                Generated: {new Date(displaySynthesis.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Regenerate option */}
          <div className="mt-4 text-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="text-sm text-cosmos-silver/40 hover:text-cosmos-sky transition-colors"
            >
              Regenerate interpretation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
