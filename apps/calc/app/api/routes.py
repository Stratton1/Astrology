import structlog
from fastapi import APIRouter, HTTPException

from app.models.requests import NatalChartRequest
from app.models.responses import NatalChartResponse
from app.core.calculator import calculate_natal_chart

router = APIRouter(prefix="/calculate", tags=["calculations"])

logger = structlog.get_logger()


@router.post("/natal", response_model=NatalChartResponse)
async def natal_chart(request: NatalChartRequest) -> NatalChartResponse:
    """
    Calculate a natal (birth) chart.

    Accepts birth date, time (optional), geographic coordinates, house system,
    and coordinate system (tropical or sidereal). Returns planet positions,
    house cusps, aspects, ascendant, and midheaven.
    """
    try:
        logger.info(
            "Calculating natal chart",
            birth_date=request.birthDate,
            coordinate_system=request.coordinateSystem,
            house_system=request.houseSystem,
            time_unknown=request.timeUnknown,
        )
        result = calculate_natal_chart(request)
        logger.info("Natal chart calculated successfully", planet_count=len(result.planets))
        return result
    except ValueError as exc:
        logger.warning("Invalid request for natal chart calculation", error=str(exc))
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Unexpected error during natal chart calculation", error=str(exc))
        raise HTTPException(status_code=500, detail="Internal calculation error") from exc
