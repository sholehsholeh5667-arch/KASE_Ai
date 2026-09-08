from fastapi import (
    APIRouter,
    Depends,
    Query,
    HTTPException,
)

from fastapi.responses import HTMLResponse

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.pembelian import (
    PembelianCreate,
    PembelianListResponse,
    PembelianResponse,
)

from app.services.pembelian_service import (
    pembelian_service,
)

from app.repositories.pembelian import (
    pembelian_repository,
)

from app.services.cetak_service import (
    preview_pembelian,
)

from app.api.dependencies import (
    require_permission,
)

from app.models.pembelian import (
    Pembelian,
)

from app.models.detail_pembelian import (
    DetailPembelian,
)


# ==========================================================
# ROUTER
# ==========================================================

router = APIRouter(
    prefix="/pembelian",
    tags=["Pembelian"],
)


# ==========================================================
# GET SEMUA PEMBELIAN
# ==========================================================

@router.get(
    "/",
    response_model=PembelianListResponse,
)
def get_all_pembelian(
    page: int = Query(
        default=1,
        ge=1,
    ),
    size: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    search: str = Query(
        default="",
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "pembelian.view"
        )
    ),
):

    # ======================================================
    # AMBIL SEMUA DATA
    # ======================================================

    data = (
        pembelian_repository
        .get_all(db)
    )

    # ======================================================
    # FILTER PENCARIAN
    # ======================================================

    search_value = (
        search.strip().lower()
    )

    if search_value:

        data = [
            item
            for item in data
            if search_value
            in (
                item.no_faktur
                or ""
            ).lower()
        ]

    # ======================================================
    # TOTAL
    # ======================================================

    total = len(data)

    # ======================================================
    # PAGINATION
    # ======================================================

    start = (
        page - 1
    ) * size

    end = start + size

    items = data[
        start:end
    ]

    # ======================================================
    # RESPONSE
    # ======================================================

    return {
        "data": items,
        "total": total,
    }


# ==========================================================
# CREATE PEMBELIAN
# ==========================================================

@router.post(
    "/",
)
def create_pembelian(
    data: PembelianCreate,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        require_permission(
            "pembelian.create"
        )
    ),
):

    return (
        pembelian_service
        .create_pembelian(
            db=db,
            data=data,

            # ------------------------------------------------
            # Sementara masih memakai user 1.
            # ------------------------------------------------
            user_id=1,
        )
    )


# ==========================================================
# PREVIEW / CETAK FAKTUR PEMBELIAN
# ==========================================================

@router.get(
    "/{pembelian_id}/print-preview",
    response_class=HTMLResponse,
)
def print_preview(
    pembelian_id: int,

    jenis: str = Query(
        default="faktur",
        pattern="^faktur$",
    ),

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        require_permission(
            "pembelian.view"
        )
    ),
):

    html = (
        preview_pembelian(
            db=db,
            pembelian_id=pembelian_id,
            jenis=jenis,
        )
    )

    return HTMLResponse(
        content=html,
        status_code=200,
    )


# ==========================================================
# GET DETAIL PEMBELIAN
# ==========================================================
#
# Mengambil satu faktur pembelian beserta detail barang.
#
# Dipakai oleh Retur Pembelian untuk mendapatkan:
# - data faktur
# - supplier
# - detail barang
# - qty beli
# - harga_beli faktur
# - subtotal
#
# Permission:
# pembelian.view
# ==========================================================

@router.get(
    "/{pembelian_id}",
    response_model=PembelianResponse,
)
def get_pembelian_by_id(
    pembelian_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        require_permission(
            "pembelian.view"
        )
    ),
):

    # ======================================================
    # AMBIL HEADER PEMBELIAN
    # ======================================================

    pembelian = (
        db.query(
            Pembelian
        )
        .filter(
            Pembelian.id
            == pembelian_id
        )
        .first()
    )

    # ======================================================
    # JIKA TIDAK DITEMUKAN
    # ======================================================

    if pembelian is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Data pembelian "
                f"ID {pembelian_id} "
                "tidak ditemukan."
            ),
        )

    # ======================================================
    # AMBIL DETAIL PEMBELIAN
    # ======================================================

    detail = (
        db.query(
            DetailPembelian
        )
        .filter(
            DetailPembelian.pembelian_id
            == pembelian_id
        )
        .all()
    )

    # ======================================================
    # PASANG DETAIL KE OBJECT PEMBELIAN
    # ======================================================

    pembelian.detail = detail

    # ======================================================
    # RESPONSE
    # ======================================================

    return pembelian