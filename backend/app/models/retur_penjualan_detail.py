from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DECIMAL,
    String,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class ReturPenjualanDetail(Base):
    __tablename__ = "retur_penjualan_detail"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    retur_id = Column(
        Integer,
        ForeignKey(
            "retur_penjualan.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    barang_id = Column(
        Integer,
        ForeignKey(
            "barang.id",
        ),
        nullable=False,
    )

    qty = Column(
        Integer,
        nullable=False,
        default=1,
    )

    harga = Column(
        DECIMAL(15, 2),
        nullable=False,
        default=0,
    )

    subtotal = Column(
        DECIMAL(15, 2),
        nullable=False,
        default=0,
    )

    kondisi = Column(
        String(100),
        nullable=True,
    )

    # ==========================================================
    # RELATIONSHIP
    # ==========================================================

    retur = relationship(
        "ReturPenjualan",
        back_populates="detail",
    )

    barang = relationship(
        "Barang",
        back_populates="retur_penjualan_detail",
    )