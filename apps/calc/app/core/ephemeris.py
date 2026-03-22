"""
Swiss Ephemeris wrapper for astronomical calculations.

Provides functions to calculate planet positions, house cusps, and aspects
using the pyswisseph library.
"""

from __future__ import annotations

import swisseph as swe

from app.models.responses import AspectData, HouseCusp, PlanetPosition

# ---------------------------------------------------------------------------
# Planet catalogue
# ---------------------------------------------------------------------------

# Each entry: (swe constant, display name, use_swe_calc_ut)
# For the Mean North Node we use swe.MEAN_NODE; for Chiron swe.CHIRON.
_PLANETS: list[tuple[int, str]] = [
    (swe.SUN, "Sun"),
    (swe.MOON, "Moon"),
    (swe.MERCURY, "Mercury"),
    (swe.VENUS, "Venus"),
    (swe.MARS, "Mars"),
    (swe.JUPITER, "Jupiter"),
    (swe.SATURN, "Saturn"),
    (swe.URANUS, "Uranus"),
    (swe.NEPTUNE, "Neptune"),
    (swe.PLUTO, "Pluto"),
    (swe.MEAN_NODE, "North Node"),
    (swe.CHIRON, "Chiron"),
]

# Zodiac sign names indexed 0–11 (Aries = 0)
_SIGNS: list[str] = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
]

# Aspect definitions: (name, exact_angle, default_orb)
_ASPECTS: list[tuple[str, float, float]] = [
    ("conjunction", 0.0, 8.0),
    ("sextile", 60.0, 6.0),
    ("square", 90.0, 8.0),
    ("trine", 120.0, 8.0),
    ("opposition", 180.0, 8.0),
]

# Map house system name → single-character code used by swe.houses()
_HOUSE_SYSTEM_CODES: dict[str, bytes] = {
    "placidus": b"P",
    "whole_sign": b"W",
    "equal": b"E",
    "koch": b"K",
    "campanus": b"C",
    "regiomontanus": b"R",
}

# Map ayanamsha name → swe constant
_AYANAMSHA_CODES: dict[str, int] = {
    "lahiri": swe.SIDM_LAHIRI,
    "raman": swe.SIDM_RAMAN,
    "krishnamurti": swe.SIDM_KRISHNAMURTI,
    "fagan_bradley": swe.SIDM_FAGAN_BRADLEY,
}

# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------


