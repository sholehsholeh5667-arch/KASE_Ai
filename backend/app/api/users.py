from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_toko,
    get_current_user,
    require_permission,
)

from app.core.database import get_db

from app.core.security import (
    hash_password,
)

from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserStatusUpdate,
    UserResponse,
    UserMemberResponse,
)

from app.services.user_service import (
    user_service,
)


# ==========================================================
# ROUTER
# ==========================================================

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# ==========================================================
# CURRENT USER
# ==========================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def me(
    current_user=Depends(
        get_current_user
    ),
):
    """
    Mengambil data user yang sedang login.

    Semua user yang sudah login
    dapat menggunakan endpoint ini.

    Response sengaja dibatasi menggunakan
    UserResponse agar field sensitif seperti:

    - password_hash
    - reset_token_hash
    - reset_token_expires

    tidak dikirim ke frontend.
    """

    return current_user


# ==========================================================
# DAFTAR ANGGOTA TOKO
# ==========================================================

@router.get(
    "/members",
    response_model=list[
        UserMemberResponse
    ],
)
def get_members(
    search: str | None = Query(
        default=None,
        description=(
            "Cari nama, username, "
            "atau email."
        ),
    ),
    include_inactive: bool = Query(
        default=False,
        description=(
            "Tampilkan anggota nonaktif."
        ),
    ),
    db: Session = Depends(
        get_db
    ),
    current_user=Depends(
        require_permission(
            "user.view"
        )
    ),
    current_toko=Depends(
        get_current_toko
    ),
):
    """
    Mengambil anggota dari toko aktif.

    Data selalu dibatasi berdasarkan
    toko aktif user.
    """

    return user_service.get_members(
        db=db,
        toko_id=current_toko.id,
        search=search,
        include_inactive=include_inactive,
    )


# ==========================================================
# DETAIL ANGGOTA
# ==========================================================

@router.get(
    "/members/{user_id}",
    response_model=UserMemberResponse,
)
def get_member(
    user_id: int,
    db: Session = Depends(
        get_db
    ),
    current_user=Depends(
        require_permission(
            "user.view"
        )
    ),
    current_toko=Depends(
        get_current_toko
    ),
):
    """
    Mengambil detail anggota
    dari toko aktif.
    """

    member = user_service.get_member(
        db=db,
        toko_id=current_toko.id,
        user_id=user_id,
    )

    if member is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Anggota tidak ditemukan "
                "di toko aktif."
            ),
        )

    return member


# ==========================================================
# TAMBAH ANGGOTA
# ==========================================================

@router.post(
    "/members",
    response_model=UserMemberResponse,
    status_code=201,
)
def create_member(
    data: UserCreate,
    db: Session = Depends(
        get_db
    ),
    current_user=Depends(
        require_permission(
            "user.create"
        )
    ),
    current_toko=Depends(
        get_current_toko
    ),
):
    """
    Menambahkan anggota baru
    ke toko aktif.

    Role yang boleh:
        admin
        kasir
        gudang
        akuntan

    Owner dan Programmer tidak
    dapat dibuat dari endpoint ini.
    """

    try:

        password_hash = hash_password(
            data.password
        )

        return user_service.create_member(
            db=db,
            toko_id=current_toko.id,
            nama=data.nama,
            username=data.username,
            password_hash=password_hash,
            role=data.role,
            email=(
                str(data.email)
                if data.email
                else None
            ),
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ==========================================================
# UPDATE ANGGOTA
# ==========================================================

@router.put(
    "/members/{user_id}",
    response_model=UserMemberResponse,
)
def update_member(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(
        get_db
    ),
    current_user=Depends(
        require_permission(
            "user.update"
        )
    ),
    current_toko=Depends(
        get_current_toko
    ),
):
    """
    Mengubah data anggota biasa.
    """

    try:

        member = (
            user_service.update_member(
                db=db,
                toko_id=current_toko.id,
                user_id=user_id,
                nama=data.nama,
                email=(
                    str(data.email)
                    if data.email
                    else None
                ),
                role=data.role,
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    if member is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Anggota tidak ditemukan "
                "atau bukan anggota biasa."
            ),
        )

    return member


# ==========================================================
# UPDATE STATUS
# ==========================================================

@router.patch(
    "/members/{user_id}/status",
    response_model=UserMemberResponse,
)
def update_member_status(
    user_id: int,
    data: UserStatusUpdate,
    db: Session = Depends(
        get_db
    ),
    current_user=Depends(
        require_permission(
            "user.update"
        )
    ),
    current_toko=Depends(
        get_current_toko
    ),
):
    """
    Mengaktifkan/
    menonaktifkan anggota.
    """

    try:

        member = (
            user_service.set_member_status(
                db=db,
                toko_id=current_toko.id,
                user_id=user_id,
                aktif=data.aktif,
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    if member is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Anggota tidak ditemukan "
                "di toko aktif."
            ),
        )

    return member