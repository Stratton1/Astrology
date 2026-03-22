import { describe, it, expect } from 'vitest';
import { queryKeys } from '../hooks';

describe('Query Keys', () => {
  it('generates correct profiles key', () => {
    expect(queryKeys.profiles).toEqual(['profiles']);
  });

  it('generates correct profile key with id', () => {
    expect(queryKeys.profile('abc')).toEqual(['profiles', 'abc']);
  });

  it('generates correct charts key', () => {
    expect(queryKeys.charts).toEqual(['charts']);
  });

  it('generates correct chart key with id', () => {
    expect(queryKeys.chart('xyz')).toEqual(['charts', 'xyz']);
  });
});
