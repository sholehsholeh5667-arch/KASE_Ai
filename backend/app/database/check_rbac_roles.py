from __future__ import annotations

from app.core.database import SessionLocal

from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission


# ==========================================================
# ROLE YANG DIAUDIT
# ==========================================================

ROLE_ORDER = [
    "owner",
    "admin",
    "kasir",
    "gudang",
    "akuntan",
]


# ==========================================================
# PERMISSION PENTING YANG KITA AUDIT
# ==========================================================

PERMISSIONS = [
    "barang.view",
    "barang.create",
    "barang.update",
    "barang.delete",

    "kategori.view",
    "kategori.create",
    "kategori.update",
    "kategori.delete",

    "supplier.view",
    "supplier.create",
    "supplier.update",
    "supplier.delete",

    "pelanggan.view",
    "pelanggan.create",
    "pelanggan.update",
    "pelanggan.delete",

    "penjualan.view",
    "penjualan.create",
    "penjualan.delete",

    "pembelian.view",
    "pembelian.create",

    "stok.view",
    "stok.adjust",

    "mutasi_stok.view",

    "stock_opname.view",
    "stock_opname.create",
    "stock_opname.approve",

    "retur_penjualan.view",
    "retur_penjualan.create",
    "retur_penjualan.update",
    "retur_penjualan.delete",

    "retur_pembelian.view",
    "retur_pembelian.create",
    "retur_pembelian.update",
    "retur_pembelian.delete",

    "laporan.view",
    "laporan.export",
    "laporan.laba_rugi",

    "kitab.view",
    "kitab.search",

    "muamalah.view",
]


# ==========================================================
# PERMISSION YANG DIHARAPKAN
# ==========================================================
#
# True  = role seharusnya memiliki
# False = role seharusnya tidak memiliki
#
# Catatan:
# Programmer-only tidak memakai role permission biasa.
# Settings memakai ROLE_OWNER_ADMIN.
# Authenticated endpoint juga bukan permission database.
# ==========================================================

