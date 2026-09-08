from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    Numeric,
    String,
    Text,
)

from app.core.database import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(
        Integer,
        primary_key=True,
        nullable=False,
    )

    store_name = Column(
        String(200),
        nullable=True,
    )

    owner_name = Column(
        String(150),
        nullable=True,
    )

    address = Column(
        Text,
        nullable=True,
    )

    phone = Column(
        String(30),
        nullable=True,
    )

    email = Column(
        String(100),
        nullable=True,
    )

    logo = Column(
        String(255),
        nullable=True,
    )

    currency = Column(
        String(10),
        nullable=True,
    )

    tax = Column(
        Numeric(5, 2),
        nullable=True,
    )

    thermal_printer = Column(
        String(100),
        nullable=True,
    )

    receipt_width = Column(
        Integer,
        nullable=True,
    )

    backup_auto = Column(
        Boolean,
        nullable=True,
    )

    language = Column(
        String(20),
        nullable=True,
    )