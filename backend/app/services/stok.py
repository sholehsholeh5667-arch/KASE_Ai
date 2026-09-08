from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.stock_opname import (
    StockOpname,
    StatusOpname,
)

from app.models.stock_opname_detail import (
    StockOpnameDetail,
)

from app.schemas.stok import StockOpnameCreate

from app.repositories.stok import stok_repository

from app.services.mutasi_stok_service import (
    MutasiStokService,
)


class StokService:

    # ==========================================================
    # CREATE STOCK OPNAME
    # ==========================================================

    def create_stock_opname(
        self,
        db: Session,
        data: StockOpnameCreate,
        user_id: int,
    ):

        try:

            nomor = stok_repository.generate_nomor_opname(db)

            opname = StockOpname(
                nomor=nomor,
                status=StatusOpname.DRAFT.value,
                keterangan=data.keterangan,
                created_by=user_id,
            )

            stok_repository.create_stock_opname(
                db,
                opname,
            )

            for item in data.detail:

                barang = stok_repository.get_barang(
                    db,
                    item.barang_id,
                )

                if barang is None:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Barang {item.barang_id} tidak ditemukan.",
                    )

                stok_sistem = Decimal(barang.stok)

                stok_fisik = Decimal(item.stok_fisik)

                selisih = stok_fisik - stok_sistem

                detail = StockOpnameDetail(
                    stock_opname_id=opname.id,
                    barang_id=barang.id,
                    stok_sistem=stok_sistem,
                    stok_fisik=stok_fisik,
                    selisih=selisih,
                    keterangan=item.keterangan,
                )

                stok_repository.create_stock_opname_detail(
                    db,
                    detail,
                )

            stok_repository.commit(db)

            return opname

        except Exception:

            stok_repository.rollback(db)

            raise

    # ==========================================================
    # APPROVE STOCK OPNAME
    # ==========================================================

    def approve_stock_opname(
        self,
        db: Session,
        opname_id: int,
        user_id: int,
    ):

        try:

            opname = stok_repository.get_stock_opname(
                db,
                opname_id,
            )

            if opname is None:
                raise HTTPException(
                    status_code=404,
                    detail="Stock Opname tidak ditemukan.",
                )

            if opname.status == StatusOpname.SELESAI:
                raise HTTPException(
                    status_code=400,
                    detail="Stock Opname sudah diselesaikan.",
                )

            for detail in opname.detail:

                barang = stok_repository.get_barang(
                    db,
                    detail.barang_id,
                )

                if barang is None:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Barang {detail.barang_id} tidak ditemukan.",
                    )

                stok_baru = Decimal(detail.stok_fisik)

                if detail.selisih != 0:

                    MutasiStokService.penyesuaian(
                        db=db,
                        barang=barang,
                        stok_baru=stok_baru,
                        jenis="STOCK_OPNAME",
                        referensi=opname.nomor,
                        keterangan=detail.keterangan,
                        created_by=user_id,
                    )

            opname.status = StatusOpname.SELESAI
            opname.approved_by = user_id

            stok_repository.commit(db)

            return opname

        except Exception:

            stok_repository.rollback(db)

            raise


# ==========================================================
# INSTANCE
# ==========================================================

stok_service = StokService()