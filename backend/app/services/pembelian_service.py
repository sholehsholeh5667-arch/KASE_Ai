from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.pembelian import Pembelian
from app.models.detail_pembelian import DetailPembelian

from app.schemas.pembelian import PembelianCreate

from app.repositories.pembelian import (
    pembelian_repository,
)

from app.services.mutasi_stok_service import (
    MutasiStokService,
)


# ==========================================================
# PEMBELIAN SERVICE
# ==========================================================

class PembelianService:

    # ======================================================
    # CREATE PEMBELIAN
    # ======================================================

    def create_pembelian(
        self,
        db: Session,
        data: PembelianCreate,
        user_id: int | None = None,
    ):

        # ==================================================
        # USER
        # ==================================================

        if user_id is None:
            user_id = data.user_id

        if user_id is None:
            raise HTTPException(
                status_code=400,
                detail="User belum ditentukan.",
            )

        # ==================================================
        # VALIDASI DETAIL
        # ==================================================

        if not data.detail:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Detail pembelian "
                    "tidak boleh kosong."
                ),
            )

        try:

            # ==============================================
            # VALIDASI USER
            # ==============================================

            user = (
                db.query(User)
                .filter(
                    User.id == user_id
                )
                .first()
            )

            if user is None:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"User ID {user_id} "
                        "tidak ditemukan."
                    ),
                )

            if not user.aktif:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"User ID {user_id} "
                        "tidak aktif."
                    ),
                )

            # ==============================================
            # VALIDASI SUPPLIER
            # ==============================================

            supplier = (
                pembelian_repository.get_supplier(
                    db,
                    data.supplier_id,
                )
            )

            if supplier is None:
                raise HTTPException(
                    status_code=404,
                    detail="Supplier tidak ditemukan.",
                )

            if not supplier.aktif:
                raise HTTPException(
                    status_code=400,
                    detail="Supplier tidak aktif.",
                )

            # ==============================================
            # NOMOR FAKTUR
            # ==============================================

            if data.no_faktur:

                no_faktur = (
                    data.no_faktur.strip()
                )

                if len(no_faktur) > 30:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "No faktur maksimal "
                            "30 karakter."
                        ),
                    )

                if not no_faktur:
                    no_faktur = (
                        pembelian_repository
                        .generate_nomor_faktur(db)
                    )

            else:

                no_faktur = (
                    pembelian_repository
                    .generate_nomor_faktur(db)
                )

            # ==============================================
            # CEK DUPLIKAT NO FAKTUR
            # ==============================================

            pembelian_existing = (
                db.query(Pembelian)
                .filter(
                    Pembelian.no_faktur
                    == no_faktur
                )
                .first()
            )

            if pembelian_existing is not None:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"No faktur '{no_faktur}' "
                        "sudah digunakan."
                    ),
                )

            # ==============================================
            # HITUNG TOTAL DETAIL
            # ==============================================

            total = Decimal("0")

            detail_barang = []

            for item in data.detail:

                # ==========================================
                # CARI BARANG
                # ==========================================

                barang = (
                    pembelian_repository.get_barang(
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

                # ==========================================
                # BARANG AKTIF
                # ==========================================

                if not barang.aktif:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Barang ID "
                            f"{item.barang_id} "
                            "tidak aktif."
                        ),
                    )

                # ==========================================
                # DECIMAL
                # ==========================================

                qty = Decimal(
                    str(item.qty)
                )

                harga_beli = Decimal(
                    str(item.harga_beli)
                )

                # ==========================================
                # VALIDASI QTY
                # ==========================================

                if qty <= 0:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Qty barang ID "
                            f"{item.barang_id} "
                            "harus lebih dari 0."
                        ),
                    )

                # ==========================================
                # VALIDASI HARGA
                # ==========================================

                if harga_beli <= 0:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Harga beli barang ID "
                            f"{item.barang_id} "
                            "harus lebih dari 0."
                        ),
                    )

                # ==========================================
                # SUBTOTAL
                # ==========================================

                subtotal = (
                    qty * harga_beli
                )

                total += subtotal

                detail_barang.append(
                    {
                        "barang": barang,
                        "qty": qty,
                        "harga_beli": harga_beli,
                        "subtotal": subtotal,
                    }
                )

            # ==============================================
            # DISKON
            #
            # Modul UI Pembelian tidak menyediakan
            # input diskon.
            # Nilai tetap 0.
            # ==============================================

            diskon = Decimal(
                str(
                    data.diskon
                    if data.diskon is not None
                    else 0
                )
            )

            if diskon < 0:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Diskon tidak boleh negatif."
                    ),
                )

            # ==============================================
            # GRAND TOTAL
            # ==============================================

            grand_total = (
                total - diskon
            )

            if grand_total < 0:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Diskon tidak boleh lebih besar "
                        "dari total pembelian."
                    ),
                )

            # ==============================================
            # SIMPAN HEADER PEMBELIAN
            # ==============================================

            pembelian = Pembelian(
                no_faktur=no_faktur,
                supplier_id=data.supplier_id,
                user_id=user_id,
                tanggal=data.tanggal,
                total=total,
                diskon=diskon,
                grand_total=grand_total,
                keterangan=data.keterangan,
            )

            pembelian_repository.create_pembelian(
                db,
                pembelian,
            )

            # ==============================================
            # DETAIL + STOK
            # ==============================================

            for item in detail_barang:

                barang = item["barang"]

                qty = item["qty"]

                harga_beli = item["harga_beli"]

                subtotal = item["subtotal"]

                # ==========================================
                # DETAIL
                # ==========================================

                detail = DetailPembelian(
                    pembelian_id=pembelian.id,
                    barang_id=barang.id,
                    qty=qty,
                    harga_beli=harga_beli,
                    subtotal=subtotal,
                )

                pembelian_repository.create_detail(
                    db,
                    detail,
                )

                # ==========================================
                # UPDATE HARGA BELI TERAKHIR
                # ==========================================

                pembelian_repository.update_harga_beli(
                    db,
                    barang,
                    harga_beli,
                )

                # ==========================================
                # MUTASI STOK MASUK
                # ==========================================

                MutasiStokService.stok_masuk(
                    db=db,
                    barang=barang,
                    qty=qty,
                    jenis="PEMBELIAN",
                    referensi=no_faktur,
                    keterangan=(
                        f"Pembelian {no_faktur}"
                    ),
                    created_by=user_id,
                )

            # ==============================================
            # COMMIT
            # ==============================================

            pembelian_repository.commit(
                db
            )

            # ==============================================
            # RETURN
            # ==============================================

            return pembelian

        except HTTPException:

            pembelian_repository.rollback(
                db
            )

            raise

        except Exception:

            pembelian_repository.rollback(
                db
            )

            raise


# ==========================================================
# INSTANCE
# ==========================================================

pembelian_service = PembelianService()


# ==========================================================
# KOMPATIBILITAS LAMA
# ==========================================================

def simpan_pembelian(
    db: Session,
    data: PembelianCreate,
):

    return pembelian_service.create_pembelian(
        db=db,
        data=data,
        user_id=data.user_id,
    )