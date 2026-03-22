/**
 * Tradition-specific synthesis prompt templates.
 *
 * Each template receives structured chart data (planets, houses, aspects)
 * and produces a system prompt + user prompt for Claude.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

interface PlanetData {
  planet: string;
  longitude: number;
  latitude: number;
  speed: number;
  retrograde: boolean;
  sign: string;
  signDegree: number;
  house: number | null;
}

interface HouseData {
  house: number;
  cuspLongitude: number;
  sign: string;
  signDegree: number;
}

interface AspectData {
  planet1: string;
  planet2: string;
  aspectType: string;
  exactAngle: number;
  orb: number;
  applying: boolean;
}

interface ChartData {
  planets: PlanetData[];
  houses: HouseData[];
  aspects: AspectData[];
  ascendant: number;
  midheaven: number;
  coordinateSystem?: string;
  houseSystem?: string;
}

export interface SynthesisPrompt {
  system: string;
  user: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPlanets(planets: PlanetData[]): string {
  return planets
    .map((p) => {
      const retro = p.retrograde ? ' (R)' : '';
      const house = p.house ? ` in House ${p.house}` : '';
      return `- ${p.planet}: ${p.sign} ${p.signDegree.toFixed(1)}°${retro}${house}`;
    })
    .join('\n');
}

function formatHouses(houses: HouseData[]): string {
  return houses
    .map((h) => `- House ${h.house}: ${h.sign} ${h.signDegree.toFixed(1)}°`)
    .join('\n');
}

function formatAspects(aspects: AspectData[]): string {
  return aspects
    .map((a) => {
      const applying = a.applying ? 'applying' : 'separating';
      return `- ${a.planet1} ${a.aspectType} ${a.planet2} (orb ${a.orb.toFixed(2)}°, ${applying})`;
    })
    .join('\n');
}

function formatChartSummary(data: ChartData): string {
  return `## Planetary Positions
${formatPlanets(data.planets)}

## House Cusps (${data.houseSystem ?? 'unknown'} system)
${formatHouses(data.houses)}

## Aspects
${formatAspects(data.aspects)}

## Key Points
- Ascendant: ${data.ascendant.toFixed(2)}°
- Midheaven: ${data.midheaven.toFixed(2)}°
- Coordinate System: ${data.coordinateSystem ?? 'tropical'}`;
}

// ─── Western ────────────────────────────────────────────────────────────────

function westernPrompt(data: ChartData): SynthesisPrompt {
  return {
    system: `You are an expert Western tropical astrologer with deep knowledge of modern psychological astrology. You interpret natal charts using the tropical zodiac, modern planetary rulerships (including Uranus, Neptune, Pluto), and the Placidus or other Western house systems.

Your interpretations should:
- Begin with an overview of the chart's dominant themes (element balance, modality emphasis, hemisphere distribution)
- Interpret the Sun, Moon, and Ascendant as the core personality triad
- Discuss each planet's sign and house placement with psychological depth
- Analyze major aspects (conjunction, sextile, square, trine, opposition) and their psychological dynamics
- Note any stelliums, T-squares, grand trines, or other aspect patterns
- Discuss retrograde planets and their significance
- Provide practical insights without fatalistic predictions
- Use warm, encouraging, psychologically-informed language
- Structure the interpretation with clear sections and headings using Markdown`,

    user: `Please provide a comprehensive natal chart interpretation for the following chart data:

${formatChartSummary(data)}

Provide a thorough, insightful interpretation covering personality, emotional nature, communication style, relationships, career tendencies, and growth areas. Use Markdown formatting with headers for each section.`,
  };
}

// ─── Vedic ──────────────────────────────────────────────────────────────────

function vedicPrompt(data: ChartData): SynthesisPrompt {
  return {
    system: `You are an expert Vedic (Jyotish) astrologer with deep knowledge of classical Indian astrology. You interpret charts using the sidereal zodiac, traditional planetary rulerships (excluding outer planets as primary rulers), and the whole sign house system as primary reference.

Your interpretations should:
- Identify the Lagna (Ascendant) lord and its placement as the foundation of the reading
- Discuss planetary yogas (Raja Yoga, Dhana Yoga, etc.) present in the chart
- Analyze planets by their functional nature (benefic/malefic) relative to the Lagna
- Discuss planetary dignity: own sign, exaltation, debilitation, moolatrikona
- Note the Nakshatra placements of key planets (Moon especially)
- Assess Dasha periods and their implications where possible
- Discuss house lords and their placements (e.g., 7th lord in 10th house)
- Identify arishta (difficult) yogas as well as positive ones, with remedial suggestions
- Use proper Sanskrit terminology with English explanations
- Structure the interpretation with clear sections and headings using Markdown`,

    user: `Please provide a comprehensive Jyotish natal chart interpretation (Janma Kundali analysis) for the following chart data:

${formatChartSummary(data)}

Provide a thorough Vedic interpretation covering the Lagna, planetary yogas, house lord placements, key Nakshatras, and life area analysis (dharma, artha, kama, moksha). Use Markdown formatting with headers for each section.`,
  };
}

// ─── Hellenistic ────────────────────────────────────────────────────────────

function hellenisticPrompt(data: ChartData): SynthesisPrompt {
  return {
    system: `You are an expert Hellenistic astrologer with deep knowledge of ancient Greco-Roman astrological techniques as practiced by Vettius Valens, Dorotheus, and Ptolemy. You interpret charts using traditional methods that predate modern psychological astrology.

Your interpretations should:
- Determine sect (day/night chart) and identify the sect light, benefic, and malefic
- Analyze the domicile lord of the Ascendant (Oikodespotes) and its condition
- Assess planetary condition using essential dignities: domicile, exaltation, triplicity, bounds, decan
- Discuss planets as benefics or malefics by sect (e.g., Mars less harmful in night charts)
- Identify the Lot of Fortune (Part of Fortune) and Lot of Spirit and their lords
- Analyze whole sign house placements as the primary house system
- Note planets in their joy (e.g., Mercury in 1st, Moon in 3rd, etc.)
- Discuss bonification and maltreatment of planets through aspect
- Use proper Hellenistic terminology with clear English explanations
- Avoid modern psychological language; use the classical framework of fate, fortune, and character
- Structure the interpretation with clear sections and headings using Markdown`,

    user: `Please provide a comprehensive Hellenistic natal chart interpretation (Nativity analysis) for the following chart data:

${formatChartSummary(data)}

Provide a thorough Hellenistic interpretation covering sect analysis, domicile lord conditions, Lots, house topics by whole sign, and an overall assessment of the native's fortune and character. Use Markdown formatting with headers for each section.`,
  };
}

// ─── Factory ────────────────────────────────────────────────────────────────

const PROMPT_BUILDERS: Record<string, (data: ChartData) => SynthesisPrompt> = {
  western: westernPrompt,
  vedic: vedicPrompt,
  hellenistic: hellenisticPrompt,
};

export function buildSynthesisPrompt(
  tradition: string,
  chartDataJson: string
): SynthesisPrompt {
  const builder = PROMPT_BUILDERS[tradition];
  if (!builder) {
    throw new Error(`Unknown tradition: ${tradition}`);
  }

  const data = JSON.parse(chartDataJson) as ChartData;
  return builder(data);
}
