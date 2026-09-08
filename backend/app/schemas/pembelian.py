from datetime import datetime
from decimal import Decimal

from pydantic import (
    BaseModel,
    ConfigDict,
    StrictStr,
    Field,
    field_validator,
)


# ==========================================================
# DETAIL PEMBELIAN CREATE
# ==========================================================

class DetailPembelianCreate(BaseModel):

    barang_id: int = Field(
        ...,
        gt=0,
    )

    qty: Decimal = Field(
        ...,
        gt=0,
    )

    harga_beli: Decimal = Field(
        ...,
        gt=0,
    )


# ==========================================================
# PEMBELIAN CREATE
# ==========================================================

class PembelianCreate(BaseModel):

    # Nomor faktur boleh kosong karena
    # backend akan membuat otomatis.
    no_faktur: StrictStr | None = None

    supplier_id: int = Field(
        ...,
        gt=0,
    )

    # Opsional di request frontend.
    # Backend saat ini menggunakan user_id
    # dari endpoint/service.
    user_id: int | None = Field(
        default=None,
        gt=0,
    )

    tanggal: datetime | None = None

    # Dipertahankan sesuai struktur database lama.
    # Modul UI Pembelian tidak menyediakan input diskon.
    diskon: Decimal = Field(
        default=Decimal("0"),
        ge=0,
    )

    keterangan: str | None = None

    detail: list[DetailPembelianCreate] = Field(
        ...,
        min_length=1,
    )

    # ======================================================
    # VALIDASI NO FAKTUR
    # ======================================================

    @field_validator("no_faktur")
    @classmethod
    def validate_no_faktur(
        cls,
        value: str | None,
    ) -> str | None:

        # Kosong = backend generate otomatis
        if value is None:
            return None

        value = value.strip()

        # String kosong juga dianggap tidak diisi
        if not value:
            return None

        if len(value) > 30:
            raise ValueError(
                "No faktur maksimal 30 karakter."
            )

        return value


# ==========================================================
# DETAIL PEMBELIAN RESPONSE
# ==========================================================

class DetailPembelianResponse(BaseModel):

    id: int

    pembelian_id: int

    barang_id: int

    qty: Decimal

    harga_beli: Decimal

    subtotal: Decimal

    model_config = ConfigDict(
        from_attributes=True,
    )


# ==========================================================
# PEMBELIAN RESPONSE
# ==========================================================

class PembelianResponse(BaseModel):

    id: int

    no_faktur: str

    tanggal: datetime

    supplier_id: int

    user_id: int

    total: Decimal

    diskon: Decimal

    grand_total: Decimal

    keterangan: str | None = None

    created_at: datetime | None = None

    detail: list[
        DetailPembelianResponse
    ] = Field(
        default_factory=list,
    )

    model_config = ConfigDict(
        from_attributes=True,
    )


# ==========================================================
# LIST RESPONSE
# ==========================================================

class PembelianListResponse(BaseModel):

    data: list[PembelianResponse]

    total: int

    model_config = ConfigDict(
        from_attributes=True,
    )