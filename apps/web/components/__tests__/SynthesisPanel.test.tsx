import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SynthesisPanel } from '../SynthesisPanel';

// Mock the hooks
const mockMutateAsync = vi.fn();
vi.mock('@/lib/hooks', () => ({
  useGenerateSynthesis: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }),
  useSynthesis: () => ({
    data: null,
  }),
  useSynthesesForChart: () => ({
    data: [],
    isLoading: false,
  }),
}));

// Mock the store
vi.mock('@/lib/store', () => ({
  useCosmosStore: () => 'mock-token',
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('SynthesisPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the generate button when no synthesis exists', () => {
    renderWithProviders(
      <SynthesisPanel chartId="chart-123" tradition="western" />
    );
    expect(screen.getByText('Generate Interpretation')).toBeDefined();
    expect(screen.getByText('AI Interpretation')).toBeDefined();
  });

  it('displays the tradition name', () => {
    renderWithProviders(
      <SynthesisPanel chartId="chart-123" tradition="western" />
    );
    expect(screen.getByText('Western')).toBeDefined();
  });

  it('calls generate mutation on button click', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({
      synthesis: {
        id: 'synth-1',
        chartId: 'chart-123',
        tradition: 'western',
        status: 'pending',
      },
    });

    renderWithProviders(
      <SynthesisPanel chartId="chart-123" tradition="western" />
    );

    await user.click(screen.getByText('Generate Interpretation'));
    expect(mockMutateAsync).toHaveBeenCalledWith({
      chartId: 'chart-123',
      tradition: 'western',
    });
  });
});
