"""
Tests for the Swiss Ephemeris wrapper (app/core/ephemeris.py).

Some tests require Swiss Ephemeris data files (*.se1) to be present on disk.
Those tests are marked with @pytest.mark.requires_ephe so they can be skipped
in environments where the ephemeris data is unavailable.

Run all tests:
    pytest tests/test_ephemeris.py

Skip tests that need ephemeris data files:
    pytest tests/test_ephemeris.py -m "not requires_ephe"
"""

from __future__ import annotations

import pytest

from app.core.ephemeris import (
    calculate_aspects,
    calculate_houses,
    calculate_planet_positions,
    julian_day,
    longitude_to_sign,
)
from app.models.responses import PlanetPosition


# ---------------------------------------------------------------------------
# longitude_to_sign
# ---------------------------------------------------------------------------


class TestLongitudeToSign:
    """Unit tests for longitude_to_sign helper — no ephemeris data required."""

    @pytest.mark.parametrize(
        "longitude, expected_sign, expected_degree",
        [
            (0.0, "Aries", 0.0),
            (15.0, "Aries", 15.0),
            (29.999, "Aries", 29.999),
            (30.0, "Taurus", 0.0),
            (45.0, "Taurus", 15.0),
            (60.0, "Gemini", 0.0),
            (90.0, "Cancer", 0.0),
            (120.0, "Leo", 0.0),
            (150.0, "Virgo", 0.0),
            (180.0, "Libra", 0.0),
            (210.0, "Scorpio", 0.0),
            (240.0, "Sagittarius", 0.0),
            (270.0, "Capricorn", 0.0),
            (300.0, "Aquarius", 0.0),
            (330.0, "Pisces", 0.0),
            (359.999, "Pisces", 29.999),
        ],
    )
    def test_sign_boundaries(
        self, longitude: float, expected_sign: str, expected_degree: float
    ) -> None:
        sign, degree = longitude_to_sign(longitude)
        assert sign == expected_sign
        assert pytest.approx(degree, abs=1e-3) == expected_degree

    def test_longitude_normalises_beyond_360(self) -> None:
        """Longitudes ≥ 360° should wrap correctly."""
        sign1, deg1 = longitude_to_sign(360.0)
        sign2, deg2 = longitude_to_sign(0.0)
        assert sign1 == sign2
        assert pytest.approx(deg1) == deg2

    def test_longitude_normalises_large_value(self) -> None:
        """720° should equal 0°."""
        sign, degree = longitude_to_sign(720.0)
        assert sign == "Aries"
        assert pytest.approx(degree) == 0.0

    def test_all_twelve_signs_reachable(self) -> None:
        """Every sign should be returned for exactly one 30° band."""
        signs_seen = set()
        for i in range(12):
            sign, _ = longitude_to_sign(i * 30.0)
            signs_seen.add(sign)
        assert len(signs_seen) == 12


# ---------------------------------------------------------------------------
# julian_day
# ---------------------------------------------------------------------------


class TestJulianDay:
    """Unit tests for julian_day helper — no ephemeris data required."""

    def test_known_jd_unix_epoch(self) -> None:
        """Unix epoch (1970-01-01 00:00 UTC) = JD 2440587.5."""
        jd = julian_day("1970-01-01", "00:00")
        assert pytest.approx(jd, abs=1e-4) == 2440587.5

    def test_known_jd_j2000(self) -> None:
        """J2000.0 epoch is 2000-01-01 12:00 TT ≈ JD 2451545.0."""
        jd = julian_day("2000-01-01", "12:00")
        assert pytest.approx(jd, abs=1e-4) == 2451545.0

    def test_noon_default_when_time_none(self) -> None:
        """When time is None, noon (12:00) is used as the default."""
        jd_none = julian_day("2000-01-01", None)
        jd_noon = julian_day("2000-01-01", "12:00")
        assert pytest.approx(jd_none) == jd_noon

    def test_different_times_produce_different_jd(self) -> None:
        """Morning and evening on the same date must yield different JDs."""
        jd_am = julian_day("1990-06-15", "06:00")
        jd_pm = julian_day("1990-06-15", "18:00")
        assert jd_pm > jd_am
        # Difference should be exactly 0.5 days
        assert pytest.approx(jd_pm - jd_am, abs=1e-6) == 0.5

    def test_different_dates_produce_different_jd(self) -> None:
        """Consecutive dates should differ by exactly 1.0."""
        jd1 = julian_day("2024-03-01", "12:00")
        jd2 = julian_day("2024-03-02", "12:00")
        assert pytest.approx(jd2 - jd1, abs=1e-6) == 1.0


