from __future__ import annotations

from pathlib import Path
import hashlib
import re
import sqlite3
from typing import Any


# ============================================================
# FILE YANG DIDUKUNG
# ============================================================

SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".txt",
    ".sqlite",
    ".db",
}


# ============================================================
# SQLITE KITAB YANG DIDUKUNG
#
# Database kitab Shamela harus mempunyai:
#   info
#   pages
#   titles
# ============================================================

REQUIRED_SQLITE_TABLES = {
    "info",
    "pages",
    "titles",
}


# ============================================================
# HITUNG SHA256 FILE
# ============================================================

def hitung_sha256(path: Path) -> str:
    sha256 = hashlib.sha256()

    with path.open("rb") as file:
        while True:
            chunk = file.read(1024 * 1024)

            if not chunk:
                break

            sha256.update(chunk)

    return sha256.hexdigest()


# ============================================================
# DETEKSI JUZ DARI NAMA FILE
# ============================================================

def deteksi_juz(nama_file: str) -> int | None:
    nama = nama_file.lower()

    pola = [
        r"juz[_\-\s]*(\d+)",
        r"jilid[_\-\s]*(\d+)",
        r"vol[_\-\s]*(\d+)",
        r"volume[_\-\s]*(\d+)",
    ]

    for pattern in pola:
        match = re.search(pattern, nama)

        if match:
            return int(match.group(1))

    return None


# ============================================================
# DETEKSI FORMAT
# ============================================================

def deteksi_format(path: Path) -> str:
    return path.suffix.lower().replace(".", "")


# ============================================================
# CEK SQLITE FORMAT KITAB
# ============================================================

def sqlite_adalah_kitab(
    path: Path,
) -> bool:

    try:

        conn = sqlite3.connect(
            f"file:{path.resolve().as_posix()}?mode=ro",
            uri=True,
        )

        try:

            rows = conn.execute(
                """
                SELECT name
                FROM sqlite_master
                WHERE type = 'table'
                """
            ).fetchall()

            tables = {
                str(row[0]).lower()
                for row in rows
            }

            return REQUIRED_SQLITE_TABLES.issubset(
                tables
            )

        finally:

            conn.close()

    except Exception:

        return False


# ============================================================
# AMBIL INFO SQLITE
# ============================================================

def ambil_info_sqlite(
    path: Path,
) -> dict[str, str]:

    hasil: dict[str, str] = {}

    try:

        conn = sqlite3.connect(
            f"file:{path.resolve().as_posix()}?mode=ro",
            uri=True,
        )

        try:

            rows = conn.execute(
                """
                SELECT name, value
                FROM info
                """
            ).fetchall()

            for name, value in rows:

                key = str(
                    name or ""
                ).strip()

                val = str(
                    value or ""
                ).strip()

                if key:
                    hasil[key] = val

        finally:

            conn.close()

    except Exception:

        return {}

    return hasil


# ============================================================
# AMBIL NAMA KITAB DARI SQLITE
# ============================================================

def deteksi_nama_kitab_sqlite(
    path: Path,
) -> str:

    info = ambil_info_sqlite(path)

    # Beberapa database Shamela menggunakan
    # variasi nama field metadata.

    kandidat = [
        "booktitle",
        "book_name",
        "bookname",
        "name",
        "title",
        "اسم الكتاب",
    ]

    for key in kandidat:

        value = info.get(key)

        if value:
            return value.strip()

    # Jika metadata tidak memiliki nama kitab,
    # gunakan nama file tanpa extension.

    return path.stem.strip()


# ============================================================
# DETEKSI KATEGORI
# ============================================================

def deteksi_kategori(
    path: Path,
    root: Path,
) -> str:

    try:

        relative = path.relative_to(root)

    except ValueError:

        return "umum"

    parts = relative.parts

    # --------------------------------------------------------
    # Struktur:
    #
    # root/
    #   kategori/
    #       kitab/
    #           file
    # --------------------------------------------------------

    if len(parts) >= 3:

        kategori = parts[0].strip()

        if kategori:
            return kategori

    # --------------------------------------------------------
    # Struktur:
    #
    # root/
    #   file.sqlite
    #
    # atau
    #
    # root/
    #   subfolder/
    #       file.sqlite
    # --------------------------------------------------------

    if len(parts) >= 2:

        folder = parts[0].strip()

        if folder:
            return folder

    return "umum"


# ============================================================
# DETEKSI NAMA KITAB
# ============================================================

def deteksi_nama_kitab(
    path: Path,
    root: Path,
    format_file: str,
) -> str:

    # --------------------------------------------------------
    # SQLITE / DB
    # --------------------------------------------------------

    if format_file in {
        "sqlite",
        "db",
    }:

        nama = deteksi_nama_kitab_sqlite(
            path
        )

        if nama:
            return nama

    # --------------------------------------------------------
    # STRUKTUR FOLDER
    #
    # root/
    #   kategori/
    #       kitab/
    #           file
    # --------------------------------------------------------

    try:

        relative = path.relative_to(root)

        parts = relative.parts

    except ValueError:

        parts = ()

    if len(parts) >= 3:

        kitab = parts[1].strip()

        if kitab:
            return kitab

    # --------------------------------------------------------
    # SUBFOLDER LANGSUNG
    #
    # root/
    #   kitab/
    #       file
    # --------------------------------------------------------

    if len(parts) >= 2:

        kitab = parts[0].strip()

        if kitab:
            return kitab

    # --------------------------------------------------------
    # FALLBACK NAMA FILE
    # --------------------------------------------------------

    return path.stem.strip()


