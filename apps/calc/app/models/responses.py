from pydantic import BaseModel, Field
from typing import Optional


class PlanetPosition(BaseModel):
    """Position and state of a single planet or point."""

    planet: str = Field(..., description="Planet or point name (e.g., 'Sun', 'Moon', 'North Node')")
    longitude: float = Field(..., description="Ecliptic longitude in decimal degrees (0–360)")
    latitude: float = Field(..., description="Ecliptic latitude in decimal degrees")
    speed: float = Field(..., description="Daily motion in degrees per day (negative = retrograde)")
    retrograde: bool = Field(..., description="True when the planet is in retrograde motion")
    sign: str = Field(..., description="Zodiac sign name (e.g., 'Aries', 'Taurus')")
    signDegree: float = Field(..., description="Degrees within the current sign (0–29.999...)")
    house: Optional[int] = Field(default=None, description="House number (1–12), None when time is unknown")


class HouseCusp(BaseModel):
    """Cusp data for a single astrological house."""

    house: int = Field(..., description="House number (1–12)")
    longitude: float = Field(..., description="Ecliptic longitude of the house cusp (0–360)")
    sign: str = Field(..., description="Zodiac sign in which the cusp falls")
    signDegree: float = Field(..., description="Degrees within the sign (0–29.999...)")


class AspectData(BaseModel):
    """Aspect relationship between two planets."""

    planet1: str = Field(..., description="Name of the first planet")
    planet2: str = Field(..., description="Name of the second planet")
    aspectType: str = Field(
        ...,
        description="Aspect name (conjunction, sextile, square, trine, opposition)",
    )
    exactAngle: float = Field(..., description="Exact angular separation of the aspect (e.g., 0, 60, 90, 120, 180)")
    orb: float = Field(..., description="Difference in degrees from exact aspect angle (always positive)")
    applying: bool = Field(
        ...,
        description="True when the faster planet is moving toward exactness; False when separating",
    )


class NatalChartResponse(BaseModel):
    """Complete natal chart calculation result."""

    coordinateSystem: str = Field(
        ...,
        description="Coordinate system used: 'tropical' or 'sidereal'",
    )
    houseSystem: str = Field(..., description="House system used for calculation")
    ayanamsha: Optional[str] = Field(
        default=None,
        description="Ayanamsha applied (only present for sidereal charts)",
    )
    planets: list[PlanetPosition] = Field(..., description="List of planet and point positions")
    houses: list[HouseCusp] = Field(..., description="List of house cusps (12 entries)")
    aspects: list[AspectData] = Field(..., description="List of aspects between planets")
    ascendant: float = Field(..., description="Ascendant (AC) longitude in decimal degrees")
    midheaven: float = Field(..., description="Midheaven (MC) longitude in decimal degrees")
    calculatedAt: str = Field(..., description="ISO 8601 timestamp of when the calculation was performed")
