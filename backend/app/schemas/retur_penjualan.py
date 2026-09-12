from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ==========================================================
# DETAIL RETUR PENJUALAN
# ==========================================================

class DetailReturPenjualanCreate(BaseModel):

    barang_id: int = Field(
        gt=0
    )

    qty: int = Field(
        gt=0
    )

    harga: Decimal = Field(
        ge=0
    )

    kondisi: Optional[str] = None


# ==========================================================
# CREATE RETUR PENJUALAN
# ==========================================================

class ReturPenjualanCreate(BaseModel):

    penjualan_id: int = Field(
        gt=0
    )

    pelanggan_id: Optional[int] = None

    alasan: Optional[str] = None

    jenis_refund: str = "CASH"

    detail: List[
        DetailReturPenjualanCreate
    ]


# ==========================================================
# UPDATE RETUR PENJUALAN
# ==========================================================

class ReturPenjualanUpdate(BaseModel):

    alasan: Optional[str] = None

    jenis_refund: Optional[str] = None


# ==========================================================
# DETAIL RESPONSE
# ==========================================================

class DetailReturPenjualanResponse(BaseModel):

    id: int

    retur_id: int

    barang_id: int

    qty: int

    harga: Decimal

    subtotal: Decimal

    kondisi: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# RESPONSE
# ==========================================================

class ReturPenjualanResponse(BaseModel):

    id: int

    no_retur: Optional[str] = None

    penjualan_id: int

    pelanggan_id: Optional[int] = None

    created_by: int

    total: Decimal

    status: str

    alasan: Optional[str] = None

    jenis_refund: str

    detail: List[
        DetailReturPenjualanResponse
    ] = []

    model_config = ConfigDict(
        from_attributes=True
    )
# ==========================================================
# PAGINATION RESPONSE
# ==========================================================

class ReturPenjualanPaginationResponse(BaseModel):
    items: List[ReturPenjualanResponse]
    total: int
    page: int
    size: int