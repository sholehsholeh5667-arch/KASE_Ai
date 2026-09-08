from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ==========================================================
# SETTINGS BASE
# ==========================================================

class SettingsBase(BaseModel):

    store_name: Optional[str] = Field(
        default=None,
        max_length=200,
    )

    owner_name: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    address: Optional[str] = None

    phone: Optional[str] = Field(
        default=None,
        max_length=30,
    )

    email: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    logo: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    currency: Optional[str] = Field(
        default="IDR",
        max_length=10,
    )

    tax: Optional[Decimal] = Field(
        default=Decimal("0.00"),
        ge=0,
        le=100,
    )

    thermal_printer: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    receipt_width: Optional[int] = Field(
        default=80,
        ge=1,
    )

    backup_auto: Optional[bool] = False

    language: Optional[str] = Field(
        default="id",
        max_length=20,
    )


# ==========================================================
# SETTINGS UPDATE
# ==========================================================

class SettingsUpdate(SettingsBase):
    pass


# ==========================================================
# SETTINGS RESPONSE
# ==========================================================

class SettingsResponse(SettingsBase):

    id: int

    model_config = ConfigDict(
        from_attributes=True
    )