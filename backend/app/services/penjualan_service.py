from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.penjualan import Penjualan
from app.models.detail_penjualan import DetailPenjualan

from app.schemas.penjualan import PenjualanCreate

from app.repositories.penjualan import (
    penjualan_repository,
)

from app.services.mutasi_stok_service import (
    MutasiStokService,
)


class PenjualanService:

    # =====================================================
    # GET ALL
    # =====================================================

    def get_all(
        self,
        db: Session,
    ):
        return penjualan_repository.get_all(db)

    # =====================================================
    # GET BY ID
    # =====================================================

    def get_by_id(
        self,
        db: Session,
        penjualan_id: int,
    ):

        penjualan = penjualan_repository.get_by_id(
            db,
            penjualan_id,
        )

        if penjualan is None:
            raise HTTPException(
                status_code=404,
                detail="Penjualan tidak ditemukan.",
            )

        return penjualan

    # =====================================================
    # CREATE PENJUALAN
    # =====================================================

    def create_penjualan(
        self,
        db: Session,
        data: PenjualanCreate,
        user_id: int,
    ):

        try:

            # =============================================
            # GENERATE NOMOR FAKTUR
            # =============================================

            no_faktur = (
                penjualan_repository.generate_nomor_faktur(
                    db
                )
            )

            # =============================================
            # HITUNG SUBTOTAL
            # =============================================

            subtotal = Decimal("0")

            detail_barang = []

            # =============================================
            # VALIDASI BARANG
            # =============================================

            for item in data.items:

                barang = (
                    penjualan_repository.get_barang(
                        db,
                        item.barang_id,
                    )
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

                stok = Decimal(
                    str(barang.stok)
                )

                qty = Decimal(
                    str(item.qty)
                )

                # =========================================
                # VALIDASI STOK
                # =========================================

                if stok < qty:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Stok {barang.nama_barang} "
                            "tidak mencukupi. "
                            f"Stok tersedia: {stok}, "
                            f"diminta: {qty}."
                        ),
                    )

                # =========================================
                # VALIDASI HARGA
                # =========================================

                harga_jual = Decimal(
                    str(item.harga_jual)
                )

                if harga_jual < 0:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Harga jual barang ID "
                            f"{item.barang_id} "
                            "tidak boleh negatif."
                        ),
                    )

                # =========================================
                # HITUNG SUBTOTAL ITEM
                # =========================================

                nilai_subtotal = (
                    qty * harga_jual
                )

                subtotal += nilai_subtotal

                detail_barang.append(
                    {
                        "barang": barang,
                        "qty": qty,
                        "harga_jual": harga_jual,
                        "subtotal": nilai_subtotal,
                    }
                )

            # =============================================
            # VALIDASI DISKON
            # =============================================

            diskon = Decimal(
                str(data.diskon)
            )

            if diskon < 0:
                raise HTTPException(
                    status_code=400,
                    detail="Diskon tidak boleh negatif.",
                )

            # =============================================
            # VALIDASI PAJAK
            # =============================================

            pajak = Decimal(
                str(data.pajak)
            )

            if pajak < 0:
                raise HTTPException(
                    status_code=400,
                    detail="Pajak tidak boleh negatif.",
                )

            # =============================================
            # GRAND TOTAL
            # =============================================

            grand_total = (
                subtotal
                - diskon
                + pajak
            )

            if grand_total < 0:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Diskon tidak boleh lebih besar "
                        "dari subtotal ditambah pajak."
                    ),
                )

            # =============================================
            # PEMBAYARAN
            # =============================================

            dibayar = Decimal(
                str(data.dibayar)
            )

            if dibayar < 0:
                raise HTTPException(
                    status_code=400,
                    detail="Nominal pembayaran tidak boleh negatif.",
                )

            if dibayar < grand_total:
                raise HTTPException(
                    status_code=400,
                    detail="Pembayaran kurang.",
                )

            # =============================================
            # KEMBALIAN
            # =============================================

            kembalian = (
                dibayar - grand_total
            )

            # =============================================
            # HEADER PENJUALAN
            # =============================================

            penjualan = Penjualan(

                no_faktur=no_faktur,

                pelanggan_id=data.pelanggan_id,

                subtotal=subtotal,

                diskon=diskon,

                pajak=pajak,

                grand_total=grand_total,

                metode_bayar=data.metode_bayar,

                dibayar=dibayar,

                kembalian=kembalian,

                status="SELESAI",

                keterangan=data.keterangan,
            )

            penjualan_repository.create_penjualan(
                db,
                penjualan,
            )

            # =============================================
            # DETAIL + STOK
            # =============================================

            for item in detail_barang:

                barang = item["barang"]

                qty = item["qty"]

                harga_jual = item["harga_jual"]

                nilai_subtotal = item["subtotal"]

                # =========================================
                # SIMPAN DETAIL PENJUALAN
                # =========================================

                detail = DetailPenjualan(

                    penjualan_id=penjualan.id,

                    barang_id=barang.id,

                    qty=qty,

                    harga_jual=harga_jual,

                    subtotal=nilai_subtotal,
                )

                penjualan_repository.create_detail(
                    db,
                    detail,
                )

                # =========================================
                # STOK KELUAR + MUTASI STOK
                # =========================================

                MutasiStokService.stok_keluar(

                    db=db,

                    barang=barang,

                    qty=qty,

                    jenis="PENJUALAN",

                    referensi=no_faktur,

                    keterangan=(
                        f"Penjualan {no_faktur}"
                    ),

                    created_by=user_id,
                )

            # =============================================
            # COMMIT
            # =============================================

            penjualan_repository.commit(
                db
            )

            return penjualan

        # =============================================
        # HTTP EXCEPTION
        # =============================================

        except HTTPException:

            penjualan_repository.rollback(
                db
            )

            raise

        # =============================================
        # ERROR LAIN
        # =============================================

        except Exception:

            penjualan_repository.rollback(
                db
            )

            raise

    # =====================================================
    # DELETE
    # =====================================================

    def delete(
        self,
        db: Session,
        penjualan_id: int,
    ):

        penjualan = (
            penjualan_repository.get_by_id(
                db,
                penjualan_id,
            )
        )

        if penjualan is None:
            raise HTTPException(
                status_code=404,
                detail="Penjualan tidak ditemukan.",
            )

        penjualan_repository.delete(
            db,
            penjualan,
        )

        penjualan_repository.commit(
            db
        )

        return {
            "message": (
                "Penjualan berhasil dihapus."
            )
        }


# =====================================================
# INSTANCE
# =====================================================

penjualan_service = PenjualanService()