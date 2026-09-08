from decimal import Decimal

from fastapi import HTTPException

from sqlalchemy import func

from sqlalchemy.orm import (
    Session,
    joinedload,
)

from app.models.pembelian import (
    Pembelian,
)

from app.models.detail_pembelian import (
    DetailPembelian,
)

from app.models.barang import (
    Barang,
)

from app.models.retur_pembelian import (
    ReturPembelian,
)

from app.models.retur_pembelian_detail import (
    ReturPembelianDetail,
)

from app.schemas.retur_pembelian import (
    ReturPembelianCreate,
    ReturPembelianUpdate,
)

from app.services.mutasi_stok_service import (
    MutasiStokService,
)


# ==========================================================
# SERVICE RETUR PEMBELIAN
# ==========================================================

class ReturPembelianService:

    # ======================================================
    # GET ALL
    # ======================================================

    @staticmethod
    def get_all(
        db: Session,
    ):

        return (
            db.query(
                ReturPembelian
            )
            .options(
                joinedload(
                    ReturPembelian.pembelian
                ),

                joinedload(
                    ReturPembelian.supplier
                ),

                joinedload(
                    ReturPembelian.user
                ),

                joinedload(
                    ReturPembelian.detail
                ).joinedload(
                    ReturPembelianDetail.barang
                ),
            )
            .order_by(
                ReturPembelian.id.desc()
            )
            .all()
        )


    # ======================================================
    # GET BY ID
    # ======================================================

    @staticmethod
    def get_by_id(
        db: Session,
        retur_id: int,
    ):

        retur = (
            db.query(
                ReturPembelian
            )
            .options(
                joinedload(
                    ReturPembelian.pembelian
                ),

                joinedload(
                    ReturPembelian.supplier
                ),

                joinedload(
                    ReturPembelian.user
                ),

                joinedload(
                    ReturPembelian.detail
                ).joinedload(
                    ReturPembelianDetail.barang
                ),
            )
            .filter(
                ReturPembelian.id
                == retur_id
            )
            .first()
        )


        if not retur:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Data retur pembelian "
                    "tidak ditemukan."
                ),
            )


        return retur


    # ======================================================
    # CREATE RETUR PEMBELIAN
    # ======================================================

    @staticmethod
    def create(
        db: Session,
        data: ReturPembelianCreate,
        created_by: int,
    ):

        try:

            # ==================================================
            # VALIDASI PEMBELIAN
            # ==================================================

            pembelian = (
                db.query(
                    Pembelian
                )
                .filter(
                    Pembelian.id
                    == data.pembelian_id
                )
                .first()
            )


            if not pembelian:

                raise HTTPException(
                    status_code=404,
                    detail=(
                        "Data pembelian "
                        "tidak ditemukan."
                    ),
                )


            # ==================================================
            # VALIDASI SUPPLIER
            # ==================================================

            if (
                data.supplier_id
                != pembelian.supplier_id
            ):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Supplier retur tidak sesuai "
                        "dengan supplier pada transaksi "
                        "pembelian."
                    ),
                )


            # ==================================================
            # VALIDASI DETAIL
            # ==================================================

            if not data.detail:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Detail retur pembelian "
                        "tidak boleh kosong."
                    ),
                )


            # ==================================================
            # CEGAH BARANG DUPLIKAT
            # ==================================================

            barang_diproses = set()


            for item in data.detail:

                if (
                    item.barang_id
                    in barang_diproses
                ):

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Barang ID "
                            f"{item.barang_id} "
                            "tidak boleh muncul "
                            "dua kali dalam satu retur."
                        ),
                    )


                barang_diproses.add(
                    item.barang_id
                )


            # ==================================================
            # VALIDASI SEMUA DETAIL
            #
            # Header belum dibuat sebelum seluruh
            # validasi selesai.
            # ==================================================

            detail_validated = []


            for item in data.detail:

                # ==============================================
                # CARI DETAIL PEMBELIAN
                # ==============================================

                detail_pembelian = (
                    db.query(
                        DetailPembelian
                    )
                    .filter(
                        DetailPembelian.pembelian_id
                        == data.pembelian_id,

                        DetailPembelian.barang_id
                        == item.barang_id,
                    )
                    .first()
                )


                # ==============================================
                # BARANG HARUS ADA PADA FAKTUR
                # ==============================================

                if not detail_pembelian:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Barang ID "
                            f"{item.barang_id} "
                            "tidak ada pada "
                            "transaksi pembelian."
                        ),
                    )


                # ==============================================
                # VALIDASI QTY
                # ==============================================

                if item.qty <= 0:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Qty retur barang ID "
                            f"{item.barang_id} "
                            "harus lebih dari 0."
                        ),
                    )


                # ==============================================
                # QTY SUDAH DISETUJUI
                # ==============================================

                qty_sudah_retur = (
                    db.query(
                        func.coalesce(
                            func.sum(
                                ReturPembelianDetail.qty
                            ),
                            0,
                        )
                    )
                    .join(
                        ReturPembelian,
                        ReturPembelian.id
                        == ReturPembelianDetail.retur_id,
                    )
                    .filter(
                        ReturPembelian.pembelian_id
                        == data.pembelian_id,

                        ReturPembelianDetail.barang_id
                        == item.barang_id,

                        ReturPembelian.status
                        == "DISETUJUI",
                    )
                    .scalar()
                )


                qty_sudah_retur = (
                    qty_sudah_retur
                    or 0
                )


                # ==============================================
                # QTY SEDANG PENDING
                # ==============================================

                qty_pending = (
                    db.query(
                        func.coalesce(
                            func.sum(
                                ReturPembelianDetail.qty
                            ),
                            0,
                        )
                    )
                    .join(
                        ReturPembelian,
                        ReturPembelian.id
                        == ReturPembelianDetail.retur_id,
                    )
                    .filter(
                        ReturPembelian.pembelian_id
                        == data.pembelian_id,

                        ReturPembelianDetail.barang_id
                        == item.barang_id,

                        ReturPembelian.status
                        == "PENDING",
                    )
                    .scalar()
                )


                qty_pending = (
                    qty_pending
                    or 0
                )


                # ==============================================
                # CEGAH RETUR PENDING BERULANG
                # ==============================================

                if qty_pending > 0:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Barang ID "
                            f"{item.barang_id} "
                            "masih memiliki retur "
                            f"PENDING sebanyak "
                            f"{qty_pending}. "
                            "Selesaikan retur tersebut "
                            "terlebih dahulu."
                        ),
                    )


                # ==============================================
                # HITUNG SISA QTY
                # ==============================================

                sisa_qty = (
                    detail_pembelian.qty
                    - qty_sudah_retur
                )


                # ==============================================
                # VALIDASI QTY
                # ==============================================

                if item.qty > sisa_qty:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "Qty retur melebihi "
                            f"sisa ({sisa_qty})"
                        ),
                    )


                # ==================================================
                # HARGA RETUR
                #
                # !!! PENTING !!!
                #
                # Harga TIDAK diambil dari:
                #
                #     item.harga
                #
                # Harga selalu diambil langsung dari:
                #
                #     detail_pembelian.harga_beli
                #
                # sehingga harga retur sama dengan harga
                # historis pada faktur pembelian.
                # ==================================================

                harga_faktur = Decimal(
                    str(
                        detail_pembelian.harga_beli
                    )
                )


                # ==============================================
                # VALIDASI HARGA FAKTUR
                # ==============================================

                if harga_faktur <= 0:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Harga beli pada faktur "
                            f"untuk barang ID "
                            f"{item.barang_id} "
                            "harus lebih dari 0."
                        ),
                    )


                # ==============================================
                # SUBTOTAL RETUR
                #
                # Qty retur × harga faktur
                # ==============================================

                subtotal = (
                    Decimal(
                        str(item.qty)
                    )
                    * harga_faktur
                )


                # ==============================================
                # SIMPAN DATA YANG SUDAH VALID
                # ==============================================

                detail_validated.append(
                    {
                        "barang_id":
                            item.barang_id,

                        "qty":
                            item.qty,

                        "harga":
                            harga_faktur,

                        "subtotal":
                            subtotal,

                        "kondisi":
                            item.kondisi,
                    }
                )


            # ==================================================
            # BUAT HEADER RETUR
            #
            # Baru dibuat setelah semua validasi lolos.
            # ==================================================

            retur = ReturPembelian(

                pembelian_id=
                    data.pembelian_id,

                supplier_id=
                    data.supplier_id,

                created_by= created_by,

                alasan=
                    data.alasan,

                jenis_refund=
                    data.jenis_refund,

                status=
                    "PENDING",

                total=
                    Decimal("0"),
            )


            db.add(
                retur
            )

            db.flush()


            # ==================================================
            # SIMPAN DETAIL RETUR
            # ==================================================

            total = Decimal(
                "0"
            )


            for item in detail_validated:

                db.add(
                    ReturPembelianDetail(

                        retur_id=
                            retur.id,

                        barang_id=
                            item["barang_id"],

                        qty=
                            item["qty"],

                        harga=
                            item["harga"],

                        subtotal=
                            item["subtotal"],

                        kondisi=
                            item["kondisi"],
                    )
                )


                total += (
                    item["subtotal"]
                )


            # ==================================================
            # SIMPAN TOTAL
            # ==================================================

            retur.total = total


            db.commit()


            db.refresh(
                retur
            )


            return retur


        except HTTPException:

            db.rollback()

            raise


        except Exception:

            db.rollback()

            raise


    # ======================================================
    # UPDATE
    # ======================================================

    @staticmethod
    def update(
        db: Session,
        retur_id: int,
        data: ReturPembelianUpdate,
    ):

        try:

            retur = (
                db.query(
                    ReturPembelian
                )
                .filter(
                    ReturPembelian.id
                    == retur_id
                )
                .first()
            )


            if not retur:

                raise HTTPException(
                    status_code=404,
                    detail=(
                        "Retur pembelian "
                        "tidak ditemukan."
                    ),
                )


            # ================================================
            # HANYA RETUR PENDING YANG BOLEH DIUBAH
            # ================================================

            if (
                retur.status
                != "PENDING"
            ):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Retur sudah diproses."
                    ),
                )


            # ================================================
            # UPDATE ALASAN
            # ================================================

            if (
                data.alasan
                is not None
            ):

                retur.alasan = (
                    data.alasan
                )


            # ================================================
            # UPDATE JENIS REFUND
            # ================================================

            if (
                data.jenis_refund
                is not None
            ):

                retur.jenis_refund = (
                    data.jenis_refund
                )


            db.commit()

            db.refresh(
                retur
            )


            return retur


        except HTTPException:

            db.rollback()

            raise


        except Exception:

            db.rollback()

            raise


    # ======================================================
    # DELETE
    # ======================================================

    @staticmethod
    def delete(
        db: Session,
        retur_id: int,
    ):

        try:

            retur = (
                db.query(
                    ReturPembelian
                )
                .filter(
                    ReturPembelian.id
                    == retur_id
                )
                .first()
            )


            if not retur:

                raise HTTPException(
                    status_code=404,
                    detail=(
                        "Retur pembelian "
                        "tidak ditemukan."
                    ),
                )


            # ================================================
            # HANYA PENDING YANG BOLEH DIHAPUS
            # ================================================

            if (
                retur.status
                != "PENDING"
            ):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Retur sudah diproses."
                    ),
                )


            db.delete(
                retur
            )


            db.commit()


            return {
                "message":
                    (
                        "Retur pembelian "
                        "berhasil dihapus."
                    )
            }


        except HTTPException:

            db.rollback()

            raise


        except Exception:

            db.rollback()

            raise


    # ======================================================
    # APPROVE
    # ======================================================

    @staticmethod
    def approve(
        db: Session,
        retur_id: int,
    ):

        try:

            retur = (
                db.query(
                    ReturPembelian
                )
                .options(
                    joinedload(
                        ReturPembelian.detail
                    ).joinedload(
                        ReturPembelianDetail.barang
                    )
                )
                .filter(
                    ReturPembelian.id
                    == retur_id
                )
                .first()
            )


            if not retur:

                raise HTTPException(
                    status_code=404,
                    detail=(
                        "Retur pembelian "
                        "tidak ditemukan."
                    ),
                )


            # ================================================
            # HANYA PENDING YANG BOLEH DISETUJUI
            # ================================================

            if (
                retur.status
                != "PENDING"
            ):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Retur sudah diproses."
                    ),
                )


            # ==================================================
            # VALIDASI ULANG SAAT APPROVE
            # ==================================================

            for item in retur.detail:

                # ==============================================
                # QTY SUDAH DISETUJUI DARI RETUR LAIN
                # ==============================================

                qty_sudah_disetujui = (

                    db.query(
                        func.coalesce(
                            func.sum(
                                ReturPembelianDetail.qty
                            ),
                            0,
                        )
                    )

                    .join(
                        ReturPembelian,
                        ReturPembelian.id
                        == ReturPembelianDetail.retur_id,
                    )

                    .filter(

                        ReturPembelian.pembelian_id
                        == retur.pembelian_id,

                        ReturPembelianDetail.barang_id
                        == item.barang_id,

                        ReturPembelian.status
                        == "DISETUJUI",

                        ReturPembelian.id
                        != retur.id,
                    )

                    .scalar()
                )


                qty_sudah_disetujui = (
                    qty_sudah_disetujui
                    or 0
                )


                # ==============================================
                # CARI DETAIL FAKTUR
                # ==============================================

                detail_pembelian = (

                    db.query(
                        DetailPembelian
                    )

                    .filter(

                        DetailPembelian.pembelian_id
                        == retur.pembelian_id,

                        DetailPembelian.barang_id
                        == item.barang_id,
                    )

                    .first()
                )


                if not detail_pembelian:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Barang ID "
                            f"{item.barang_id} "
                            "tidak ditemukan pada "
                            "detail pembelian."
                        ),
                    )


                # ==============================================
                # HITUNG SISA QTY
                # ==============================================

                sisa_qty = (

                    detail_pembelian.qty
                    - qty_sudah_disetujui
                )


                # ==============================================
                # VALIDASI QTY
                # ==============================================

                if (
                    item.qty
                    > sisa_qty
                ):

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Qty retur barang ID "
                            f"{item.barang_id} "
                            "melebihi sisa qty yang "
                            f"tersedia ({sisa_qty})."
                        ),
                    )


                # =================================================
                # SINKRONKAN HARGA DETAIL
                #
                # Bila harga master berubah setelah retur dibuat,
                # harga retur tetap menggunakan harga faktur.
                # =================================================

                harga_faktur = Decimal(
                    str(
                        detail_pembelian.harga_beli
                    )
                )


                if harga_faktur <= 0:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Harga beli pada faktur "
                            f"untuk barang ID "
                            f"{item.barang_id} "
                            "tidak valid."
                        ),
                    )


                # ==============================================
                # PASTIKAN NILAI RETUR TETAP SESUAI FAKTUR
                # ==============================================

                item.harga = (
                    harga_faktur
                )

                item.subtotal = (

                    Decimal(
                        str(item.qty)
                    )
                    * harga_faktur
                )


            # ==================================================
            # HITUNG ULANG TOTAL RETUR
            # ==================================================

            total_retur = Decimal(
                "0"
            )


            for item in retur.detail:

                total_retur += Decimal(
                    str(
                        item.subtotal
                    )
                )


            retur.total = (
                total_retur
            )


            # ==================================================
            # PROSES STOK KELUAR
            # ==================================================

            for item in retur.detail:

                barang = (

                    db.query(
                        Barang
                    )

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


                MutasiStokService.stok_keluar(

                    db=db,

                    barang=barang,

                    qty=Decimal(
                        str(
                            item.qty
                        )
                    ),

                    jenis=
                        "RETUR_PEMBELIAN",

                    referensi=(
                        f"RPB-{retur.id}"
                    ),

                    keterangan=
                        retur.alasan,

                    created_by=
                        retur.created_by,
                )


            # ==================================================
            # UBAH STATUS
            # ==================================================

            retur.status = (
                "DISETUJUI"
            )


            db.commit()


            db.refresh(
                retur
            )


            return retur


        except HTTPException:

            db.rollback()

            raise


        except Exception:

            db.rollback()

            raise


    # ======================================================
    # REJECT
    # ======================================================

    @staticmethod
    def reject(
        db: Session,
        retur_id: int,
        alasan: str | None = None,
    ):

        try:

            retur = (
                db.query(
                    ReturPembelian
                )
                .filter(
                    ReturPembelian.id
                    == retur_id
                )
                .first()
            )


            if not retur:

                raise HTTPException(
                    status_code=404,
                    detail=(
                        "Retur pembelian "
                        "tidak ditemukan."
                    ),
                )


            # ================================================
            # HANYA PENDING YANG BOLEH DITOLAK
            # ================================================

            if (
                retur.status
                != "PENDING"
            ):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Retur sudah diproses."
                    ),
                )


            retur.status = (
                "DITOLAK"
            )


            if alasan:

                retur.alasan = (
                    alasan
                )


            db.commit()


            db.refresh(
                retur
            )


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

retur_pembelian_service = (
    ReturPembelianService()
)