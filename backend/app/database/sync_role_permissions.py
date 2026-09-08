from app.core.database import SessionLocal
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission


ROLE_PERMISSIONS = {
    "owner": [
        "barang.view", "barang.create", "barang.update", "barang.delete",
        "kategori.view", "kategori.create", "kategori.update", "kategori.delete",
        "supplier.view", "supplier.create", "supplier.update", "supplier.delete",
        "pelanggan.view", "pelanggan.create", "pelanggan.update", "pelanggan.delete",
        "penjualan.view", "penjualan.create", "penjualan.update", "penjualan.delete",
        "pembelian.view", "pembelian.create", "pembelian.update", "pembelian.delete",
        "stok.view", "stok.adjust",
        "mutasi_stok.view",

        "retur_penjualan.view", "retur_penjualan.create",
        "retur_penjualan.update", "retur_penjualan.delete",

        "retur_pembelian.view", "retur_pembelian.create",
        "retur_pembelian.update", "retur_pembelian.delete",
        "retur_pembelian.approve", "retur_pembelian.reject",

        "laporan.view", "laporan.export", "laporan.laba_rugi",
        "dashboard.view",
        "muamalah.view",
        "kitab.view", "kitab.search", "kitab.translate", "kitab.explain",
        "zakat.view",
        "user.view", "user.create", "user.update", "user.delete",
        "hak_akses.view", "hak_akses.update",
        "stock_opname.view", "stock_opname.create",
        "stock_opname.update", "stock_opname.approve",
    ],

    "admin": [
        "barang.view", "barang.create", "barang.update", "barang.delete",
        "kategori.view", "kategori.create", "kategori.update", "kategori.delete",
        "supplier.view", "supplier.create", "supplier.update", "supplier.delete",
        "pelanggan.view", "pelanggan.create", "pelanggan.update", "pelanggan.delete",
        "penjualan.view", "penjualan.create", "penjualan.update", "penjualan.delete",
        "pembelian.view", "pembelian.create", "pembelian.update", "pembelian.delete",
        "stok.view", "stok.adjust",
        "mutasi_stok.view",

        "retur_penjualan.view", "retur_penjualan.create",
        "retur_penjualan.update", "retur_penjualan.delete",

        "retur_pembelian.view", "retur_pembelian.create",
        "retur_pembelian.update",
        "retur_pembelian.approve", "retur_pembelian.reject",

        "laporan.view", "laporan.export",
        "dashboard.view",
        "muamalah.view",
        "kitab.view", "kitab.search", "kitab.translate", "kitab.explain",
        "zakat.view",
        "user.view", "user.create", "user.update",
        "stock_opname.view", "stock_opname.create",
        "stock_opname.update", "stock_opname.approve",
    ],

    "kasir": [
        "barang.view",
        "kategori.view",
        "supplier.view",
        "pelanggan.view",
        "pelanggan.create",
        "pelanggan.update",
        "penjualan.view",
        "penjualan.create",
        "stok.view",
        "mutasi_stok.view",
        "retur_penjualan.view",
        "retur_penjualan.create",
        "dashboard.view",
        "muamalah.view",
        "kitab.view",
        "kitab.search",
        "kitab.translate",
        "kitab.explain",
        "zakat.view",
    ],

    "gudang": [
        "barang.view",
        "kategori.view",
        "supplier.view",
        "pelanggan.view",
        "penjualan.view",
        "pembelian.view",
        "stok.view",
        "stok.adjust",
        "mutasi_stok.view",

        "retur_penjualan.view",

        "retur_pembelian.view",
        "retur_pembelian.create",
        "retur_pembelian.update",
        "retur_pembelian.update",

        "dashboard.view",
        "muamalah.view",
        "kitab.view",
        "kitab.search",
        "kitab.translate",
        "kitab.explain",
        "zakat.view",
        "stock_opname.view",
        "stock_opname.create",
        "stock_opname.update",
    ],

    "akuntan": [
        "barang.view",
        "supplier.view",
        "pelanggan.view",
        "penjualan.view",
        "pembelian.view",
        "stok.view",
        "mutasi_stok.view",

        "retur_penjualan.view",
        "retur_pembelian.view",

        "laporan.view",
        "laporan.export",
        "laporan.laba_rugi",
        "dashboard.view",
        "muamalah.view",
        "kitab.view",
        "kitab.search",
        "kitab.translate",
        "kitab.explain",
        "zakat.view",
    ],
}


def main():
    db = SessionLocal()

    try:
        print("=" * 70)
        print("SINKRONISASI ROLE PERMISSIONS")
        print("=" * 70)

        all_permissions = {
            p.kode: p
            for p in db.query(Permission).all()
        }

        roles = {
            r.kode: r
            for r in db.query(Role).all()
        }

        # Validasi role
        for role_code in ROLE_PERMISSIONS:
            if role_code not in roles:
                raise RuntimeError(
                    f"Role tidak ditemukan: {role_code}"
                )

        # Validasi permission
        missing = []

        for role_code, permission_codes in ROLE_PERMISSIONS.items():
            for code in permission_codes:
                if code not in all_permissions:
                    missing.append(code)

        if missing:
            missing = sorted(set(missing))
            raise RuntimeError(
                "Permission tidak ditemukan: "
                + ", ".join(missing)
            )

        # Sinkronisasi
        for role_code, wanted_codes in ROLE_PERMISSIONS.items():

            role = roles[role_code]
            wanted_ids = {
                all_permissions[code].id
                for code in wanted_codes
            }

            current_rows = (
                db.query(RolePermission)
                .filter(
                    RolePermission.role_id == role.id
                )
                .all()
            )

            current_map = {
                row.permission_id: row
                for row in current_rows
            }

            # Aktifkan / buat yang seharusnya aktif
            for permission_id in wanted_ids:

                row = current_map.get(permission_id)

                if row is None:
                    db.add(
                        RolePermission(
                            role_id=role.id,
                            permission_id=permission_id,
                            aktif=True,
                        )
                    )
                else:
                    row.aktif = True

            # Nonaktifkan yang tidak termasuk matriks final
            for row in current_rows:
                if row.permission_id not in wanted_ids:
                    row.aktif = False

        db.commit()

        print("\nSINKRONISASI BERHASIL")
        print("\nREKAP FINAL:")

        for role_code in ROLE_PERMISSIONS:

            role = roles[role_code]

            total = (
                db.query(RolePermission)
                .filter(
                    RolePermission.role_id == role.id,
                    RolePermission.aktif.is_(True),
                )
                .count()
            )

            print(
                f"{role_code:<10} "
                f"{role.nama:<20} "
                f"{total} permission"
            )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()