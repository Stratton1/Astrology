"""
Main natal chart calculation orchestrator.

Coordinates calls to the Swiss Ephemeris wrapper to produce a complete
NatalChartResponse from a NatalChartRequest.
"""

from __future__ import annotations

from datetime import datetime, timezone

from app.core.ephemeris import (
    calculate_aspects,
    calculate_houses,
    calculate_planet_positions,
    julian_day,
    longitude_to_sign,
)
from app.models.requests import NatalChartRequest
from app.models.responses import HouseCusp, NatalChartResponse

# Default orbs (degrees) for each major aspect
_DEFAULT_ORBS: dict[str, float] = {
    "conjunction": 8.0,
    "sextile": 6.0,
    "square": 8.0,
    "trine": 8.0,
    "opposition": 8.0,
}


def _assign_houses(
    planets: list,
    house_cusps: list[HouseCusp],
) -> None:
    """Mutate each PlanetPosition in-place, setting its house number.

    Uses the standard method: a planet is in house N when its longitude
    falls between cusp N and cusp N+1 (wrapping from cusp 12 → cusp 1).

    Args:
        planets:     List of PlanetPosition objects (mutated in-place).
        house_cusps: Ordered list of 12 HouseCusp objects.
    """
    if not house_cusps:
        return

    cusp_lons = [hc.longitude for hc in house_cusps]  # indices 0–11 → houses 1–12

    for planet in planets:
        lon = planet.longitude % 360.0
        assigned_house = 1  # fallback

        for i in range(12):
            cusp_start = cusp_lons[i]
            cusp_end = cusp_lons[(i + 1) % 12]

            # Handle wraparound (e.g., cusp at 350° → next cusp at 10°)
            if cusp_start <= cusp_end:
                if cusp_start <= lon < cusp_end:
                    assigned_house = i + 1
                    break
            else:
                # Wraparound case
                if lon >= cusp_start or lon < cusp_end:
                    assigned_house = i + 1
                    break

        planet.house = assigned_house


def calculate_natal_chart(request: NatalChartRequest) -> NatalChartResponse:
    """Calculate a complete natal chart from a NatalChartRequest.

    Steps:
    1. Convert birth date/time to Julian Day.
    2. Calculate planet positions (tropical or sidereal).
    3. Calculate house cusps (or use Whole Sign fallback when time is unknown).
    4. Assign each planet to its house.
    5. Calculate aspects between all planets.
    6. Assemble and return the NatalChartResponse.

    Args:
        request: Validated NatalChartRequest.

    Returns:
        A fully populated NatalChartResponse.
    """
    # 1. Julian Day
    birth_time = None if request.timeUnknown else request.birthTime
    jd = julian_day(request.birthDate, birth_time)

    # 2. Planet positions
    planets = calculate_planet_positions(
        jd=jd,
        coordinate_system=request.coordinateSystem,
        ayanamsha=request.ayanamsha,
    )

    # 3. House cusps
    if request.timeUnknown:
        # When time is unknown, fall back to Whole Sign houses anchored at
        # the Sun's sign (a common approximation — gives a 12-house layout).
        house_cusps, ascendant, midheaven = _whole_sign_fallback(planets, jd, request)
        effective_house_system = "whole_sign"
    else:
        house_cusps, ascendant, midheaven = calculate_houses(
            jd=jd,
            latitude=request.latitude,
            longitude=request.longitude,
            house_system=request.houseSystem,
        )
        effective_house_system = request.houseSystem

    # 4. Assign planets to houses
    _assign_houses(planets, house_cusps)

    # 5. Aspects
    aspects = calculate_aspects(planets, orbs=_DEFAULT_ORBS)

    # 6. Assemble response
    calculated_at = datetime.now(tz=timezone.utc).isoformat()

    return NatalChartResponse(
        coordinateSystem=request.coordinateSystem,
        houseSystem=effective_house_system,
        ayanamsha=request.ayanamsha if request.coordinateSystem == "sidereal" else None,
        planets=planets,
        houses=house_cusps,
        aspects=aspects,
        ascendant=ascendant,
        midheaven=midheaven,
        calculatedAt=calculated_at,
    )


def _whole_sign_fallback(
    planets: list,
    jd: float,
    request: NatalChartRequest,
) -> tuple[list[HouseCusp], float, float]:
    """Generate Whole Sign house cusps anchored to the Sun's sign.

    When birth time is unknown we cannot compute accurate house cusps or an
    ascendant.  This helper returns a Whole Sign layout where house 1 begins
    at 0° of the Sun's sign, giving a reasonable approximation.  The
    ascendant and midheaven are both set to 0.0 to indicate they are
    unavailable.

    Args:
        planets: Already-calculated planet positions.
        jd:      Julian Day (unused here but kept for API symmetry).
        request: The original natal chart request.

    Returns:
        (house_cusps, ascendant=0.0, midheaven=0.0)
    """
    # Find the Sun
    sun = next((p for p in planets if p.planet == "Sun"), None)
    if sun is None:
        # Fallback: start from 0° Aries
        start_lon = 0.0
    else:
        # Whole Sign: house 1 begins at 0° of the Sun's sign
        sign_index = int(sun.longitude // 30)
        start_lon = float(sign_index * 30)

    house_cusps: list[HouseCusp] = []
    for house_num in range(1, 13):
        lon = (start_lon + (house_num - 1) * 30.0) % 360.0
        sign, sign_degree = longitude_to_sign(lon)
        house_cusps.append(
            HouseCusp(
                house=house_num,
                longitude=lon,
                sign=sign,
                signDegree=round(sign_degree, 6),
            )
        )

    return house_cusps, 0.0, 0.0
