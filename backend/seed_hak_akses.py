# ==========================================================
# SEED HAK AKSES KASIR AI
# ==========================================================
#
# Fungsi:
# 1. Membuat role default jika belum ada
# 2. Membuat permission default jika belum ada
# 3. Menghubungkan role dengan permission
#
# Script aman dijalankan berulang kali.
# Tidak menghapus data lama.
# ==========================================================

from sqlalchemy import select

from app.core.database import SessionLocal

from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission


# ==========================================================
# ROLE DEFAULT
# ==========================================================

ROLES = [
    {
        "kode": "owner",
        "nama": "Owner",
        "deskripsi": "Pemilik usaha dengan akses penuh sistem.",
    },
    {
        "kode": "admin",
        "nama": "Administrator",
        "deskripsi": "Pengelola sistem dan administrasi.",
    },
    {
        "kode": "kasir",
        "nama": "Kasir",
        "deskripsi": "Pengguna untuk operasional transaksi penjualan.",
    },
    {
        "kode": "gudang",
        "nama": "Gudang",
        "deskripsi": "Pengguna untuk pengelolaan stok dan gudang.",
    },
    {
        "kode": "akuntan",
        "nama": "Akuntan",
        "deskripsi": "Pengguna untuk laporan dan administrasi keuangan.",
    },
]


# ==========================================================
# PERMISSION DEFAULT
# ==========================================================

