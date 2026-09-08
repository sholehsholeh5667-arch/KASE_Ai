"""
Model Stock Opname
==================

Header Stock Opname
"""

from enum import Enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text,
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


# ==========================================================
# STATUS OPNAME
# ==========================================================

class StatusOpname(str, Enum):
    """
    Status Stock Opname
    """

    DRAFT = "DRAFT"
    PROSES = "PROSES"
    SELESAI = "SELESAI"
    DIBATALKAN = "DIBATALKAN"


# ==========================================================
# HEADER STOCK OPNAME
# ==========================================================

class StockOpname(Base):
    """
    Header Stock Opname
    """

    __tablename__ = "stock_opname"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nomor = Column(
        String(30),
        unique=True,
        nullable=False
    )

    tanggal = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    status = Column(
        String(20),
        nullable=False,
        default=StatusOpname.DRAFT.value
    )

    keterangan = Column(
        Text,
        nullable=True
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    approved_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    approved_at = Column(
        DateTime,
        nullable=True
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

    # ======================================================
    # RELATIONSHIP
    # ======================================================

    detail = relationship(
        "StockOpnameDetail",
        back_populates="stock_opname",
        cascade="all, delete-orphan"
    )

    creator = relationship(
        "User",
        foreign_keys=[created_by]
    )

    approver = relationship(
        "User",
        foreign_keys=[approved_by]
    )

    def __repr__(self):

        return (
            f"<StockOpname("
            f"id={self.id}, "
            f"nomor='{self.nomor}', "
            f"status='{self.status}'"
            f")>"
        )