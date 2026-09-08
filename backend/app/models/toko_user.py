from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class TokoUser(Base):
    __tablename__ = "toko_users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    toko_id = Column(
        Integer,
        ForeignKey(
            "toko.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    status = Column(
        String(20),
        nullable=False,
        default="aktif"
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

    toko = relationship(
        "Toko",
        back_populates="anggota"
    )

    user = relationship(
        "User"
    )