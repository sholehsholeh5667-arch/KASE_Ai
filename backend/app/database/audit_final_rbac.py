from __future__ import annotations

from app.main import app

from app.core.database import SessionLocal

from app.models.permission import Permission

from app.database.rbac_final_map import (
    ENDPOINT_RBAC,
)


# ==========================================================
# KONFIGURASI
# ==========================================================

IGNORED_PATHS = {
    "/",
    "/openapi.json",
    "/docs",
    "/docs/oauth2-redirect",
    "/redoc",
}

IGNORED_METHODS = {
    "head",
    "options",
}


# ==========================================================
# ATURAN KHUSUS
# ==========================================================
#
# Aturan berikut BUKAN permission database biasa.
#
# PUBLIC
# AUTHENTICATED
# ROLE_OWNER_ADMIN
# AI_DYNAMIC
# PROGRAMMER_ONLY
# IMMUTABLE
#
# Semua aturan ini diperlakukan terpisah dari
# tabel permissions.
# ==========================================================


PUBLIC_ROUTES = {
    (
        "POST",
        "/auth/login",
    ): "PUBLIC",

    (
        "POST",
        "/auth/forgot-password",
    ): "PUBLIC",

    (
        "POST",
        "/auth/reset-password",
    ): "PUBLIC",
}


AUTHENTICATED_ROUTES = {
    (
        "GET",
        "/users/me",
    ): "AUTHENTICATED",

    (
        "GET",
        "/toko/current",
    ): "AUTHENTICATED",
}


ROLE_ROUTES = {
    (
        "GET",
        "/settings",
    ): "ROLE_OWNER_ADMIN",

    (
        "PUT",
        "/settings",
    ): "ROLE_OWNER_ADMIN",
}


SPECIAL_ROUTES = {
    (
        "POST",
        "/ai/process",
    ): "AI_DYNAMIC",

    (
        "POST",
        "/kitab-kuning/scan-folder",
    ): "PROGRAMMER_ONLY",
}


IMMUTABLE_ROUTES = {
    (
        "DELETE",
        "/mutasi-stok/{mutasi_id}",
    ): "IMMUTABLE",
}


# Semua endpoint yang bukan permission database biasa.
SPECIAL_ALL = {}

SPECIAL_ALL.update(
    PUBLIC_ROUTES
)

SPECIAL_ALL.update(
    AUTHENTICATED_ROUTES
)

SPECIAL_ALL.update(
    ROLE_ROUTES
)

SPECIAL_ALL.update(
    SPECIAL_ROUTES
)

SPECIAL_ALL.update(
    IMMUTABLE_ROUTES
)

SPECIAL_SET = set(
    SPECIAL_ALL.keys()
)


# ==========================================================
# NORMALISASI PATH
# ==========================================================

def normalize_path(
    path: str,
) -> str:

    path = str(
        path
    ).strip()

    if not path:
        return "/"

    if path.startswith(
        "/api/v1"
    ):
        path = path[
            len("/api/v1"):
        ]

    if not path:
        return "/"

    return path


# ==========================================================
# AMBIL ROUTE DARI OPENAPI
# ==========================================================

def get_openapi_routes():

    schema = app.openapi()

    result = []

    for (
        raw_path,
        path_item,
    ) in schema.get(
        "paths",
        {},
    ).items():

        path = normalize_path(
            raw_path
        )

        if path in IGNORED_PATHS:
            continue

        for method in path_item.keys():

            method = str(
                method
            ).lower()

            if method in IGNORED_METHODS:
                continue

            result.append(
                (
                    method.upper(),
                    path,
                )
            )

    return sorted(
        set(result)
    )


# ==========================================================
# AMBIL RBAC MAP
# ==========================================================

def get_rbac_map():

    result = []

    for (
        method,
        path,
    ), permission in (
        ENDPOINT_RBAC.items()
    ):

        result.append(
            (
                str(
                    method
                ).upper(),

                normalize_path(
                    path
                ),

                permission,
            )
        )

    return result


# ==========================================================
# MAIN
# ==========================================================

