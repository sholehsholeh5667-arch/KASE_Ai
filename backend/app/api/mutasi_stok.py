from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.mutasi_stok import (
    MutasiStokCreate,
    MutasiStokUpdate,
    MutasiStokResponse,
    MutasiStokPaginationResponse,
)

from app.services.mutasi_stok_service import (
    MutasiStokService,
)

from app.api.dependencies import (
    require_permission,
)


router = APIRouter(
    prefix="/mutasi-stok",
    tags=["Mutasi Stok"],
)


# ======================================
# LIST
# ======================================

@router.get(
    "",
    response_model=MutasiStokPaginationResponse,
)
def get_all(
    page: int = Query(
        1,
        ge=1,
        description="Nomor halaman, minimal 1",
    ),
    size: int = Query(
        10,
        ge=1,
        description="Jumlah data per halaman, minimal 1",
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "mutasi_stok.view"
        )
    ),
):
    result = MutasiStokService.get_all(
        db,
        page,
        size,
    )

    return result


# ======================================
# DETAIL
# ======================================

@router.get(
    "/{mutasi_id}",
    response_model=MutasiStokResponse,
)
def get_by_id(
    mutasi_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "mutasi_stok.view"
        )
    ),
):
    data = MutasiStokService.get_by_id(
        db,
        mutasi_id,
    )

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Mutasi stok tidak ditemukan",
        )

    return data


# ======================================
# CREATE / PENYESUAIAN
# ======================================

@router.post(
    "",
    response_model=MutasiStokResponse,
)
def create(
    payload: MutasiStokCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "stok.adjust"
        )
    ),
):
    try:
        return MutasiStokService.create(
            db,
            payload,
            current_user.id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

# ======================================
# UPDATE / PENYESUAIAN
# ======================================

@router.put(
    "/{mutasi_id}",
    response_model=MutasiStokResponse,
)
def update(
    mutasi_id: int,
    payload: MutasiStokUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "stok.adjust"
        )
    ),
):
    try:

        data = MutasiStokService.update(
            db,
            mutasi_id,
            payload,
        )

        if not data:
            raise HTTPException(
                status_code=404,
                detail="Mutasi stok tidak ditemukan",
            )

        return data

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# ======================================
# DELETE
# ======================================

@router.delete(
    "/{mutasi_id}",
)
def delete(
    mutasi_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "__NO_ROLE_PERMISSION__"
        )
    ),
):
    # Endpoint delete sengaja tidak diberikan
    # kepada 5 role operasional.
    #
    # Riwayat mutasi stok tidak boleh dihapus
    # agar histori stok tetap terjaga.

    raise HTTPException(
        status_code=403,
        detail=(
            "Penghapusan riwayat mutasi stok "
            "tidak diizinkan."
        ),
    )