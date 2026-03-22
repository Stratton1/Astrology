import { describe, it, expect } from 'vitest';
import { buildSynthesisPrompt } from '../lib/prompts';

const MOCK_CHART_DATA = JSON.stringify({
  planets: [
    { planet: 'Sun', longitude: 353.5, latitude: 0, speed: 1.0, retrograde: false, sign: 'Pisces', signDegree: 23.5, house: 10 },
    { planet: 'Moon', longitude: 254.9, latitude: -1.2, speed: 12.5, retrograde: false, sign: 'Sagittarius', signDegree: 14.9, house: 6 },
    { planet: 'Mercury', longitude: 330.2, latitude: -2.3, speed: 1.5, retrograde: false, sign: 'Pisces', signDegree: 0.2, house: 9 },
  ],
  houses: [
    { house: 1, cuspLongitude: 109.7, sign: 'Cancer', signDegree: 19.7 },
    { house: 2, cuspLongitude: 132.5, sign: 'Leo', signDegree: 12.5 },
  ],
  aspects: [
    { planet1: 'Sun', planet2: 'Moon', aspectType: 'square', exactAngle: 90, orb: 1.4, applying: false },
  ],
  ascendant: 109.7,
  midheaven: 19.2,
  coordinateSystem: 'tropical',
  houseSystem: 'placidus',
});

describe('buildSynthesisPrompt', () => {
  it('builds a Western prompt with system and user messages', () => {
    const prompt = buildSynthesisPrompt('western', MOCK_CHART_DATA);
    expect(prompt.system).toContain('Western tropical astrologer');
    expect(prompt.user).toContain('Sun: Pisces 23.5');
    expect(prompt.user).toContain('Moon: Sagittarius 14.9');
    expect(prompt.user).toContain('Sun square Moon');
  });

  it('builds a Vedic prompt with Jyotish terminology', () => {
    const prompt = buildSynthesisPrompt('vedic', MOCK_CHART_DATA);
    expect(prompt.system).toContain('Vedic');
    expect(prompt.system).toContain('Jyotish');
    expect(prompt.user).toContain('Janma Kundali');
  });

  it('builds a Hellenistic prompt with classical terminology', () => {
    const prompt = buildSynthesisPrompt('hellenistic', MOCK_CHART_DATA);
    expect(prompt.system).toContain('Hellenistic');
    expect(prompt.system).toContain('sect');
    expect(prompt.user).toContain('Nativity');
  });

  it('throws for unknown tradition', () => {
    expect(() => buildSynthesisPrompt('mayan', MOCK_CHART_DATA)).toThrow(
      'Unknown tradition: mayan'
    );
  });

  it('includes house system and coordinate system in output', () => {
    const prompt = buildSynthesisPrompt('western', MOCK_CHART_DATA);
    expect(prompt.user).toContain('placidus');
    expect(prompt.user).toContain('tropical');
  });

  it('formats retrograde planets correctly', () => {
    const dataWithRetro = JSON.stringify({
      planets: [
        { planet: 'Saturn', longitude: 280.0, latitude: 0, speed: -0.05, retrograde: true, sign: 'Capricorn', signDegree: 10.0, house: 7 },
      ],
      houses: [],
      aspects: [],
      ascendant: 0,
      midheaven: 0,
    });
    const prompt = buildSynthesisPrompt('western', dataWithRetro);
    expect(prompt.user).toContain('(R)');
  });

  it('formats applying/separating aspects', () => {
    const prompt = buildSynthesisPrompt('western', MOCK_CHART_DATA);
    expect(prompt.user).toContain('separating');
  });
});
