import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ioredis before importing queue
vi.mock('bullmq', () => {
  const mockAdd = vi.fn().mockResolvedValue({ id: 'job-123' });
  const mockQueue = vi.fn().mockImplementation(() => ({
    add: mockAdd,
    on: vi.fn(),
  }));
  return {
    Queue: mockQueue,
    Worker: vi.fn(),
    Job: vi.fn(),
  };
});

vi.mock('../lib/config', () => ({
  config: {
    redisUrl: 'redis://localhost:6379',
  },
}));

vi.mock('../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('queue module', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports expected interface', async () => {
    const mod = await import('../lib/queue');
    expect(mod.SYNTHESIS_QUEUE).toBe('synthesis');
    expect(typeof mod.getSynthesisQueue).toBe('function');
    expect(typeof mod.enqueueSynthesisJob).toBe('function');
    expect(mod.redisConnection).toBeDefined();
    expect(mod.redisConnection.host).toBe('localhost');
    expect(mod.redisConnection.port).toBe(6379);
  });
});
