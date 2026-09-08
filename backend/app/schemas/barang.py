from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ======================================
# Base Schema
# ======================================

class BarangBase(BaseModel):

    kode_barang: str = Field(
        ...,
        min_length=1,
        max_length=30,
    )

    nama_barang: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )

    alias_barang: Optional[str] = Field(
        default=None,
        max_length=200,
    )

    kategori_id: Optional[int] = None

    supplier_default: Optional[int] = None

    satuan: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    harga_beli: Decimal = Field(
        default=Decimal("0"),
        ge=0
    )

    harga_jual: Decimal = Field(
        default=Decimal("0"),
        ge=0
    )

    stok: Decimal = Field(
        default=Decimal("0"),
        ge=0
    )

    stok_minimum: int = Field(
        default=5,
        ge=0
    )

    lokasi_rak: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    foto: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    aktif: bool = True


# ======================================
# Create
# ======================================

class BarangCreate(BarangBase):
    pass


# ======================================
# Update
# ======================================

class BarangUpdate(BaseModel):

    kode_barang: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=30,
    )

    nama_barang: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    alias_barang: Optional[str] = Field(
        default=None,
        max_length=200,
    )

    kategori_id: Optional[int] = None

    supplier_default: Optional[int] = None

    satuan: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    harga_beli: Optional[Decimal] = Field(
        default=None,
        ge=0
    )

    harga_jual: Optional[Decimal] = Field(
        default=None,
        ge=0
    )

    stok: Optional[Decimal] = Field(
        default=None,
        ge=0
    )

    stok_minimum: Optional[int] = Field(
        default=None,
        ge=0
    )

    lokasi_rak: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    foto: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    aktif: Optional[bool] = None


# ======================================
# Response Barang
# ======================================

class BarangResponse(BarangBase):

    id: int

    model_config = ConfigDict(
        from_attributes=True
    )


# ======================================
# Pagination Response
# ======================================

class BarangPaginationResponse(BaseModel):

    items: list[BarangResponse]

    total: int

    model_config = ConfigDict(
        from_attributes=True
    )