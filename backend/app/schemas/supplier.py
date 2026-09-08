from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ======================================
# Base Schema
# ======================================
class SupplierBase(BaseModel):
    nama: str = Field(..., max_length=150)
    alamat: Optional[str] = None
    telepon: Optional[str] = Field(default=None, max_length=30)
    email: Optional[str] = Field(default=None, max_length=100)
    kontak: Optional[str] = Field(default=None, max_length=100)
    aktif: bool = True


# ======================================
# Create
# ======================================
class SupplierCreate(SupplierBase):
    pass


# ======================================
# Update
# ======================================
class SupplierUpdate(BaseModel):
    nama: Optional[str] = Field(default=None, max_length=150)
    alamat: Optional[str] = None
    telepon: Optional[str] = Field(default=None, max_length=30)
    email: Optional[str] = Field(default=None, max_length=100)
    kontak: Optional[str] = Field(default=None, max_length=100)
    aktif: Optional[bool] = None


# ======================================
# Response
# ======================================
class SupplierResponse(SupplierBase):
    id: int
    kode_supplier: str

    model_config = ConfigDict(from_attributes=True)

    model_config = ConfigDict(
        from_attributes=True
    )


# ======================================
# Pagination Response
# ======================================
class SupplierPaginationResponse(BaseModel):
    items: list[SupplierResponse]

    total: int
    page: int
    size: int
    pages: int

    model_config = ConfigDict(
        from_attributes=True
    )