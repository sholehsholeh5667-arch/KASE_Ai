from fastapi import (
    APIRouter,
    Depends,
    Query,
    UploadFile,
    File,
    HTTPException,
)

from sqlalchemy.orm import Session

import uuid
import cloudinary
import cloudinary.uploader

from app.api.dependencies import require_permission
from app.core.database import get_db

from app.schemas.barang import (
    BarangCreate,
    BarangUpdate,
    BarangResponse,
    BarangPaginationResponse,
)

from app.services.barang import barang_service
router = APIRouter(
    prefix="/barang",
    tags=["Barang"],
)



# =========================================================
# AMBIL SEMUA BARANG
# =========================================================
# Semua 5 role boleh melihat / mencari barang.
#
# Permission:
# barang.view
# =========================================================

@router.get(
    "/",
    response_model=BarangPaginationResponse,
)
def get_all(
    search: str | None = Query(
        default=None,
        description="Cari berdasarkan kode atau nama barang",
    ),
    page: int = Query(
        default=1,
        ge=1,
        description="Nomor halaman",
    ),
    size: int = Query(
        default=10,
        ge=1,
        le=100,
        description="Jumlah data per halaman",
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "barang.view"
        )
    ),
):
    return barang_service.get_all(
        db=db,
        search=search,
        page=page,
        size=size,
    )


# =========================================================
# AMBIL BARANG BERDASARKAN ID
# =========================================================
# Semua 5 role boleh melihat detail barang.
#
# Permission:
# barang.view
# =========================================================

@router.get(
    "/{barang_id}",
    response_model=BarangResponse,
)
def get_by_id(
    barang_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "barang.view"
        )
    ),
):
    return barang_service.get_by_id(
        db,
        barang_id,
    )


# =========================================================
# TAMBAH BARANG
# =========================================================
# Owner dan Administrator boleh menambah master barang.
#
# Permission:
# barang.create
# =========================================================

@router.post(
    "/",
    response_model=BarangResponse,
    status_code=201,
)
def create(
    data: BarangCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "barang.create"
        )
    ),
):
    return barang_service.create(
        db,
        data,
    )


# =========================================================
# UPDATE BARANG
# =========================================================
# Owner dan Administrator boleh mengubah master barang.
#
# Permission:
# barang.update
# =========================================================

@router.put(
    "/{barang_id}",
    response_model=BarangResponse,
)
def update(
    barang_id: int,
    data: BarangUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "barang.update"
        )
    ),
):
    return barang_service.update(
        db,
        barang_id,
        data,
    )

# =========================================================
# UPLOAD FOTO BARANG
# =========================================================
# Owner dan Administrator yang memiliki barang.update
# dapat menambah / mengganti foto barang.
#
# Permission:
# barang.update
# =========================================================

@router.post(
    "/{barang_id}/foto",
    response_model=BarangResponse,
)
async def upload_foto(
    barang_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission("barang.update")
    ),
):
    # -----------------------------------------
    # Cari barang
    # -----------------------------------------

    barang = barang_service.get_by_id(
        db,
        barang_id,
    )

    if not barang:
        raise HTTPException(
            status_code=404,
            detail="Barang tidak ditemukan.",
        )

    # -----------------------------------------
    # Validasi MIME type
    # -----------------------------------------

    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Format foto harus JPG, PNG, atau WEBP.",
        )

    # -----------------------------------------
    # Baca file
    # -----------------------------------------

    content = await file.read()

    # -----------------------------------------
    # Validasi ukuran maksimal 5 MB
    # -----------------------------------------

    max_size = 5 * 1024 * 1024

    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Ukuran foto maksimal 5 MB.",
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="File foto kosong.",
        )

    # -----------------------------------------
    # Validasi signature / magic bytes
    # -----------------------------------------

    is_valid_image = False

    if file.content_type == "image/jpeg":
        is_valid_image = content.startswith(b"\xff\xd8\xff")

    elif file.content_type == "image/png":
        is_valid_image = content.startswith(
            b"\x89PNG\r\n\x1a\n"
        )

    elif file.content_type == "image/webp":
        is_valid_image = (
            len(content) >= 12
            and content[0:4] == b"RIFF"
            and content[8:12] == b"WEBP"
        )

    if not is_valid_image:
        raise HTTPException(
            status_code=400,
            detail="File bukan gambar JPG, PNG, atau WEBP yang valid.",
        )

    # -----------------------------------------
    # Upload ke Cloudinary
    # -----------------------------------------

    try:
        result = cloudinary.uploader.upload(
         content,
         folder="kasir_ai/barang",
         public_id=f"barang_{barang_id}_{uuid.uuid4().hex}",
         resource_type="image",
        )

    except Exception as exc:
     raise HTTPException(
        status_code=500,
        detail="Gagal mengunggah foto ke Cloudinary.",
    ) from exc

    # URL foto Cloudinary yang disimpan ke database
    new_photo_path = result.get("secure_url")

    if not new_photo_path:
         raise HTTPException(
         status_code=500,
         detail="URL foto dari Cloudinary tidak ditemukan.",
        )
    # Foto lama
    old_photo = barang.foto

    # -----------------------------------------
    # Update database
    # -----------------------------------------

    barang.foto = new_photo_path

    try:
        db.commit()
        db.refresh(barang)

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Gagal menyimpan informasi foto ke database.",
        ) from exc
# =========================================================
# HAPUS BARANG
# =========================================================
# Owner dan Administrator boleh menghapus master barang.
#
# Permission:
# barang.delete
# =========================================================

@router.delete(
    "/{barang_id}",
)
def delete(
    barang_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "barang.delete"
        )
    ),
):
    return barang_service.delete(
        db,
        barang_id,
    )