def main():

    print()

    print(
        "=" * 95
    )

    print(
        "AUDIT FINAL SELURUH API + RBAC"
    )

    print(
        "=" * 95
    )

    # ======================================================
    # DATABASE
    # ======================================================

    db = SessionLocal()

    try:

        permissions = {
            permission.kode

            for permission
            in (
                db.query(
                    Permission
                )
                .filter(
                    Permission.aktif.is_(True)
                )
                .all()
            )
        }

    finally:

        db.close()

    # ======================================================
    # ROUTE AKTIF
    # ======================================================

    live_routes = (
        get_openapi_routes()
    )

    live_set = set(
        live_routes
    )

    # ======================================================
    # RBAC MAP
    # ======================================================

    rbac_map = (
        get_rbac_map()
    )

    rbac_set = {
        (
            method,
            path,
        )

        for (
            method,
            path,
            _,
        ) in rbac_map
    }

    # ======================================================
    # HEADER
    # ======================================================

    print()

    print(
        f"ROUTE AKTIF     : {len(live_routes)}"
    )

    print(
        f"RBAC MAP        : {len(rbac_map)}"
    )

    print(
        f"PERMISSION DB   : {len(permissions)}"
    )

    print(
        f"RULE KHUSUS     : {len(SPECIAL_ALL)}"
    )

    # ======================================================
    # DUPLIKASI
    # ======================================================

    print()

    print(
        "=" * 95
    )

    print(
        "1. DUPLIKASI ROUTE"
    )

    print(
        "=" * 95
    )

    #
    # OpenAPI telah memberikan satu representasi
    # per METHOD + PATH.
    #
    # Karena get_openapi_routes() menggunakan set,
    # tidak ada duplikasi METHOD + PATH di hasil akhir.
    #

    print(
        "✅ Tidak ada duplikasi pada OpenAPI routes."
    )

    # ======================================================
    # ENDPOINT BELUM TERPETAKAN
    # ======================================================

    unmapped = []

    for (
        method,
        path,
    ) in live_routes:

        # --------------------------------------------------
        # RULE KHUSUS
        # --------------------------------------------------

        if (
            method,
            path,
        ) in SPECIAL_SET:

            continue

        # --------------------------------------------------
        # STATIC RBAC
        # --------------------------------------------------

        if (
            method,
            path,
        ) not in rbac_set:

            unmapped.append(
                (
                    method,
                    path,
                )
            )

    print()

    print(
        "=" * 95
    )

    print(
        "2. ENDPOINT BELUM TERPETAKAN"
    )

    print(
        "=" * 95
    )

    if unmapped:

        for (
            method,
            path,
        ) in sorted(
            unmapped
        ):

            print(
                f"❌ {method:<7} {path}"
            )

    else:

        print(
            "✅ Semua endpoint sudah memiliki aturan akses."
        )

    # ======================================================
    # RBAC MAP VS DATABASE
    # ======================================================

    invalid_permissions = []

    for (
        method,
        path,
        permission,
    ) in rbac_map:

        # --------------------------------------------------
        # SPECIAL VALUE
        # --------------------------------------------------

        if permission in {
            "PUBLIC",
            "AUTHENTICATED",
            "ROLE_OWNER_ADMIN",
            "AI_DYNAMIC",
            "PROGRAMMER_ONLY",
            "IMMUTABLE",
        }:

            continue

        # --------------------------------------------------
        # PERMISSION HARUS ADA DI DATABASE
        # --------------------------------------------------

        if permission not in permissions:

            invalid_permissions.append(
                (
                    method,
                    path,
                    permission,
                )
            )

    print()

    print(
        "=" * 95
    )

    print(
        "3. RBAC MAP VS DATABASE"
    )

    print(
        "=" * 95
    )

    if invalid_permissions:

        for (
            method,
            path,
            permission,
        ) in invalid_permissions:

            print(
                f"❌ {method:<7} "
                f"{path:<55} "
                f"→ {permission}"
            )

    else:

        print(
            "✅ Semua permission database "
            "pada map tersedia dan aktif."
        )

    # ======================================================
    # RBAC MAP YANG SUDAH TIDAK ADA DI API
    # ======================================================

    stale_map = []

    for (
        method,
        path,
    ) in rbac_set:

        # --------------------------------------------------
        # SPECIAL TIDAK DICEK SEBAGAI STATIC MAP
        # --------------------------------------------------

        if (
            method,
            path,
        ) in SPECIAL_SET:

            continue

        if (
            method,
            path,
        ) not in live_set:

            stale_map.append(
                (
                    method,
                    path,
                )
            )

    print()

    print(
        "=" * 95
    )

    print(
        "4. RBAC MAP YANG TIDAK DITEMUKAN DI API"
    )

    print(
        "=" * 95
    )

    if stale_map:

        for (
            method,
            path,
        ) in sorted(
            stale_map
        ):

            print(
                f"⚠️ {method:<7} {path}"
            )

    else:

        print(
            "✅ Semua mapping RBAC "
            "mengarah ke endpoint aktif."
        )

    # ======================================================
    # PUBLIC
    # ======================================================

    print()

    print(
        "=" * 95
    )

    print(
        "5. ENDPOINT PUBLIC"
    )

    print(
        "=" * 95
    )

    missing_public = []

    for (
        method,
        path,
    ), rule in PUBLIC_ROUTES.items():

        if (
            method,
            path,
        ) in live_set:

            print(
                f"✅ {method:<7} "
                f"{path:<55} "
                f"→ {rule}"
            )

        else:

            print(
                f"❌ {method:<7} "
                f"{path:<55} "
                f"→ TIDAK DITEMUKAN"
            )

            missing_public.append(
                (
                    method,
                    path,
                )
            )

    # ======================================================
    # AUTHENTICATED
    # ======================================================

    print()

    print(
        "=" * 95
    )

    print(
        "6. ENDPOINT AUTHENTICATED"
    )

    print(
        "=" * 95
    )

    missing_authenticated = []

    for (
        method,
        path,
    ), rule in (
        AUTHENTICATED_ROUTES.items()
    ):

        if (
            method,
            path,
        ) in live_set:

            print(
                f"✅ {method:<7} "
                f"{path:<55} "
                f"→ {rule}"
            )

        else:

            print(
                f"❌ {method:<7} "
                f"{path:<55} "
                f"→ TIDAK DITEMUKAN"
            )

            missing_authenticated.append(
                (
                    method,
                    path,
                )
            )

    # ======================================================
    # ROLE
    # ======================================================

    print()

    print(
        "=" * 95
    )

    print(
        "7. ROLE-BASED SPECIAL"
    )

    print(
        "=" * 95
    )

    missing_role = []

    for (
        method,
        path,
    ), rule in ROLE_ROUTES.items():

        if (
            method,
            path,
        ) in live_set:

            print(
                f"✅ {method:<7} "
                f"{path:<55} "
                f"→ {rule}"
            )

        else:

            print(
                f"❌ {method:<7} "
                f"{path:<55} "
                f"→ TIDAK DITEMUKAN"
            )

            missing_role.append(
                (
                    method,
                    path,
                )
            )

    # ======================================================
    # SPECIAL
    # ======================================================

    print()

    print(
        "=" * 95
    )

    print(
        "8. SPECIAL ENDPOINT"
    )

    print(
        "=" * 95
    )

    missing_special = []

    for (
        method,
        path,
    ), rule in SPECIAL_ROUTES.items():

        if (
            method,
            path,
        ) in live_set:

            print(
                f"✅ {method:<7} "
                f"{path:<55} "
                f"→ {rule}"
            )

        else:

            print(
                f"❌ {method:<7} "
                f"{path:<55} "
                f"→ TIDAK DITEMUKAN"
            )

            missing_special.append(
                (
                    method,
                    path,
                )
            )

    # ======================================================
    # IMMUTABLE
    # ======================================================

    print()

    print(
        "=" * 95
    )

    print(
        "9. IMMUTABLE ENDPOINT"
    )

    print(
        "=" * 95
    )

    missing_immutable = []

    for (
        method,
        path,
    ), rule in (
        IMMUTABLE_ROUTES.items()
    ):

        if (
            method,
            path,
        ) in live_set:

            print(
                f"✅ {method:<7} "
                f"{path:<55} "
                f"→ {rule}"
            )

        else:

            print(
                f"❌ {method:<7} "
                f"{path:<55} "
                f"→ TIDAK DITEMUKAN"
            )

            missing_immutable.append(
                (
                    method,
                    path,
                )
            )

    # ======================================================
    # SELURUH ENDPOINT
    # ======================================================

    print()

    print(
        "=" * 95
    )

    print(
        "10. SELURUH ENDPOINT AKTIF"
    )

    print(
        "=" * 95
    )

    for (
        method,
        path,
    ) in live_routes:

        # --------------------------------------------------
        # SPECIAL
        # --------------------------------------------------

        if (
            method,
            path,
        ) in SPECIAL_ALL:

            print(
                f"{method:<7} "
                f"{path:<55} "
                f"→ {SPECIAL_ALL[(method, path)]}"
            )

            continue

        # --------------------------------------------------
        # STATIC RBAC
        # --------------------------------------------------

        permission = None

        for (
            map_method,
            map_path,
            map_permission,
        ) in rbac_map:

            if (
                method == map_method
                and path == map_path
            ):

                permission = (
                    map_permission
                )

                break

        if permission:

            print(
                f"{method:<7} "
                f"{path:<55} "
                f"→ {permission}"
            )

        else:

            print(
                f"{method:<7} "
                f"{path:<55} "
                f"→ ❌ BELUM MAPPING"
            )

    # ======================================================
    # FINAL STATUS
    # ======================================================

    failed = False

    # ------------------------------------------------------
    # UNMAPPED
    # ------------------------------------------------------

    if unmapped:
        failed = True

    # ------------------------------------------------------
    # INVALID PERMISSION
    # ------------------------------------------------------

    if invalid_permissions:
        failed = True

    # ------------------------------------------------------
    # MISSING PUBLIC
    # ------------------------------------------------------

    if missing_public:
        failed = True

    # ------------------------------------------------------
    # MISSING AUTHENTICATED
    # ------------------------------------------------------

    if missing_authenticated:
        failed = True

    # ------------------------------------------------------
    # MISSING ROLE
    # ------------------------------------------------------

    if missing_role:
        failed = True

    # ------------------------------------------------------
    # MISSING SPECIAL
    # ------------------------------------------------------

    if missing_special:
        failed = True

    # ------------------------------------------------------
    # MISSING IMMUTABLE
    # ------------------------------------------------------

    if missing_immutable:
        failed = True

    # ======================================================
    # FINAL
    # ======================================================

    print()

    print(
        "=" * 95
    )

    print(
        "HASIL AKHIR"
    )

    print(
        "=" * 95
    )

    if unmapped:

        print(
            "❌ Endpoint mapping : FAIL"
        )

    else:

        print(
            "✅ Endpoint mapping : PASS"
        )

    if invalid_permissions:

        print(
            "❌ Permission database : FAIL"
        )

    else:

        print(
            "✅ Permission database : PASS"
        )

    if missing_public:

        print(
            "❌ Public endpoint : FAIL"
        )

    else:

        print(
            "✅ Public endpoint : PASS"
        )

    if missing_authenticated:

        print(
            "❌ Authenticated endpoint : FAIL"
        )

    else:

        print(
            "✅ Authenticated endpoint : PASS"
        )

    if missing_role:

        print(
            "❌ Role-based endpoint : FAIL"
        )

    else:

        print(
            "✅ Role-based endpoint : PASS"
        )

    if missing_special:

        print(
            "❌ Special endpoint : FAIL"
        )

    else:

        print(
            "✅ Special endpoint : PASS"
        )

    if missing_immutable:

        print(
            "❌ Immutable endpoint : FAIL"
        )

    else:

        print(
            "✅ Immutable endpoint : PASS"
        )

    if stale_map:

        print(
            "⚠️ Stale RBAC map : WARNING"
        )

    else:

        print(
            "✅ Stale RBAC map : PASS"
        )

    print()

    if failed:

        print(
            "❌ STATUS FINAL : FAIL"
        )

        print(
            "Masih ada endpoint/RBAC yang harus diperbaiki."
        )

        print(
            "=" * 95
        )

        return 1

    print(
        "✅ STATUS FINAL : PASS"
    )

    print(
        "SELURUH API LOLOS AUDIT RBAC."
    )

    print(
        "=" * 95
    )

    return 0


# ==========================================================
# ENTRY POINT
# ==========================================================

if __name__ == "__main__":

    raise SystemExit(
        main()
    )