from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nama = Column(
        String(100),
        nullable=False
    )

    username = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(20),
        nullable=False,
        default="kasir"
    )

    aktif = Column(
        Boolean,
        nullable=False,
        default=True
    )

    # =====================================
    # RESET PASSWORD
    # =====================================

    email = Column(
        String(255),
        unique=True,
        nullable=True,
        index=True
    )

    reset_token_hash = Column(
        String(255),
        unique=True,
        nullable=True,
        index=True
    )

    reset_token_expires = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # =====================================
    # RELATIONSHIP
    # =====================================

    pembelian = relationship(
        "Pembelian",
        back_populates="user"
    )

    mutasi_stok = relationship(
        "MutasiStok",
        back_populates="user"
    )

    # Stock Opname
    stock_opname_created = relationship(
        "StockOpname",
        foreign_keys="StockOpname.created_by",
        back_populates="creator"
    )

    stock_opname_approved = relationship(
        "StockOpname",
        foreign_keys="StockOpname.approved_by",
        back_populates="approver"
    )

    retur_penjualan = relationship(
        "ReturPenjualan",
        back_populates="user"
    )

    retur_pembelian = relationship(
        "ReturPembelian",
        back_populates="user"
    )