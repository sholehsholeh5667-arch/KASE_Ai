from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ======================================
# Base Schema
# ======================================
class KategoriBase(BaseModel):
    nama: str = Field(..., max_length=100)
    deskripsi: Optional[str] = None
    aktif: bool = True


# ======================================
# Create
# ======================================
class KategoriCreate(KategoriBase):
    pass


# ======================================
# Update
# ======================================
class KategoriUpdate(BaseModel):
    nama: Optional[str] = Field(default=None, max_length=100)
    deskripsi: Optional[str] = None
    aktif: Optional[bool] = None


# ======================================
# Response
# ======================================
class KategoriResponse(KategoriBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )


# ======================================
# Pagination Response
# ======================================
class KategoriPaginationResponse(BaseModel):
    items: list[KategoriResponse]

    total: int
    page: int
    size: int
    pages: int

    model_config = ConfigDict(
        from_attributes=True
    )