# ---------------------------------------------------------------------------
# calculate_planet_positions (requires ephemeris data)
# ---------------------------------------------------------------------------


@pytest.mark.requires_ephe
class TestCalculatePlanetPositions:
    """Tests for planet position calculations. Requires Swiss Ephemeris data files."""

    # Chiron requires extra ephemeris files that may not be installed.
    # Accept 11 (without Chiron) or 12 (with Chiron).
    _MIN_PLANET_COUNT = 11
    _MAX_PLANET_COUNT = 12

    def test_returns_correct_number_of_planets(self) -> None:
        jd = julian_day("1990-06-15", "14:30")
        positions = calculate_planet_positions(jd, "tropical", None)
        assert self._MIN_PLANET_COUNT <= len(positions) <= self._MAX_PLANET_COUNT

    def test_planet_names_are_correct(self) -> None:
        jd = julian_day("1990-06-15", "14:30")
        positions = calculate_planet_positions(jd, "tropical", None)
        names = [p.planet for p in positions]
        required = [
            "Sun", "Moon", "Mercury", "Venus", "Mars",
            "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
            "North Node",
        ]
        for name in required:
            assert name in names, f"Missing required planet: {name}"

    def test_longitudes_in_valid_range(self) -> None:
        jd = julian_day("1990-06-15", "14:30")
        positions = calculate_planet_positions(jd, "tropical", None)
        for p in positions:
            assert 0.0 <= p.longitude < 360.0, (
                f"{p.planet} longitude {p.longitude} out of range"
            )

    def test_sign_degree_in_valid_range(self) -> None:
        jd = julian_day("2000-01-01", "12:00")
        positions = calculate_planet_positions(jd, "tropical", None)
        for p in positions:
            assert 0.0 <= p.signDegree < 30.0, (
                f"{p.planet} signDegree {p.signDegree} out of range"
            )

    def test_retrograde_flag_matches_speed(self) -> None:
        jd = julian_day("1990-06-15", "14:30")
        positions = calculate_planet_positions(jd, "tropical", None)
        for p in positions:
            if p.retrograde:
                assert p.speed < 0.0, (
                    f"{p.planet} marked retrograde but speed={p.speed} is positive"
                )
            else:
                assert p.speed >= 0.0, (
                    f"{p.planet} not marked retrograde but speed={p.speed} is negative"
                )

    def test_sidereal_differs_from_tropical(self) -> None:
        """Sidereal longitudes should differ from tropical by the ayanamsha value."""
        jd = julian_day("1990-06-15", "14:30")
        tropical = calculate_planet_positions(jd, "tropical", None)
        sidereal = calculate_planet_positions(jd, "sidereal", "lahiri")

        trop_sun = next(p for p in tropical if p.planet == "Sun")
        side_sun = next(p for p in sidereal if p.planet == "Sun")

        # Lahiri ayanamsha is roughly 23–24° — sidereal longitude should be smaller
        diff = (trop_sun.longitude - side_sun.longitude) % 360.0
        assert 20.0 < diff < 30.0, f"Unexpected ayanamsha difference: {diff}"

    def test_known_sun_position_j2000(self) -> None:
        """At J2000.0 (2000-01-01 12:00 TT) the Sun is near 280° (Capricorn ~10°)."""
        jd = julian_day("2000-01-01", "12:00")
        positions = calculate_planet_positions(jd, "tropical", None)
        sun = next(p for p in positions if p.planet == "Sun")
        # Sun should be in Capricorn (270–300°) around J2000.0
        assert 270.0 < sun.longitude < 285.0, (
            f"Sun longitude {sun.longitude} unexpected for J2000.0"
        )
        assert sun.sign == "Capricorn"


