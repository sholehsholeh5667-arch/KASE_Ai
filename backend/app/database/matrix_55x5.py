from app.core.database import SessionLocal
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission


ROLE_ORDER = [
    "owner",
    "admin",
    "kasir",
    "gudang",
    "akuntan",
]


db = SessionLocal()

try:
    roles = {
        r.kode: r
        for r in db.query(Role)
        .filter(
            Role.kode.in_(ROLE_ORDER),
            Role.aktif.is_(True),
        )
        .all()
    }

    permissions = (
        db.query(Permission)
        .filter(Permission.aktif.is_(True))
        .order_by(Permission.id)
        .all()
    )

    assignments = {
        (rp.role_id, rp.permission_id)
        for rp in db.query(RolePermission)
        .filter(RolePermission.aktif.is_(True))
        .all()
    }

    print("=" * 100)
    print("MATRIX 55 PERMISSION x 5 ROLE")
    print("=" * 100)

    print(
        f"{'ID':<4}"
        f"{'PERMISSION':<35}"
        f"{'OWNER':<10}"
        f"{'ADMIN':<10}"
        f"{'KASIR':<10}"
        f"{'GUDANG':<10}"
        f"{'AKUNTAN':<10}"
    )

    print("-" * 100)

    for permission in permissions:

        results = []

        for role_code in ROLE_ORDER:

            role = roles.get(role_code)

            allowed = (
                role is not None
                and (
                    role.id,
                    permission.id
                ) in assignments
            )

            results.append(
                "✅" if allowed else "❌"
            )

        print(
            f"{permission.id:<4}"
            f"{permission.kode:<35}"
            f"{results[0]:<10}"
            f"{results[1]:<10}"
            f"{results[2]:<10}"
            f"{results[3]:<10}"
            f"{results[4]:<10}"
        )

    print("-" * 100)
    print(f"TOTAL PERMISSION AKTIF : {len(permissions)}")
    print("=" * 100)

finally:
    db.close()