from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from pydantic import BaseModel

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.api.dependencies import (
    require_permission,
    require_programmer,
)

from app.services.kitab_kuning.import_service import (
    kitab_import_service,
)

from app.services.kitab_kuning.sqlite_reader import (
    sqlite_kitab_reader,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/kitab-kuning",
    tags=["AI Kitab Kuning"],
)


# ============================================================
# ROOT FOLDER KITAB
# ============================================================

KITAB_ROOT = Path(
    r"D:\KITAB"
)


# ============================================================
# REQUEST SCAN FOLDER
# ============================================================

class ScanFolderRequest(BaseModel):

    folder: str


# ============================================================
# HELPER:
# VALIDASI PATH SQLITE
# ============================================================

def validate_kitab_path(
    path_file: str,
) -> Path:

    path = (
        Path(path_file)
        .expanduser()
        .resolve()
    )

    root = (
        KITAB_ROOT
        .expanduser()
        .resolve()
    )

    # --------------------------------------------------------
    # FILE HARUS BERADA DI DALAM D:\KITAB
    # --------------------------------------------------------

    try:

        path.relative_to(root)

    except ValueError:

        raise HTTPException(
            status_code=403,
            detail=(
                "File kitab berada di luar "
                f"folder yang diizinkan: {root}"
            ),
        )

    # --------------------------------------------------------
    # FILE HARUS ADA
    # --------------------------------------------------------

    if not path.exists():

        raise HTTPException(
            status_code=404,
            detail=(
                f"File kitab tidak ditemukan: "
                f"{path}"
            ),
        )

    if not path.is_file():

        raise HTTPException(
            status_code=400,
            detail=(
                f"Path bukan file: {path}"
            ),
        )

    # --------------------------------------------------------
    # FORMAT
    # --------------------------------------------------------

    if path.suffix.lower() not in {
        ".sqlite",
        ".db",
    }:

        raise HTTPException(
            status_code=400,
            detail=(
                "File kitab harus berformat "
                ".sqlite atau .db."
            ),
        )

    return path


# ============================================================
# HELPER:
# AMBIL METADATA DARI MYSQL
# ============================================================

