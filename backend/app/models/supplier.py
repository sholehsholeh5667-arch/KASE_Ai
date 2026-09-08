from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    Text,
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Supplier(Base):
    __tablename__ = "supplier"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )
    kode_supplier = Column(
      String(20),
      unique=True,
      nullable=False,
      index=True,
    )

    nama = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True,
    )

    alamat = Column(
        Text,
        nullable=True,
    )

    telepon = Column(
        String(30),
        nullable=True,
    )

    email = Column(
        String(100),
        nullable=True,
    )

    kontak = Column(
        String(100),
        nullable=True,
    )

    aktif = Column(
        Boolean,
        default=True,
        nullable=False,
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

    # ==========================
    # RELATIONSHIP
    # ==========================

    barang = relationship(
        "Barang",
        back_populates="supplier"
    )

    pembelian = relationship(
        "Pembelian",
        back_populates="supplier"
    )

    retur_pembelian = relationship(
        "ReturPembelian",
        back_populates="supplier"
    )

    def __repr__(self):
        return f"<Supplier(id={self.id}, nama='{self.nama}')>"