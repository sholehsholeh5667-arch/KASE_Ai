from typing import Optional

from pydantic import BaseModel, ConfigDict


class PelangganBase(BaseModel):
    nama: str
    alamat: Optional[str] = None
    telepon: Optional[str] = None
    email: Optional[str] = None


class PelangganCreate(PelangganBase):
    pass


class PelangganUpdate(BaseModel):
    nama: Optional[str] = None
    alamat: Optional[str] = None
    telepon: Optional[str] = None
    email: Optional[str] = None


class PelangganResponse(PelangganBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )