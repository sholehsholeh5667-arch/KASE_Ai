from __future__ import annotations

from app.core.database import SessionLocal

from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission


# ==========================================================
# PERMISSION YANG HARUS DITAMBAHKAN
# ==========================================================

ADD_PERMISSIONS = {

    "kasir": {
        "pembelian.view",
        "stock_opname.view",
        "laporan.view",
        "laporan.export",
    },

    "gudang": {
        "retur_pembelian.update",
        "retur_pembelian.delete",
        "laporan.view",
        "laporan.export",
    },

    "akuntan": {
        "kategori.view",
        "stock_opname.view",
    },
}


# ==========================================================
# PERMISSION YANG HARUS DICABUT
# ==========================================================

REMOVE_PERMISSIONS = {

    "akuntan": {
        "retur_pembelian.view",
    },
}


# ==========================================================
# SYNC
# ==========================================================

def main():

    db = SessionLocal()

    try:

        roles = (
            db.query(Role)
            .filter(
                Role.aktif.is_(True)
            )
            .all()
        )

        role_map = {
            str(role.kode)
            .strip()
            .lower(): role
            for role in roles
        }

        permissions = (
            db.query(Permission)
            .filter(
                Permission.aktif.is_(True)
            )
            .all()
        )

        permission_map = {
            str(permission.kode).strip():
            permission
            for permission in permissions
        }

        # ==================================================
        # TAMBAH
        # ==================================================

        for role_code, permission_codes in (
            ADD_PERMISSIONS.items()
        ):

            role = role_map.get(
                role_code
            )

            if role is None:
                raise RuntimeError(
                    f"Role tidak ditemukan: {role_code}"
                )

            for permission_code in (
                permission_codes
            ):

                permission = permission_map.get(
                    permission_code
                )

                if permission is None:
                    raise RuntimeError(
                        "Permission tidak ditemukan: "
                        f"{permission_code}"
                    )

                existing = (
                    db.query(RolePermission)
                    .filter(
                        RolePermission.role_id
                        == role.id,

                        RolePermission.permission_id
                        == permission.id,
                    )
                    .first()
                )

                if existing is None:

                    db.add(
                        RolePermission(
                            role_id=role.id,
                            permission_id=permission.id,
                            aktif=True,
                        )
                    )

                    print(
                        f"+ ADD    "
                        f"{role_code} -> "
                        f"{permission_code}"
                    )

                elif not existing.aktif:

                    existing.aktif = True

                    print(
                        f"+ ENABLE "
                        f"{role_code} -> "
                        f"{permission_code}"
                    )

                else:

                    print(
                        f"= SKIP   "
                        f"{role_code} -> "
                        f"{permission_code}"
                    )

        # ==================================================
        # CABUT
        # ==================================================

        for role_code, permission_codes in (
            REMOVE_PERMISSIONS.items()
        ):

            role = role_map.get(
                role_code
            )

            if role is None:
                raise RuntimeError(
                    f"Role tidak ditemukan: {role_code}"
                )

            for permission_code in (
                permission_codes
            ):

                permission = permission_map.get(
                    permission_code
                )

                if permission is None:
                    raise RuntimeError(
                        "Permission tidak ditemukan: "
                        f"{permission_code}"
                    )

                rows = (
                    db.query(RolePermission)
                    .filter(
                        RolePermission.role_id
                        == role.id,

                        RolePermission.permission_id
                        == permission.id,

                        RolePermission.aktif.is_(True),
                    )
                    .all()
                )

                for row in rows:

                    row.aktif = False

                    print(
                        f"- REMOVE  "
                        f"{role_code} -> "
                        f"{permission_code}"
                    )

        # ==================================================
        # COMMIT
        # ==================================================

        db.commit()

        print()
        print("=" * 80)
        print("RBAC ROLE SYNC SELESAI")
        print("=" * 80)

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# ==========================================================
# ENTRY POINT
# ==========================================================

if __name__ == "__main__":
    main()