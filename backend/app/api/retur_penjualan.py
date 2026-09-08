from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.dependencies import require_permission

from app.schemas.retur_penjualan import (
    ReturPenjualanCreate,
    ReturPenjualanResponse,
)

from app.services.retur_penjualan_service import (
    retur_penjualan_service,
)


router = APIRouter(
    prefix="/retur-penjualan",
    tags=["Retur Penjualan"],
)


# ==========================================================
# CREATE RETUR PENJUALAN
# ==========================================================

@router.post(
    "/",
    response_model=ReturPenjualanResponse,
    status_code=201,
)
def create(
    data: ReturPenjualanCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "retur_penjualan.create"
        )
    ),
):
    return retur_penjualan_service.create(
        db,
        data,
        current_user.id,
    )


# ==========================================================
# APPROVE RETUR PENJUALAN
# ==========================================================

@router.post(
    "/{retur_id}/approve",
    response_model=ReturPenjualanResponse,
)
def approve(
    retur_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "retur_penjualan.update"
        )
    ),
):
    return retur_penjualan_service.approve(
        db,
        retur_id,
    )