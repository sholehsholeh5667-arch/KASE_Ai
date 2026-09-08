from fastapi import APIRouter, Depends, Query

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.supplier import (
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse,
    SupplierPaginationResponse,
)

from app.services.supplier_service import SupplierService

from app.api.dependencies import require_permission


router = APIRouter(
    prefix="/supplier",
    tags=["Supplier"],
)


service = SupplierService()


# =========================================================
# AMBIL SEMUA SUPPLIER
# =========================================================

@router.get(
    "/",
    response_model=SupplierPaginationResponse,
)
def get_supplier(
    search: str | None = Query(
        default=None
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    size: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "supplier.view"
        )
    ),
):
    return service.get_all(
        db=db,
        search=search,
        page=page,
        size=size,
    )


# =========================================================
# AMBIL SUPPLIER BERDASARKAN ID
# =========================================================

@router.get(
    "/{supplier_id}",
    response_model=SupplierResponse,
)
def get_supplier_by_id(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "supplier.view"
        )
    ),
):
    return service.get_by_id(
        db=db,
        supplier_id=supplier_id,
    )


# =========================================================
# TAMBAH SUPPLIER
# =========================================================

@router.post(
    "/",
    response_model=SupplierResponse,
    status_code=201,
)
def create_supplier(
    data: SupplierCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "supplier.create"
        )
    ),
):
    return service.create(
        db=db,
        data=data,
    )


# =========================================================
# UPDATE SUPPLIER
# =========================================================

@router.put(
    "/{supplier_id}",
    response_model=SupplierResponse,
)
def update_supplier(
    supplier_id: int,
    data: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "supplier.update"
        )
    ),
):
    return service.update(
        db=db,
        supplier_id=supplier_id,
        data=data,
    )


# =========================================================
# HAPUS SUPPLIER
# =========================================================

@router.delete(
    "/{supplier_id}",
)
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission(
            "supplier.delete"
        )
    ),
):
    return service.delete(
        db=db,
        supplier_id=supplier_id,
    )