from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    DECIMAL,
    Text,
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Pembelian(Base):
    __tablename__ = "pembelian"

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
        nullable=True,
    )

    supplier_id = Column(
        Integer,
        ForeignKey("supplier.id"),
        nullable=False,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    # ==================================================
    # NILAI TRANSAKSI
    # ==================================================

    total = Column(
        DECIMAL(15, 2),
        nullable=True,
        default=0,
    )

    diskon = Column(
        DECIMAL(15, 2),
        nullable=False,
        default=0,
    )

    grand_total = Column(
        DECIMAL(15, 2),
        nullable=False,
        default=0,
    )

    keterangan = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=True,
    )

    # ==================================================
    # RELATIONSHIP
    # ==================================================

    supplier = relationship(
        "Supplier",
        back_populates="pembelian",
    )

    user = relationship(
        "User",
        back_populates="pembelian",
    )

    detail = relationship(
        "DetailPembelian",
        back_populates="pembelian",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    retur_pembelian = relationship(
        "ReturPembelian",
        back_populates="pembelian",
    )

    def __repr__(self):
        return (
            f"<Pembelian("
            f"id={self.id}, "
            f"no_faktur='{self.no_faktur}', "
            f"total={self.total}, "
            f"diskon={self.diskon}, "
            f"grand_total={self.grand_total}"
            f")>"
        )