EXPECTED = {

    # ======================================================
    # OWNER
    # ======================================================

    "owner": {

        "barang.view": True,
        "barang.create": True,
        "barang.update": True,
        "barang.delete": True,

        "kategori.view": True,
        "kategori.create": True,
        "kategori.update": True,
        "kategori.delete": True,

        "supplier.view": True,
        "supplier.create": True,
        "supplier.update": True,
        "supplier.delete": True,

        "pelanggan.view": True,
        "pelanggan.create": True,
        "pelanggan.update": True,
        "pelanggan.delete": True,

        "penjualan.view": True,
        "penjualan.create": True,
        "penjualan.delete": True,

        "pembelian.view": True,
        "pembelian.create": True,

        "stok.view": True,
        "stok.adjust": True,

        "mutasi_stok.view": True,

        "stock_opname.view": True,
        "stock_opname.create": True,
        "stock_opname.approve": True,

        "retur_penjualan.view": True,
        "retur_penjualan.create": True,
        "retur_penjualan.update": True,
        "retur_penjualan.delete": True,

        "retur_pembelian.view": True,
        "retur_pembelian.create": True,
        "retur_pembelian.update": True,
        "retur_pembelian.delete": True,

        "laporan.view": True,
        "laporan.export": True,
        "laporan.laba_rugi": True,

        "kitab.view": True,
        "kitab.search": True,

        "muamalah.view": True,
    },


    # ======================================================
    # ADMIN
    # ======================================================

    "admin": {

        "barang.view": True,
        "barang.create": True,
        "barang.update": True,
        "barang.delete": True,

        "kategori.view": True,
        "kategori.create": True,
        "kategori.update": True,
        "kategori.delete": True,

        "supplier.view": True,
        "supplier.create": True,
        "supplier.update": True,
        "supplier.delete": True,

        "pelanggan.view": True,
        "pelanggan.create": True,
        "pelanggan.update": True,
        "pelanggan.delete": True,

        "penjualan.view": True,
        "penjualan.create": True,
        "penjualan.delete": True,

        "pembelian.view": True,
        "pembelian.create": True,

        "stok.view": True,
        "stok.adjust": True,

        "mutasi_stok.view": True,

        "stock_opname.view": True,
        "stock_opname.create": True,
        "stock_opname.approve": True,

        "retur_penjualan.view": True,
        "retur_penjualan.create": True,
        "retur_penjualan.update": True,
        "retur_penjualan.delete": True,

        "retur_pembelian.view": True,
        "retur_pembelian.create": True,
        "retur_pembelian.update": True,
        "retur_pembelian.delete": True,

        "laporan.view": True,
        "laporan.export": True,
        "laporan.laba_rugi": False,

        "kitab.view": True,
        "kitab.search": True,

        "muamalah.view": True,
    },


    # ======================================================
    # KASIR
    # ======================================================

    "kasir": {

        "barang.view": True,
        "barang.create": False,
        "barang.update": False,
        "barang.delete": False,

        "kategori.view": True,
        "kategori.create": False,
        "kategori.update": False,
        "kategori.delete": False,

        "supplier.view": True,
        "supplier.create": False,
        "supplier.update": False,
        "supplier.delete": False,

        "pelanggan.view": True,
        "pelanggan.create": True,
        "pelanggan.update": True,
        "pelanggan.delete": False,

        "penjualan.view": True,
        "penjualan.create": True,
        "penjualan.delete": False,

        "pembelian.view": True,
        "pembelian.create": False,

        "stok.view": True,
        "stok.adjust": False,

        "mutasi_stok.view": True,

        "stock_opname.view": True,
        "stock_opname.create": False,
        "stock_opname.approve": False,

        "retur_penjualan.view": True,
        "retur_penjualan.create": True,
        "retur_penjualan.update": False,
        "retur_penjualan.delete": False,

        "retur_pembelian.view": False,
        "retur_pembelian.create": False,
        "retur_pembelian.update": False,
        "retur_pembelian.delete": False,

        "laporan.view": True,
        "laporan.export": True,
        "laporan.laba_rugi": False,

        "kitab.view": True,
        "kitab.search": True,

        "muamalah.view": True,
    },


    # ======================================================
    # GUDANG
    # ======================================================

    "gudang": {

        "barang.view": True,
        "barang.create": False,
        "barang.update": False,
        "barang.delete": False,

        "kategori.view": True,
        "kategori.create": False,
        "kategori.update": False,
        "kategori.delete": False,

        "supplier.view": True,
        "supplier.create": False,
        "supplier.update": False,
        "supplier.delete": False,

        "pelanggan.view": True,
        "pelanggan.create": False,
        "pelanggan.update": False,
        "pelanggan.delete": False,

        "penjualan.view": True,
        "penjualan.create": False,
        "penjualan.delete": False,

        "pembelian.view": True,
        "pembelian.create": False,

        "stok.view": True,
        "stok.adjust": True,

        "mutasi_stok.view": True,

        "stock_opname.view": True,
        "stock_opname.create": True,
        "stock_opname.approve": False,

        "retur_penjualan.view": True,
        "retur_penjualan.create": False,
        "retur_penjualan.update": False,
        "retur_penjualan.delete": False,

        "retur_pembelian.view": True,
        "retur_pembelian.create": True,
        "retur_pembelian.update": True,
        "retur_pembelian.delete": True,

        "laporan.view": True,
        "laporan.export": True,
        "laporan.laba_rugi": False,

        "kitab.view": True,
        "kitab.search": True,

        "muamalah.view": True,
    },


    # ======================================================
    # AKUNTAN
    # ======================================================

    "akuntan": {

        "barang.view": True,
        "barang.create": False,
        "barang.update": False,
        "barang.delete": False,

        "kategori.view": True,
        "kategori.create": False,
        "kategori.update": False,
        "kategori.delete": False,

        "supplier.view": True,
        "supplier.create": False,
        "supplier.update": False,
        "supplier.delete": False,

        "pelanggan.view": True,
        "pelanggan.create": False,
        "pelanggan.update": False,
        "pelanggan.delete": False,

        "penjualan.view": True,
        "penjualan.create": False,
        "penjualan.delete": False,

        "pembelian.view": True,
        "pembelian.create": False,

        "stok.view": True,
        "stok.adjust": False,

        "mutasi_stok.view": True,

        "stock_opname.view": True,
        "stock_opname.create": False,
        "stock_opname.approve": False,

        "retur_penjualan.view": True,
        "retur_penjualan.create": False,
        "retur_penjualan.update": False,
        "retur_penjualan.delete": False,

        "retur_pembelian.view": False,
        "retur_pembelian.create": False,
        "retur_pembelian.update": False,
        "retur_pembelian.delete": False,

        "laporan.view": True,
        "laporan.export": True,
        "laporan.laba_rugi": True,

        "kitab.view": True,
        "kitab.search": True,

        "muamalah.view": True,
    },
}


# ==========================================================
# AUDIT
# ==========================================================

