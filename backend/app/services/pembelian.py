from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.pembelian import Pembelian
from app.models.detail_pembelian import DetailPembelian

from app.schemas.pembelian import PembelianCreate

from app.repositories.pembelian import (
    pembelian_repository
)


class PembelianService:

    def create_pembelian(
        self,
        db: Session,
        data: PembelianCreate,
        user_id: int
    ):

        try:

            # ======================================
            # Validasi Supplier
            # ======================================
            supplier = pembelian_repository.get_supplier(
                db,
                data.supplier_id
            )

            if supplier is None:
                raise HTTPException(
                    status_code=404,
                    detail="Supplier tidak ditemukan."
                )

            # ======================================
            # Generate Nomor Faktur
            # ======================================
            no_faktur = (
                pembelian_repository.generate_nomor_faktur(db)
            )

            subtotal = Decimal("0")

            detail_barang = []

            # ======================================
            # Validasi Barang & Hitung Subtotal
            # ======================================
            for item in data.items:

                barang = pembelian_repository.get_barang(
                    db,
                    item.barang_id
                )

                if barang is None:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Barang ID {item.barang_id} tidak ditemukan."
                    )

                nilai_subtotal = (
                    item.qty * item.harga_beli
                )

                subtotal += nilai_subtotal

                detail_barang.append({
                    "barang": barang,
                    "qty": item.qty,
                    "harga_beli": item.harga_beli,
                    "subtotal": nilai_subtotal
                })

            total = (
                subtotal
                - data.diskon
                + data.pajak
            )

            # ======================================
            # Simpan Header Pembelian
            # ======================================
            pembelian = Pembelian(

                no_faktur=no_faktur,

                supplier_id=data.supplier_id,

                user_id=user_id,

                subtotal=subtotal,

                diskon=data.diskon,

                pajak=data.pajak,

                total=total,

                keterangan=data.keterangan
            )

            pembelian_repository.create_pembelian(
                db,
                pembelian
            )

            # ======================================
            # Simpan Detail + Tambah Stok
            # ======================================
            for item in detail_barang:

                detail = DetailPembelian(

                    pembelian_id=pembelian.id,

                    barang_id=item["barang"].id,

                    qty=item["qty"],

                    harga_beli=item["harga_beli"],

                    subtotal=item["subtotal"]
                )

                pembelian_repository.create_detail(
                    db,
                    detail
                )

                # Tambah stok
                pembelian_repository.tambah_stok(
                    db,
                    item["barang"],
                    item["qty"]
                )

                # Update harga beli terakhir
                pembelian_repository.update_harga_beli(
                    db,
                    item["barang"],
                    item["harga_beli"]
                )

            pembelian_repository.commit(db)

            return pembelian

        except Exception:

            pembelian_repository.rollback(db)

            raise


pembelian_service = PembelianService()