def get_kitab_file(
    db: Session,
    kitab_file_id: int,
) -> dict[str, Any] | None:

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
                jumlah_halaman
            FROM kitab_file
            WHERE id = :id
            LIMIT 1
            """
        ),
        {
            "id": kitab_file_id,
        },
    )

    row = result.mappings().first()

    if row is None:
        return None

    return dict(row)


# ============================================================
# HELPER:
# AMBIL SEMUA FILE KITAB
# ============================================================

def get_all_kitab_files(
    db: Session,
    kategori: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:

    conditions = []

    params: dict[str, Any] = {}

    if kategori:

        conditions.append(
            "kategori = :kategori"
        )

        params["kategori"] = kategori

    if search:

        conditions.append(
            """
            (
                kitab LIKE :search
                OR nama_file LIKE :search
                OR kategori LIKE :search
            )
            """
        )

        params["search"] = (
            f"%{search.strip()}%"
        )

    where_sql = ""

    if conditions:

        where_sql = (
            "WHERE "
            + " AND ".join(
                conditions
            )
        )

    result = db.execute(
        text(
            f"""
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
                jumlah_halaman
            FROM kitab_file
            {where_sql}
            ORDER BY
                kategori ASC,
                kitab ASC,
                nomor_juz ASC,
                nama_file ASC
            """
        ),
        params,
    )

    return [
        dict(row)
        for row in result.mappings().all()
    ]


# ============================================================
# SCAN FOLDER KITAB
# PROGRAMMER ONLY
# ============================================================

@router.post(
    "/scan-folder",
)
def scan_folder(
    data: ScanFolderRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_programmer()
    ),
):
    """
    Scan folder kitab dan mendaftarkan
    file kitab ke tabel kitab_file.

    Tahap ini BELUM mengimpor isi kitab.

    Endpoint ini hanya dapat digunakan
    oleh Programmer.
    """

    # --------------------------------------------------------
    # VALIDASI FOLDER
    # --------------------------------------------------------

    if not data.folder.strip():

        raise HTTPException(
            status_code=400,
            detail="Folder kitab wajib diisi.",
        )

    try:

        result = (
            kitab_import_service
            .scan_and_register(
                db=db,
                root_folder=data.folder.strip(),
            )
        )

        return result

    except FileNotFoundError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Gagal melakukan scan folder kitab: "
                f"{error}"
            ),
        )


# ============================================================
# DAFTAR KITAB
# PERMISSION: kitab.view
# ============================================================

@router.get(
    "/books",
)
def get_books(
    kategori: str | None = Query(
        default=None,
        description="Filter kategori kitab",
    ),
    search: str | None = Query(
        default=None,
        description=(
            "Cari kategori, nama kitab, "
            "atau nama file"
        ),
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "kitab.view"
        )
    ),
):

    books = get_all_kitab_files(
        db=db,
        kategori=kategori,
        search=search,
    )

    return {
        "success": True,
        "total": len(books),
        "items": books,
    }


# ============================================================
# DETAIL KITAB
# PERMISSION: kitab.view
# ============================================================

@router.get(
    "/books/{kitab_file_id}",
)
def get_book_detail(
    kitab_file_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "kitab.view"
        )
    ),
):

    kitab = get_kitab_file(
        db,
        kitab_file_id,
    )

    if kitab is None:

        raise HTTPException(
            status_code=404,
            detail="Kitab tidak ditemukan.",
        )

    path = validate_kitab_path(
        kitab["path_file"]
    )

    try:

        info = (
            sqlite_kitab_reader
            .get_info(path)
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Gagal membaca metadata "
                f"kitab: {error}"
            ),
        )

    return {
        "success": True,
        "metadata": kitab,
        "sqlite_info": info,
    }


# ============================================================
# BACA DAFTAR HALAMAN
# PERMISSION: kitab.view
# ============================================================

@router.get(
    "/books/{kitab_file_id}/pages",
)
def get_book_pages(
    kitab_file_id: int,
    page: int = Query(
        default=1,
        ge=1,
        description="Nomor halaman daftar",
    ),
    size: int = Query(
        default=20,
        ge=1,
        le=100,
        description=(
            "Jumlah halaman per request"
        ),
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "kitab.view"
        )
    ),
):

    kitab = get_kitab_file(
        db,
        kitab_file_id,
    )

    if kitab is None:

        raise HTTPException(
            status_code=404,
            detail="Kitab tidak ditemukan.",
        )

    path = validate_kitab_path(
        kitab["path_file"]
    )

    try:

        result = (
            sqlite_kitab_reader
            .list_pages(
                path=path,
                page=page,
                size=size,
            )
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Gagal membaca halaman kitab: "
                f"{error}"
            ),
        )

    return {
        "success": True,
        "kitab": {
            "id": kitab["id"],
            "kategori": kitab["kategori"],
            "kitab": kitab["kitab"],
            "nama_file": kitab["nama_file"],
        },
        **result,
    }


# ============================================================
# BACA SATU HALAMAN
# PERMISSION: kitab.view
# ============================================================

@router.get(
    "/books/{kitab_file_id}/pages/{page_id}",
)
def get_book_page(
    kitab_file_id: int,
    page_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "kitab.view"
        )
    ),
):

    kitab = get_kitab_file(
        db,
        kitab_file_id,
    )

    if kitab is None:

        raise HTTPException(
            status_code=404,
            detail="Kitab tidak ditemukan.",
        )

    path = validate_kitab_path(
        kitab["path_file"]
    )

    try:

        result = (
            sqlite_kitab_reader
            .get_page(
                path=path,
                page_id=page_id,
            )
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Gagal membaca halaman kitab: "
                f"{error}"
            ),
        )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Halaman kitab "
                "tidak ditemukan."
            ),
        )

    return {
        "success": True,
        "kitab": {
            "id": kitab["id"],
            "kategori": kitab["kategori"],
            "kitab": kitab["kitab"],
            "nama_file": kitab["nama_file"],
        },
        "page": result,
    }


# ============================================================
# CARI IBARAT DALAM SATU KITAB
# PERMISSION: kitab.search
# ============================================================

@router.get(
    "/books/{kitab_file_id}/search",
)
def search_book(
    kitab_file_id: int,
    q: str = Query(
        min_length=1,
        description="Kata/frasa yang dicari",
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Maksimum hasil",
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "kitab.search"
        )
    ),
):

    kitab = get_kitab_file(
        db,
        kitab_file_id,
    )

    if kitab is None:

        raise HTTPException(
            status_code=404,
            detail="Kitab tidak ditemukan.",
        )

    path = validate_kitab_path(
        kitab["path_file"]
    )

    try:

        results = (
            sqlite_kitab_reader
            .search(
                path=path,
                keyword=q,
                limit=limit,
            )
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Gagal mencari ibarat: "
                f"{error}"
            ),
        )

    return {
        "success": True,
        "query": q,
        "total": len(results),
        "kitab": {
            "id": kitab["id"],
            "kategori": kitab["kategori"],
            "kitab": kitab["kitab"],
            "nama_file": kitab["nama_file"],
        },
        "items": results,
    }


# ============================================================
# CARI SEMUA KITAB
# PERMISSION: kitab.search
# ============================================================

@router.get(
    "/search",
)
def search_all_books(
    q: str = Query(
        min_length=1,
        description="Cari teks/ibarat di semua kitab",
    ),
    limit_per_book: int = Query(
        default=10,
        ge=1,
        le=50,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "kitab.search"
        )
    ),
):

    books = get_all_kitab_files(
        db=db,
    )

    hasil = []

    for kitab in books:

        path_value = kitab.get(
            "path_file"
        )

        if not path_value:
            continue

        try:

            path = validate_kitab_path(
                path_value
            )

            results = (
                sqlite_kitab_reader
                .search(
                    path=path,
                    keyword=q,
                    limit=limit_per_book,
                )
            )

            if results:

                hasil.append(
                    {
                        "kitab": {
                            "id": kitab["id"],
                            "kategori": kitab["kategori"],
                            "kitab": kitab["kitab"],
                            "nama_file": kitab["nama_file"],
                        },
                        "items": results,
                    }
                )

        except HTTPException:
            continue

        except Exception:
            continue

    total_hasil = sum(
        len(item["items"])
        for item in hasil
    )

    return {
        "success": True,
        "query": q,
        "total_kitab": len(hasil),
        "total_hasil": total_hasil,
        "items": hasil,
    }