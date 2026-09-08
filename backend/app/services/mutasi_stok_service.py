from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.mutasi_stok import MutasiStok
from app.models.barang import Barang
from app.schemas.mutasi_stok import (
    MutasiStokCreate,
    MutasiStokUpdate,
)


class MutasiStokService:

    JENIS_VALID = {
        "PEMBELIAN",
        "PENJUALAN",
        "RETUR_PEMBELIAN",
        "RETUR_PENJUALAN",
        "STOCK_OPNAME",
        "PENYESUAIAN",
        "TRANSFER_GUDANG",
        "PRODUKSI",
        "HILANG",
        "RUSAK",
    }

    JENIS_STOK_MASUK = {
        "PEMBELIAN",
        "RETUR_PENJUALAN",
        "PRODUKSI",
    }

    JENIS_STOK_KELUAR = {
        "PENJUALAN",
        "RETUR_PEMBELIAN",
        "HILANG",
        "RUSAK",
    }

    JENIS_UPDATE_DIIZINKAN = {
        "jenis",
        "qty",
        "keterangan",
    }

    # =========================================================
    # GET ALL
    # =========================================================

    @staticmethod
    def get_all(
        db: Session,
        page: int = 1,
        size: int = 10,
    ):
        offset = (page - 1) * size

        query = (
            db.query(MutasiStok)
            .order_by(MutasiStok.id.desc())
        )

        total = query.count()

        items = (
            query
            .offset(offset)
            .limit(size)
            .all()
        )

        return {
            "items": items,
            "total": total,
        }

    # =========================================================
    # GET BY ID
    # =========================================================

    @staticmethod
    def get_by_id(
        db: Session,
        mutasi_id: int,
    ):
        return (
            db.query(MutasiStok)
            .filter(MutasiStok.id == mutasi_id)
            .first()
        )

    # =========================================================
    # CREATE
    # =========================================================

    @staticmethod
    def create(
        db: Session,
        data: MutasiStokCreate,
        created_by: int,
    ):
        try:
            # -------------------------------------------------
            # CARI BARANG
            # -------------------------------------------------

            barang = (
                db.query(Barang)
                .filter(Barang.id == data.barang_id)
                .first()
            )

            if not barang:
                raise ValueError(
                    f"Barang dengan id {data.barang_id} tidak ditemukan"
                )

            # -------------------------------------------------
            # NORMALISASI JENIS
            # -------------------------------------------------

            jenis_input = str(data.jenis).strip().upper()

            # UI:
            # MASUK  -> PENYESUAIAN positif
            # KELUAR -> PENYESUAIAN negatif

            if jenis_input == "MASUK":
                jenis = "PENYESUAIAN"
                arah_mutasi = "MASUK"

            elif jenis_input == "KELUAR":
                jenis = "PENYESUAIAN"
                arah_mutasi = "KELUAR"

            else:
                jenis = jenis_input
                arah_mutasi = None

            # -------------------------------------------------
            # VALIDASI JENIS
            # -------------------------------------------------

            if jenis not in MutasiStokService.JENIS_VALID:
                raise ValueError(
                    f"Jenis mutasi tidak valid: {data.jenis}"
                )

            # -------------------------------------------------
            # VALIDASI QTY
            # -------------------------------------------------

            qty = Decimal(str(data.qty))

            if qty <= 0:
                raise ValueError(
                    "Qty mutasi harus lebih dari 0"
                )

            # -------------------------------------------------
            # STOK AWAL
            # -------------------------------------------------

            stok_awal = Decimal(
                str(
                    barang.stok
                    if barang.stok is not None
                    else 0
                )
            )

            # -------------------------------------------------
            # HITUNG STOK
            # -------------------------------------------------

            if arah_mutasi == "MASUK":

                stok_akhir = stok_awal + qty
                qty_mutasi = qty

            elif arah_mutasi == "KELUAR":

                if stok_awal < qty:
                    raise ValueError(
                        f"Stok tidak cukup. "
                        f"Stok tersedia: {stok_awal}, "
                        f"diminta: {qty}"
                    )

                stok_akhir = stok_awal - qty
                qty_mutasi = -qty

            elif jenis in MutasiStokService.JENIS_STOK_MASUK:

                stok_akhir = stok_awal + qty
                qty_mutasi = qty

            elif jenis in MutasiStokService.JENIS_STOK_KELUAR:

                if stok_awal < qty:
                    raise ValueError(
                        f"Stok tidak cukup. "
                        f"Stok tersedia: {stok_awal}, "
                        f"diminta: {qty}"
                    )

                stok_akhir = stok_awal - qty
                qty_mutasi = -qty

            else:

                stok_akhir = stok_awal + qty
                qty_mutasi = qty

            # -------------------------------------------------
            # UPDATE STOK
            # -------------------------------------------------

            barang.stok = stok_akhir
            db.add(barang)

            # -------------------------------------------------
            # KETERANGAN
            # -------------------------------------------------

            keterangan = getattr(
                data,
                "keterangan",
                None,
            )

            # -------------------------------------------------
            # REFERENSI
            # -------------------------------------------------

            referensi = getattr(
                data,
                "referensi",
                None,
            )

            if referensi:
                if keterangan:
                    keterangan = (
                        f"{keterangan} "
                        f"(Ref: {referensi})"
                    )
                else:
                    keterangan = f"Ref: {referensi}"

            # -------------------------------------------------
            # BUAT MUTASI
            # -------------------------------------------------

            mutasi = MutasiStok(
                barang_id=barang.id,
                jenis=jenis,
                qty=qty_mutasi,
                stok_awal=stok_awal,
                stok_akhir=stok_akhir,
                keterangan=keterangan,
                created_by=created_by,
            )

            # -------------------------------------------------
            # REFERENSI
            # -------------------------------------------------

            if hasattr(MutasiStok, "referensi"):
                mutasi.referensi = referensi

            db.add(mutasi)

            # -------------------------------------------------
            # SIMPAN
            # -------------------------------------------------

            db.commit()
            db.refresh(mutasi)

            return mutasi

        except Exception:
            db.rollback()
            raise

    # =========================================================
    # STOK MASUK
    # =========================================================

    @staticmethod
    def stok_masuk(
        db: Session,
        barang,
        qty,
        jenis: str = "PEMBELIAN",
        referensi: str = None,
        keterangan: str = None,
        created_by: int = None,
    ):
        try:
            stok_awal = Decimal(
                str(
                    barang.stok
                    if barang.stok is not None
                    else 0
                )
            )

            qty = Decimal(str(qty))

            if qty <= 0:
                raise ValueError(
                    "Qty stok masuk harus lebih dari 0"
                )

            jenis = str(jenis).strip().upper()

            if jenis not in MutasiStokService.JENIS_VALID:
                raise ValueError(
                    f"Jenis mutasi tidak valid: {jenis}"
                )

            stok_akhir = stok_awal + qty

            barang.stok = stok_akhir
            db.add(barang)

            if referensi:
                if keterangan:
                    keterangan = (
                        f"{keterangan} "
                        f"(Ref: {referensi})"
                    )
                else:
                    keterangan = f"Ref: {referensi}"

            mutasi = MutasiStok(
                barang_id=barang.id,
                jenis=jenis,
                qty=qty,
                stok_awal=stok_awal,
                stok_akhir=stok_akhir,
                keterangan=keterangan,
                created_by=created_by,
            )

            if hasattr(MutasiStok, "referensi"):
                mutasi.referensi = referensi

            db.add(mutasi)
            db.flush()

            return mutasi

        except Exception:
            db.rollback()
            raise

    # =========================================================
    # STOK KELUAR
    # =========================================================

    @staticmethod
    def stok_keluar(
        db: Session,
        barang,
        qty,
        jenis: str = "PENJUALAN",
        referensi: str = None,
        keterangan: str = None,
        created_by: int = None,
    ):
        try:
            stok_awal = Decimal(
                str(
                    barang.stok
                    if barang.stok is not None
                    else 0
                )
            )

            qty = Decimal(str(qty))

            if qty <= 0:
                raise ValueError(
                    "Qty stok keluar harus lebih dari 0"
                )

            jenis = str(jenis).strip().upper()

            if jenis not in MutasiStokService.JENIS_VALID:
                raise ValueError(
                    f"Jenis mutasi tidak valid: {jenis}"
                )

            if stok_awal < qty:
                raise ValueError(
                    f"Stok tidak cukup. "
                    f"Stok tersedia: {stok_awal}, "
                    f"diminta: {qty}"
                )

            stok_akhir = stok_awal - qty

            barang.stok = stok_akhir
            db.add(barang)

            if referensi:
                if keterangan:
                    keterangan = (
                        f"{keterangan} "
                        f"(Ref: {referensi})"
                    )
                else:
                    keterangan = f"Ref: {referensi}"

            mutasi = MutasiStok(
                barang_id=barang.id,
                jenis=jenis,
                qty=-qty,
                stok_awal=stok_awal,
                stok_akhir=stok_akhir,
                keterangan=keterangan,
                created_by=created_by,
            )

            if hasattr(MutasiStok, "referensi"):
                mutasi.referensi = referensi

            db.add(mutasi)
            db.flush()

            return mutasi

        except Exception:
            db.rollback()
            raise

    # =========================================================
    # PENYESUAIAN
    # =========================================================

    @staticmethod
    def penyesuaian(
        db: Session,
        barang,
        stok_baru,
        jenis: str = "STOCK_OPNAME",
        referensi: str = None,
        keterangan: str = None,
        created_by: int = None,
    ):
        try:
            stok_awal = Decimal(
                str(
                    barang.stok
                    if barang.stok is not None
                    else 0
                )
            )

            stok_akhir = Decimal(str(stok_baru))

            if stok_akhir < 0:
                raise ValueError(
                    "Stok baru tidak boleh negatif"
                )

            selisih = stok_akhir - stok_awal

            if selisih == 0:
                return None

            jenis = str(jenis).strip().upper()

            if jenis not in MutasiStokService.JENIS_VALID:
                raise ValueError(
                    f"Jenis mutasi tidak valid: {jenis}"
                )

            if referensi:
                if keterangan:
                    keterangan = (
                        f"{keterangan} "
                        f"(Ref: {referensi})"
                    )
                else:
                    keterangan = f"Ref: {referensi}"

            barang.stok = stok_akhir
            db.add(barang)

            mutasi = MutasiStok(
                barang_id=barang.id,
                jenis=jenis,
                qty=selisih,
                stok_awal=stok_awal,
                stok_akhir=stok_akhir,
                keterangan=keterangan,
                created_by=created_by,
            )

            if hasattr(MutasiStok, "referensi"):
                mutasi.referensi = referensi

            db.add(mutasi)
            db.flush()

            return mutasi

        except Exception:
            db.rollback()
            raise

    # =========================================================
    # UPDATE
    # =========================================================

    @staticmethod
    def update(
        db: Session,
        mutasi_id: int,
        data: MutasiStokUpdate,
    ):
        try:
            obj = (
                db.query(MutasiStok)
                .filter(MutasiStok.id == mutasi_id)
                .first()
            )

            if not obj:
                return None

            update_data = data.model_dump(
                exclude_unset=True
            )

            field_tidak_diizinkan = (
                set(update_data.keys())
                - MutasiStokService.JENIS_UPDATE_DIIZINKAN
            )

            if field_tidak_diizinkan:
                raise ValueError(
                    "Field update tidak diizinkan: "
                    + ", ".join(
                        sorted(field_tidak_diizinkan)
                    )
                )

            if not update_data:
                raise ValueError(
                    "Tidak ada data yang diubah"
                )

            barang = (
                db.query(Barang)
                .filter(Barang.id == obj.barang_id)
                .first()
            )

            if not barang:
                raise ValueError(
                    f"Barang dengan id {obj.barang_id} "
                    "tidak ditemukan"
                )

            jenis_lama = str(
                obj.jenis
                if obj.jenis is not None
                else ""
            ).strip().upper()

            qty_lama = Decimal(
                str(
                    obj.qty
                    if obj.qty is not None
                    else 0
                )
            )

            jenis_baru = jenis_lama

            if "jenis" in update_data:

                if update_data["jenis"] is None:
                    raise ValueError(
                        "Jenis mutasi tidak boleh kosong"
                    )

                jenis_baru = str(
                    update_data["jenis"]
                ).strip().upper()

                if jenis_baru not in MutasiStokService.JENIS_VALID:
                    raise ValueError(
                        "Jenis mutasi tidak valid: "
                        + str(update_data["jenis"])
                    )

            qty_baru_abs = abs(qty_lama)

            if "qty" in update_data:

                if update_data["qty"] is None:
                    raise ValueError(
                        "Qty mutasi tidak boleh kosong"
                    )

                qty_baru_abs = Decimal(
                    str(update_data["qty"])
                )

                if qty_baru_abs <= 0:
                    raise ValueError(
                        "Qty mutasi harus lebih dari 0"
                    )

            # -------------------------------------------------
            # EFEK MUTASI LAMA
            # -------------------------------------------------

            if jenis_lama in MutasiStokService.JENIS_STOK_MASUK:

                efek_lama = abs(qty_lama)

            elif jenis_lama in MutasiStokService.JENIS_STOK_KELUAR:

                efek_lama = -abs(qty_lama)

            else:

                efek_lama = qty_lama

            # -------------------------------------------------
            # EFEK MUTASI BARU
            # -------------------------------------------------

            if jenis_baru in MutasiStokService.JENIS_STOK_MASUK:

                efek_baru = qty_baru_abs

            elif jenis_baru in MutasiStokService.JENIS_STOK_KELUAR:

                efek_baru = -qty_baru_abs

            elif jenis_baru in {
                "PENYESUAIAN",
                "STOCK_OPNAME",
            }:

                if "qty" in update_data:
                    efek_baru = Decimal(
                        str(update_data["qty"])
                    )
                else:
                    efek_baru = qty_lama

            else:

                efek_baru = qty_baru_abs

            # -------------------------------------------------
            # PERUBAHAN STOK
            # -------------------------------------------------

            perubahan_stok = efek_baru - efek_lama

            stok_sekarang = Decimal(
                str(
                    barang.stok
                    if barang.stok is not None
                    else 0
                )
            )

            stok_baru = stok_sekarang + perubahan_stok

            if stok_baru < 0:
                raise ValueError(
                    "Stok tidak cukup setelah update. "
                    f"Stok tersedia: {stok_sekarang}, "
                    f"stok setelah update: {stok_baru}"
                )

            if perubahan_stok != 0:
                barang.stok = stok_baru
                db.add(barang)

            obj.jenis = jenis_baru

            if jenis_baru in MutasiStokService.JENIS_STOK_KELUAR:

                obj.qty = -qty_baru_abs

            elif jenis_baru in MutasiStokService.JENIS_STOK_MASUK:

                obj.qty = qty_baru_abs

            elif jenis_baru in {
                "PENYESUAIAN",
                "STOCK_OPNAME",
            }:

                if "qty" in update_data:
                    obj.qty = Decimal(
                        str(update_data["qty"])
                    )

            else:

                if "qty" in update_data:
                    obj.qty = qty_baru_abs

            if "keterangan" in update_data:
                obj.keterangan = update_data["keterangan"]

            obj.stok_akhir = stok_baru

            db.add(obj)
            db.commit()
            db.refresh(obj)

            return obj

        except Exception:
            db.rollback()
            raise

    # =========================================================
    # DELETE
    # =========================================================

    @staticmethod
    def delete(
        db: Session,
        mutasi_id: int,
    ):
        try:
            obj = (
                db.query(MutasiStok)
                .filter(MutasiStok.id == mutasi_id)
                .first()
            )

            if not obj:
                return False

            db.delete(obj)
            db.commit()

            return True

        except Exception:
            db.rollback()
            raise