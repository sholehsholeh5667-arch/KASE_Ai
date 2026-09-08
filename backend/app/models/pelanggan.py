from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Pelanggan(Base):
    __tablename__ = "pelanggan"

    id = Column(Integer, primary_key=True, index=True)

    nama = Column(String(150), nullable=False)

    alamat = Column(Text)

    telepon = Column(String(20))

    email = Column(String(100))

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    # ======================================
    # RELATIONSHIP
    # ======================================

    penjualan = relationship(
        "Penjualan",
        back_populates="pelanggan"
    )

    retur_penjualan = relationship(
        "ReturPenjualan",
        back_populates="pelanggan"
    )