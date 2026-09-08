from sqlalchemy import (
    Column,
    Integer,
    String,
    DECIMAL,
    Boolean,
    ForeignKey,
    DateTime
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Barang(Base):
    __tablename__ = "barang"

    id = Column(Integer, primary_key=True, index=True)

    kode_barang = Column(
        String(30),
        unique=True,
        nullable=False
    )

    nama_barang = Column(
        String(200),
        nullable=False
    )

    alias_barang = Column(
        String(200)
    )

    kategori_id = Column(
        Integer,
        ForeignKey("kategori.id")
    )

    supplier_default = Column(
        Integer,
        ForeignKey("supplier.id")
    )

    satuan = Column(
        String(20)
    )

    harga_beli = Column(
        DECIMAL(15,2),
        default=0
    )

    harga_jual = Column(
        DECIMAL(15,2),
        default=0
    )

    stok = Column(
        DECIMAL(15,2),
        default=0
    )

    stok_minimum = Column(
        DECIMAL(15,2),
        default=5
    )

    lokasi_rak = Column(
        String(100)
    )

    foto = Column(
        String(255)
    )

    aktif = Column(
        Boolean,
        default=True
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

    kategori = relationship(
        "Kategori",
        back_populates="barang"
    )

    supplier = relationship(
        "Supplier",
        back_populates="barang"
    )

    detail_pembelian = relationship(
        "DetailPembelian",
        back_populates="barang"
    )

    detail_penjualan = relationship(
        "DetailPenjualan",
        back_populates="barang"
    )

    mutasi_stok = relationship(
        "MutasiStok",
        back_populates="barang"
    )

    stock_opname_detail = relationship(
        "StockOpnameDetail",
        back_populates="barang"
    )
    retur_penjualan_detail = relationship(
      "ReturPenjualanDetail",
      back_populates="barang"
    )
    retur_pembelian_detail = relationship(
      "ReturPembelianDetail",
     back_populates="barang"
    )