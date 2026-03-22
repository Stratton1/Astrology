# COSMOS — Known Limitations

1. **Swiss Ephemeris historical accuracy:** Planetary position accuracy degrades for dates before approximately 1500 AD; results in that range should be treated as approximate.
2. **Swiss Ephemeris date range:** Theoretical coverage is 13000 BC to 16000 AD, but practical accuracy is highest in the modern era (1800 AD onward); extreme historical or far-future dates carry increasing error.
3. **Extreme latitude house failures:** Placidus house calculations fail or produce nonsensical results for birth latitudes above approximately ±66.5° (Arctic/Antarctic circles); users born at extreme latitudes should use Whole Sign or Equal house systems instead.
4. **Geocoding accuracy for obscure locations:** The OpenCage geocoding API may return imprecise coordinates for very small towns, historical place names, or locations in regions with poor data coverage, affecting house cusp accuracy.
5. **AI synthesis non-determinism:** The same chart submitted for synthesis may produce meaningfully different interpretive text across requests due to the probabilistic nature of LLM outputs; synthesis results are not reproducible.
6. **No astrological expertise guarantee in synthesis:** AI-generated interpretations are not validated by professional astrologers and may contain errors, contradictions, or culturally insensitive framing; outputs should be reviewed critically.
7. **Unknown birth time charts:** Charts calculated without a known birth time use a noon default, rendering house placements, the Ascendant, Midheaven, and all angle-derived factors unreliable; these are flagged in the response but not suppressed.
8. **Julian/Gregorian calendar boundary:** Dates near the calendar reform of October 1582 require explicit calendar system specification; ambiguous dates in this period may be misinterpreted, particularly for historical figures.
9. **No real-time transit tracking:** Transit calculations in v1 are point-in-time snapshots only; there is no streaming, polling, or push notification for transits becoming exact.
10. **Limited asteroid support:** Only major asteroids are included (Chiron, and the four major asteroids: Ceres, Pallas, Juno, Vesta if configured); the full catalog of minor planets and trans-Neptunian objects is deferred to a future version.
11. **No fixed star support:** Fixed star positions and their conjunctions to natal planets are not included in v1 calculations or synthesis.
12. **Heliocentric positions not supported:** All planetary positions are geocentric only; heliocentric charting is not available in v1.
13. **Rate limits restrict heavy usage:** The synthesis endpoint is limited to 10 requests per minute per user; batch processing or automated chart generation at scale is not supported and will be throttled.
14. **No offline or PWA support:** The application requires a live internet connection for all functionality; there is no service worker, cached chart data, or offline mode in v1.
15. **Single timezone per chart:** Each chart stores a single resolved UTC offset at the time of birth; historical timezone database accuracy (before ~1970) varies by region and may introduce small errors in sidereal time calculations.
16. **No composite or synastry charts:** Relationship chart types (composite, Davison, synastry grid) are not implemented in v1; only natal charts are supported.
