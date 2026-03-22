# COSMOS — Astrology Traditions Reference

## CRITICAL RULE
**Never mix sidereal and tropical values in the same output without explicit labels.**
Every calculation response must include `coordinateSystem` and `ayanamsha` fields.

## Western Tropical
- **Coordinate system:** Tropical (vernal equinox = 0° Aries)
- **Default house system:** Placidus
- **Rulerships:** Modern (includes Uranus→Aquarius, Neptune→Pisces, Pluto→Scorpio)
- **Planets:** Sun through Pluto + North Node + Chiron
- **Aspects:** Conjunction (0°, 8° orb), Sextile (60°, 6°), Square (90°, 7°), Trine (120°, 8°), Opposition (180°, 8°)
- **Features:** natal, transit, synastry, composite, solar_return, progressions

## Vedic / Jyotish
- **Coordinate system:** Sidereal
- **Default ayanamsha:** Lahiri (also support Raman, Krishnamurti, Fagan-Bradley)
- **Default house system:** Whole Sign
- **Rulerships:** Traditional only (Sun through Saturn) + Rahu/Ketu for nodes
- **Planets:** Sun through Saturn + Rahu (North Node) + Ketu (South Node)
- **Aspects:** Tighter orbs than Western
- **Nakshatras:** 27 lunar mansions (Ashwini through Revati), each 13°20'
- **Dashas:** Vimshottari (120-year cycle based on Moon's nakshatra)
- **Features:** natal, transit, dashas, nakshatras, yogas

## Hellenistic
- **Coordinate system:** Tropical
- **Default house system:** Whole Sign
- **Rulerships:** Traditional only (Sun through Saturn)
- **Planets:** Sun through Saturn + North Node
- **Sect:** Diurnal (Sun above horizon) vs Nocturnal (Sun below horizon)
  - Diurnal planets: Sun, Jupiter, Saturn
  - Nocturnal planets: Moon, Venus, Mars
- **Lots:** Part of Fortune = ASC + Moon - Sun (day) / ASC + Sun - Moon (night)
- **Bounds/Terms:** Egyptian bounds for each sign
- **Profections:** Annual, 1 sign per year from ASC
- **Features:** natal, transit, sect, bounds, lots, profections

## House Systems
| Code | Name | Notes |
|------|------|-------|
| placidus | Placidus | Default Western. Fails at extreme latitudes (>66.5°) |
| whole_sign | Whole Sign | Default Vedic/Hellenistic. Always works. |
| equal | Equal | 30° from ASC. Always works. |
| koch | Koch | Similar to Placidus. Fails at extreme latitudes. |
| campanus | Campanus | Based on prime vertical. |
| regiomontanus | Regiomontanus | Based on celestial equator. |

## Ayanamsha Values
| Name | Approximate offset (2024) |
|------|--------------------------|
| Lahiri | ~24°07' |
| Raman | ~22°31' |
| Krishnamurti | ~23°52' |
| Fagan-Bradley | ~24°44' |