# ---------------------------------------------------------------------------
# calculate_houses (requires ephemeris data)
# ---------------------------------------------------------------------------


@pytest.mark.requires_ephe
class TestCalculateHouses:
    """Tests for house cusp calculations. Requires Swiss Ephemeris data files."""

    def test_returns_twelve_house_cusps(self) -> None:
        jd = julian_day("1990-06-15", "14:30")
        cusps, asc, mc = calculate_houses(jd, 40.7128, -74.0060, "placidus")
        assert len(cusps) == 12

    def test_house_numbers_one_to_twelve(self) -> None:
        jd = julian_day("1990-06-15", "14:30")
        cusps, _, _ = calculate_houses(jd, 40.7128, -74.0060, "placidus")
        assert [c.house for c in cusps] == list(range(1, 13))

    def test_ascendant_in_valid_range(self) -> None:
        jd = julian_day("1990-06-15", "14:30")
        _, asc, _ = calculate_houses(jd, 40.7128, -74.0060, "placidus")
        assert 0.0 <= asc < 360.0

    def test_midheaven_in_valid_range(self) -> None:
        jd = julian_day("1990-06-15", "14:30")
        _, _, mc = calculate_houses(jd, 40.7128, -74.0060, "placidus")
        assert 0.0 <= mc < 360.0

    def test_whole_sign_cusps_are_multiples_of_30(self) -> None:
        """In Whole Sign, each cusp should fall at 0° of a sign (multiple of 30°)."""
        jd = julian_day("1990-06-15", "14:30")
        cusps, _, _ = calculate_houses(jd, 40.7128, -74.0060, "whole_sign")
        for cusp in cusps:
            assert pytest.approx(cusp.longitude % 30.0, abs=1e-4) == 0.0, (
                f"Whole Sign cusp {cusp.house} not at sign boundary: {cusp.longitude}"
            )

    def test_different_house_systems_give_different_cusps(self) -> None:
        """Placidus and Koch should produce different cusps for the same chart."""
        jd = julian_day("1990-06-15", "14:30")
        cusps_p, _, _ = calculate_houses(jd, 40.7128, -74.0060, "placidus")
        cusps_k, _, _ = calculate_houses(jd, 40.7128, -74.0060, "koch")
        # At least one cusp should differ
        diffs = [
            abs(p.longitude - k.longitude)
            for p, k in zip(cusps_p, cusps_k)
        ]
        assert any(d > 0.01 for d in diffs)


# ---------------------------------------------------------------------------
# calculate_aspects (no ephemeris data required)
# ---------------------------------------------------------------------------


