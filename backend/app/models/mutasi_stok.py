from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Numeric,
    Text,
    Enum,
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class MutasiStok(Base):

    __tablename__ = "mutasi_stok"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    tanggal = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    barang_id = Column(
        Integer,
        ForeignKey("barang.id"),
        nullable=False,
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    jenis = Column(
        Enum(
            "PEMBELIAN",
            "PENJUALAN",
            "RETUR_PEMBELIAN",
            "RETUR_PENJUALAN",
            "STOCK_OPNAME",
            "PENYESUAIAN",
            "TRANSFER_GUDANG",
            "PRODUKSI",
            "HILANG",
            "RUSAK",
        ),
        nullable=True,
    )

    qty = Column(
        Numeric(15, 2),
        nullable=False,
    )

    stok_awal = Column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    stok_akhir = Column(
        Numeric(15, 2),
        nullable=False,
        default=0,
    )

    referensi = Column(
        String(50),
        nullable=True,
    )

    keterangan = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
    )

    barang = relationship(
        "Barang"
    )

    user = relationship(
        "User",
        back_populates="mutasi_stok",
    )