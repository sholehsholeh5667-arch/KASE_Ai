from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_user,
    require_permission,
)

from app.core.database import get_db

from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission


# ==========================================================
# ROUTER
# ==========================================================

router = APIRouter(
    prefix="/permissions",
    tags=["Permissions"],
)


# ==========================================================
# SCHEMA UPDATE
# ==========================================================

class RolePermissionUpdate(BaseModel):
    permissions: list[str]


# ==========================================================
# GET PERMISSION USER LOGIN
# ==========================================================

@router.get(
    "/me",
)
def get_my_permissions(
    current_user=Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    """
    Mengambil seluruh permission aktif
    berdasarkan role user yang sedang login.
    """

    role_code = (
        str(
            current_user.role
        )
        .strip()
        .lower()
    )

    rows = (
        db.query(
            Permission
        )
        .join(
            RolePermission,
            RolePermission.permission_id
            == Permission.id,
        )
        .join(
            Role,
            Role.id
            == RolePermission.role_id,
        )
        .filter(
            Role.kode == role_code,
            Role.aktif.is_(True),
            RolePermission.aktif.is_(True),
            Permission.aktif.is_(True),
        )
        .order_by(
            Permission.modul.asc(),
            Permission.kode.asc(),
        )
        .all()
    )

    return [
        {
            "id": permission.id,
            "kode": permission.kode,
            "nama": permission.nama,
            "modul": permission.modul,
            "aksi": permission.aksi,
            "deskripsi": permission.deskripsi,
        }
        for permission in rows
    ]


# ==========================================================
# GET PERMISSION BERDASARKAN ROLE
# ==========================================================

@router.get(
    "/role/{role_code}",
)
def get_role_permissions(
    role_code: str,
    current_user=Depends(
        require_permission(
            "hak_akses.view"
        )
    ),
    db: Session = Depends(
        get_db
    ),
):
    """
    Mengambil seluruh permission aktif
    berdasarkan role tertentu.
    """

    normalized_role = (
        role_code
        .strip()
        .lower()
    )

    role = (
        db.query(
            Role
        )
        .filter(
            Role.kode == normalized_role,
            Role.aktif.is_(True),
        )
        .first()
    )

    if role is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Role '{role_code}' "
                "tidak ditemukan."
            ),
        )

    rows = (
        db.query(
            Permission
        )
        .join(
            RolePermission,
            RolePermission.permission_id
            == Permission.id,
        )
        .filter(
            RolePermission.role_id
            == role.id,
            RolePermission.aktif.is_(True),
            Permission.aktif.is_(True),
        )
        .order_by(
            Permission.modul.asc(),
            Permission.kode.asc(),
        )
        .all()
    )

    return [
        {
            "id": permission.id,
            "kode": permission.kode,
            "nama": permission.nama,
            "modul": permission.modul,
            "aksi": permission.aksi,
            "deskripsi": permission.deskripsi,
        }
        for permission in rows
    ]


# ==========================================================
# UPDATE PERMISSION ROLE
# ==========================================================

@router.put(
    "/role/{role_code}",
)
def update_role_permissions(
    role_code: str,
    data: RolePermissionUpdate,
    current_user=Depends(
        require_permission(
            "hak_akses.update"
        )
    ),
    db: Session = Depends(
        get_db
    ),
):
    """
    Mengubah permission sebuah role.

    Data yang diterima adalah daftar kode
    permission yang harus aktif.

    Permission lain akan dibuat nonaktif.
    """

    normalized_role = (
        role_code
        .strip()
        .lower()
    )

    role = (
        db.query(
            Role
        )
        .filter(
            Role.kode == normalized_role,
            Role.aktif.is_(True),
        )
        .first()
    )

    if role is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Role '{role_code}' "
                "tidak ditemukan."
            ),
        )

    # ------------------------------------------------------
    # Normalisasi daftar permission
    # ------------------------------------------------------

    requested_codes = {
        str(code)
        .strip()
        .lower()
        for code in data.permissions
        if str(code).strip()
    }

    # ------------------------------------------------------
    # Ambil seluruh permission aktif
    # ------------------------------------------------------

    all_permissions = (
        db.query(
            Permission
        )
        .filter(
            Permission.aktif.is_(True)
        )
        .all()
    )

    permission_by_code = {
        permission.kode.strip().lower():
            permission
        for permission in all_permissions
    }

    # ------------------------------------------------------
    # Validasi permission
    # ------------------------------------------------------

    invalid_codes = sorted(
        requested_codes
        - set(
            permission_by_code.keys()
        )
    )

    if invalid_codes:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Permission tidak ditemukan.",
                "permissions": invalid_codes,
            },
        )

    # ------------------------------------------------------
    # Ambil role_permissions yang sudah ada
    # ------------------------------------------------------

    existing_rows = (
        db.query(
            RolePermission
        )
        .filter(
            RolePermission.role_id
            == role.id
        )
        .all()
    )

    existing_by_permission_id = {
        row.permission_id:
            row
        for row in existing_rows
    }

    requested_permission_ids = {
        permission_by_code[code].id
        for code in requested_codes
    }

    # ------------------------------------------------------
    # Aktif / nonaktifkan record yang sudah ada
    # ------------------------------------------------------

    for row in existing_rows:

        row.aktif = (
            row.permission_id
            in requested_permission_ids
        )

    # ------------------------------------------------------
    # Buat record baru jika belum ada
    # ------------------------------------------------------

    for permission_id in requested_permission_ids:

        if (
            permission_id
            not in existing_by_permission_id
        ):

            db.add(
                RolePermission(
                    role_id=role.id,
                    permission_id=permission_id,
                    aktif=True,
                )
            )

    db.commit()

    # ------------------------------------------------------
    # Ambil ulang permission aktif
    # ------------------------------------------------------

    rows = (
        db.query(
            Permission
        )
        .join(
            RolePermission,
            RolePermission.permission_id
            == Permission.id,
        )
        .filter(
            RolePermission.role_id
            == role.id,
            RolePermission.aktif.is_(True),
            Permission.aktif.is_(True),
        )
        .order_by(
            Permission.modul.asc(),
            Permission.kode.asc(),
        )
        .all()
    )

    return {
        "message":
            "Hak akses berhasil diperbarui.",
        "role": {
            "id": role.id,
            "kode": role.kode,
            "nama": role.nama,
        },
        "permissions": [
            {
                "id": permission.id,
                "kode": permission.kode,
                "nama": permission.nama,
                "modul": permission.modul,
                "aksi": permission.aksi,
                "deskripsi": permission.deskripsi,
            }
            for permission in rows
        ],
    }