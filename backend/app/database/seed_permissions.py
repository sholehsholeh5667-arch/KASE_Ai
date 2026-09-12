from app.core.database import SessionLocal
from app.models.permission import Permission


PERMISSIONS = [
    # Barang
    ("barang.view", "Lihat Barang", "barang", "view"),
    ("barang.create", "Tambah Barang", "barang", "create"),
    ("barang.update", "Ubah Barang", "barang", "update"),
    ("barang.delete", "Hapus Barang", "barang", "delete"),

    # Kategori
    ("kategori.view", "Lihat Kategori", "kategori", "view"),
    ("kategori.create", "Tambah Kategori", "kategori", "create"),
    ("kategori.update", "Ubah Kategori", "kategori", "update"),
    ("kategori.delete", "Hapus Kategori", "kategori", "delete"),

    # Supplier
    ("supplier.view", "Lihat Supplier", "supplier", "view"),
    ("supplier.create", "Tambah Supplier", "supplier", "create"),
    ("supplier.update", "Ubah Supplier", "supplier", "update"),
    ("supplier.delete", "Hapus Supplier", "supplier", "delete"),

    # Pelanggan
    ("pelanggan.view", "Lihat Pelanggan", "pelanggan", "view"),
    ("pelanggan.create", "Tambah Pelanggan", "pelanggan", "create"),
    ("pelanggan.update", "Ubah Pelanggan", "pelanggan", "update"),
    ("pelanggan.delete", "Hapus Pelanggan", "pelanggan", "delete"),

    # Penjualan
    ("penjualan.view", "Lihat Penjualan", "penjualan", "view"),
    ("penjualan.create", "Tambah Penjualan", "penjualan", "create"),
    ("penjualan.update", "Ubah Penjualan", "penjualan", "update"),
    ("penjualan.delete", "Hapus Penjualan", "penjualan", "delete"),

    # Pembelian
    ("pembelian.view", "Lihat Pembelian", "pembelian", "view"),
    ("pembelian.create", "Tambah Pembelian", "pembelian", "create"),
    ("pembelian.update", "Ubah Pembelian", "pembelian", "update"),
    ("pembelian.delete", "Hapus Pembelian", "pembelian", "delete"),

    # Stok
    ("stok.view", "Lihat Stok", "stok", "view"),
    ("stok.adjust", "Penyesuaian Stok", "stok", "adjust"),

    # Mutasi Stok
    ("mutasi_stok.view", "Lihat Mutasi Stok", "mutasi_stok", "view"),

    # Retur Penjualan
    ("retur_penjualan.view", "Lihat Retur Penjualan", "retur_penjualan", "view"),
    ("retur_penjualan.create", "Tambah Retur Penjualan", "retur_penjualan", "create"),
    ("retur_penjualan.update", "Ubah Retur Penjualan", "retur_penjualan", "update"),
    ("retur_penjualan.delete", "Hapus Retur Penjualan", "retur_penjualan", "delete"),

    # Retur Pembelian
    ("retur_pembelian.view", "Lihat Retur Pembelian", "retur_pembelian", "view"),
    ("retur_pembelian.create", "Tambah Retur Pembelian", "retur_pembelian", "create"),
    ("retur_pembelian.update", "Ubah Retur Pembelian", "retur_pembelian", "update"),
    ("retur_pembelian.delete", "Hapus Retur Pembelian", "retur_pembelian", "delete"),
    ("retur_pembelian.approve", "Setujui Retur Pembelian", "retur_pembelian", "approve"),
    ("retur_pembelian.reject", "Tolak Retur Pembelian", "retur_pembelian", "reject"),

    # Stock Opname
    ("stock_opname.view", "Lihat Stock Opname", "stock_opname", "view"),
    ("stock_opname.create", "Buat Stock Opname", "stock_opname", "create"),
    ("stock_opname.update", "Ubah Stock Opname", "stock_opname", "update"),
    ("stock_opname.approve", "Setujui Stock Opname", "stock_opname", "approve"),

    # Laporan
    ("laporan.view", "Lihat Laporan", "laporan", "view"),
    ("laporan.export", "Export Laporan", "laporan", "export"),
    ("laporan.laba_rugi", "Lihat Laba Rugi", "laporan", "laba_rugi"),

    # Dashboard
    ("dashboard.view", "Lihat Dashboard", "dashboard", "view"),

    # AI Muamalah
    ("muamalah.view", "Lihat AI Muamalah", "muamalah", "view"),

    # AI Kitab Kuning
    ("kitab.view", "Lihat AI Kitab Kuning", "kitab", "view"),
    ("kitab.search", "Pencarian Kitab", "kitab", "search"),
    ("kitab.translate", "Terjemah Kitab", "kitab", "translate"),
    ("kitab.explain", "Penjelasan Kitab", "kitab", "explain"),

    # AI Zakat
    ("zakat.view", "Lihat AI Zakat Tijarah", "zakat", "view"),

    # User
    ("user.view", "Lihat User", "user", "view"),
    ("user.create", "Tambah User", "user", "create"),
    ("user.update", "Ubah User", "user", "update"),
    ("user.delete", "Hapus User", "user", "delete"),

    # Hak Akses
    ("hak_akses.view", "Lihat Hak Akses", "hak_akses", "view"),
    ("hak_akses.update", "Ubah Hak Akses", "hak_akses", "update"),
]


def seed_permissions():
    db = SessionLocal()

    try:
        created = 0
        existing = 0

        for kode, nama, modul, aksi in PERMISSIONS:
            permission = (
                db.query(Permission)
                .filter(Permission.kode == kode)
                .first()
            )

            if permission:
                permission.nama = nama
                permission.modul = modul
                permission.aksi = aksi
                permission.aktif = True
                existing += 1
            else:
                db.add(
                    Permission(
                        kode=kode,
                        nama=nama,
                        modul=modul,
                        aksi=aksi,
                        aktif=True,
                    )
                )
                created += 1

        db.commit()

        print("=" * 60)
        print("SEED PERMISSION BERHASIL")
        print("=" * 60)
        print(f"Permission dibuat : {created}")
        print(f"Permission sudah ada : {existing}")
        print(f"Total permission : {db.query(Permission).count()}")
        print("=" * 60)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_permissions()