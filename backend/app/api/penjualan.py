from fastapi import (
    APIRouter,
    Depends,
    Query,
    status,
)

from fastapi.responses import HTMLResponse

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.api.dependencies import (
    require_permission,
)

from app.schemas.penjualan import (
    PenjualanCreate,
    PenjualanResponse,
)

from app.services.cetak_service import (
    preview_penjualan,
)

from app.services.penjualan_service import (
    penjualan_service,
)


# =====================================================
# ROUTER
# =====================================================

router = APIRouter(
    prefix="/penjualan",
    tags=["Penjualan"],
)


# =====================================================
# GET ALL
# permission: penjualan.view
# =====================================================

@router.get(
    "/",
    response_model=list[PenjualanResponse],
)
def get_all(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "penjualan.view"
        )
    ),
):
    return penjualan_service.get_all(
        db
    )


# =====================================================
# PREVIEW / CETAK PENJUALAN
# permission: penjualan.view
# =====================================================

@router.get(
    "/{penjualan_id}/print-preview",
    response_class=HTMLResponse,
)
def print_preview(
    penjualan_id: int,

    jenis: str = Query(
        default="struk",
        pattern="^(struk|faktur)$",
    ),

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        require_permission(
            "penjualan.view"
        )
    ),
):
    html = preview_penjualan(
        db=db,
        penjualan_id=penjualan_id,
        jenis=jenis,
    )

    return HTMLResponse(
        content=html,
        status_code=200,
    )


# =====================================================
# GET BY ID
# permission: penjualan.view
# =====================================================

@router.get(
    "/{penjualan_id}",
    response_model=PenjualanResponse,
)
def get_by_id(
    penjualan_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        require_permission(
            "penjualan.view"
        )
    ),
):
    return penjualan_service.get_by_id(
        db,
        penjualan_id,
    )


# =====================================================
# CREATE
# permission: penjualan.create
# =====================================================

@router.post(
    "/",
    response_model=PenjualanResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    data: PenjualanCreate,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        require_permission(
            "penjualan.create"
        )
    ),
):
    return penjualan_service.create_penjualan(
        db=db,
        data=data,
        user_id=current_user.id,
    )


# =====================================================
# DELETE
# permission: penjualan.delete
# =====================================================

@router.delete(
    "/{penjualan_id}",
)
def delete(
    penjualan_id: int,

    db: Session = Depends(
        get_db
    ),

    current_user=Depends(
        require_permission(
            "penjualan.delete"
        )
    ),
):
    return penjualan_service.delete(
        db,
        penjualan_id,
    )