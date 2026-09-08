from datetime import datetime
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


# ==========================================================
# BASE MATERI MUAMALAH
# ==========================================================

class MuamalahMateriBase(BaseModel):

    kategori: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    # ------------------------------------------------------
    # TETAP DIPERTAHANKAN
    # `judul` adalah judul materi pada database MySQL lama.
    # Jangan diubah menjadi al_kitab agar CRUD tidak rusak.
    # ------------------------------------------------------

    judul: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    pertanyaan: Optional[str] = None

    # ======================================================
    # TEKS ARAB / IBARAT
    # ======================================================

    teks_arab: Optional[str] = None

    # ======================================================
    # TERJEMAH
    # ======================================================

    terjemah: Optional[str] = None

    # ======================================================
    # PENJELASAN / SYARAH
    # ======================================================

    penjelasan: Optional[str] = None

    # ======================================================
    # CATATAN KAKI
    # TIDAK DIPOTONG
    # ======================================================

    catatan_kaki: Optional[str] = None

    # ======================================================
    # ISI MATERI
    # ======================================================

    isi_materi: str = Field(
        ...,
        min_length=1,
    )

    # ======================================================
    # REFERENSI INTERNAL
    # TIDAK WAJIB DITAMPILKAN KE USER
    # ======================================================

    referensi_kitab: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    juz: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    halaman: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    sumber: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    aktif: bool = True

    # ======================================================
    # VALIDASI KATEGORI
    # ======================================================

    @field_validator("kategori")
    @classmethod
    def validate_kategori(
        cls,
        value: str,
    ) -> str:

        value = value.strip()

        if not value:
            raise ValueError(
                "Kategori tidak boleh kosong."
            )

        return value

    # ======================================================
    # VALIDASI JUDUL
    # ======================================================

    @field_validator("judul")
    @classmethod
    def validate_judul(
        cls,
        value: str,
    ) -> str:

        value = value.strip()

        if not value:
            raise ValueError(
                "Judul materi tidak boleh kosong."
            )

        return value

    # ======================================================
    # VALIDASI ISI MATERI
    # ======================================================

    @field_validator("isi_materi")
    @classmethod
    def validate_isi_materi(
        cls,
        value: str,
    ) -> str:

        value = value.strip()

        if not value:
            raise ValueError(
                "Isi materi tidak boleh kosong."
            )

        return value


# ==========================================================
# CREATE
# ==========================================================

class MuamalahMateriCreate(
    MuamalahMateriBase
):
    pass


# ==========================================================
# UPDATE
# ==========================================================

class MuamalahMateriUpdate(BaseModel):

    kategori: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    judul: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    pertanyaan: Optional[str] = None

    # ======================================================
    # TEKS ARAB / IBARAT
    # ======================================================

    teks_arab: Optional[str] = None

    # ======================================================
    # TERJEMAH
    # ======================================================

    terjemah: Optional[str] = None

    # ======================================================
    # PENJELASAN / SYARAH
    # ======================================================

    penjelasan: Optional[str] = None

    # ======================================================
    # CATATAN KAKI
    # ======================================================

    catatan_kaki: Optional[str] = None

    # ======================================================
    # ISI MATERI
    # ======================================================

    isi_materi: Optional[str] = Field(
        default=None,
        min_length=1,
    )

    # ======================================================
    # REFERENSI INTERNAL
    # ======================================================

    referensi_kitab: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    juz: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    halaman: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    sumber: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    aktif: Optional[bool] = None

    # ======================================================
    # VALIDASI KATEGORI
    # ======================================================

    @field_validator("kategori")
    @classmethod
    def validate_kategori(
        cls,
        value: Optional[str],
    ) -> Optional[str]:

        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError(
                "Kategori tidak boleh kosong."
            )

        return value

    # ======================================================
    # VALIDASI JUDUL
    # ======================================================

    @field_validator("judul")
    @classmethod
    def validate_judul(
        cls,
        value: Optional[str],
    ) -> Optional[str]:

        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError(
                "Judul materi tidak boleh kosong."
            )

        return value

    # ======================================================
    # VALIDASI ISI MATERI
    # ======================================================

    @field_validator("isi_materi")
    @classmethod
    def validate_isi_materi(
        cls,
        value: Optional[str],
    ) -> Optional[str]:

        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError(
                "Isi materi tidak boleh kosong."
            )

        return value