PERMISSIONS = [

    # ------------------------------------------------------
    # BARANG
    # ------------------------------------------------------

    {
        "kode": "barang.view",
        "nama": "Lihat Barang",
        "modul": "barang",
        "aksi": "view",
        "deskripsi": "Melihat data barang.",
    },

    {
        "kode": "barang.create",
        "nama": "Tambah Barang",
        "modul": "barang",
        "aksi": "create",
        "deskripsi": "Menambahkan barang baru.",
    },

    {
        "kode": "barang.update",
        "nama": "Ubah Barang",
        "modul": "barang",
        "aksi": "update",
        "deskripsi": "Mengubah data barang.",
    },

    {
        "kode": "barang.delete",
        "nama": "Hapus Barang",
        "modul": "barang",
        "aksi": "delete",
        "deskripsi": "Menghapus barang.",
    },


    # ------------------------------------------------------
    # KATEGORI
    # ------------------------------------------------------

    {
        "kode": "kategori.view",
        "nama": "Lihat Kategori",
        "modul": "kategori",
        "aksi": "view",
        "deskripsi": "Melihat kategori barang.",
    },

    {
        "kode": "kategori.create",
        "nama": "Tambah Kategori",
        "modul": "kategori",
        "aksi": "create",
        "deskripsi": "Menambahkan kategori.",
    },

    {
        "kode": "kategori.update",
        "nama": "Ubah Kategori",
        "modul": "kategori",
        "aksi": "update",
        "deskripsi": "Mengubah kategori.",
    },

    {
        "kode": "kategori.delete",
        "nama": "Hapus Kategori",
        "modul": "kategori",
        "aksi": "delete",
        "deskripsi": "Menghapus kategori.",
    },


    # ------------------------------------------------------
    # SUPPLIER
    # ------------------------------------------------------

    {
        "kode": "supplier.view",
        "nama": "Lihat Supplier",
        "modul": "supplier",
        "aksi": "view",
        "deskripsi": "Melihat supplier.",
    },

    {
        "kode": "supplier.create",
        "nama": "Tambah Supplier",
        "modul": "supplier",
        "aksi": "create",
        "deskripsi": "Menambahkan supplier.",
    },

    {
        "kode": "supplier.update",
        "nama": "Ubah Supplier",
        "modul": "supplier",
        "aksi": "update",
        "deskripsi": "Mengubah supplier.",
    },

    {
        "kode": "supplier.delete",
        "nama": "Hapus Supplier",
        "modul": "supplier",
        "aksi": "delete",
        "deskripsi": "Menghapus supplier.",
    },


    # ------------------------------------------------------
    # PELANGGAN
    # ------------------------------------------------------

    {
        "kode": "pelanggan.view",
        "nama": "Lihat Pelanggan",
        "modul": "pelanggan",
        "aksi": "view",
        "deskripsi": "Melihat data pelanggan.",
    },

    {
        "kode": "pelanggan.create",
        "nama": "Tambah Pelanggan",
        "modul": "pelanggan",
        "aksi": "create",
        "deskripsi": "Menambahkan pelanggan.",
    },

    {
        "kode": "pelanggan.update",
        "nama": "Ubah Pelanggan",
        "modul": "pelanggan",
        "aksi": "update",
        "deskripsi": "Mengubah pelanggan.",
    },

    {
        "kode": "pelanggan.delete",
        "nama": "Hapus Pelanggan",
        "modul": "pelanggan",
        "aksi": "delete",
        "deskripsi": "Menghapus pelanggan.",
    },


    # ------------------------------------------------------
    # PENJUALAN
    # ------------------------------------------------------

    {
        "kode": "penjualan.view",
        "nama": "Lihat Penjualan",
        "modul": "penjualan",
        "aksi": "view",
        "deskripsi": "Melihat transaksi penjualan.",
    },

    {
        "kode": "penjualan.create",
        "nama": "Buat Penjualan",
        "modul": "penjualan",
        "aksi": "create",
        "deskripsi": "Membuat transaksi penjualan.",
    },

    {
        "kode": "penjualan.update",
        "nama": "Ubah Penjualan",
        "modul": "penjualan",
        "aksi": "update",
        "deskripsi": "Mengubah transaksi penjualan.",
    },

    {
        "kode": "penjualan.delete",
        "nama": "Hapus Penjualan",
        "modul": "penjualan",
        "aksi": "delete",
        "deskripsi": "Menghapus transaksi penjualan.",
    },


    # ------------------------------------------------------
    # PEMBELIAN
    # ------------------------------------------------------

    {
        "kode": "pembelian.view",
        "nama": "Lihat Pembelian",
        "modul": "pembelian",
        "aksi": "view",
        "deskripsi": "Melihat transaksi pembelian.",
    },

    {
        "kode": "pembelian.create",
        "nama": "Buat Pembelian",
        "modul": "pembelian",
        "aksi": "create",
        "deskripsi": "Membuat transaksi pembelian.",
    },

    {
        "kode": "pembelian.update",
        "nama": "Ubah Pembelian",
        "modul": "pembelian",
        "aksi": "update",
        "deskripsi": "Mengubah transaksi pembelian.",
    },

    {
        "kode": "pembelian.delete",
        "nama": "Hapus Pembelian",
        "modul": "pembelian",
        "aksi": "delete",
        "deskripsi": "Menghapus transaksi pembelian.",
    },


    # ------------------------------------------------------
    # STOK
    # ------------------------------------------------------

    {
        "kode": "stok.view",
        "nama": "Lihat Stok",
        "modul": "stok",
        "aksi": "view",
        "deskripsi": "Melihat stok barang.",
    },

    {
        "kode": "stok.adjust",
        "nama": "Penyesuaian Stok",
        "modul": "stok",
        "aksi": "adjust",
        "deskripsi": "Melakukan penyesuaian stok.",
    },


    # ------------------------------------------------------
    # MUTASI STOK
    # ------------------------------------------------------

    {
        "kode": "mutasi_stok.view",
        "nama": "Lihat Mutasi Stok",
        "modul": "mutasi_stok",
        "aksi": "view",
        "deskripsi": "Melihat riwayat mutasi stok.",
    },


    # ------------------------------------------------------
    # RETUR PENJUALAN
    # ------------------------------------------------------

    {
        "kode": "retur_penjualan.view",
        "nama": "Lihat Retur Penjualan",
        "modul": "retur_penjualan",
        "aksi": "view",
        "deskripsi": "Melihat retur penjualan.",
    },

    {
        "kode": "retur_penjualan.create",
        "nama": "Buat Retur Penjualan",
        "modul": "retur_penjualan",
        "aksi": "create",
        "deskripsi": "Membuat retur penjualan.",
    },


    # ------------------------------------------------------
    # RETUR PEMBELIAN
    # ------------------------------------------------------

    {
        "kode": "retur_pembelian.view",
        "nama": "Lihat Retur Pembelian",
        "modul": "retur_pembelian",
        "aksi": "view",
        "deskripsi": "Melihat retur pembelian.",
    },

    {
        "kode": "retur_pembelian.create",
        "nama": "Buat Retur Pembelian",
        "modul": "retur_pembelian",
        "aksi": "create",
        "deskripsi": "Membuat retur pembelian.",
    },


    # ------------------------------------------------------
    # LAPORAN
    # ------------------------------------------------------

    {
        "kode": "laporan.view",
        "nama": "Lihat Laporan",
        "modul": "laporan",
        "aksi": "view",
        "deskripsi": "Melihat laporan.",
    },

    {
        "kode": "laporan.export",
        "nama": "Export Laporan",
        "modul": "laporan",
        "aksi": "export",
        "deskripsi": "Mengekspor laporan.",
    },


    # ------------------------------------------------------
    # DASHBOARD
    # ------------------------------------------------------

    {
        "kode": "dashboard.view",
        "nama": "Lihat Dashboard",
        "modul": "dashboard",
        "aksi": "view",
        "deskripsi": "Melihat dashboard.",
    },


    # ------------------------------------------------------
    # AI MUAMALAH
    # ------------------------------------------------------

    {
        "kode": "muamalah.view",
        "nama": "Lihat AI Muamalah",
        "modul": "muamalah",
        "aksi": "view",
        "deskripsi": "Menggunakan modul AI Muamalah.",
    },


    # ------------------------------------------------------
    # AI KITAB KUNING
    # ------------------------------------------------------

    {
        "kode": "kitab.view",
        "nama": "Lihat AI Kitab",
        "modul": "kitab",
        "aksi": "view",
        "deskripsi": "Mengakses modul AI Kitab Kuning.",
    },

    {
        "kode": "kitab.search",
        "nama": "Cari Ibarat Kitab",
        "modul": "kitab",
        "aksi": "search",
        "deskripsi": "Mencari ibarat dalam database kitab.",
    },

    {
        "kode": "kitab.translate",
        "nama": "Terjemahkan Kitab",
        "modul": "kitab",
        "aksi": "translate",
        "deskripsi": "Menggunakan AI untuk menerjemahkan teks Arab.",
    },

    {
        "kode": "kitab.explain",
        "nama": "Jelaskan Kitab",
        "modul": "kitab",
        "aksi": "explain",
        "deskripsi": "Menggunakan AI untuk menjelaskan teks kitab.",
    },


    # ------------------------------------------------------
    # AI ZAKAT
    # ------------------------------------------------------

    {
        "kode": "zakat.view",
        "nama": "Lihat AI Zakat",
        "modul": "zakat",
        "aksi": "view",
        "deskripsi": "Mengakses modul AI Zakat.",
    },


    # ------------------------------------------------------
    # USER
    # ------------------------------------------------------

    {
        "kode": "user.view",
        "nama": "Lihat Pengguna",
        "modul": "user",
        "aksi": "view",
        "deskripsi": "Melihat pengguna sistem.",
    },

    {
        "kode": "user.create",
        "nama": "Tambah Pengguna",
        "modul": "user",
        "aksi": "create",
        "deskripsi": "Membuat pengguna baru.",
    },

    {
        "kode": "user.update",
        "nama": "Ubah Pengguna",
        "modul": "user",
        "aksi": "update",
        "deskripsi": "Mengubah pengguna.",
    },

    {
        "kode": "user.delete",
        "nama": "Hapus Pengguna",
        "modul": "user",
        "aksi": "delete",
        "deskripsi": "Menghapus pengguna.",
    },


    # ------------------------------------------------------
    # HAK AKSES
    # ------------------------------------------------------

    {
        "kode": "hak_akses.view",
        "nama": "Lihat Hak Akses",
        "modul": "hak_akses",
        "aksi": "view",
        "deskripsi": "Melihat konfigurasi hak akses.",
    },

    {
        "kode": "hak_akses.update",
        "nama": "Ubah Hak Akses",
        "modul": "hak_akses",
        "aksi": "update",
        "deskripsi": "Mengubah hak akses role.",
    },
]


