from sqlalchemy import (
    Column,
    Integer,
    String,
    DECIMAL,
    DateTime,
    ForeignKey,
    Text,
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Penjualan(Base):
    __tablename__ = "penjualan"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    no_faktur = Column(
        String(30),
        unique=True,
        nullable=False,
    )

    tanggal = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    pelanggan_id = Column(
        Integer,
        ForeignKey("pelanggan.id"),
        nullable=True,
    )

    # =====================================
    # NILAI TRANSAKSI
    # =====================================

    subtotal = Column(
        DECIMAL(15, 2),
        nullable=False,
        default=0,
    )

    diskon = Column(
        DECIMAL(15, 2),
        nullable=False,
        default=0,
    )

    pajak = Column(
        DECIMAL(15, 2),
        nullable=False,
        default=0,
    )

    grand_total = Column(
        DECIMAL(15, 2),
        nullable=False,
        default=0,
    )

    metode_bayar = Column(
        String(30),
        nullable=False,
        default="TUNAI",
    )

    dibayar = Column(
        DECIMAL(15, 2),
        nullable=False,
        default=0,
    )

    kembalian = Column(
        DECIMAL(15, 2),
        nullable=False,
        default=0,
    )

    status = Column(
        String(30),
        nullable=False,
        default="SELESAI",
    )

    keterangan = Column(
        Text,
        nullable=True,
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

    # =====================================
    # RELATIONSHIP
    # =====================================

    pelanggan = relationship(
        "Pelanggan",
        back_populates="penjualan",
    )

    detail = relationship(
        "DetailPenjualan",
        back_populates="penjualan",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    retur_penjualan = relationship(
        "ReturPenjualan",
        back_populates="penjualan",
    )

    def __repr__(self):
        return (
            f"<Penjualan("
            f"id={self.id}, "
            f"no_faktur='{self.no_faktur}', "
            f"grand_total={self.grand_total})>"
        )