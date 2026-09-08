from sqlalchemy import text
from sqlalchemy.orm import Session


class KitabFileRepository:

    # ========================================================
    # CEK FILE BERDASARKAN SHA256
    # ========================================================

    @staticmethod
    def exists_by_sha256(
        db: Session,
        sha256: str,
    ) -> bool:

        result = db.execute(
            text(
                """
                SELECT id
                FROM kitab_file
                WHERE sha256 = :sha256
                LIMIT 1
                """
            ),
            {
                "sha256": sha256,
            },
        )

        return result.first() is not None

    # ========================================================
    # TAMBAH FILE KITAB
    # ========================================================

    @staticmethod
    def create(
        db: Session,
        data: dict,
    ):

        result = db.execute(
            text(
                """
                INSERT INTO kitab_file (
                    kategori,
                    kitab,
                    nama_file,
                    path_file,
                    nomor_juz,
                    format_file,
                    ukuran_file,
                    sha256,
                    status_import
                )
                VALUES (
                    :kategori,
                    :kitab,
                    :nama_file,
                    :path_file,
                    :nomor_juz,
                    :format_file,
                    :ukuran_file,
                    :sha256,
                    'BELUM_IMPORT'
                )
                """
            ),
            {
                "kategori": data["kategori"],
                "kitab": data["kitab"],
                "nama_file": data["nama_file"],
                "path_file": data["path_file"],
                "nomor_juz": data["nomor_juz"],
                "format_file": data["format_file"],
                "ukuran_file": data["ukuran_file"],
                "sha256": data["sha256"],
            },
        )

        return result.lastrowid

    # ========================================================
    # AMBIL SEMUA FILE KITAB
    # ========================================================

    @staticmethod
    def get_all(
        db: Session,
    ):

        result = db.execute(
            text(
                """
                SELECT
                    id,
                    kategori,
                    kitab,
                    nama_file,
                    path_file,
                    nomor_juz,
                    halaman_awal,
                    halaman_akhir,
                    format_file,
                    ukuran_file,
                    sha256,
                    status_import,
                    jumlah_halaman,
                    created_at,
                    updated_at
                FROM kitab_file
                ORDER BY
                    kategori,
                    kitab,
                    nomor_juz,
                    nama_file
                """
            )
        )

        return result.mappings().all()


# ============================================================
# INSTANCE
# ============================================================

kitab_file_repository = KitabFileRepository()