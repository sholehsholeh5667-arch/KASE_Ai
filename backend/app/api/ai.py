"""
AI HTTP API
===========

Pintu HTTP resmi untuk AI KasirAI.

Alur:

HTTP Request
    ↓
AI API
    ↓
RBAC / Permission Check
    ↓
AIManager
    ↓
AIRouter
    ↓
AI Handler
    ├── Chat
    ├── Muamalah
    ├── Kitab
    ├── Zakat
    ├── Vision
    ├── Voice
    └── Automation
"""

from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.api.dependencies import (
    get_current_user,
)

from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission

from app.ai.manager import AIManager


# ==========================================================
# ROUTER
# ==========================================================

router = APIRouter(
    tags=["AI"],
)


# ==========================================================
# AI MANAGER
# ==========================================================

ai_manager = AIManager()


# ==========================================================
# REQUEST
# ==========================================================

class AIProcessRequest(BaseModel):
    """
    Request umum untuk seluruh modul AI.
    """

    model_config = ConfigDict(
        extra="allow",
    )

    module: str | None = Field(
        default=None,
        description=(
            "Modul AI. Contoh: "
            "chat, muamalah, kitab, zakat."
        ),
    )

    action: str | None = Field(
        default=None,
        description=(
            "Action khusus modul."
        ),
    )

    message: str = Field(
        ...,
        min_length=1,
        description="Pesan atau pertanyaan pengguna.",
    )

    kitab: str | None = None

    bab: str | None = None

    limit: int | None = Field(
        default=5,
        ge=1,
        le=50,
    )


# ==========================================================
# RESPONSE
# ==========================================================

class AIProcessResponse(BaseModel):
    """
    Response standar HTTP AI.
    """

    status: str

    success: bool

    provider: str | None = None

    module: str | None = None

    message: str | None = None

    data: Any = None


# ==========================================================
# NORMALISASI MODULE
# ==========================================================

def normalize_module(
    module: str | None,
) -> str:

    return str(
        module or ""
    ).strip().lower()


# ==========================================================
# NORMALISASI ACTION
# ==========================================================

def normalize_action(
    action: str | None,
) -> str:

    return str(
        action or ""
    ).strip().lower()


# ==========================================================
# TENTUKAN PERMISSION AI
# ==========================================================

def resolve_ai_permission(
    module: str | None,
    action: str | None,
) -> str | None:
    """
    Menentukan permission database yang diperlukan
    berdasarkan module + action.

    Return:
        kode permission
        atau None jika belum memiliki mapping.
    """

    module_value = normalize_module(
        module
    )

    action_value = normalize_action(
        action
    )

    # ------------------------------------------------------
    # MUAMALAH
    # ------------------------------------------------------

    if module_value == "muamalah":

        return "muamalah.view"

    # ------------------------------------------------------
    # KITAB
    # ------------------------------------------------------

    if module_value in {
        "kitab",
        "kitab_kuning",
        "kitab-kuning",
    }:

        # Cari ibarat
        if action_value in {
            "cari_ibarat",
            "cari-ibarat",
            "search",
            "cari",
        }:
            return "kitab.search"

        # Terjemah
        if action_value in {
            "terjemah",
            "terjemahkan",
            "translate",
            "translation",
        }:
            return "kitab.translate"

        # Jelaskan
        if action_value in {
            "explain",
            "jelaskan",
            "penjelasan",
        }:
            return "kitab.explain"

        # Baca / penggunaan umum
        return "kitab.view"

    # ------------------------------------------------------
    # ZAKAT
    # ------------------------------------------------------

    if module_value == "zakat":

        return "zakat.view"

    # ------------------------------------------------------
    # MODUL LAIN BELUM MEMILIKI PERMISSION DATABASE
    # ------------------------------------------------------

    return None


# ==========================================================
# CEK PERMISSION USER
# ==========================================================

