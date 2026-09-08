"""
API Laporan
===========

Endpoint Modul Laporan.
"""

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.services.laporan_service import (
    LaporanService,
)

from app.utils.export_pdf import (
    PDFExporter,
)

from app.utils.export_excel import (
    ExcelExporter,
)

from app.api.dependencies import (
    require_permission,
)


router = APIRouter(
    prefix="/laporan",
    tags=["Laporan"],
)


# =====================================================
# SUMMARY
# =====================================================

@router.get(
    "/summary"
)
def summary(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.view"
        )
    ),
):
    service = LaporanService(db)

    return service.get_summary()


# =====================================================
# PENJUALAN
# =====================================================

@router.get(
    "/penjualan"
)
async def penjualan(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.view"
        )
    ),
):
    service = LaporanService(db)

    return await service.get_penjualan()


# =====================================================
# PEMBELIAN
# =====================================================

@router.get(
    "/pembelian"
)
async def pembelian(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.view"
        )
    ),
):
    service = LaporanService(db)

    return await service.get_pembelian()


# =====================================================
# RETUR PENJUALAN
# =====================================================

@router.get(
    "/retur-penjualan"
)
async def retur_penjualan(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.view"
        )
    ),
):
    service = LaporanService(db)

    return await service.get_retur_penjualan()


# =====================================================
# RETUR PEMBELIAN
# =====================================================

@router.get(
    "/retur-pembelian"
)
async def retur_pembelian(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.view"
        )
    ),
):
    service = LaporanService(db)

    return await service.get_retur_pembelian()


# =====================================================
# STOK
# =====================================================

@router.get(
    "/stok"
)
async def stok(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.view"
        )
    ),
):
    service = LaporanService(db)

    return service.get_stock()


# =====================================================
# MUTASI STOK
# =====================================================

@router.get(
    "/mutasi-stok"
)
async def mutasi_stok(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.view"
        )
    ),
):
    service = LaporanService(db)

    return service.get_stock_mutation()


# =====================================================
# PRODUK TERLARIS
# =====================================================

@router.get(
    "/produk-terlaris"
)
async def produk_terlaris(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.view"
        )
    ),
):
    service = LaporanService(db)

    return service.get_top_product(
        limit
    )


# =====================================================
# PELANGGAN
# =====================================================

@router.get(
    "/pelanggan"
)
async def pelanggan(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.view"
        )
    ),
):
    service = LaporanService(db)

    return await service.get_customer_report()


# =====================================================
# SUPPLIER
# =====================================================

@router.get(
    "/supplier"
)
async def supplier(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.view"
        )
    ),
):
    service = LaporanService(db)

    return await service.get_supplier_report()


# =====================================================
# LABA RUGI
# =====================================================

@router.get(
    "/laba-rugi"
)
async def laba_rugi(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.laba_rugi"
        )
    ),
):
    service = LaporanService(db)

    return service.get_profit_loss()


# =====================================================
# NILAI PERSEDIAAN
# =====================================================

@router.get(
    "/nilai-persediaan"
)
async def nilai_persediaan(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.view"
        )
    ),
):
    service = LaporanService(db)

    return service.get_inventory_value()


# =====================================================
# EXPORT PDF PENJUALAN
# =====================================================

@router.get(
    "/penjualan/pdf"
)
async def export_penjualan_pdf(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.export"
        )
    ),
):

    service = LaporanService(db)

    data = await service.get_penjualan()

    headers = [
        "No",
        "Tanggal",
        "Pelanggan",
        "Total",
    ]

    rows = []

    nomor = 1

    for item in data:

        rows.append(
            [
                nomor,
                item.get("tanggal"),
                item.get("pelanggan"),
                item.get("total"),
            ]
        )

        nomor += 1

    pdf = PDFExporter().export(
        title="Laporan Penjualan",
        headers=headers,
        rows=rows,
    )

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                "attachment; "
                "filename=laporan_penjualan.pdf"
        },
    )


# =====================================================
# EXPORT EXCEL PENJUALAN
# =====================================================

@router.get(
    "/penjualan/excel"
)
async def export_penjualan_excel(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.export"
        )
    ),
):

    service = LaporanService(db)

    data = await service.get_penjualan()

    headers = [
        "No",
        "Tanggal",
        "Pelanggan",
        "Total",
    ]

    rows = []

    nomor = 1

    for item in data:

        rows.append(
            [
                nomor,
                item.get("tanggal"),
                item.get("pelanggan"),
                item.get("total"),
            ]
        )

        nomor += 1

    excel = ExcelExporter().export(
        title="Laporan Penjualan",
        headers=headers,
        rows=rows,
    )

    return Response(
        content=excel,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition":
                "attachment; "
                "filename=laporan_penjualan.xlsx"
        },
    )


# =====================================================
# FILTER PENJUALAN
# =====================================================

@router.get(
    "/penjualan/filter"
)
async def filter_penjualan(
    tanggal_awal: str | None = None,
    tanggal_akhir: str | None = None,
    kategori_id: int | None = None,
    supplier_id: int | None = None,
    pelanggan_id: int | None = None,
    barang_id: int | None = None,
    kasir_id: int | None = None,
    metode_bayar: str | None = None,
    status: str | None = None,
    keyword: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "DESC",
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "laporan.view"
        )
    ),
):
    """
    Filter laporan penjualan.
    """

    service = LaporanService(db)

    return await service.filter_penjualan(
        tanggal_awal=tanggal_awal,
        tanggal_akhir=tanggal_akhir,
        kategori_id=kategori_id,
        supplier_id=supplier_id,
        pelanggan_id=pelanggan_id,
        barang_id=barang_id,
        kasir_id=kasir_id,
        metode_bayar=metode_bayar,
        status=status,
        keyword=keyword,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit,
    )