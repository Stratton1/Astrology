import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanetTable } from '../PlanetTable';

const mockPlanets = [
  {
    planet: 'Sun' as const,
    longitude: 355.56,
    latitude: 0,
    speed: 1.01,
    retrograde: false,
    sign: 'Pisces' as const,
    signDegree: 25.56,
    house: 10,
  },
  {
    planet: 'Moon' as const,
    longitude: 123.45,
    latitude: 5.1,
    speed: 13.2,
    retrograde: false,
    sign: 'Leo' as const,
    signDegree: 3.45,
    house: 3,
  },
  {
    planet: 'Saturn' as const,
    longitude: 330.0,
    latitude: 0.5,
    speed: -0.05,
    retrograde: true,
    sign: 'Aquarius' as const,
    signDegree: 0.0,
    house: 9,
  },
];

describe('PlanetTable', () => {
  it('renders planet names', () => {
    render(<PlanetTable planets={mockPlanets} />);
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Moon')).toBeInTheDocument();
    expect(screen.getByText('Saturn')).toBeInTheDocument();
  });

  it('renders zodiac signs', () => {
    render(<PlanetTable planets={mockPlanets} />);
    expect(screen.getByText('Pisces')).toBeInTheDocument();
    expect(screen.getByText('Leo')).toBeInTheDocument();
    expect(screen.getByText('Aquarius')).toBeInTheDocument();
  });

  it('shows retrograde indicator for retrograde planets', () => {
    render(<PlanetTable planets={mockPlanets} />);
    const retrogradeIndicators = screen.getAllByText('℞');
    // Saturn is retrograde — at least one ℞ should show
    expect(retrogradeIndicators.length).toBeGreaterThanOrEqual(1);
  });

  it('renders house numbers', () => {
    render(<PlanetTable planets={mockPlanets} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows empty state when no planets', () => {
    render(<PlanetTable planets={[]} />);
    expect(screen.getByText('No planet data available.')).toBeInTheDocument();
  });

  it('sorts planets in conventional order (Sun first)', () => {
    render(<PlanetTable planets={mockPlanets} />);
    const rows = screen.getAllByRole('row');
    // First data row (after header) should be Sun
    expect(rows[1]).toHaveTextContent('Sun');
    expect(rows[2]).toHaveTextContent('Moon');
  });

  it('optionally shows longitude column', () => {
    render(<PlanetTable planets={mockPlanets} showLongitude />);
    // λ header should be present
    expect(screen.getByText('λ')).toBeInTheDocument();
    expect(screen.getByText('355.5600°')).toBeInTheDocument();
  });
});