def check_user_permission(
    db: Session,
    current_user: User,
    permission_code: str,
):
    """
    Memeriksa:

    User
      ↓
    Role
      ↓
    RolePermission
      ↓
    Permission
    """

    # ------------------------------------------------------
    # ROLE
    # ------------------------------------------------------

    role_code = str(
        current_user.role
    ).strip().lower()

    role = (
        db.query(Role)
        .filter(
            Role.kode == role_code,
            Role.aktif.is_(True),
        )
        .first()
    )

    if role is None:

        raise HTTPException(
            status_code=403,
            detail="Role user tidak valid.",
        )

    # ------------------------------------------------------
    # PERMISSION
    # ------------------------------------------------------

    permission = (
        db.query(Permission)
        .filter(
            Permission.kode
            == permission_code,
            Permission.aktif.is_(True),
        )
        .first()
    )

    if permission is None:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Permission '{permission_code}' "
                "tidak ditemukan."
            ),
        )

    # ------------------------------------------------------
    # ROLE -> PERMISSION
    # ------------------------------------------------------

    role_permission = (
        db.query(RolePermission)
        .filter(
            RolePermission.role_id
            == role.id,

            RolePermission.permission_id
            == permission.id,

            RolePermission.aktif.is_(True),
        )
        .first()
    )

    if role_permission is None:

        raise HTTPException(
            status_code=403,
            detail=(
                "Akses AI ditolak. "
                f"Permission '{permission_code}' "
                "tidak dimiliki oleh role user."
            ),
        )

    return True


# ==========================================================
# POST /process
# ==========================================================

@router.post(
    "/process",
    response_model=AIProcessResponse,
    summary="Memproses request AI",
    description=(
        "Endpoint utama AI KasirAI. "
        "Permission ditentukan berdasarkan "
        "module dan action."
    ),
)
async def process_ai(
    request: AIProcessRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
) -> AIProcessResponse:

    try:

        # ==================================================
        # NORMALISASI
        # ==================================================

        module = normalize_module(
            request.module
        )

        action = normalize_action(
            request.action
        )

        # ==================================================
        # MODULE WAJIB
        # ==================================================

        if not module:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Module AI wajib ditentukan."
                ),
            )

        # ==================================================
        # RESOLVE PERMISSION
        # ==================================================

        permission_code = (
            resolve_ai_permission(
                module=module,
                action=action,
            )
        )

        # ==================================================
        # MODUL BELUM DI-MAPPING
        # ==================================================

        if permission_code is None:

            raise HTTPException(
                status_code=403,
                detail=(
                    "Modul AI belum memiliki "
                    "permission RBAC: "
                    f"{module}"
                ),
            )

        # ==================================================
        # CEK PERMISSION
        # ==================================================

        check_user_permission(
            db=db,
            current_user=current_user,
            permission_code=permission_code,
        )

        # ==================================================
        # UBAH PYDANTIC MODEL MENJADI DICT
        # ==================================================

        payload = request.model_dump(
            exclude_none=True
        )

        # Pastikan nilai yang diteruskan
        # sudah menggunakan bentuk normalisasi.

        payload["module"] = module
        payload["db"] = db

        if action:

            payload["action"] = action

        # ==================================================
        # PROCESS AI
        # ==================================================

        result = await ai_manager.process(
            payload,
             db=db,
        )

        # ==================================================
        # STRING
        # ==================================================

        if isinstance(
            result,
            str,
        ):

            return AIProcessResponse(
                status="success",
                success=True,
                provider="ai",
                module=request.module,
                message=result,
                data=None,
            )

        # ==================================================
        # DICT
        # ==================================================

        if isinstance(
            result,
            dict,
        ):

            return AIProcessResponse(
                status=str(
                    result.get(
                        "status",
                        "success",
                    )
                ),

                success=bool(
                    result.get(
                        "success",
                        True,
                    )
                ),

                provider=result.get(
                    "provider"
                ),

                module=result.get(
                    "module",
                    request.module,
                ),

                message=result.get(
                    "message"
                ),

                data=result.get(
                    "data"
                ),
            )

        # ==================================================
        # HASIL LAIN
        # ==================================================

        return AIProcessResponse(
            status="success",
            success=True,
            provider="ai",
            module=request.module,
            message=str(
                result
            ),
            data=None,
        )

    # ======================================================
    # HTTP EXCEPTION
    # ======================================================

    except HTTPException:
        raise

    # ======================================================
    # ERROR LAIN
    # ======================================================

    except Exception as exc:

        print(
            "=========================================="
        )

        print(
            "AI API ERROR"
        )

        print(
            type(exc).__name__
        )

        print(
            str(exc)
        )

        print(
            "=========================================="
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Terjadi kesalahan saat "
                "memproses AI: "
                f"{exc}"
            ),
        ) from exc