# ==========================================================
# RESPONSE CRUD MATERI
# ==========================================================

class MuamalahMateriResponse(
    MuamalahMateriBase
):

    id: int

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# PENCARIAN MATERI
# ==========================================================

class MuamalahMateriSearch(BaseModel):

    query: str = Field(
        ...,
        min_length=1,
    )

    kategori: Optional[str] = None

    limit: int = Field(
        default=10,
        ge=1,
        le=50,
    )

    # ======================================================
    # VALIDASI QUERY
    # ======================================================

    @field_validator("query")
    @classmethod
    def validate_query(
        cls,
        value: str,
    ) -> str:

        value = value.strip()

        if not value:
            raise ValueError(
                "Pertanyaan pencarian tidak boleh kosong."
            )

        return value


# ==========================================================
# HASIL AI MUAMALAH - SEARCH
#
# Dipakai oleh:
# GET /api/v1/muamalah/ai/search/
#
# Tidak menggunakan `judul`, karena untuk hasil kitab
# kita sudah memisahkan:
#
#   al_kitab = nama kitab
#   bab      = bab/topik
#
# ==========================================================

class MuamalahAISearchResult(BaseModel):

    id: Optional[int] = None

    # ======================================================
    # SUMBER KITAB
    # ======================================================

    al_kitab: Optional[str] = None

    # ======================================================
    # BAB / TOPIK PEMBAHASAN
    # ======================================================

    bab: Optional[str] = None

    # ======================================================
    # KATEGORI KITAB
    # ======================================================

    kategori: Optional[str] = None

    # ======================================================
    # PERTANYAAN
    # ======================================================

    pertanyaan: Optional[str] = None

    # ======================================================
    # TEKS ARAB / IBARAT
    # ======================================================

    teks_arab: Optional[str] = None

    # ======================================================
    # TERJEMAH
    # ======================================================

    terjemah: Optional[str] = None

    # ======================================================
    # PENJELASAN / SYARAH
    # ======================================================

    penjelasan: Optional[str] = None

    # ======================================================
    # CATATAN KAKI
    # ======================================================

    catatan_kaki: Optional[str] = None

    # ======================================================
    # ISI MATERI
    # ======================================================

    isi_materi: str = Field(
        ...,
        min_length=1,
    )

    # ======================================================
    # REFERENSI
    # ======================================================

    referensi_kitab: Optional[str] = None

    juz: Optional[str] = None

    halaman: Optional[str] = None

    sumber: Optional[str] = None

    # ======================================================
    # STATUS
    # ======================================================

    aktif: bool = True

    # ======================================================
    # TIMESTAMP
    # ======================================================

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# HASIL AI MUAMALAH
#
# Dipakai untuk jawaban AI final.
#
# ==========================================================

class MuamalahAIResponse(BaseModel):

    # ======================================================
    # PERTANYAAN & JAWABAN
    # ======================================================

    pertanyaan: str

    jawaban: str

    materi_id: Optional[int] = None

    # ======================================================
    # SUMBER KITAB
    # ======================================================

    al_kitab: Optional[str] = None

    # ======================================================
    # BAB / TOPIK
    # ======================================================

    bab: Optional[str] = None

    # ======================================================
    # KATEGORI
    # ======================================================

    kategori: Optional[str] = None

    # ======================================================
    # MATERI REFERENSI
    # ======================================================

    teks_arab: Optional[str] = None

    terjemah: Optional[str] = None

    penjelasan: Optional[str] = None

    catatan_kaki: Optional[str] = None

    # ======================================================
    # REFERENSI INTERNAL
    # ======================================================

    referensi_kitab: Optional[str] = None

    juz: Optional[str] = None

    halaman: Optional[str] = None

    sumber: Optional[str] = None

    # ======================================================
    # STATUS HASIL
    # ======================================================

    ditemukan: bool = False