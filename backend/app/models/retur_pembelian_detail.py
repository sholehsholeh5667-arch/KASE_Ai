from sqlalchemy import (
    Column,
    Integer,
    DECIMAL,
    String,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class ReturPembelianDetail(Base):
    __tablename__ = "retur_pembelian_detail"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    retur_id = Column(
        Integer,
        ForeignKey("retur_pembelian.id", ondelete="CASCADE"),
        nullable=False
    )

    barang_id = Column(
        Integer,
        ForeignKey("barang.id"),
        nullable=False
    )

    qty = Column(
        Integer,
        nullable=False
    )

    harga = Column(
        DECIMAL(15, 2),
        nullable=False
    )

    subtotal = Column(
        DECIMAL(15, 2),
        nullable=False
    )

    kondisi = Column(
        String(100)
    )

    # ==========================
    # RELATIONSHIP
    # ==========================

    retur = relationship(
        "ReturPembelian",
        back_populates="detail"
    )

    barang = relationship(
        "Barang",
        back_populates="retur_pembelian_detail"
    )