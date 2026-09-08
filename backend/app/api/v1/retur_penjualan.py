from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.retur_penjualan import (
    ReturPenjualanCreate,
    ReturPenjualanUpdate,
    ReturPenjualanResponse,
)

from app.services.retur_penjualan_service import (
    ReturPenjualanService,
)

from app.api.dependencies import (
    require_permission,
)


# ==========================================================
# ROUTER
# ==========================================================

router = APIRouter(
    prefix="/retur-penjualan",
    tags=["Retur Penjualan"],
)


# ==========================================================
# GET ALL
# permission: retur_penjualan.view
# ==========================================================

@router.get(
    "/",
    response_model=list[ReturPenjualanResponse],
)
def get_all(
    db: Session = Depends(get_db),

    current_user=Depends(
        require_permission(
            "retur_penjualan.view"
        )
    ),
):
    return ReturPenjualanService.get_all(
        db
    )


# ==========================================================
# GET BY ID
# permission: retur_penjualan.view
# ==========================================================

@router.get(
    "/{retur_id}",
    response_model=ReturPenjualanResponse,
)
def get_by_id(
    retur_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        require_permission(
            "retur_penjualan.view"
        )
    ),
):
    return ReturPenjualanService.get_by_id(
        db,
        retur_id,
    )


# ==========================================================
# CREATE
# permission: retur_penjualan.create
# ==========================================================

@router.post(
    "/",
    response_model=ReturPenjualanResponse,
)
def create(
    data: ReturPenjualanCreate,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        require_permission(
            "retur_penjualan.create"
        )
    ),
):
    return ReturPenjualanService.create(
        db,
        data,
        current_user.id,
    )


# ==========================================================
# UPDATE
# permission: retur_penjualan.update
# ==========================================================

@router.put(
    "/{retur_id}",
    response_model=ReturPenjualanResponse,
)
def update(
    retur_id: int,

    data: ReturPenjualanUpdate,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        require_permission(
            "retur_penjualan.update"
        )
    ),
):
    return ReturPenjualanService.update(
        db,
        retur_id,
        data,
    )


# ==========================================================
# DELETE
# permission: retur_penjualan.delete
# ==========================================================

@router.delete(
    "/{retur_id}",
)
def delete(
    retur_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        require_permission(
            "retur_penjualan.delete"
        )
    ),
):
    return ReturPenjualanService.delete(
        db,
        retur_id,
    )


# ==========================================================
# APPROVE
#
# Tidak ada permission retur_penjualan.approve
# di sistem kita saat ini.
#
# Karena approve adalah perubahan status,
# kita gunakan retur_penjualan.update.
# ==========================================================

@router.post(
    "/{retur_id}/approve",
    response_model=ReturPenjualanResponse,
)
def approve(
    retur_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        require_permission(
            "retur_penjualan.update"
        )
    ),
):
    return ReturPenjualanService.approve(
        db,
        retur_id,
    )


# ==========================================================
# REJECT
#
# Reject juga merupakan perubahan status,
# sehingga memakai retur_penjualan.update.
# ==========================================================

@router.post(
    "/{retur_id}/reject",
    response_model=ReturPenjualanResponse,
)
def reject(
    retur_id: int,

    alasan: str | None = None,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        require_permission(
            "retur_penjualan.update"
        )
    ),
):
    return ReturPenjualanService.reject(
        db,
        retur_id,
        alasan,
    )