def main():

    print()
    print("=" * 100)
    print("AUDIT ROLE -> PERMISSION")
    print("=" * 100)

    db = SessionLocal()

    try:

        # --------------------------------------------------
        # AMBIL ROLE
        # --------------------------------------------------

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

        # --------------------------------------------------
        # AMBIL PERMISSION
        # --------------------------------------------------

        permission_rows = (
            db.query(Permission)
            .filter(
                Permission.aktif.is_(True)
            )
            .all()
        )

        permission_map = {
            str(permission.kode)
            .strip(): permission
            for permission in permission_rows
        }

        # --------------------------------------------------
        # CEK ROLE
        # --------------------------------------------------

        missing_roles = []

        for role_code in ROLE_ORDER:

            if role_code not in role_map:

                missing_roles.append(
                    role_code
                )

        if missing_roles:

            print()
            print(
                "❌ ROLE TIDAK DITEMUKAN:"
            )

            for role_code in missing_roles:

                print(
                    f"   - {role_code}"
                )

        else:

            print()
            print(
                "✅ Semua 5 role ditemukan."
            )

        # --------------------------------------------------
        # CEK PERMISSION
        # --------------------------------------------------

        missing_permissions = []

        for permission_code in PERMISSIONS:

            if (
                permission_code
                not in permission_map
            ):

                missing_permissions.append(
                    permission_code
                )

        if missing_permissions:

            print()
            print(
                "❌ PERMISSION TIDAK DITEMUKAN:"
            )

            for permission_code in (
                missing_permissions
            ):

                print(
                    f"   - {permission_code}"
                )

        else:

            print(
                "✅ Semua permission audit ditemukan."
            )

        # --------------------------------------------------
        # AUDIT ROLE
        # --------------------------------------------------

        total_fail = 0

        print()

        print(
            "=" * 100
        )

        print(
            "HASIL PER ROLE"
        )

        print(
            "=" * 100
        )

        for role_code in ROLE_ORDER:

            print()

            print(
                f"[{role_code.upper()}]"
            )

            print(
                "-" * 100
            )

            role = role_map.get(
                role_code
            )

            if role is None:

                print(
                    "❌ Role tidak ditemukan."
                )

                total_fail += 1

                continue

            # --------------------------------------------------
            # PERMISSION AKTUAL
            # --------------------------------------------------

            actual_permission_ids = {
                row.permission_id

                for row
                in (
                    db.query(
                        RolePermission
                    )
                    .filter(
                        RolePermission.role_id
                        == role.id,

                        RolePermission.aktif.is_(
                            True
                        ),
                    )
                    .all()
                )
            }

            # --------------------------------------------------
            # BANDINGKAN
            # --------------------------------------------------

            role_fail = 0

            for permission_code in PERMISSIONS:

                permission = (
                    permission_map.get(
                        permission_code
                    )
                )

                if permission is None:

                    continue

                actual = (
                    permission.id
                    in actual_permission_ids
                )

                expected = (
                    EXPECTED[
                        role_code
                    ].get(
                        permission_code,
                        False,
                    )
                )

                if actual == expected:

                    status = "✅"

                else:

                    status = "❌"

                    role_fail += 1
                    total_fail += 1

                print(
                    f"{status} "
                    f"{permission_code:<35} "
                    f"expected={str(expected):<5} "
                    f"actual={str(actual):<5}"
                )

            if role_fail == 0:

                print()

                print(
                    "✅ ROLE PASS"
                )

            else:

                print()

                print(
                    f"❌ ROLE FAIL "
                    f"({role_fail} perbedaan)"
                )

        # --------------------------------------------------
        # OVERVIEW
        # --------------------------------------------------

        print()

        print(
            "=" * 100
        )

        print(
            "HASIL AKHIR AUDIT ROLE"
        )

        print(
            "=" * 100
        )

        print(
            f"Jumlah role diuji       : {len(ROLE_ORDER)}"
        )

        print(
            f"Jumlah permission diuji : {len(PERMISSIONS)}"
        )

        print(
            f"Total perbedaan         : {total_fail}"
        )

        if (
            not missing_roles
            and not missing_permissions
            and total_fail == 0
        ):

            print()

            print(
                "✅ STATUS FINAL : PASS"
            )

            print(
                "Role dan permission database "
                "sesuai matriks yang ditetapkan."
            )

            return 0

        print()

        print(
            "❌ STATUS FINAL : FAIL"
        )

        print(
            "Ada role/permission yang belum "
            "sesuai. DATABASE TIDAK DIUBAH."
        )

        return 1

    finally:

        db.close()


# ==========================================================
# ENTRY POINT
# ==========================================================

if __name__ == "__main__":

    raise SystemExit(
        main()
    )