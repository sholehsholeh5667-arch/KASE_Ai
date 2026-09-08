from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ======================================
# Base
# ======================================

class MutasiStokBase(BaseModel):
    barang_id: int
    jenis: str
    qty: Decimal
    keterangan: Optional[str] = None
    created_by: Optional[int] = None


# ======================================
# Create
# ======================================

class MutasiStokCreate(MutasiStokBase):
    pass


# ======================================
# Update
# ======================================

class MutasiStokUpdate(BaseModel):
    jenis: Optional[str] = None
    qty: Optional[Decimal] = None
    keterangan: Optional[str] = None

    model_config = ConfigDict(
        extra="forbid"
    )


# ======================================
# Response
# ======================================

class MutasiStokResponse(MutasiStokBase):
    id: int
    tanggal: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ======================================
# Pagination
# ======================================

class MutasiStokPaginationResponse(BaseModel):
    items: list[MutasiStokResponse]
    total: int

    model_config = ConfigDict(
        from_attributes=True
    )