from sqlalchemy.orm import Session

from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate


def get_all(db: Session):
    return db.query(Supplier).all()


def get_by_id(db: Session, supplier_id: int):
    return db.query(Supplier).filter(
        Supplier.id == supplier_id
    ).first()


def create(db: Session, data: SupplierCreate):
    supplier = Supplier(**data.model_dump())

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


def update(db: Session, supplier_id: int, data: SupplierUpdate):
    supplier = get_by_id(db, supplier_id)

    if supplier is None:
        return None

    for key, value in data.model_dump().items():
        setattr(supplier, key, value)

    db.commit()
    db.refresh(supplier)

    return supplier


def delete(db: Session, supplier_id: int):
    supplier = get_by_id(db, supplier_id)

    if supplier is None:
        return None

    db.delete(supplier)
    db.commit()

    return supplier