# ==========================================================
# PERMISSION PER ROLE
# ==========================================================

ROLE_PERMISSION_MAP = {

    # ======================================================
    # OWNER
    # ======================================================

    "owner": "ALL",

    # ======================================================
    # ADMIN
    # ======================================================

    "admin": [
        "dashboard.view",

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
        "penjualan.update",
        "penjualan.delete",

        "pembelian.view",
        "pembelian.create",
        "pembelian.update",
        "pembelian.delete",

        "stok.view",
        "stok.adjust",

        "mutasi_stok.view",

        "retur_penjualan.view",
        "retur_penjualan.create",

        "retur_pembelian.view",
        "retur_pembelian.create",

        "laporan.view",
        "laporan.export",

        "muamalah.view",

        "kitab.view",
        "kitab.search",
        "kitab.translate",
        "kitab.explain",

        "zakat.view",

        "user.view",
        "user.create",
        "user.update",
        "user.delete",

        "hak_akses.view",
        "hak_akses.update",
    ],

    # ======================================================
    # KASIR
    # ======================================================

    "kasir": [
        "dashboard.view",

        "barang.view",

        "kategori.view",

        "pelanggan.view",
        "pelanggan.create",
        "pelanggan.update",

        "penjualan.view",
        "penjualan.create",

        "retur_penjualan.view",
        "retur_penjualan.create",

        "kitab.view",
        "kitab.search",
        "kitab.translate",
        "kitab.explain",

        "muamalah.view",

        "zakat.view",
    ],

    # ======================================================
    # GUDANG
    # ======================================================

    "gudang": [
        "dashboard.view",

        "barang.view",
        "barang.create",
        "barang.update",

        "kategori.view",

        "supplier.view",

        "stok.view",
        "stok.adjust",

        "mutasi_stok.view",

        "pembelian.view",
        "pembelian.create",

        "retur_pembelian.view",
        "retur_pembelian.create",

        "kitab.view",
        "kitab.search",
    ],

    # ======================================================
    # AKUNTAN
    # ======================================================

    "akuntan": [
        "dashboard.view",

        "barang.view",

        "pelanggan.view",

        "supplier.view",

        "penjualan.view",

        "pembelian.view",

        "retur_penjualan.view",

        "retur_pembelian.view",

        "laporan.view",
        "laporan.export",

        "zakat.view",

        "muamalah.view",

        "kitab.view",
        "kitab.search",
        "kitab.translate",
        "kitab.explain",
    ],
}