def longitude_to_sign(longitude: float) -> tuple[str, float]:
    """Convert an ecliptic longitude (0–360°) to (sign_name, degree_within_sign).

    Args:
        longitude: Ecliptic longitude in decimal degrees, normalised to [0, 360).

    Returns:
        A tuple of (sign_name, sign_degree) where sign_degree is in [0, 30).
    """
    lon = longitude % 360.0
    sign_index = int(lon // 30)
    sign_degree = lon % 30.0
    return _SIGNS[sign_index], sign_degree


def julian_day(date_str: str, time_str: str | None) -> float:
    """Convert a calendar date and optional time to a Julian Day Number (UT).

    Args:
        date_str: Date in 'YYYY-MM-DD' format.
        time_str: Time in 'HH:MM' format (24-hour). If None, noon (12:00) is used.

    Returns:
        Julian Day Number as a float (Universal Time).
    """
    year, month, day = (int(p) for p in date_str.split("-"))

    if time_str is not None:
        hour_str, minute_str = time_str.split(":")
        hour = int(hour_str)
        minute = int(minute_str)
    else:
        hour = 12
        minute = 0

    # Fractional hour for swe.julday
    ut_hour = hour + minute / 60.0

    jd = swe.julday(year, month, day, ut_hour, swe.GREG_CAL)
    return jd


# ---------------------------------------------------------------------------
# Core calculation functions
# ---------------------------------------------------------------------------


def calculate_planet_positions(
    jd: float,
    coordinate_system: str,
    ayanamsha: str | None,
) -> list[PlanetPosition]:
    """Calculate ecliptic positions for all tracked planets.

    Args:
        jd:                Julian Day Number (UT).
        coordinate_system: 'tropical' or 'sidereal'.
        ayanamsha:         Ayanamsha name (required when coordinate_system is
                           'sidereal'; if None defaults to 'lahiri').

    Returns:
        A list of :class:`PlanetPosition` objects.
    """
    is_sidereal = coordinate_system.lower() == "sidereal"

    if is_sidereal:
        ayan_key = (ayanamsha or "lahiri").lower()
        sid_mode = _AYANAMSHA_CODES.get(ayan_key, swe.SIDM_LAHIRI)
        swe.set_sid_mode(sid_mode, 0, 0)
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL
    else:
        swe.set_sid_mode(swe.SIDM_FAGAN_BRADLEY, 0, 0)  # reset to default
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED

    positions: list[PlanetPosition] = []

    import logging

    _log = logging.getLogger(__name__)

    for planet_id, planet_name in _PLANETS:
        try:
            result, return_flags = swe.calc_ut(jd, planet_id, flags)
        except swe.Error as exc:
            # Some bodies (e.g., Chiron) require additional ephemeris data files.
            # Skip gracefully if the file is not available.
            _log.warning("Skipping %s: %s", planet_name, exc)
            continue

        # result is a tuple with at least 6 elements:
        # [lon, lat, dist, speed_lon, speed_lat, speed_dist]
        lon: float = result[0]
        lat: float = result[1]
        speed: float = result[3]  # longitudinal speed (deg/day)
        retrograde = speed < 0.0

        sign, sign_degree = longitude_to_sign(lon)

        positions.append(
            PlanetPosition(
                planet=planet_name,
                longitude=lon,
                latitude=lat,
                speed=speed,
                retrograde=retrograde,
                sign=sign,
                signDegree=round(sign_degree, 6),
                house=None,  # assigned later by calculator
            )
        )

    return positions


def calculate_houses(
    jd: float,
    latitude: float,
    longitude: float,
    house_system: str,
) -> tuple[list[HouseCusp], float, float]:
    """Calculate house cusps, ascendant, and midheaven.

    Args:
        jd:          Julian Day Number (UT).
        latitude:    Geographic latitude in decimal degrees.
        longitude:   Geographic longitude in decimal degrees.
        house_system: House system name (e.g., 'placidus', 'whole_sign').

    Returns:
        A tuple of (house_cusps, ascendant_longitude, midheaven_longitude).
    """
    sys_code = _HOUSE_SYSTEM_CODES.get(house_system.lower(), b"P")

    try:
        cusps, ascmc = swe.houses(jd, latitude, longitude, sys_code)
    except swe.Error as exc:
        raise RuntimeError(
            f"Swiss Ephemeris error calculating houses: {exc}"
        ) from exc

    # cusps is a tuple of 12 values (0-indexed): cusps[0] = house 1, cusps[11] = house 12
    # ascmc: [ASC, MC, ARMC, Vertex, Equatorial ASC, co-ASC Koch, co-ASC Munkasey, Polar ASC]
    ascendant: float = ascmc[0]
    midheaven: float = ascmc[1]

    house_cusps: list[HouseCusp] = []
    for house_num in range(1, 13):
        lon = cusps[house_num - 1]
        sign, sign_degree = longitude_to_sign(lon)
        house_cusps.append(
            HouseCusp(
                house=house_num,
                longitude=lon,
                sign=sign,
                signDegree=round(sign_degree, 6),
            )
        )

    return house_cusps, ascendant, midheaven


def calculate_aspects(
    planets: list[PlanetPosition],
    orbs: dict[str, float] | None = None,
) -> list[AspectData]:
    """Find all major aspects between pairs of planets.

    Checks for conjunction (0°), sextile (60°), square (90°), trine (120°),
    and opposition (180°).

    Args:
        planets: List of planet positions.
        orbs:    Optional mapping of aspect_name → orb override in degrees.

    Returns:
        A list of :class:`AspectData` objects for each aspect found.
    """
    # Build effective orb table
    effective_orbs: dict[str, float] = {name: default for name, _, default in _ASPECTS}
    if orbs:
        effective_orbs.update(orbs)

    aspects: list[AspectData] = []

    for i in range(len(planets)):
        for j in range(i + 1, len(planets)):
            p1 = planets[i]
            p2 = planets[j]

            # Angular separation (shortest arc, 0–180)
            diff = abs(p1.longitude - p2.longitude) % 360.0
            if diff > 180.0:
                diff = 360.0 - diff

            for aspect_name, exact_angle, _ in _ASPECTS:
                allowed_orb = effective_orbs[aspect_name]
                orb_value = abs(diff - exact_angle)

                if orb_value <= allowed_orb:
                    # Determine applying vs. separating:
                    # The faster-moving planet closes the gap when applying.
                    faster = p1 if abs(p1.speed) >= abs(p2.speed) else p2
                    slower = p2 if faster is p1 else p1

                    # Angular distance from faster to slower (signed, 0–360)
                    signed_diff = (slower.longitude - faster.longitude) % 360.0

                    # For each aspect angle, check whether the faster planet
                    # is moving toward the exact aspect.
                    # Applying: the arc is decreasing (faster is approaching slower).
                    # We approximate: if the faster planet moves in the direction
                    # that reduces |diff - exact_angle|, it is applying.
                    future_faster_lon = faster.longitude + faster.speed  # 1 day ahead
                    future_diff = abs(future_faster_lon - slower.longitude) % 360.0
                    if future_diff > 180.0:
                        future_diff = 360.0 - future_diff
                    future_orb = abs(future_diff - exact_angle)
                    applying = future_orb < orb_value

                    aspects.append(
                        AspectData(
                            planet1=p1.planet,
                            planet2=p2.planet,
                            aspectType=aspect_name,
                            exactAngle=exact_angle,
                            orb=round(orb_value, 4),
                            applying=applying,
                        )
                    )

    return aspects
