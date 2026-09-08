from typing import List

from fastapi import APIRouter, Depends, Body

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.retur_pembelian import (
    ReturPembelianCreate,
    ReturPembelianUpdate,
    ReturPembelianResponse,
)

from app.services.retur_pembelian_service import (
    ReturPembelianService,
)

from app.api.dependencies import require_permission


router = APIRouter(
    prefix="/retur-pembelian",
    tags=["Retur Pembelian"],
)


# ==========================================================
# GET ALL
# ==========================================================

@router.get(
    "/",
    response_model=List[ReturPembelianResponse],
)
def get_all(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "retur_pembelian.view"
        )
    ),
):
    return ReturPembelianService.get_all(
        db
    )


# ==========================================================
# GET BY ID
# ==========================================================

@router.get(
    "/{retur_id}",
    response_model=ReturPembelianResponse,
)
def get_by_id(
    retur_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "retur_pembelian.view"
        )
    ),
):
    return ReturPembelianService.get_by_id(
        db,
        retur_id,
    )


# ==========================================================
# CREATE
# ==========================================================

@router.post(
    "/",
    response_model=ReturPembelianResponse,
    status_code=201,
)
def create(
    data: ReturPembelianCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "retur_pembelian.create"
        )
    ),
):
    return ReturPembelianService.create(
     db,
     data,
     current_user.id,
    )


# ==========================================================
# APPROVE
# ==========================================================

@router.post(
    "/{retur_id}/approve",
    response_model=ReturPembelianResponse,
)
def approve(
    retur_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
         "retur_pembelian.approve"
        )
    ),
):
    return ReturPembelianService.approve(
        db,
        retur_id,
    )


# ==========================================================
# REJECT
# ==========================================================

@router.post(
    "/{retur_id}/reject",
    response_model=ReturPembelianResponse,
)
def reject(
    retur_id: int,
    alasan: str | None = Body(default=None, embed=True),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "retur_pembelian.reject"
        )
    ),
):
    return ReturPembelianService.reject(
        db,
        retur_id,
        alasan,
    )


# ==========================================================
# UPDATE
# ==========================================================

@router.put(
    "/{retur_id}",
    response_model=ReturPembelianResponse,
)
def update(
    retur_id: int,
    data: ReturPembelianUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "retur_pembelian.update"
        )
    ),
):
    return ReturPembelianService.update(
        db,
        retur_id,
        data,
    )


# ==========================================================
# DELETE
# ==========================================================

@router.delete(
    "/{retur_id}",
)
def delete(
    retur_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "retur_pembelian.delete"
        )
    ),
):
    return ReturPembelianService.delete(
        db,
        retur_id,
    )