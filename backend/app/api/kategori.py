from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.kategori import (
    KategoriCreate,
    KategoriUpdate,
    KategoriResponse,
    KategoriPaginationResponse,
)

from app.services.kategori_service import KategoriService

from app.api.dependencies import require_permission


router = APIRouter(
    prefix="/kategori",
    tags=["Kategori"],
)


service = KategoriService()


# =====================================
# Ambil semua kategori
# =====================================

@router.get(
    "/",
    response_model=KategoriPaginationResponse,
)
def get_all(
    search: str | None = Query(
        default=None
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    size: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "kategori.view"
        )
    ),
):
    return service.get_all(
        db=db,
        search=search,
        page=page,
        size=size,
    )


# =====================================
# Ambil berdasarkan ID
# =====================================

@router.get(
    "/{kategori_id}",
    response_model=KategoriResponse,
)
def get_by_id(
    kategori_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "kategori.view"
        )
    ),
):
    return service.get_by_id(
        db,
        kategori_id,
    )


# =====================================
# Tambah kategori
# =====================================

@router.post(
    "/",
    response_model=KategoriResponse,
    status_code=201,
)
def create(
    data: KategoriCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "kategori.create"
        )
    ),
):
    return service.create(
        db,
        data,
    )


# =====================================
# Update kategori
# =====================================

@router.put(
    "/{kategori_id}",
    response_model=KategoriResponse,
)
def update(
    kategori_id: int,
    data: KategoriUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "kategori.update"
        )
    ),
):
    return service.update(
        db,
        kategori_id,
        data,
    )


# =====================================
# Hapus kategori
# =====================================

@router.delete(
    "/{kategori_id}"
)
def delete(
    kategori_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "kategori.delete"
        )
    ),
):
    return service.delete(
        db,
        kategori_id,
    )