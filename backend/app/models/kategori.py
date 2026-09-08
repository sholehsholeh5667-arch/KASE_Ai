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


class Kategori(Base):
    __tablename__ = "kategori"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nama = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    deskripsi = Column(
        Text,
        nullable=True
    )

    aktif = Column(
        Boolean,
        default=True,
        nullable=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    barang = relationship(
        "Barang",
        back_populates="kategori",
        lazy="select"
    )

    def __repr__(self):
        return f"<Kategori(id={self.id}, nama='{self.nama}')>"