from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func

from app.core.database import Base


class MuamalahMateri(Base):
    __tablename__ = "muamalah_materi"

    # ==========================================================
    # PRIMARY KEY
    # ==========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    # ==========================================================
    # KATEGORI
    # ==========================================================

    kategori = Column(
        String(100),
        nullable=False,
        index=True,
    )

    # ==========================================================
    # JUDUL MATERI
    # ==========================================================

    judul = Column(
        String(255),
        nullable=False,
        index=True,
    )

    # ==========================================================
    # PERTANYAAN
    # ==========================================================

    pertanyaan = Column(
        Text,
        nullable=True,
    )

    # ==========================================================
    # TEKS ARAB / IBARAT
    # ==========================================================

    teks_arab = Column(
        Text,
        nullable=True,
    )

    # ==========================================================
    # TERJEMAH
    # ==========================================================

    terjemah = Column(
        Text,
        nullable=True,
    )

    # ==========================================================
    # PENJELASAN / SYARAH
    # ==========================================================

    penjelasan = Column(
        Text,
        nullable=True,
    )

    # ==========================================================
    # CATATAN KAKI
    # DISIMPAN UTUH
    # ==========================================================

    catatan_kaki = Column(
        Text,
        nullable=True,
    )

    # ==========================================================
    # ISI MATERI
    # ==========================================================

    isi_materi = Column(
        Text,
        nullable=False,
    )

    # ==========================================================
    # REFERENSI KITAB
    # INTERNAL
    # TIDAK DITAMPILKAN KEPADA USER
    # ==========================================================

    referensi_kitab = Column(
        String(255),
        nullable=True,
    )

    # ==========================================================
    # JUZ
    # INTERNAL
    # ==========================================================

    juz = Column(
        String(50),
        nullable=True,
    )

    # ==========================================================
    # HALAMAN
    # INTERNAL
    # ==========================================================

    halaman = Column(
        String(50),
        nullable=True,
    )

    # ==========================================================
    # SUMBER
    # INTERNAL
    # ==========================================================

    sumber = Column(
        String(255),
        nullable=True,
    )

    # ==========================================================
    # STATUS AKTIF
    # ==========================================================

    aktif = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default="1",
        index=True,
    )

    # ==========================================================
    # TIMESTAMP
    # ==========================================================

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )