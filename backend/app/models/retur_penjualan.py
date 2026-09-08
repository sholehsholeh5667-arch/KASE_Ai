from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Text,
    Enum,
    DECIMAL,
    DateTime,
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ReturPenjualan(Base):
    __tablename__ = "retur_penjualan"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    no_retur = Column(
        String(30),
        unique=True,
        nullable=True,
    )

    penjualan_id = Column(
        Integer,
        ForeignKey("penjualan.id"),
        nullable=False,
    )

    pelanggan_id = Column(
        Integer,
        ForeignKey("pelanggan.id"),
        nullable=True,
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    alasan = Column(
        Text,
        nullable=True,
    )

    jenis_refund = Column(
        Enum(
            "CASH",
            "TRANSFER",
            "STORE_CREDIT",
            "TUKAR_BARANG",
            name="jenis_refund_penjualan_enum",
        ),
        default="CASH",
        nullable=False,
    )

    status = Column(
        Enum(
            "DRAFT",
            "SELESAI",
            "BATAL",
            name="status_retur_penjualan_enum",
        ),
        default="DRAFT",
        nullable=False,
    )

    total = Column(
        DECIMAL(15, 2),
        default=0,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ==========================================================
    # RELATIONSHIP
    # ==========================================================

    penjualan = relationship(
        "Penjualan",
        back_populates="retur_penjualan",
    )

    pelanggan = relationship(
        "Pelanggan",
        back_populates="retur_penjualan",
    )

    user = relationship(
        "User",
        back_populates="retur_penjualan",
    )

    detail = relationship(
        "ReturPenjualanDetail",
        back_populates="retur",
        cascade="all, delete-orphan",
    )