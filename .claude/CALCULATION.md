# COSMOS — Calculation Engine Reference

## Engine
Swiss Ephemeris via pyswisseph (Python bindings)

## Planets Calculated
Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, North Node (mean), Chiron

## Position Format
- Ecliptic longitude: 0°–360°
- Converted to sign + degree within sign (e.g., 45° = 15° Taurus)
- Latitude, speed, retrograde status included

## House Calculation
| System | Swiss Ephem Code | Notes |
|--------|-----------------|-------|
| Placidus | P | Fails >66.5° latitude |
| Whole Sign | W | Always works |
| Equal | E | Always works |
| Koch | K | Fails >66.5° latitude |
| Campanus | C | Works at all latitudes |
| Regiomontanus | R | Works at all latitudes |

## Coordinate Systems
- **Tropical:** Default. Vernal equinox = 0° Aries.
- **Sidereal:** Apply ayanamsha via `swe.set_sid_mode()`. Options: Lahiri, Raman, Krishnamurti, Fagan-Bradley.

## Timezone Handling
- All input times converted to UTC for calculation
- Original IANA timezone ID stored with birth data
- Julian Day computed from UTC datetime
- If birth time unknown: use 12:00 noon, flag houses as unreliable

## Aspects
- Major (Ptolemaic): Conjunction (0°), Sextile (60°), Square (90°), Trine (120°), Opposition (180°)
- Orbs are tradition-specific (see packages/traditions configs)
- Calculate for all planet pairs
- Track whether aspect is applying or separating (based on relative speeds)

## Julian Day Conversion
```python
swe.julday(year, month, day, hour + min/60 + sec/3600)
```

## Key Edge Cases
1. **Arctic/Antarctic circles (>66.5°):** Placidus/Koch fail. Use Whole Sign fallback.
2. **Date line crossing:** Careful with UTC conversion.
3. **Julian/Gregorian boundary (Oct 1582):** Swiss Ephemeris handles automatically with `swe.GREG_CAL` / `swe.JUL_CAL`.
4. **Historical dates (<1500 AD):** Accuracy degrades. Document this limitation.
5. **Birth time unknown:** Calculate noon chart. Mark houses and angles as unreliable.

## Testing Methodology
- Validate against published ephemeris tables
- Use known celebrity charts with published positions
- Accuracy target: ≤1 arcminute for planetary positions
- Test all house systems for known reference data
- Test sidereal offset against known ayanamsha values
