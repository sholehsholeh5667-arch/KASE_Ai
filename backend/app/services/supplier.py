from sqlalchemy.orm import Session

class SupplierService:

    def create(self, db: Session, data):
        pass

    def update(self, db: Session, supplier_id: int, data):
        pass

    def delete(self, db: Session, supplier_id: int):
        pass


supplier_service = SupplierService()