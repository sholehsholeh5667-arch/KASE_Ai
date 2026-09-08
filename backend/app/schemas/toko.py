from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
)


# ==========================================================
# BASE
# ==========================================================

class TokoBase(BaseModel):

    nama: str
    kode: str
    parent_id: int | None = None
    deskripsi: str | None = None


# ==========================================================
# CREATE
# ==========================================================

class TokoCreate(
    TokoBase
):
    pass


# ==========================================================
# UPDATE
# ==========================================================

class TokoUpdate(
    BaseModel
):

    nama: str | None = None
    kode: str | None = None
    parent_id: int | None = None
    deskripsi: str | None = None


# ==========================================================
# RESPONSE
# ==========================================================

class TokoResponse(
    TokoBase
):

    id: int
    aktif: bool

    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True
    )