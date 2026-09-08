from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.penjualan import Penjualan
from app.models.detail_penjualan import DetailPenjualan

from app.schemas.penjualan import PenjualanCreate

from app.repositories.penjualan import (
    penjualan_repository
)


class PenjualanService:

    def create_penjualan(
        self,
        db: Session,
        data: PenjualanCreate,
        user_id: int
    ):

        try:

            # ==========================
            # Nomor Faktur
            # ==========================
            no_faktur = (
                "PJ" +
                datetime.now().strftime("%Y%m%d%H%M%S")
            )

            subtotal = 0

            # ==========================
            # Hitung Subtotal
            # ==========================
            for item in data.items:

                barang = penjualan_repository.get_barang(
                    db,
                    item.barang_id
                )

                if barang is None:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Barang ID {item.barang_id} tidak ditemukan"
                    )

                if barang.stok < item.qty:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Stok {barang.nama_barang} tidak mencukupi"
                    )

                subtotal += item.qty * item.harga_jual

            total = (
                subtotal
                - data.diskon
                + data.pajak
            )

            if data.bayar < total:
                raise HTTPException(
                    status_code=400,
                    detail="Pembayaran kurang."
                )

            kembalian = data.bayar - total

            # ==========================
            # Header Penjualan
            # ==========================
            penjualan = Penjualan(

                no_faktur=no_faktur,

                pelanggan_id=data.pelanggan_id,

                user_id=user_id,

                subtotal=subtotal,

                diskon=data.diskon,

                pajak=data.pajak,

                total=total,

                bayar=data.bayar,

                kembalian=kembalian,

                status="selesai",

                keterangan=data.keterangan
            )

            penjualan_repository.create_penjualan(
                db,
                penjualan
            )

            # ==========================
            # Detail Penjualan
            # ==========================
            for item in data.items:

                barang = penjualan_repository.get_barang(
                    db,
                    item.barang_id
                )

                detail = DetailPenjualan(

                    penjualan_id=penjualan.id,

                    barang_id=item.barang_id,

                    qty=item.qty,

                    harga_jual=item.harga_jual,

                    subtotal=item.qty * item.harga_jual
                )

                penjualan_repository.create_detail(
                    db,
                    detail
                )

                penjualan_repository.update_stok(
                    db,
                    barang,
                    item.qty
                )

            penjualan_repository.commit(db)

            return penjualan

        except Exception:

            penjualan_repository.rollback(db)

            raise


penjualan_service = PenjualanService()