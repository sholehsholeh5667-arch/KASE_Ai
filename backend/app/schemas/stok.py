from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# =====================================================
# ENUM
# =====================================================

class JenisMutasi(str, Enum):
    PEMBELIAN = "PEMBELIAN"
    PENJUALAN = "PENJUALAN"
    RETUR_PEMBELIAN = "RETUR_PEMBELIAN"
    RETUR_PENJUALAN = "RETUR_PENJUALAN"
    STOCK_OPNAME = "STOCK_OPNAME"
    PENYESUAIAN = "PENYESUAIAN"
    TRANSFER_GUDANG = "TRANSFER_GUDANG"
    PRODUKSI = "PRODUKSI"
    HILANG = "HILANG"
    RUSAK = "RUSAK"


class StatusOpname(str, Enum):
    DRAFT = "DRAFT"
    PROSES = "PROSES"
    SELESAI = "SELESAI"
    DIBATALKAN = "DIBATALKAN"


# =====================================================
# MUTASI STOK
# =====================================================

class MutasiStokResponse(BaseModel):

    id: int
    tanggal: datetime

    barang_id: int

    jenis: JenisMutasi

    qty: Decimal

    stok_awal: Decimal

    stok_akhir: Decimal

    referensi: Optional[str]

    keterangan: Optional[str]

    created_by: Optional[int]

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# STOCK OPNAME DETAIL
# =====================================================

class StockOpnameDetailCreate(BaseModel):

    barang_id: int = Field(..., gt=0)

    stok_fisik: Decimal = Field(..., ge=0)

    keterangan: Optional[str] = None


class StockOpnameDetailResponse(BaseModel):

    id: int

    barang_id: int

    stok_sistem: Decimal

    stok_fisik: Decimal

    selisih: Decimal

    keterangan: Optional[str]

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# STOCK OPNAME
# =====================================================

class StockOpnameCreate(BaseModel):

    keterangan: Optional[str] = None

    detail: List[
        StockOpnameDetailCreate
    ]


class StockOpnameResponse(BaseModel):

    id: int

    nomor: str

    tanggal: datetime

    status: StatusOpname

    keterangan: Optional[str]

    detail: List[
        StockOpnameDetailResponse
    ]

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================
# BARANG STOK MINIMUM
# =====================================================

class BarangMinimumResponse(BaseModel):

    barang_id: int

    nama_barang: str

    stok: int

    stok_minimum: int


# =====================================================
# KARTU STOK
# =====================================================

class KartuStokResponse(BaseModel):

    tanggal: datetime

    jenis: JenisMutasi

    referensi: Optional[str]

    masuk: Decimal

    keluar: Decimal

    saldo: Decimal

    model_config = ConfigDict(
        from_attributes=True
    )