# ============================================================
# BANGUN DATA FILE
# ============================================================

def buat_data_file(
    path: Path,
    root: Path,
) -> dict[str, Any]:

    format_file = deteksi_format(
        path
    )

    ukuran_file = path.stat().st_size

    sha256 = hitung_sha256(
        path
    )

    nomor_juz = deteksi_juz(
        path.name
    )

    kategori = deteksi_kategori(
        path,
        root,
    )

    kitab = deteksi_nama_kitab(
        path,
        root,
        format_file,
    )

    return {
        "kategori": kategori,

        "kitab": kitab,

        "nama_file": path.name,

        "path_file": str(
            path.resolve()
        ),

        "nomor_juz": nomor_juz,

        "format_file": format_file,

        "ukuran_file": ukuran_file,

        "sha256": sha256,
    }


# ============================================================
# SCAN FOLDER KITAB
# ============================================================

def scan_folder_kitab(
    root_folder: str,
) -> list[dict]:

    root = Path(
        root_folder
    ).expanduser().resolve()

    # --------------------------------------------------------
    # VALIDASI ROOT
    # --------------------------------------------------------

    if not root.exists():

        raise FileNotFoundError(
            f"Folder kitab tidak ditemukan: {root}"
        )

    if not root.is_dir():

        raise ValueError(
            f"Path bukan folder: {root}"
        )

    hasil: list[dict] = []

    dilewati: list[dict] = []

    # --------------------------------------------------------
    # SCAN REKURSIF
    #
    # Berbeda dari versi lama:
    #
    # Tidak lagi mengharuskan:
    #
    # root/kategori/kitab/file
    #
    # File langsung di root juga dibaca.
    # --------------------------------------------------------

    semua_file = sorted(
        (
            path
            for path in root.rglob("*")
            if path.is_file()
        ),
        key=lambda p: str(p).lower(),
    )

    for file_path in semua_file:

        extension = (
            file_path.suffix.lower()
        )

        # ----------------------------------------------------
        # EXTENSION
        # ----------------------------------------------------

        if extension not in SUPPORTED_EXTENSIONS:

            continue

        format_file = deteksi_format(
            file_path
        )

        # ----------------------------------------------------
        # SQLITE / DB
        #
        # Hanya masukkan SQLite yang benar-benar
        # mempunyai format kitab.
        # ----------------------------------------------------

        if format_file in {
            "sqlite",
            "db",
        }:

            if not sqlite_adalah_kitab(
                file_path
            ):

                dilewati.append(
                    {
                        "path": str(
                            file_path
                        ),
                        "alasan": (
                            "Bukan format "
                            "SQLite kitab"
                        ),
                    }
                )

                continue

        # ----------------------------------------------------
        # BANGUN DATA
        # ----------------------------------------------------

        try:

            data = buat_data_file(
                file_path,
                root,
            )

            hasil.append(
                data
            )

        except Exception as error:

            dilewati.append(
                {
                    "path": str(
                        file_path
                    ),
                    "alasan": str(
                        error
                    ),
                }
            )

    # --------------------------------------------------------
    # SIMPAN INFORMASI SCAN UNTUK DEBUG
    # --------------------------------------------------------

    scan_folder_kitab.last_skipped = (
        dilewati
    )

    return hasil


# ============================================================
# ATTRIBUTE HASIL FILE YANG DILEWATI
# ============================================================

scan_folder_kitab.last_skipped = []


# ============================================================
# TEST MANUAL
# ============================================================

if __name__ == "__main__":

    import sys

    if len(sys.argv) < 2:

        print(
            "Cara penggunaan:"
        )

        print()

        print(
            'python file_mapper.py '
            '"D:\\AI_KITAB\\IslamicLibrary\\shamela_books"'
        )

        raise SystemExit(1)

    folder = sys.argv[1]

    try:

        hasil = scan_folder_kitab(
            folder
        )

        dilewati = (
            scan_folder_kitab.last_skipped
        )

        print()

        print(
            "========================================"
        )

        print(
            "HASIL PEMETAAN FILE KITAB"
        )

        print(
            "========================================"
        )

        print(
            f"Total file valid : {len(hasil)}"
        )

        print(
            f"Total dilewati   : {len(dilewati)}"
        )

        print()

        # ----------------------------------------------------
        # TAMPILKAN FILE VALID
        # ----------------------------------------------------

        for nomor, item in enumerate(
            hasil,
            start=1,
        ):

            print(
                f"[{nomor}] "
                f"{item['kitab']}"
            )

            print(
                f"    Kategori : "
                f"{item['kategori']}"
            )

            print(
                f"    File     : "
                f"{item['nama_file']}"
            )

            print(
                f"    Format   : "
                f"{item['format_file']}"
            )

            print(
                f"    Juz      : "
                f"{item['nomor_juz']}"
            )

            print(
                f"    Ukuran   : "
                f"{item['ukuran_file']} bytes"
            )

            print(
                f"    SHA256   : "
                f"{item['sha256']}"
            )

            print()

        # ----------------------------------------------------
        # TAMPILKAN FILE YANG DILEWATI
        # ----------------------------------------------------

        if dilewati:

            print(
                "========================================"
            )

            print(
                "FILE DILEWATI"
            )

            print(
                "========================================"
            )

            for nomor, item in enumerate(
                dilewati,
                start=1,
            ):

                print(
                    f"[{nomor}] "
                    f"{item['path']}"
                )

                print(
                    f"    Alasan: "
                    f"{item['alasan']}"
                )

                print()

    except Exception as error:

        print(
            f"ERROR: {error}"
        )

        raise