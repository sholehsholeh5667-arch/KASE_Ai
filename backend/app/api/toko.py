from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.api.dependencies import (
    get_current_toko,
    get_current_user,
    require_role,
)

from app.models.user import User

from app.schemas.toko import (
    TokoCreate,
    TokoUpdate,
    TokoResponse,
)

from app.services.toko_service import (
    toko_service,
)


# ==========================================================
# ROUTER
# ==========================================================

router = APIRouter(
    prefix="/toko",
    tags=["Toko"],
)


# ==========================================================
# CURRENT TOKO
# ==========================================================

@router.get(
    "/current",
)
def current_toko(
    toko=Depends(
        get_current_toko
    ),
):
    """
    Mengambil toko aktif milik user yang sedang login.
    """

    return {
        "id": toko.id,
        "nama": toko.nama,
        "kode": toko.kode,
        "parent_id": toko.parent_id,
        "deskripsi": toko.deskripsi,
        "aktif": toko.aktif,
    }


# ==========================================================
# DAFTAR TOKO
# ==========================================================

@router.get(
    "",
)
def get_all_toko(
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Mengambil daftar toko.

    Untuk sementara:
    - user biasa hanya melihat toko aktif
    - owner juga melihat daftar toko aktif

    Pembatasan detail akses akan diperketat
    pada API anggota/toko setelah sistem multi-cabang selesai.
    """

    toko_list = (
        toko_service.get_all(
            db=db
        )
    )

    return [
        {
            "id": toko.id,
            "nama": toko.nama,
            "kode": toko.kode,
            "parent_id": toko.parent_id,
            "deskripsi": toko.deskripsi,
            "aktif": toko.aktif,
        }
        for toko in toko_list
    ]


# ==========================================================
# DETAIL TOKO
# ==========================================================

@router.get(
    "/{toko_id}",
)
def get_toko(
    toko_id: int,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Mengambil detail toko.
    """

    toko = (
        toko_service.get_by_id(
            db=db,
            toko_id=toko_id,
        )
    )

    if toko is None:
        raise HTTPException(
            status_code=404,
            detail="Toko tidak ditemukan.",
        )

    return {
        "id": toko.id,
        "nama": toko.nama,
        "kode": toko.kode,
        "parent_id": toko.parent_id,
        "deskripsi": toko.deskripsi,
        "aktif": toko.aktif,
    }


# ==========================================================
# DAFTAR CABANG
# ==========================================================

@router.get(
    "/{toko_id}/cabang",
)
def get_cabang(
    toko_id: int,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Mengambil cabang langsung dari satu toko.
    """

    parent = (
        toko_service.get_by_id(
            db=db,
            toko_id=toko_id,
        )
    )

    if parent is None:
        raise HTTPException(
            status_code=404,
            detail="Toko induk tidak ditemukan.",
        )

    cabang = (
        toko_service.get_cabang(
            db=db,
            parent_id=toko_id,
        )
    )

    return [
        {
            "id": toko.id,
            "nama": toko.nama,
            "kode": toko.kode,
            "parent_id": toko.parent_id,
            "deskripsi": toko.deskripsi,
            "aktif": toko.aktif,
        }
        for toko in cabang
    ]


# ==========================================================
# CREATE TOKO
# OWNER ONLY
# ==========================================================

@router.post(
    "",
    response_model=TokoResponse,
    status_code=201,
)
def create_toko(
    data: TokoCreate,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_role("owner")
    ),
):
    """
    Hanya Owner yang dapat membuat:
    - toko induk
    - toko cabang
    """

    try:

        return toko_service.create(
            db=db,
            nama=data.nama,
            kode=data.kode,
            parent_id=data.parent_id,
            deskripsi=data.deskripsi,
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ==========================================================
# UPDATE TOKO
# OWNER ONLY
# ==========================================================

@router.put(
    "/{toko_id}",
    response_model=TokoResponse,
)
def update_toko(
    toko_id: int,
    data: TokoUpdate,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_role("owner")
    ),
):
    """
    Hanya Owner yang dapat mengubah data toko.
    """

    try:

        toko = (
            toko_service.update(
                db=db,
                toko_id=toko_id,
                nama=data.nama,
                kode=data.kode,
                parent_id=data.parent_id,
                deskripsi=data.deskripsi,
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    if toko is None:
        raise HTTPException(
            status_code=404,
            detail="Toko tidak ditemukan.",
        )

    return toko


# ==========================================================
# STATUS TOKO
# OWNER ONLY
# ==========================================================

@router.patch(
    "/{toko_id}/status",
    response_model=TokoResponse,
)
def update_status_toko(
    toko_id: int,
    aktif: bool,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_role("owner")
    ),
):
    """
    Owner dapat mengaktifkan/
    menonaktifkan toko.
    """

    toko = (
        toko_service.set_status(
            db=db,
            toko_id=toko_id,
            aktif=aktif,
        )
    )

    if toko is None:
        raise HTTPException(
            status_code=404,
            detail="Toko tidak ditemukan.",
        )

    return toko