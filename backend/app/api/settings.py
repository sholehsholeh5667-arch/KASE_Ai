from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.api.dependencies import (
    require_role,
)

from app.schemas.settings import (
    SettingsResponse,
    SettingsUpdate,
)

from app.services.settings import (
    SettingsService,
)


# ==========================================================
# ROUTER SETTINGS TOKO
# ==========================================================

router = APIRouter(
    prefix="/settings",
    tags=["Settings Toko"],
)


# ==========================================================
# GET SETTINGS TOKO
# OWNER + ADMIN
# ==========================================================

@router.get(
    "",
    response_model=SettingsResponse,
)
def get_settings(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "owner",
            "admin",
        )
    ),
):
    """
    Mengambil pengaturan toko.

    Akses:
    - Owner
    - Admin
    """

    return SettingsService.get_settings(
        db
    )


# ==========================================================
# UPDATE SETTINGS TOKO
# OWNER + ADMIN
# ==========================================================

@router.put(
    "",
    response_model=SettingsResponse,
)
def update_settings(
    data: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "owner",
            "admin",
        )
    ),
):
    """
    Mengubah pengaturan toko.

    Akses:
    - Owner
    - Admin
    """

    return SettingsService.update_settings(
        db,
        data,
    )