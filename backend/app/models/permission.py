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


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    kode = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    nama = Column(
        String(150),
        nullable=False
    )

    modul = Column(
        String(50),
        nullable=False,
        index=True
    )

    aksi = Column(
        String(50),
        nullable=False
    )

    deskripsi = Column(
        Text,
        nullable=True
    )

    aktif = Column(
        Boolean,
        nullable=False,
        default=True
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

    roles = relationship(
        "RolePermission",
        back_populates="permission",
        cascade="all, delete-orphan"
    )