from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.penjualan import Penjualan
from app.models.detail_penjualan import DetailPenjualan
from app.models.retur_penjualan import ReturPenjualan
from app.models.retur_penjualan_detail import ReturPenjualanDetail
from app.models.barang import Barang

from app.schemas.retur_penjualan import ReturPenjualanCreate

from app.services.mutasi_stok_service import MutasiStokService


class ReturPenjualanService:

    # ==========================================================
    # CREATE RETUR PENJUALAN
    # ==========================================================

    @staticmethod
    def create(
        db: Session,
        data: ReturPenjualanCreate,
        current_user_id: int,
    ):

        try:

            # ======================================================
            # 1. CARI PENJUALAN
            # ======================================================

            penjualan = (
                db.query(Penjualan)
                .filter(
                    Penjualan.id == data.penjualan_id
                )
                .first()
            )

            if not penjualan:
                raise HTTPException(
                    status_code=404,
                    detail="Penjualan tidak ditemukan.",
                )

            # ======================================================
            # 2. VALIDASI DETAIL
            # ======================================================

            if not data.detail:
                raise HTTPException(
                    status_code=400,
                    detail="Detail retur tidak boleh kosong.",
                )

            # ======================================================
            # 3. BUAT NOMOR RETUR UNIK
            # ======================================================

            tanggal_retur = datetime.now().strftime("%Y%m%d")

            prefix = f"RPJ-{tanggal_retur}-"

            retur_terakhir = (
                db.query(ReturPenjualan)
                .filter(
                    ReturPenjualan.no_retur.like(
                        f"{prefix}%"
                    )
                )
                .order_by(
                    ReturPenjualan.id.desc()
                )
                .first()
            )

            nomor_urut = 1

            if (
                retur_terakhir
                and retur_terakhir.no_retur
            ):
                try:
                    nomor_urut = (
                        int(
                            retur_terakhir.no_retur
                            .split("-")[-1]
                        )
                        + 1
                    )

                except (
                    ValueError,
                    AttributeError,
                ):
                    nomor_urut = 1

            no_retur = (
                f"{prefix}{nomor_urut:04d}"
            )

            # ======================================================
            # 4. BUAT HEADER RETUR
            # ======================================================

            retur = ReturPenjualan(
                no_retur=no_retur,
                penjualan_id=data.penjualan_id,
                pelanggan_id=penjualan.pelanggan_id,
                created_by=current_user_id,
                alasan=data.alasan,
                jenis_refund=data.jenis_refund,
                status="DRAFT",
                total=Decimal("0"),
            )

            db.add(retur)

            db.flush()

            # ======================================================
            # 5. DETAIL RETUR
            # ======================================================

            total = Decimal("0")

            for item in data.detail:

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

                if not detail_penjualan:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Barang ID "
                            f"{item.barang_id} "
                            "tidak ada pada "
                            "transaksi penjualan."
                        ),
                    )

                # ==================================================
                # CEK QTY
                # ==================================================

                if item.qty <= 0:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "Qty retur harus "
                            "lebih dari 0."
                        ),
                    )

                if item.qty > detail_penjualan.qty:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Qty retur barang ID "
                            f"{item.barang_id} "
                            "melebihi qty penjualan."
                        ),
                    )

                # ==================================================
                # GUNAKAN HARGA PENJUALAN ASLI
                # ==================================================

                harga = Decimal(
                    str(
                        detail_penjualan.harga_jual
                    )
                )

                subtotal = (
                    Decimal(str(item.qty))
                    * harga
                )

                # ==================================================
                # BUAT DETAIL RETUR
                # ==================================================

                detail_retur = ReturPenjualanDetail(
                    retur_id=retur.id,
                    barang_id=item.barang_id,
                    qty=item.qty,
                    harga=harga,
                    subtotal=subtotal,
                    kondisi=item.kondisi,
                )

                db.add(detail_retur)

                total += subtotal

            # ======================================================
            # 6. UPDATE TOTAL
            # ======================================================

            retur.total = total

            # ======================================================
            # 7. SIMPAN
            # ======================================================

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
    # APPROVE RETUR PENJUALAN
    # ==========================================================

    @staticmethod
    def approve(
        db: Session,
        retur_id: int,
    ):

        try:

            # ==================================================
            # 1. CARI RETUR
            # ==================================================

            retur = (
                db.query(ReturPenjualan)
                .filter(
                    ReturPenjualan.id == retur_id
                )
                .first()
            )

            if not retur:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        "Retur penjualan "
                        "tidak ditemukan."
                    ),
                )

            # ==================================================
            # 2. CEK STATUS
            # ==================================================

            if retur.status != "DRAFT":
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Retur tidak dapat "
                        "di-approve. "
                        f"Status saat ini: "
                        f"{retur.status}"
                    ),
                )

            # ==================================================
            # 3. AMBIL DETAIL RETUR
            # ==================================================

            detail_retur = (
                db.query(
                    ReturPenjualanDetail
                )
                .filter(
                    ReturPenjualanDetail.retur_id
                    == retur.id
                )
                .all()
            )

            if not detail_retur:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Detail retur "
                        "tidak ditemukan."
                    ),
                )

            # ==================================================
            # 4. PROSES STOK
            # ==================================================

            for item in detail_retur:

                barang = (
                    db.query(Barang)
                    .filter(
                        Barang.id
                        == item.barang_id
                    )
                    .first()
                )

                if not barang:
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
                    referensi=retur.no_retur,
                    keterangan=(
                        retur.alasan
                        or "Retur Penjualan"
                    ),
                    created_by=retur.created_by,
                )

            # ==================================================
            # 5. UBAH STATUS RETUR
            # ==================================================

            retur.status = "SELESAI"

            # ==================================================
            # 6. SIMPAN
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
# INSTANCE SERVICE
# ==========================================================

retur_penjualan_service = (
    ReturPenjualanService()
)