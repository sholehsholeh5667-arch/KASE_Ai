from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


# ==========================================================
# KONDISI BARANG RETUR
# ==========================================================

KONDISI_RETUR_VALID = {
    "BAIK",
    "RUSAK",
}


# ==========================================================
# JENIS REFUND RETUR
# ==========================================================

JENIS_REFUND_VALID = {
    "CASH",
}


# ==========================================================
# DETAIL RETUR PEMBELIAN
# ==========================================================

class ReturPembelianDetailBase(BaseModel):
    barang_id: int

    qty: int = Field(
        gt=0
    )

    harga: Decimal = Field(
        gt=0
    )

    kondisi: str = Field(
        ...,
        min_length=1,
    )

    # ======================================================
    # VALIDASI KONDISI
    # ======================================================

    @field_validator("kondisi")
    @classmethod
    def validate_kondisi(
        cls,
        value: str,
    ) -> str:

        value = value.strip().upper()

        if value not in KONDISI_RETUR_VALID:
            raise ValueError(
                "Kondisi retur harus "
                "'BAIK' atau 'RUSAK'."
            )

        return value


# ==========================================================
# DETAIL CREATE
# ==========================================================

class ReturPembelianDetailCreate(
    ReturPembelianDetailBase
):
    pass


# ==========================================================
# DETAIL RESPONSE
# ==========================================================

class ReturPembelianDetailResponse(BaseModel):
    id: int
    barang_id: int
    qty: int
    harga: Decimal
    subtotal: Decimal
    kondisi: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# HEADER RETUR PEMBELIAN
# ==========================================================

class ReturPembelianBase(BaseModel):
    pembelian_id: int
    supplier_id: int

    alasan: Optional[str] = None

    jenis_refund: str = "CASH"

    # ======================================================
    # VALIDASI JENIS REFUND
    # ======================================================

    @field_validator("jenis_refund")
    @classmethod
    def validate_jenis_refund(
        cls,
        value: str,
    ) -> str:

        value = value.strip().upper()

        if value not in JENIS_REFUND_VALID:
            raise ValueError(
                "Jenis refund harus 'CASH'."
            )

        return value


# ==========================================================
# CREATE
# ==========================================================

class ReturPembelianCreate(
    ReturPembelianBase
):
    detail: List[
        ReturPembelianDetailCreate
    ]


# ==========================================================
# UPDATE
# ==========================================================

class ReturPembelianUpdate(BaseModel):
    alasan: Optional[str] = None
    jenis_refund: Optional[str] = None
    status: Optional[str] = None

    # ======================================================
    # VALIDASI JENIS REFUND UPDATE
    # ======================================================

    @field_validator("jenis_refund")
    @classmethod
    def validate_jenis_refund(
        cls,
        value: Optional[str],
    ) -> Optional[str]:

        if value is None:
            return None

        value = value.strip().upper()

        if value not in JENIS_REFUND_VALID:
            raise ValueError(
                "Jenis refund harus 'CASH'."
            )

        return value


# ==========================================================
# RESPONSE
# ==========================================================

class ReturPembelianResponse(BaseModel):
    id: int
    pembelian_id: int
    supplier_id: int
    created_by: int

    alasan: Optional[str]

    jenis_refund: str

    status: str

    total: Decimal

    created_at: datetime
    updated_at: datetime

    detail: List[
        ReturPembelianDetailResponse
    ] = []

    model_config = ConfigDict(
        from_attributes=True
    )