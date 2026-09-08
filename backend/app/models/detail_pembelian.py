from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DECIMAL
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class DetailPembelian(Base):
    __tablename__ = "detail_pembelian"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    pembelian_id = Column(
        Integer,
        ForeignKey(
            "pembelian.id",
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

    harga_beli = Column(
        DECIMAL(15,2),
        nullable=False
    )

    subtotal = Column(
        DECIMAL(15,2),
        nullable=False
    )

    pembelian = relationship(
        "Pembelian",
        back_populates="detail"
    )

    barang = relationship(
        "Barang",
        back_populates="detail_pembelian"
    )