# ==========================================================
# CREATE / GET ROLE
# ==========================================================

def get_or_create_role(
    db,
    kode,
    nama,
    deskripsi,
):

    role = db.execute(
        select(Role).where(
            Role.kode == kode
        )
    ).scalar_one_or_none()

    if role is None:

        role = Role(
            kode=kode,
            nama=nama,
            deskripsi=deskripsi,
            aktif=True,
        )

        db.add(role)

        db.flush()

        print(
            f"[CREATE ROLE] {kode}"
        )

    else:

        print(
            f"[EXISTS ROLE] {kode}"
        )

    return role


# ==========================================================
# CREATE / GET PERMISSION
# ==========================================================

def get_or_create_permission(
    db,
    data,
):

    permission = db.execute(
        select(Permission).where(
            Permission.kode ==
            data["kode"]
        )
    ).scalar_one_or_none()

    if permission is None:

        permission = Permission(
            kode=data["kode"],
            nama=data["nama"],
            modul=data["modul"],
            aksi=data["aksi"],
            deskripsi=data["deskripsi"],
            aktif=True,
        )

        db.add(permission)

        db.flush()

        print(
            f"[CREATE PERMISSION] "
            f"{data['kode']}"
        )

    else:

        print(
            f"[EXISTS PERMISSION] "
            f"{data['kode']}"
        )

    return permission


