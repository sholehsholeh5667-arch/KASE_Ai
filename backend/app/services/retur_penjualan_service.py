from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.barang import Barang
from app.models.penjualan import Penjualan
from app.models.detail_penjualan import DetailPenjualan
from app.models.retur_penjualan import ReturPenjualan
from app.models.retur_penjualan_detail import ReturPenjualanDetail

from app.schemas.retur_penjualan import (
    ReturPenjualanCreate,
    ReturPenjualanUpdate,
)

from app.services.mutasi_stok_service import (
    MutasiStokService,
)
from app.utils.nomor_retur import generate_nomor_retur

class ReturPenjualanService:

    # ==========================================================
    # GET ALL
    # ==========================================================

    @staticmethod
    def get_all(
        db: Session,
    ):
        return (
            db.query(ReturPenjualan)
            .options(
                joinedload(
                    ReturPenjualan.penjualan
                ),
                joinedload(
                    ReturPenjualan.pelanggan
                ),
                joinedload(
                    ReturPenjualan.user
                ),
                joinedload(
                    ReturPenjualan.detail
                ).joinedload(
                    ReturPenjualanDetail.barang
                ),
            )
            .order_by(
                ReturPenjualan.id.desc()
            )
            .all()
        )

    # ==========================================================
    # GET BY ID
    # ==========================================================

    @staticmethod
    def get_by_id(
        db: Session,
        retur_id: int,
    ):
        retur = (
            db.query(ReturPenjualan)
            .options(
                joinedload(
                    ReturPenjualan.penjualan
                ),
                joinedload(
                    ReturPenjualan.pelanggan
                ),
                joinedload(
                    ReturPenjualan.user
                ),
                joinedload(
                    ReturPenjualan.detail
                ).joinedload(
                    ReturPenjualanDetail.barang
                ),
            )
            .filter(
                ReturPenjualan.id == retur_id
            )
            .first()
        )

        if retur is None:
            raise HTTPException(
                status_code=404,
                detail="Retur penjualan tidak ditemukan.",
            )

        return retur

    # ==========================================================
    # CREATE RETUR
    # ==========================================================

    @staticmethod
    def create(
        db: Session,
        data: ReturPenjualanCreate,
        user_id: int,
    ):
        try:

            # ==================================================
            # VALIDASI USER
            # ==================================================

            if user_id is None:
                raise HTTPException(
                    status_code=401,
                    detail="User tidak terautentikasi.",
                )

            # ==================================================
            # VALIDASI PENJUALAN
            # ==================================================

            penjualan = (
                db.query(Penjualan)
                .filter(
                    Penjualan.id == data.penjualan_id
                )
                .first()
            )

            if penjualan is None:
                raise HTTPException(
                    status_code=404,
                    detail="Penjualan tidak ditemukan.",
                )

            # ==================================================
            # VALIDASI DETAIL
            # ==================================================

            if not data.detail:
                raise HTTPException(
                    status_code=400,
                    detail="Detail retur tidak boleh kosong.",
                )

            
            # ==================================================
            # BUAT NOMOR RETUR
            # ==================================================

            no_retur = generate_nomor_retur(db)

            # ==================================================
            # BUAT HEADER RETUR
            # ==================================================

            retur = ReturPenjualan(
                no_retur=no_retur,
                penjualan_id=data.penjualan_id,
                pelanggan_id=penjualan.pelanggan_id,
                created_by=user_id,
                alasan=data.alasan,
                jenis_refund=data.jenis_refund,
                status="DRAFT",
                total=Decimal("0"),
            )

            db.add(retur)
            db.flush()

            # ==================================================
            # TOTAL RETUR
            # ==================================================

            total = Decimal("0")

            # ==================================================
            # CEGAH BARANG DUPLIKAT DALAM SATU RETUR
            # ==================================================

            barang_diproses = set()

            # ==================================================
            # DETAIL RETUR
            # ==================================================

            for item in data.detail:

                if item.barang_id in barang_diproses:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Barang ID {item.barang_id} "
                            "tidak boleh muncul dua kali "
                            "dalam satu retur."
                        ),
                    )

                barang_diproses.add(
                    item.barang_id
                )

                # ==============================================
                # CARI DETAIL PENJUALAN
                # ==============================================

                detail_penjualan = (
                    db.query(DetailPenjualan)
                    .filter(
                        DetailPenjualan.penjualan_id
                        == data.penjualan_id,
                        DetailPenjualan.barang_id
                        == item.barang_id,
                    )
                    .first()
                )

                if detail_penjualan is None:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Barang ID {item.barang_id} "
                            "tidak ada pada transaksi penjualan."
                        ),
                    )

                # ==============================================
                # QTY TERJUAL
                # ==============================================

                qty_terjual = int(
                    detail_penjualan.qty
                )

                # ==============================================
                # HITUNG QTY YANG SUDAH DIRETUR
                # ==============================================

                retur_sebelumnya = (
                    db.query(
                        ReturPenjualanDetail
                    )
                    .join(
                        ReturPenjualan,
                        ReturPenjualan.id
                        == ReturPenjualanDetail.retur_id,
                    )
                    .filter(
                        ReturPenjualan.penjualan_id
                        == data.penjualan_id,
                        ReturPenjualanDetail.barang_id
                        == item.barang_id,
                        ReturPenjualan.status
                        == "SELESAI",
                    )
                    .all()
                )

                qty_sudah_diretur = sum(
                    int(x.qty)
                    for x in retur_sebelumnya
                )

                # ==============================================
                # HITUNG SISA QTY YANG BOLEH DIRETUR
                # ==============================================

                qty_tersisa = (
                    qty_terjual
                    - qty_sudah_diretur
                )

                # ==============================================
                # VALIDASI QTY
                # ==============================================

                if item.qty > qty_tersisa:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Qty retur barang ID "
                            f"{item.barang_id} terlalu banyak. "
                            f"Qty terjual: {qty_terjual}, "
                            f"sudah diretur: {qty_sudah_diretur}, "
                            f"sisa yang dapat diretur: "
                            f"{qty_tersisa}."
                        ),
                    )

                # ==============================================
                # HARGA RETUR
                # Mengikuti harga penjualan
                # ==============================================

                harga = Decimal(
                    str(detail_penjualan.harga_jual)
                )

                qty = Decimal(
                    str(item.qty)
                )

                subtotal = (
                    qty * harga
                )

                # ==============================================
                # SIMPAN DETAIL
                # ==============================================

                detail = ReturPenjualanDetail(
                    retur_id=retur.id,
                    barang_id=item.barang_id,
                    qty=item.qty,
                    harga=harga,
                    subtotal=subtotal,
                    kondisi=item.kondisi,
                )

                db.add(detail)

                total += subtotal

            # ==================================================
            # UPDATE TOTAL
            # ==================================================

            retur.total = total

            # ==================================================
            # COMMIT
            # ==================================================

            db.commit()
            db.refresh(retur)

            return retur

        except HTTPException:

            db.rollback()
            raise

        except Exception:

            db.rollback()
            raise

    # ==========================================================
    # UPDATE
    # ==========================================================

    @staticmethod
    def update(
        db: Session,
        retur_id: int,
        data: ReturPenjualanUpdate,
    ):
        try:

            retur = (
                db.query(ReturPenjualan)
                .filter(
                    ReturPenjualan.id == retur_id
                )
                .first()
            )

            if retur is None:
                raise HTTPException(
                    status_code=404,
                    detail="Retur penjualan tidak ditemukan.",
                )

            # ==================================================
            # HANYA DRAFT
            # ==================================================

            if retur.status != "DRAFT":
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Retur hanya dapat diubah "
                        "selama status masih DRAFT."
                    ),
                )

            # ==================================================
            # UPDATE ALASAN
            # ==================================================

            if data.alasan is not None:
                retur.alasan = data.alasan

            # ==================================================
            # UPDATE JENIS REFUND
            # ==================================================

            if data.jenis_refund is not None:

                jenis_refund_valid = [
                    "CASH",
                    "TRANSFER",
                    "STORE_CREDIT",
                    "TUKAR_BARANG",
                ]

                if (
                    data.jenis_refund
                    not in jenis_refund_valid
                ):
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "Jenis refund tidak valid."
                        ),
                    )

                retur.jenis_refund = (
                    data.jenis_refund
                )

            db.commit()
            db.refresh(retur)

            return retur

        except HTTPException:

            db.rollback()
            raise

        except Exception:

            db.rollback()
            raise

    # ==========================================================
    # DELETE
    # ==========================================================

    @staticmethod
    def delete(
        db: Session,
        retur_id: int,
    ):

        try:

            retur = (
                db.query(ReturPenjualan)
                .filter(
                    ReturPenjualan.id == retur_id
                )
                .first()
            )

            if retur is None:
                raise HTTPException(
                    status_code=404,
                    detail="Retur penjualan tidak ditemukan.",
                )

            # ==================================================
            # HANYA DRAFT
            # ==================================================

            if retur.status != "DRAFT":
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Retur hanya dapat dihapus "
                        "selama status masih DRAFT."
                    ),
                )

            db.delete(retur)
            db.commit()

            return {
                "message": (
                    "Retur penjualan berhasil dihapus."
                )
            }

        except HTTPException:

            db.rollback()
            raise

        except Exception:

            db.rollback()
            raise

    # ==========================================================
    # APPROVE
    # ==========================================================

    @staticmethod
    def approve(
        db: Session,
        retur_id: int,
    ):

        try:

            # ==================================================
            # AMBIL RETUR + DETAIL
            # ==================================================

            retur = (
                db.query(ReturPenjualan)
                .options(
                    joinedload(
                        ReturPenjualan.detail
                    ).joinedload(
                        ReturPenjualanDetail.barang
                    )
                )
                .filter(
                    ReturPenjualan.id == retur_id
                )
                .first()
            )

            if retur is None:
                raise HTTPException(
                    status_code=404,
                    detail="Retur penjualan tidak ditemukan.",
                )

            # ==================================================
            # VALIDASI STATUS
            # ==================================================

            if retur.status != "DRAFT":
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Retur sudah diproses "
                        "atau tidak dapat disetujui."
                    ),
                )

            # ==================================================
            # VALIDASI DETAIL
            # ==================================================

            if not retur.detail:
                raise HTTPException(
                    status_code=400,
                    detail="Retur tidak memiliki detail.",
                )

            # ==================================================
            # PROSES STOK
            # ==================================================

            for item in retur.detail:

                barang = (
                    db.query(Barang)
                    .filter(
                        Barang.id == item.barang_id
                    )
                    .first()
                )

                if barang is None:
                    raise HTTPException(
                        status_code=404,
                        detail=(
                            f"Barang ID "
                            f"{item.barang_id} "
                            "tidak ditemukan."
                        ),
                    )

                # ==================================================
                # RETUR PENJUALAN = STOK MASUK
                # ==================================================

                MutasiStokService.stok_masuk(
                    db=db,
                    barang=barang,
                    qty=Decimal(
                        str(item.qty)
                    ),
                    jenis="RETUR_PENJUALAN",
                    referensi=(
                        retur.no_retur
                        or f"RPJ-{retur.id}"
                    ),
                    keterangan=(
                        retur.alasan
                        or "Retur Penjualan"
                    ),
                    created_by=retur.created_by,
                )

            # ==================================================
            # STATUS SELESAI
            # ==================================================

            retur.status = "SELESAI"

            db.commit()
            db.refresh(retur)

            return retur

        except HTTPException:

            db.rollback()
            raise

        except Exception:

            db.rollback()
            raise

    # ==========================================================
    # REJECT / BATAL
    # ==========================================================

    @staticmethod
    def reject(
        db: Session,
        retur_id: int,
        alasan: str | None = None,
    ):

        try:

            retur = (
                db.query(ReturPenjualan)
                .filter(
                    ReturPenjualan.id == retur_id
                )
                .first()
            )

            if retur is None:
                raise HTTPException(
                    status_code=404,
                    detail="Retur penjualan tidak ditemukan.",
                )

            # ==================================================
            # HANYA DRAFT
            # ==================================================

            if retur.status != "DRAFT":
                raise HTTPException(
                    status_code=400,
                    detail="Retur sudah diproses.",
                )

            retur.status = "BATAL"

            if alasan:
                retur.alasan = alasan

            db.commit()
            db.refresh(retur)

            return retur

        except HTTPException:

            db.rollback()
            raise

        except Exception:

            db.rollback()
            raise


# ==========================================================
# INSTANCE
# ==========================================================

retur_penjualan_service = ReturPenjualanService()