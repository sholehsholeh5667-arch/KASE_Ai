from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Toko(Base):
    __tablename__ = "toko"

    # ======================================================
    # ID
    # ======================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ======================================================
    # NAMA
    # ======================================================

    nama = Column(
        String(150),
        nullable=False,
    )

    # ======================================================
    # KODE
    # ======================================================

    kode = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    # ======================================================
    # TOKO INDUK
    # ======================================================
    #
    # NULL     = toko induk
    # angka ID = cabang dari toko tersebut
    #

    parent_id = Column(
        Integer,
        ForeignKey(
            "toko.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    # ======================================================
    # DESKRIPSI
    # ======================================================

    deskripsi = Column(
        Text,
        nullable=True,
    )

    # ======================================================
    # AKTIF
    # ======================================================

    aktif = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    # ======================================================
    # TIMESTAMP
    # ======================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ======================================================
    # ANGGOTA TOKO
    # ======================================================

    anggota = relationship(
        "TokoUser",
        back_populates="toko",
        cascade="all, delete-orphan",
    )

    # ======================================================
    # RELASI TOKO INDUK
    # ======================================================

    parent = relationship(
        "Toko",
        remote_side=[id],
        back_populates="cabang",
    )

    # ======================================================
    # RELASI TOKO CABANG
    # ======================================================

    cabang = relationship(
        "Toko",
        back_populates="parent",
        cascade="save-update",
    )