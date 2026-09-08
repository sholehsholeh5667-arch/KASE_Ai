from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DECIMAL,
    Text,
    DateTime
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class StockOpnameDetail(Base):
    __tablename__ = "stock_opname_detail"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    stock_opname_id = Column(
        Integer,
        ForeignKey(
            "stock_opname.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    barang_id = Column(
        Integer,
        ForeignKey("barang.id"),
        nullable=False
    )

    stok_sistem = Column(
        DECIMAL(15, 2),
        nullable=False,
        default=0
    )

    stok_fisik = Column(
        DECIMAL(15, 2),
        nullable=False,
        default=0
    )

    selisih = Column(
        DECIMAL(15, 2),
        nullable=False,
        default=0
    )

    keterangan = Column(Text)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    # ==========================
    # Relationship
    # ==========================

    stock_opname = relationship(
        "StockOpname",
        back_populates="detail"
    )

    barang = relationship(
        "Barang",
        back_populates="stock_opname_detail"
    )