# ==========================================================
# CREATE ROLE PERMISSION
# ==========================================================

def ensure_role_permission(
    db,
    role,
    permission,
):

    relation = db.execute(
        select(RolePermission).where(
            RolePermission.role_id ==
            role.id,

            RolePermission.permission_id ==
            permission.id,
        )
    ).scalar_one_or_none()

    if relation is None:

        relation = RolePermission(
            role_id=role.id,
            permission_id=permission.id,
            aktif=True,
        )

        db.add(relation)

        print(
            f"[LINK] "
            f"{role.kode} -> "
            f"{permission.kode}"
        )

    else:

        print(
            f"[EXISTS LINK] "
            f"{role.kode} -> "
            f"{permission.kode}"
        )


# ==========================================================
# MAIN SEED
# ==========================================================

def seed_hak_akses():

    db = SessionLocal()

    try:

        print()
        print("=" * 70)
        print("SEED HAK AKSES KASIR AI")
        print("=" * 70)
        print()


        # --------------------------------------------------
        # ROLE
        # --------------------------------------------------

        roles = {}

        for data in ROLES:

            roles[
                data["kode"]
            ] = get_or_create_role(
                db=db,
                kode=data["kode"],
                nama=data["nama"],
                deskripsi=data["deskripsi"],
            )


        # --------------------------------------------------
        # PERMISSION
        # --------------------------------------------------

        permissions = {}

        for data in PERMISSIONS:

            permissions[
                data["kode"]
            ] = get_or_create_permission(
                db=db,
                data=data,
            )


        # --------------------------------------------------
        # ROLE -> PERMISSION
        # --------------------------------------------------

        for role_code, permission_codes in (
            ROLE_PERMISSION_MAP.items()
        ):

            role = roles.get(
                role_code
            )

            if role is None:

                print(
                    f"[WARNING] Role tidak ditemukan: "
                    f"{role_code}"
                )

                continue


            # OWNER = SEMUA PERMISSION

            if permission_codes == "ALL":

                selected_permissions = (
                    permissions.values()
                )

            else:

                selected_permissions = []

                for permission_code in (
                    permission_codes
                ):

                    permission = permissions.get(
                        permission_code
                    )

                    if permission is None:

                        print(
                            "[WARNING] "
                            "Permission tidak ditemukan: "
                            f"{permission_code}"
                        )

                        continue

                    selected_permissions.append(
                        permission
                    )


            for permission in (
                selected_permissions
            ):

                ensure_role_permission(
                    db=db,
                    role=role,
                    permission=permission,
                )


        # --------------------------------------------------
        # COMMIT
        # --------------------------------------------------

        db.commit()


        print()
        print("=" * 70)
        print("SEED HAK AKSES BERHASIL")
        print("=" * 70)
        print()


    except Exception:

        db.rollback()

        print()
        print("=" * 70)
        print("SEED HAK AKSES GAGAL")
        print("=" * 70)
        print()

        raise


    finally:

        db.close()


# ==========================================================
# ENTRY POINT
# ==========================================================

if __name__ == "__main__":

    seed_hak_akses()