from sqlalchemy import (
    Column,
    Integer,
    Text,
    Enum,
    DECIMAL,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ReturPembelian(Base):
    __tablename__ = "retur_pembelian"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    pembelian_id = Column(
        Integer,
        ForeignKey("pembelian.id"),
        nullable=False
    )

    supplier_id = Column(
        Integer,
        ForeignKey("supplier.id"),
        nullable=False
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    alasan = Column(Text)

    jenis_refund = Column(
        Enum(
            "CASH",
            "POTONG_TAGIHAN",
            "TUKAR_BARANG",
            name="jenis_refund_pembelian"
        ),
        default="CASH"
    )

    status = Column(
        Enum(
            "PENDING",
            "DISETUJUI",
            "DITOLAK",
            name="status_retur_pembelian"
        ),
        default="PENDING"
    )

    total = Column(
        DECIMAL(15, 2),
        default=0
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    # ==========================
    # RELATIONSHIP
    # ==========================

    pembelian = relationship(
        "Pembelian",
        back_populates="retur_pembelian"
    )

    supplier = relationship(
        "Supplier",
        back_populates="retur_pembelian"
    )

    user = relationship(
        "User",
        back_populates="retur_pembelian"
    )

    detail = relationship(
        "ReturPembelianDetail",
        back_populates="retur",
        cascade="all, delete-orphan"
    )