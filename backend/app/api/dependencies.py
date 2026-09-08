from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from sqlalchemy.orm import Session

from app.core.auth import decode_token
from app.core.database import get_db

from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission

from app.models.toko import Toko
from app.models.toko_user import TokoUser


# ==========================================================
# SECURITY
# ==========================================================

security = HTTPBearer(
    auto_error=False
)


# ==========================================================
# CURRENT USER
# ==========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(
        get_db
    ),
):
    """
    Mengambil user yang sedang login berdasarkan JWT.

    User diverifikasi kembali ke database.
    """

    # ------------------------------------------------------
    # CEK HEADER
    # ------------------------------------------------------

    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail=(
                "Authorization header "
                "tidak ditemukan."
            ),
        )

    # ------------------------------------------------------
    # DECODE JWT
    # ------------------------------------------------------

    payload = decode_token(
        credentials.credentials
    )

    # ------------------------------------------------------
    # USER ID
    # ------------------------------------------------------

    user_id = payload.get(
        "id"
    )

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail=(
                "Token tidak memiliki "
                "user id."
            ),
        )

    # ------------------------------------------------------
    # AMBIL USER DARI DATABASE
    # ------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail=(
                "User tidak ditemukan."
            ),
        )

    # ------------------------------------------------------
    # CEK AKTIF
    # ------------------------------------------------------

    if not user.aktif:
        raise HTTPException(
            status_code=401,
            detail=(
                "Akun tidak aktif."
            ),
        )

    return user


# ==========================================================
# REQUIRE ROLE
# ==========================================================

def require_role(*roles):

    def role_checker(
        current_user: User = Depends(
            get_current_user
        ),
    ):
        """
        Membatasi endpoint berdasarkan role.
        """

        current_role = str(
            current_user.role
        ).strip().lower()

        allowed_roles = {
            str(role).strip().lower()
            for role in roles
        }

        if current_role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Akses ditolak.",
            )

        return current_user

    return role_checker


# ==========================================================
# REQUIRE PERMISSION
# ==========================================================

def require_permission(
    permission_code: str
):

    def permission_checker(
        current_user: User = Depends(
            get_current_user
        ),
        db: Session = Depends(
            get_db
        ),
    ):
        """
        Membatasi endpoint berdasarkan permission.

        Alur:

        User
          ↓
        Role
          ↓
        RolePermission
          ↓
        Permission
          ↓
        ALLOW / 403
        """

        # --------------------------------------------------
        # ROLE USER
        # --------------------------------------------------

        role_code = str(
            current_user.role
        ).strip().lower()

        # --------------------------------------------------
        # CARI ROLE
        # --------------------------------------------------

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
                detail=(
                    "Role user tidak valid."
                ),
            )

        # --------------------------------------------------
        # CARI PERMISSION
        # --------------------------------------------------

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
                    f"Permission "
                    f"'{permission_code}' "
                    "tidak ditemukan."
                ),
            )

        # --------------------------------------------------
        # CEK ROLE -> PERMISSION
        # --------------------------------------------------

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

        # --------------------------------------------------
        # TOLAK
        # --------------------------------------------------

        if role_permission is None:
            raise HTTPException(
                status_code=403,
                detail=(
                    "Akses ditolak. "
                    f"Permission "
                    f"'{permission_code}' "
                    "tidak dimiliki oleh "
                    "role user."
                ),
            )

        # --------------------------------------------------
        # IZINKAN
        # --------------------------------------------------

        return current_user

    return permission_checker


# ==========================================================
# REQUIRE PROGRAMMER
# ==========================================================

def require_programmer():

    def programmer_checker(
        current_user: User = Depends(
            get_current_user
        ),
    ):
        """
        Membatasi endpoint teknis/internal
        hanya untuk role programmer.
        """

        current_role = str(
            current_user.role
        ).strip().lower()

        if current_role != "programmer":
            raise HTTPException(
                status_code=403,
                detail=(
                    "Akses ditolak. "
                    "Endpoint ini hanya dapat "
                    "diakses oleh Programmer."
                ),
            )

        return current_user

    return programmer_checker


# ==========================================================
# CURRENT TOKO
# ==========================================================

def get_current_toko(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    """
    Mengambil toko aktif yang menjadi
    anggota user yang sedang login.

    Struktur:

    users
        ↓
    toko_users
        ↓
    toko

    Status keanggotaan:
        owner
        member

    Status aktif:
        toko_users.aktif = True
    """

    # ------------------------------------------------------
    # CARI KEANGGOTAAN TOKO AKTIF
    # ------------------------------------------------------

    toko_user = (
        db.query(TokoUser)
        .filter(
            TokoUser.user_id
            == current_user.id,

            TokoUser.status.in_(
                [
                    "owner",
                    "member",
                ]
            ),

            TokoUser.aktif.is_(True),
        )
        .first()
    )

    # ------------------------------------------------------
    # USER BELUM MEMILIKI TOKO AKTIF
    # ------------------------------------------------------

    if toko_user is None:
        raise HTTPException(
            status_code=403,
            detail=(
                "User belum memiliki "
                "toko aktif."
            ),
        )

    # ------------------------------------------------------
    # CARI TOKO
    # ------------------------------------------------------

    toko = (
        db.query(Toko)
        .filter(
            Toko.id
            == toko_user.toko_id,

            Toko.aktif.is_(True),
        )
        .first()
    )

    # ------------------------------------------------------
    # TOKO TIDAK DITEMUKAN
    # ------------------------------------------------------

    if toko is None:
        raise HTTPException(
            status_code=403,
            detail=(
                "Toko aktif tidak ditemukan."
            ),
        )

    return toko