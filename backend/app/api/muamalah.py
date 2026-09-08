from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.api.dependencies import (
    require_permission,
    require_programmer,
)

from app.schemas.muamalah import (
    MuamalahMateriCreate,
    MuamalahMateriUpdate,
    MuamalahMateriResponse,
    MuamalahAISearchResult,
)

from app.services.muamalah_service import (
    muamalah_service,
)


# ==========================================================
# ROUTER
# ==========================================================

router = APIRouter(
    prefix="/muamalah",
    tags=["AI Muamalah"],
)


# ==========================================================
# GET SEMUA MATERI
# SEMUA 5 ROLE
# ==========================================================

@router.get(
    "/",
    response_model=List[MuamalahMateriResponse],
)
def get_all_materi(
    aktif_only: bool = Query(
        True,
        description="Hanya tampilkan materi aktif",
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "muamalah.view"
        )
    ),
):
    """
    Mengambil daftar materi Muamalah.

    Semua 5 role dapat menggunakan
    fitur membaca materi Muamalah.

    Default hanya menampilkan materi aktif.
    """

    return muamalah_service.get_all(
        db=db,
        aktif_only=aktif_only,
    )


# ==========================================================
# SEARCH MATERI
# SEMUA 5 ROLE
# ==========================================================

@router.get(
    "/search/",
    response_model=List[MuamalahMateriResponse],
)
def search_materi(
    q: str = Query(
        ...,
        min_length=1,
        description="Kata kunci pencarian materi",
    ),
    kategori: Optional[str] = Query(
        None,
        description="Filter berdasarkan kategori",
    ),
    limit: int = Query(
        10,
        ge=1,
        le=50,
        description="Jumlah maksimal hasil",
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "muamalah.view"
        )
    ),
):
    """
    Pencarian materi Muamalah.

    Semua 5 role dapat menggunakan
    fitur pencarian.
    """

    return muamalah_service.search(
        db=db,
        query=q,
        kategori=kategori,
        limit=limit,
    )


# ==========================================================
# SEARCH MATERI UNTUK AI
# SEMUA 5 ROLE
# ==========================================================

@router.get(
    "/ai/search/",
    response_model=List[MuamalahAISearchResult],
)
def search_for_ai(
    q: str = Query(
        ...,
        min_length=1,
        description="Pertanyaan pengguna",
    ),
    limit: int = Query(
        5,
        ge=1,
        le=20,
        description="Jumlah materi yang digunakan AI",
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "muamalah.view"
        )
    ),
):
    """
    Mencari materi aktif yang digunakan
    sebagai knowledge base AI Muamalah.

    Semua 5 role dapat menggunakan endpoint ini.
    """

    return muamalah_service.search_for_ai(
        db=db,
        pertanyaan=q,
        limit=limit,
    )


# ==========================================================
# GET MATERI BERDASARKAN KATEGORI
# SEMUA 5 ROLE
# ==========================================================

@router.get(
    "/kategori/{kategori}",
    response_model=List[MuamalahMateriResponse],
)
def get_by_kategori(
    kategori: str,
    aktif_only: bool = Query(
        True,
        description="Hanya tampilkan materi aktif",
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "muamalah.view"
        )
    ),
):
    """
    Mengambil materi berdasarkan kategori.

    Semua 5 role dapat membaca materi.
    """

    return muamalah_service.get_by_kategori(
        db=db,
        kategori=kategori,
        aktif_only=aktif_only,
    )


# ==========================================================
# GET DETAIL MATERI
# SEMUA 5 ROLE
# ==========================================================

@router.get(
    "/{materi_id}",
    response_model=MuamalahMateriResponse,
)
def get_materi(
    materi_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "muamalah.view"
        )
    ),
):
    """
    Mengambil detail satu materi Muamalah.
    """

    materi = muamalah_service.get_by_id(
        db=db,
        materi_id=materi_id,
    )

    if materi is None:
        raise HTTPException(
            status_code=404,
            detail="Materi Muamalah tidak ditemukan.",
        )

    return materi


# ==========================================================
# CREATE MATERI
# PROGRAMMER ONLY
# ==========================================================

@router.post(
    "/",
    response_model=MuamalahMateriResponse,
    status_code=201,
)
def create_materi(
    data: MuamalahMateriCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_programmer()
    ),
):
    """
    Hanya Programmer yang boleh
    menambahkan materi Muamalah.
    """

    return muamalah_service.create(
        db=db,
        data=data,
    )


# ==========================================================
# UPDATE MATERI
# PROGRAMMER ONLY
# ==========================================================

@router.put(
    "/{materi_id}",
    response_model=MuamalahMateriResponse,
)
def update_materi(
    materi_id: int,
    data: MuamalahMateriUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_programmer()
    ),
):
    """
    Hanya Programmer yang boleh
    mengubah materi Muamalah.
    """

    materi = muamalah_service.update(
        db=db,
        materi_id=materi_id,
        data=data,
    )

    if materi is None:
        raise HTTPException(
            status_code=404,
            detail="Materi Muamalah tidak ditemukan.",
        )

    return materi


# ==========================================================
# AKTIFKAN MATERI
# PROGRAMMER ONLY
# ==========================================================

@router.post(
    "/{materi_id}/activate",
    response_model=MuamalahMateriResponse,
)
def activate_materi(
    materi_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_programmer()
    ),
):
    """
    Hanya Programmer yang boleh
    mengaktifkan materi Muamalah.
    """

    materi = muamalah_service.activate(
        db=db,
        materi_id=materi_id,
    )

    if materi is None:
        raise HTTPException(
            status_code=404,
            detail="Materi Muamalah tidak ditemukan.",
        )

    return materi


# ==========================================================
# NONAKTIFKAN MATERI
# PROGRAMMER ONLY
# ==========================================================

@router.post(
    "/{materi_id}/deactivate",
    response_model=MuamalahMateriResponse,
)
def deactivate_materi(
    materi_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_programmer()
    ),
):
    """
    Hanya Programmer yang boleh
    menonaktifkan materi Muamalah.
    """

    materi = muamalah_service.deactivate(
        db=db,
        materi_id=materi_id,
    )

    if materi is None:
        raise HTTPException(
            status_code=404,
            detail="Materi Muamalah tidak ditemukan.",
        )

    return materi


# ==========================================================
# DELETE MATERI
# PROGRAMMER ONLY
# ==========================================================

@router.delete(
    "/{materi_id}",
)
def delete_materi(
    materi_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_programmer()
    ),
):
    """
    Hanya Programmer yang boleh
    menghapus materi Muamalah.
    """

    berhasil = muamalah_service.delete(
        db=db,
        materi_id=materi_id,
    )

    if not berhasil:
        raise HTTPException(
            status_code=404,
            detail="Materi Muamalah tidak ditemukan.",
        )

    return {
        "message": (
            "Materi Muamalah berhasil dihapus."
        ),
        "id": materi_id,
    }