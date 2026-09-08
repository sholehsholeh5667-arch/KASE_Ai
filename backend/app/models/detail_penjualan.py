from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DECIMAL
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class DetailPenjualan(Base):
    __tablename__ = "detail_penjualan"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    penjualan_id = Column(
        Integer,
        ForeignKey(
            "penjualan.id",
            ondelete="CASCADE"
        ),
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

    harga_jual = Column(
        DECIMAL(15, 2),
        nullable=False
    )

    subtotal = Column(
        DECIMAL(15, 2),
        nullable=False
    )

    penjualan = relationship(
        "Penjualan",
        back_populates="detail"
    )

    barang = relationship(
        "Barang",
        back_populates="detail_penjualan"
    )