from sqlalchemy.orm import Session

from app.repositories.kitab_file_repository import (
    kitab_file_repository,
)

from app.services.kitab_kuning.file_mapper import (
    scan_folder_kitab,
)


class KitabImportService:

    # ========================================================
    # SCAN + REGISTER FILE KITAB
    # ========================================================

    @staticmethod
    def scan_and_register(
        db: Session,
        root_folder: str,
    ):

        # ----------------------------------------------------
        # SCAN FOLDER
        # ----------------------------------------------------

        files = scan_folder_kitab(
            root_folder
        )

        hasil = []

        registered = 0
        skipped = 0

        # ----------------------------------------------------
        # PROSES SETIAP FILE
        # ----------------------------------------------------

        for item in files:

            # =================================================
            # CEK DUPLIKAT BERDASARKAN SHA256
            # =================================================

            sudah_ada = (
                kitab_file_repository
                .exists_by_sha256(
                    db,
                    item["sha256"],
                )
            )

            if sudah_ada:

                skipped += 1

                hasil.append(
                    {
                        "status": "SKIP",

                        "file": item[
                            "nama_file"
                        ],

                        "kitab": item[
                            "kitab"
                        ],

                        "kategori": item[
                            "kategori"
                        ],

                        "message": (
                            "File sudah "
                            "terdaftar."
                        ),
                    }
                )

                continue

            # =================================================
            # REGISTER FILE BARU
            # =================================================

            file_id = (
                kitab_file_repository.create(
                    db,
                    item,
                )
            )

            registered += 1

            hasil.append(
                {
                    "status": "REGISTERED",

                    "id": file_id,

                    "file": item[
                        "nama_file"
                    ],

                    "kitab": item[
                        "kitab"
                    ],

                    "kategori": item[
                        "kategori"
                    ],

                    "message": (
                        "File berhasil "
                        "didaftarkan."
                    ),
                }
            )

        # ----------------------------------------------------
        # COMMIT
        # ----------------------------------------------------

        db.commit()

        # ----------------------------------------------------
        # HASIL
        # ----------------------------------------------------

        return {
            "success": True,

            "total_file_ditemukan": len(
                files
            ),

            "total_registered": registered,

            "total_skipped": skipped,

            "hasil": hasil,
        }


# ============================================================
# INSTANCE
# ============================================================

kitab_import_service = KitabImportService()