class TestCalculateAspects:
    """Tests for aspect calculation — uses synthetic planet data, no ephe files needed."""

    def _make_planet(self, name: str, lon: float, speed: float = 1.0) -> PlanetPosition:
        sign, sign_degree = longitude_to_sign(lon)
        return PlanetPosition(
            planet=name,
            longitude=lon,
            latitude=0.0,
            speed=speed,
            retrograde=speed < 0,
            sign=sign,
            signDegree=sign_degree,
            house=None,
        )

    def test_exact_conjunction(self) -> None:
        planets = [
            self._make_planet("Sun", 0.0),
            self._make_planet("Moon", 0.0),
        ]
        aspects = calculate_aspects(planets)
        conjunction = [a for a in aspects if a.aspectType == "conjunction"]
        assert len(conjunction) == 1
        assert conjunction[0].orb == pytest.approx(0.0, abs=1e-3)

    def test_exact_opposition(self) -> None:
        planets = [
            self._make_planet("Sun", 0.0),
            self._make_planet("Moon", 180.0),
        ]
        aspects = calculate_aspects(planets)
        opposition = [a for a in aspects if a.aspectType == "opposition"]
        assert len(opposition) == 1
        assert opposition[0].orb == pytest.approx(0.0, abs=1e-3)

    def test_exact_trine(self) -> None:
        planets = [
            self._make_planet("Sun", 0.0),
            self._make_planet("Moon", 120.0),
        ]
        aspects = calculate_aspects(planets)
        trine = [a for a in aspects if a.aspectType == "trine"]
        assert len(trine) == 1

    def test_exact_square(self) -> None:
        planets = [
            self._make_planet("Sun", 0.0),
            self._make_planet("Moon", 90.0),
        ]
        aspects = calculate_aspects(planets)
        square = [a for a in aspects if a.aspectType == "square"]
        assert len(square) == 1

    def test_exact_sextile(self) -> None:
        planets = [
            self._make_planet("Sun", 0.0),
            self._make_planet("Moon", 60.0),
        ]
        aspects = calculate_aspects(planets)
        sextile = [a for a in aspects if a.aspectType == "sextile"]
        assert len(sextile) == 1

    def test_no_aspect_outside_orb(self) -> None:
        """45° is not a major aspect and should produce no results."""
        planets = [
            self._make_planet("Sun", 0.0),
            self._make_planet("Moon", 45.0),
        ]
        aspects = calculate_aspects(planets)
        assert len(aspects) == 0

    def test_orb_boundary_included(self) -> None:
        """A planet just within the allowed orb should be detected."""
        planets = [
            self._make_planet("Sun", 0.0),
            self._make_planet("Moon", 88.0),  # 2° from exact square, orb=8
        ]
        aspects = calculate_aspects(planets)
        square = [a for a in aspects if a.aspectType == "square"]
        assert len(square) == 1
        assert square[0].orb == pytest.approx(2.0, abs=1e-3)

    def test_orb_boundary_excluded(self) -> None:
        """A planet just outside the allowed orb should not be detected."""
        planets = [
            self._make_planet("Sun", 0.0),
            self._make_planet("Moon", 81.0),  # 9° from exact square, orb=8
        ]
        aspects = calculate_aspects(planets)
        square = [a for a in aspects if a.aspectType == "square"]
        assert len(square) == 0

    def test_applying_aspect(self) -> None:
        """Faster planet approaching exact angle → applying=True."""
        # Sun at 0° speed=1.0, Mars at 117° speed=0.5.
        # Separation is 117°. Trine exact = 120°. Orb = 3°.
        # Sun is faster. Future Sun = 1°. Future diff = 116° → orb 4° (separating from Sun's perspective).
        # But from the pair perspective: the gap is growing. Actually let's use
        # a simple case: Sun at 0° speed=0.5, Moon at 119.5° speed=0.0.
        # Future Sun = 0.5. Future diff = 119. Future orb = |119-120| = 1. Current orb = |119.5-120| = 0.5.
        # Future orb > current orb → separating. So let's reverse:
        # Sun at 0° speed=0.0, Moon at 119° speed=0.5.
        # Future Moon = 119.5. Future diff = 119.5. Future orb = |119.5-120| = 0.5. Current orb = |119-120| = 1.
        # Future orb < current orb → applying!
        planets = [
            self._make_planet("Sun", 0.0, speed=0.0),
            self._make_planet("Moon", 119.0, speed=0.5),
        ]
        aspects = calculate_aspects(planets)
        trine = [a for a in aspects if a.aspectType == "trine"]
        assert len(trine) == 1
        assert trine[0].applying is True

    def test_custom_orbs_respected(self) -> None:
        """Passing a tight custom orb should exclude aspects that fall outside it."""
        planets = [
            self._make_planet("Sun", 0.0),
            self._make_planet("Moon", 87.0),  # 3° from square
        ]
        # Default orb for square is 8°; custom is 2° — should be excluded
        aspects = calculate_aspects(planets, orbs={"square": 2.0})
        square = [a for a in aspects if a.aspectType == "square"]
        assert len(square) == 0

    def test_multiple_planets_multiple_aspects(self) -> None:
        """Three planets can form up to three pairwise aspects."""
        planets = [
            self._make_planet("Sun", 0.0),
            self._make_planet("Moon", 120.0),
            self._make_planet("Mars", 240.0),
        ]
        aspects = calculate_aspects(planets)
        aspect_types = {a.aspectType for a in aspects}
        assert "trine" in aspect_types
        assert len(aspects) >= 2
