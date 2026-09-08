from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.api.dependencies import (
    require_permission,
)

from app.schemas.pelanggan import (
    PelangganCreate,
    PelangganUpdate,
    PelangganResponse,
)

from app.services.pelanggan import (
    pelanggan_service,
)


router = APIRouter(
    prefix="/pelanggan",
    tags=["Pelanggan"],
)


# =====================================
# GET SEMUA PELANGGAN
# =====================================

@router.get(
    "/",
    response_model=list[PelangganResponse],
)
def get_all(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "pelanggan.view"
        )
    ),
):
    return pelanggan_service.get_all(
        db
    )


# =====================================
# GET DETAIL PELANGGAN
# =====================================

@router.get(
    "/{id}",
    response_model=PelangganResponse,
)
def get(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "pelanggan.view"
        )
    ),
):
    pelanggan = pelanggan_service.get(
        db,
        id,
    )

    if pelanggan is None:
        raise HTTPException(
            status_code=404,
            detail="Pelanggan tidak ditemukan",
        )

    return pelanggan


# =====================================
# POST TAMBAH PELANGGAN
# =====================================

@router.post(
    "/",
    response_model=PelangganResponse,
    status_code=201,
)
def create(
    data: PelangganCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "pelanggan.create"
        )
    ),
):
    return pelanggan_service.create(
        db,
        data,
    )


# =====================================
# PUT UPDATE PELANGGAN
# =====================================
# Owner + Admin + Kasir

@router.put(
    "/{id}",
    response_model=PelangganResponse,
)
def update(
    id: int,
    data: PelangganUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "pelanggan.update"
        )
    ),
):
    pelanggan = pelanggan_service.get(
        db,
        id,
    )

    if pelanggan is None:
        raise HTTPException(
            status_code=404,
            detail="Pelanggan tidak ditemukan",
        )

    return pelanggan_service.update(
        db,
        id,
        data,
    )


# =====================================
# DELETE PELANGGAN
# =====================================

@router.delete(
    "/{id}",
)
def delete(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "pelanggan.delete"
        )
    ),
):
    pelanggan = pelanggan_service.get(
        db,
        id,
    )

    if pelanggan is None:
        raise HTTPException(
            status_code=404,
            detail="Pelanggan tidak ditemukan",
        )

    result = pelanggan_service.delete(
        db,
        id,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Pelanggan tidak ditemukan",
        )

    return {
        "message": "Pelanggan berhasil dihapus",
    }