from pydantic import BaseModel, Field, field_validator
from typing import Optional
import re


class NatalChartRequest(BaseModel):
    """Request model for natal chart calculation."""

    birthDate: str = Field(
        ...,
        description="Birth date in YYYY-MM-DD format",
        examples=["1990-06-15"],
    )
    birthTime: Optional[str] = Field(
        default=None,
        description="Birth time in HH:MM format (24-hour). Required unless timeUnknown is True.",
        examples=["14:30"],
    )
    timeUnknown: bool = Field(
        default=False,
        description="Set to True when birth time is unknown. Houses will not be calculated accurately.",
    )
    latitude: float = Field(
        ...,
        ge=-90.0,
        le=90.0,
        description="Geographic latitude of birth place in decimal degrees (-90 to 90).",
        examples=[40.7128],
    )
    longitude: float = Field(
        ...,
        ge=-180.0,
        le=180.0,
        description="Geographic longitude of birth place in decimal degrees (-180 to 180).",
        examples=[-74.0060],
    )
    houseSystem: str = Field(
        default="placidus",
        description=(
            "House system to use for chart calculation. "
            "Supported: placidus, whole_sign, equal, koch, campanus, regiomontanus."
        ),
        examples=["placidus"],
    )
    coordinateSystem: str = Field(
        default="tropical",
        description="Coordinate system: 'tropical' or 'sidereal'.",
        examples=["tropical"],
    )
    ayanamsha: Optional[str] = Field(
        default=None,
        description=(
            "Ayanamsha to use when coordinateSystem is 'sidereal'. "
            "Supported: lahiri, raman, krishnamurti, fagan_bradley, de_luce, true_citra, true_revati, ushashashi. "
            "Defaults to 'lahiri' when coordinateSystem is 'sidereal' and ayanamsha is None."
        ),
        examples=["lahiri"],
    )

    @field_validator("birthDate")
    @classmethod
    def validate_birth_date(cls, v: str) -> str:
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", v):
            raise ValueError("birthDate must be in YYYY-MM-DD format")
        parts = v.split("-")
        year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
        if not (1 <= month <= 12):
            raise ValueError("birthDate month must be between 01 and 12")
        if not (1 <= day <= 31):
            raise ValueError("birthDate day must be between 01 and 31")
        if not (1800 <= year <= 2400):
            raise ValueError("birthDate year must be between 1800 and 2400")
        return v

    @field_validator("birthTime")
    @classmethod
    def validate_birth_time(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not re.match(r"^\d{2}:\d{2}$", v):
            raise ValueError("birthTime must be in HH:MM format")
        parts = v.split(":")
        hour, minute = int(parts[0]), int(parts[1])
        if not (0 <= hour <= 23):
            raise ValueError("birthTime hour must be between 00 and 23")
        if not (0 <= minute <= 59):
            raise ValueError("birthTime minute must be between 00 and 59")
        return v

    @field_validator("coordinateSystem")
    @classmethod
    def validate_coordinate_system(cls, v: str) -> str:
        allowed = {"tropical", "sidereal"}
        if v.lower() not in allowed:
            raise ValueError(f"coordinateSystem must be one of: {', '.join(sorted(allowed))}")
        return v.lower()

    @field_validator("houseSystem")
    @classmethod
    def validate_house_system(cls, v: str) -> str:
        allowed = {"placidus", "whole_sign", "equal", "koch", "campanus", "regiomontanus"}
        if v.lower() not in allowed:
            raise ValueError(f"houseSystem must be one of: {', '.join(sorted(allowed))}")
        return v.lower()

    @field_validator("ayanamsha")
    @classmethod
    def validate_ayanamsha(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {
            "lahiri", "raman", "krishnamurti", "fagan_bradley",
        }
        if v.lower() not in allowed:
            raise ValueError(f"ayanamsha must be one of: {', '.join(sorted(allowed))}")
        return v.lower()
