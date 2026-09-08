from decimal import Decimal
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.stok import (
    StockOpnameCreate,
    StockOpnameResponse,
    MutasiStokResponse,
    BarangMinimumResponse,
    KartuStokResponse,
)

from app.services.stok import stok_service
from app.repositories.stok import stok_repository

from app.api.dependencies import require_permission
from app.models.barang import Barang


router = APIRouter(
    prefix="/stok",
    tags=["Stok"],
)


# =====================================================
# STOCK OPNAME
# =====================================================

@router.post(
    "/opname",
    response_model=StockOpnameResponse,
    status_code=201,
)
def create_stock_opname(
    data: StockOpnameCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "stock_opname.create"
        )
    ),
):
    return stok_service.create_stock_opname(
        db=db,
        data=data,
        user_id=current_user.id,
    )


@router.post(
    "/opname/{opname_id}/approve",
    response_model=StockOpnameResponse,
)
def approve_stock_opname(
    opname_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "stock_opname.approve"
        )
    ),
):
    return stok_service.approve_stock_opname(
        db=db,
        opname_id=opname_id,
        user_id=current_user.id,
    )


@router.get(
    "/opname",
    response_model=List[StockOpnameResponse],
)
def get_all_stock_opname(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "stock_opname.view"
        )
    ),
):
    return stok_repository.get_all_stock_opname(
        db
    )


@router.get(
    "/opname/{opname_id}",
    response_model=StockOpnameResponse,
)
def get_stock_opname(
    opname_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "stock_opname.view"
        )
    ),
):
    opname = stok_repository.get_stock_opname(
        db,
        opname_id,
    )

    if opname is None:
        raise HTTPException(
            status_code=404,
            detail="Stock Opname tidak ditemukan.",
        )

    return opname


# =====================================================
# MUTASI STOK
# =====================================================

@router.get(
    "/mutasi",
    response_model=List[MutasiStokResponse],
)
def get_mutasi(
    barang_id: Optional[int] = None,
    jenis: Optional[str] = None,
    tanggal_awal: Optional[str] = Query(None),
    tanggal_akhir: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "mutasi_stok.view"
        )
    ),
):
    return stok_repository.get_mutasi(
        db,
        barang_id,
        jenis,
        tanggal_awal,
        tanggal_akhir,
    )


# =====================================================
# STOK MINIMUM
# =====================================================

@router.get(
    "/minimum",
    response_model=List[BarangMinimumResponse],
)
def stok_minimum(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "stok.view"
        )
    ),
):
    barang_list = (
        stok_repository.get_barang_minimum(
            db
        )
    )

    hasil = []

    for barang in barang_list:
        hasil.append(
            BarangMinimumResponse(
                barang_id=barang.id,
                nama_barang=barang.nama_barang,
                stok=barang.stok,
                stok_minimum=barang.stok_minimum,
            )
        )

    return hasil


# =====================================================
# KARTU STOK
# =====================================================

@router.get(
    "/kartu/{barang_id}",
    response_model=List[KartuStokResponse],
)
def kartu_stok(
    barang_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "stok.view"
        )
    ),
):
    # =================================================
    # AMBIL BARANG
    # =================================================

    barang = (
        db.query(Barang)
        .filter(
            Barang.id == barang_id
        )
        .first()
    )

    if barang is None:
        raise HTTPException(
            status_code=404,
            detail="Barang tidak ditemukan.",
        )

    # =================================================
    # AMBIL SEMUA MUTASI
    # =================================================

    data = stok_repository.get_kartu_stok(
        db,
        barang_id,
    )

    # =================================================
    # JIKA BELUM ADA MUTASI
    # =================================================

    if not data:
        return []

    # =================================================
    # HITUNG TOTAL QTY MUTASI
    #
    # Rumus:
    #
    # stok_sekarang =
    # stok_awal + total seluruh qty mutasi
    #
    # Maka:
    #
    # stok_awal =
    # stok_sekarang - total qty mutasi
    # =================================================

    total_mutasi = Decimal("0")

    for item in data:

        qty = Decimal(
            str(item.qty)
        )

        total_mutasi += qty

    # =================================================
    # STOK SEKARANG
    # =================================================

    stok_sekarang = Decimal(
        str(barang.stok)
    )

    # =================================================
    # REKONSTRUKSI SALDO AWAL
    # =================================================

    saldo = (
        stok_sekarang
        - total_mutasi
    )

    # =================================================
    # HASIL KARTU STOK
    # =================================================

    hasil = []

    for item in data:

        qty = Decimal(
            str(item.qty)
        )

        # =============================================
        # STOK MASUK
        # =============================================

        if qty > 0:

            masuk = qty
            keluar = Decimal("0")

        # =============================================
        # STOK KELUAR
        # =============================================

        elif qty < 0:

            masuk = Decimal("0")
            keluar = abs(qty)

        # =============================================
        # TIDAK ADA PERUBAHAN
        # =============================================

        else:

            masuk = Decimal("0")
            keluar = Decimal("0")

        # =============================================
        # HITUNG SALDO BERJALAN
        # =============================================

        saldo = saldo + qty

        # =============================================
        # RESPONSE
        # =============================================

        hasil.append(
            KartuStokResponse(
                tanggal=item.tanggal,
                jenis=item.jenis,
                referensi=item.referensi,
                masuk=masuk,
                keluar=keluar,
                saldo=saldo,
            )
        )

    # =================================================
    # RETURN
    # =================================================

    return hasil