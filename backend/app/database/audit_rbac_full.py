from collections import defaultdict

from fastapi import FastAPI
from fastapi.routing import APIRoute

from app.main import app

from app.core.database import SessionLocal
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission


# ==========================================================
# KONFIGURASI ROLE
# ==========================================================

ROLE_ORDER = [
    "owner",
    "admin",
    "kasir",
    "gudang",
    "akuntan",
]


# ==========================================================
# DATABASE
# ==========================================================

db = SessionLocal()

try:

    roles = {
        role.id: role.kode.lower()
        for role in db.query(Role)
        .filter(Role.aktif.is_(True))
        .all()
    }

    permissions = {
        permission.id: permission.kode
        for permission in db.query(Permission)
        .filter(Permission.aktif.is_(True))
        .all()
    }

    role_permission_map = defaultdict(set)

    role_permissions = (
        db.query(RolePermission)
        .filter(RolePermission.aktif.is_(True))
        .all()
    )

    for rp in role_permissions:

        role_code = roles.get(rp.role_id)
        permission_code = permissions.get(
            rp.permission_id
        )

        if role_code and permission_code:
            role_permission_map[
                role_code
            ].add(permission_code)

finally:
    db.close()


# ==========================================================
# EKSTRAK PERMISSION
# ==========================================================

def extract_permissions(route):

    result = []

    dependant = getattr(
        route,
        "dependant",
        None
    )

    if dependant is None:
        return result

    for dependency in dependant.dependencies:

        call = getattr(
            dependency,
            "call",
            None
        )

        if call is None:
            continue

        name = getattr(
            call,
            "__name__",
            ""
        )

        if name != "permission_checker":
            continue

        closure = getattr(
            call,
            "__closure__",
            None
        )

        if not closure:
            continue

        for cell in closure:

            try:
                value = cell.cell_contents
            except ValueError:
                continue

            if (
                isinstance(value, str)
                and value in permissions.values()
            ):
                result.append(value)

    return sorted(set(result))


# ==========================================================
# TELUSURI ROUTER SECARA REKURSIF
# ==========================================================

def collect_routes(container, result=None, visited=None):

    if result is None:
        result = []

    if visited is None:
        visited = set()

    object_id = id(container)

    if object_id in visited:
        return result

    visited.add(object_id)

    # ------------------------------------------------------
    # APIRouter / IncludedRouter
    # ------------------------------------------------------

    router_routes = getattr(
        container,
        "routes",
        None
    )

    if router_routes:

        for route in router_routes:

            if isinstance(route, APIRoute):

                result.append(route)

                continue

            # FastAPI IncludedRouter
            original_router = getattr(
                route,
                "original_router",
                None
            )

            if original_router is not None:

                collect_routes(
                    original_router,
                    result,
                    visited
                )

                continue

            # Router biasa
            nested_routes = getattr(
                route,
                "routes",
                None
            )

            if nested_routes:

                collect_routes(
                    route,
                    result,
                    visited
                )

    # ------------------------------------------------------
    # original_router langsung
    # ------------------------------------------------------

    original_router = getattr(
        container,
        "original_router",
        None
    )

    if original_router is not None:

        collect_routes(
            original_router,
            result,
            visited
        )

    return result


# ==========================================================
# KUMPULKAN SEMUA ROUTE
# ==========================================================

routes = collect_routes(app)


# Hilangkan kemungkinan duplicate
unique_routes = {}

for route in routes:

    key = (
        route.path,
        tuple(sorted(route.methods))
    )

    unique_routes[key] = route


routes = list(
    unique_routes.values()
)


# ==========================================================
# SORT
# ==========================================================

routes.sort(
    key=lambda route: (
        route.path,
        ",".join(sorted(route.methods))
    )
)


# ==========================================================
# HEADER
# ==========================================================

print()
print("=" * 160)
print("AUDIT RBAC — SELURUH ENDPOINT × 5 ROLE")
print("=" * 160)

print(
    f"{'METHOD':<12}"
    f"{'ENDPOINT':<65}"
    f"{'PERMISSION':<30}"
    f"{'OWNER':<10}"
    f"{'ADMIN':<10}"
    f"{'KASIR':<10}"
    f"{'GUDANG':<10}"
    f"{'AKUNTAN':<10}"
)

print("-" * 160)


# ==========================================================
# AUDIT SETIAP ENDPOINT
# ==========================================================

protected_count = 0
unprotected_count = 0


for route in routes:

    methods = ",".join(
        sorted(route.methods)
    )

    path = route.path

    permission_codes = extract_permissions(
        route
    )

    # ------------------------------------------------------
    # BELUM ADA PERMISSION
    # ------------------------------------------------------

    if not permission_codes:

        unprotected_count += 1

        print(
            f"{methods:<12}"
            f"{path:<65}"
            f"{'-':<30}"
            f"{'⚠️':<10}"
            f"{'⚠️':<10}"
            f"{'⚠️':<10}"
            f"{'⚠️':<10}"
            f"{'⚠️':<10}"
        )

        continue

    protected_count += 1

    permission_text = ",".join(
        permission_codes
    )

    role_results = []

    for role_code in ROLE_ORDER:

        allowed = any(
            permission_code
            in role_permission_map[role_code]
            for permission_code
            in permission_codes
        )

        role_results.append(
            "✅" if allowed else "❌"
        )

    print(
        f"{methods:<12}"
        f"{path:<65}"
        f"{permission_text:<30}"
        f"{role_results[0]:<10}"
        f"{role_results[1]:<10}"
        f"{role_results[2]:<10}"
        f"{role_results[3]:<10}"
        f"{role_results[4]:<10}"
    )


# ==========================================================
# RINGKASAN
# ==========================================================

print()
print("=" * 160)
print("RINGKASAN AUDIT")
print("=" * 160)

print(
    f"TOTAL ENDPOINT HTTP       : {len(routes)}"
)

print(
    f"SUDAH DILINDUNGI RBAC     : {protected_count}"
)

print(
    f"BELUM DILINDUNGI RBAC     : {unprotected_count}"
)

print()
print("✅ = role memiliki permission")
print("❌ = role tidak memiliki permission")
print("⚠️ = endpoint belum memakai require_permission()")

print("=" * 160)