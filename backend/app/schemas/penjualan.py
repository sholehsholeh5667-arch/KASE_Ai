from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ==========================================================
# DETAIL ITEM REQUEST
# ==========================================================

class PenjualanItem(BaseModel):

    barang_id: int = Field(
        ...,
        gt=0,
        examples=[16]
    )

    qty: int = Field(
        ...,
        gt=0,
        examples=[2]
    )

    harga_jual: Decimal = Field(
        ...,
        ge=0,
        examples=[15000]
    )


# ==========================================================
# CREATE REQUEST
# ==========================================================

class PenjualanCreate(BaseModel):

    pelanggan_id: Optional[int] = Field(
        default=None,
        examples=[1]
    )

    diskon: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        examples=[0]
    )

    pajak: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        examples=[0]
    )

    metode_bayar: str = Field(
        default="TUNAI",
        examples=["TUNAI"]
    )

    dibayar: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        examples=[30000]
    )

    keterangan: Optional[str] = Field(
        default=None,
        examples=["Penjualan TEST"]
    )

    items: List[PenjualanItem] = Field(
        ...,
        min_length=1
    )


# ==========================================================
# UPDATE REQUEST
# ==========================================================

class PenjualanUpdate(BaseModel):

    pelanggan_id: Optional[int] = Field(
        default=None,
        examples=[1]
    )

    diskon: Optional[Decimal] = Field(
        default=None,
        ge=0,
        examples=[0]
    )

    pajak: Optional[Decimal] = Field(
        default=None,
        ge=0,
        examples=[0]
    )

    metode_bayar: Optional[str] = Field(
        default=None,
        examples=["TUNAI"]
    )

    dibayar: Optional[Decimal] = Field(
        default=None,
        ge=0,
        examples=[30000]
    )

    status: Optional[str] = Field(
        default=None,
        examples=["SELESAI"]
    )

    keterangan: Optional[str] = Field(
        default=None,
        examples=["Update penjualan"]
    )


# ==========================================================
# DETAIL RESPONSE
# ==========================================================

class DetailPenjualanResponse(BaseModel):

    id: int = Field(
        ...,
        examples=[1]
    )

    barang_id: int = Field(
        ...,
        examples=[16]
    )

    qty: int = Field(
        ...,
        examples=[2]
    )

    harga_jual: Decimal = Field(
        ...,
        examples=[15000]
    )

    subtotal: Decimal = Field(
        ...,
        examples=[30000]
    )

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# RESPONSE
# ==========================================================

class PenjualanResponse(BaseModel):

    id: int = Field(
        ...,
        examples=[21]
    )

    no_faktur: str = Field(
        ...,
        examples=["PJ-20260817-000001"]
    )

    tanggal: datetime

    pelanggan_id: Optional[int] = Field(
        default=None,
        examples=[1]
    )

    subtotal: Decimal = Field(
        ...,
        examples=[30000]
    )

    diskon: Decimal = Field(
        ...,
        examples=[0]
    )

    pajak: Decimal = Field(
        ...,
        examples=[0]
    )

    grand_total: Decimal = Field(
        ...,
        examples=[30000]
    )

    metode_bayar: str = Field(
        ...,
        examples=["TUNAI"]
    )

    dibayar: Decimal = Field(
        ...,
        examples=[30000]
    )

    kembalian: Decimal = Field(
        ...,
        examples=[0]
    )

    status: str = Field(
        ...,
        examples=["SELESAI"]
    )

    keterangan: Optional[str] = Field(
        default=None,
        examples=["Penjualan TEST FINAL KasirAI"]
    )

    detail: List[DetailPenjualanResponse] = Field(
        default_factory=list
    )

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# LIST RESPONSE
# ==========================================================

class PenjualanListResponse(BaseModel):

    data: List[PenjualanResponse]

    total: int = Field(
        ...,
        examples=[8]
    )

    model_config = ConfigDict(
        from_attributes=True
    )