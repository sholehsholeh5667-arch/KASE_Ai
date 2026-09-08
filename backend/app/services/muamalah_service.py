from datetime import datetime
from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.muamalah_materi import MuamalahMateri
from app.ai.muamalah.muamalah_retrieval import MuamalahRetrieval
from app.schemas.muamalah import (
    MuamalahMateriCreate,
    MuamalahMateriUpdate,
)


class MuamalahService:
    _muamalah_retrieval = MuamalahRetrieval()

    # ==========================================================
    # GET SEMUA MATERI
    # ==========================================================

    @staticmethod
    def get_all(
        db: Session,
        aktif_only: bool = False,
    ):
        query = db.query(MuamalahMateri)

        if aktif_only:
            query = query.filter(
                MuamalahMateri.aktif.is_(True)
            )

        return (
            query
            .order_by(
                MuamalahMateri.kategori.asc(),
                MuamalahMateri.judul.asc(),
            )
            .all()
        )

    # ==========================================================
    # GET MATERI BERDASARKAN ID
    # ==========================================================

    @staticmethod
    def get_by_id(
        db: Session,
        materi_id: int,
    ) -> Optional[MuamalahMateri]:

        return (
            db.query(MuamalahMateri)
            .filter(
                MuamalahMateri.id == materi_id
            )
            .first()
        )

    # ==========================================================
    # CREATE MATERI
    # ==========================================================

    @staticmethod
    def create(
        db: Session,
        data: MuamalahMateriCreate,
    ) -> MuamalahMateri:

        materi = MuamalahMateri(
            **data.model_dump()
        )

        db.add(materi)
        db.commit()
        db.refresh(materi)

        return materi

    # ==========================================================
    # UPDATE MATERI
    # ==========================================================

    @staticmethod
    def update(
        db: Session,
        materi_id: int,
        data: MuamalahMateriUpdate,
    ) -> Optional[MuamalahMateri]:

        materi = (
            db.query(MuamalahMateri)
            .filter(
                MuamalahMateri.id == materi_id
            )
            .first()
        )

        if materi is None:
            return None

        perubahan = data.model_dump(
            exclude_unset=True
        )

        for key, value in perubahan.items():
            setattr(
                materi,
                key,
                value,
            )

        db.commit()
        db.refresh(materi)

        return materi

    # ==========================================================
    # DELETE MATERI
    # ==========================================================

    @staticmethod
    def delete(
        db: Session,
        materi_id: int,
    ) -> bool:

        materi = (
            db.query(MuamalahMateri)
            .filter(
                MuamalahMateri.id == materi_id
            )
            .first()
        )

        if materi is None:
            return False

        db.delete(materi)
        db.commit()

        return True

    # ==========================================================
    # AKTIFKAN MATERI
    # ==========================================================

    @staticmethod
    def activate(
        db: Session,
        materi_id: int,
    ) -> Optional[MuamalahMateri]:

        materi = (
            db.query(MuamalahMateri)
            .filter(
                MuamalahMateri.id == materi_id
            )
            .first()
        )

        if materi is None:
            return None

        materi.aktif = True

        db.commit()
        db.refresh(materi)

        return materi

    # ==========================================================
    # NONAKTIFKAN MATERI
    # ==========================================================

    @staticmethod
    def deactivate(
        db: Session,
        materi_id: int,
    ) -> Optional[MuamalahMateri]:

        materi = (
            db.query(MuamalahMateri)
            .filter(
                MuamalahMateri.id == materi_id
            )
            .first()
        )

        if materi is None:
            return None

        materi.aktif = False

        db.commit()
        db.refresh(materi)

        return materi

    # ==========================================================
    # CARI MATERI
    # ==========================================================

    @staticmethod
    def search(
        db: Session,
        query: str,
        kategori: Optional[str] = None,
        limit: int = 10,
    ):

        query = query.strip()

        if not query:
            return []

        search_pattern = f"%{query}%"

        filters = [
            # --------------------------------------------------
            # DATA UTAMA
            # --------------------------------------------------

            MuamalahMateri.judul.ilike(
                search_pattern
            ),

            MuamalahMateri.pertanyaan.ilike(
                search_pattern
            ),

            MuamalahMateri.isi_materi.ilike(
                search_pattern
            ),

            MuamalahMateri.kategori.ilike(
                search_pattern
            ),

            # --------------------------------------------------
            # IBARAT / TEKS ARAB
            # --------------------------------------------------

            MuamalahMateri.teks_arab.ilike(
                search_pattern
            ),

            # --------------------------------------------------
            # TERJEMAH
            # --------------------------------------------------

            MuamalahMateri.terjemah.ilike(
                search_pattern
            ),

            # --------------------------------------------------
            # PENJELASAN / SYARAH
            # --------------------------------------------------

            MuamalahMateri.penjelasan.ilike(
                search_pattern
            ),

            # --------------------------------------------------
            # CATATAN KAKI
            # --------------------------------------------------

            MuamalahMateri.catatan_kaki.ilike(
                search_pattern
            ),

            # --------------------------------------------------
            # REFERENSI INTERNAL
            # --------------------------------------------------

            MuamalahMateri.referensi_kitab.ilike(
                search_pattern
            ),
        ]

        db_query = (
            db.query(MuamalahMateri)
            .filter(
                MuamalahMateri.aktif.is_(True)
            )
            .filter(
                or_(*filters)
            )
        )

        if kategori:
            db_query = db_query.filter(
                MuamalahMateri.kategori.ilike(
                    kategori.strip()
                )
            )

        return (
            db_query
            .order_by(
                MuamalahMateri.judul.asc()
            )
            .limit(limit)
            .all()
        )

    # ==========================================================
    # CARI BERDASARKAN KATEGORI
    # ==========================================================

    @staticmethod
    def get_by_kategori(
        db: Session,
        kategori: str,
        aktif_only: bool = True,
    ):

        db_query = (
            db.query(MuamalahMateri)
            .filter(
                MuamalahMateri.kategori.ilike(
                    kategori.strip()
                )
            )
        )

        if aktif_only:
            db_query = db_query.filter(
                MuamalahMateri.aktif.is_(True)
            )

        return (
            db_query
            .order_by(
                MuamalahMateri.judul.asc()
            )
            .all()
        )

    # ==========================================================
    # ADAPTER HASIL RETRIEVAL → RESPONSE API
    # ==========================================================

    @staticmethod
    def _adapt_ai_result(result):
        """
        Menyesuaikan hasil MuamalahRetrieval
        (SQLite + MySQL) dengan schema API Muamalah.
        """

        def as_text(value):
            if value is None:
                return None
            return str(value)

        created_at = result.get("created_at")
        updated_at = result.get("updated_at")

        # ------------------------------------------------------
        # Normalisasi timestamp dari SQLite/MySQL
        # ------------------------------------------------------
        def normalize_datetime(value):
            if value is None:
                return None

            if isinstance(value, datetime):
                return value

            text = str(value).strip()

            if not text:
                return None

            try:
                return datetime.fromisoformat(
                    text.replace("Z", "+00:00")
                )
            except ValueError:
                return None

        created_at = normalize_datetime(created_at)
        updated_at = normalize_datetime(updated_at)

        if created_at is not None and updated_at is None:
            updated_at = created_at

        nama_kitab = result.get("nama_kitab")
        pengarang = result.get("pengarang")
        kategori_kitab = result.get("kategori_kitab")

        al_kitab = (
                nama_kitab
                or result.get("kitab")
                or "Kitab Kuning"
            )

        kategori = (
                kategori_kitab
                or result.get("kategori")
                or "Kitab Kuning"
            )

        bab = (
                result.get("bab")
                or result.get("judul")
                or result.get("kitab")
                or "Bab tidak diketahui"
            )

        teks = (
            result.get("teks")
            or result.get("isi_materi")
            or result.get("context")
            or ""
        )

        isi_materi = (
            result.get("isi_materi")
            or teks
            or "Materi kitab tidak tersedia."
        )

        halaman = result.get("halaman")

        sumber_file = result.get("sumber_file")

        return {
            "id": result.get("id"),
            "kategori": str(kategori)[:100],

            "al_kitab": str(al_kitab)[:255],
            "bab": str(bab)[:255],

            "pertanyaan": as_text(
                result.get("pertanyaan")
            ),
            "teks_arab": as_text(
                result.get("teks_arab") or teks
            ),
            "terjemah": as_text(
                result.get("terjemah")
            ),
            "penjelasan": as_text(
                result.get("penjelasan")
            ),
            "catatan_kaki": as_text(
                result.get("catatan_kaki")
            ),
            "isi_materi": str(isi_materi),
            "referensi_kitab": as_text(
                result.get("referensi_kitab")
                or al_kitab
                or sumber_file
            ),
            "juz": as_text(
                result.get("juz")
            ),
            "halaman": as_text(
                halaman
            ),
            "sumber": as_text(
                result.get("sumber")
                or sumber_file
                or result.get("source")
            ),
            "aktif": bool(
                result.get("aktif", True)
            ),
            "created_at": created_at,
            "updated_at": updated_at,
        }

    # ==========================================================
    # CARI MATERI UNTUK AI
    # ==========================================================

    @classmethod
    def search_for_ai(
        cls,
        db: Session,
        pertanyaan: str,
        limit: int = 5,
    ):
        pertanyaan = (pertanyaan or "").strip()

        if not pertanyaan:
            return []

        try:
            results = cls._muamalah_retrieval.search(
                query=pertanyaan,
                limit=limit,
                db=db,
            )
        except Exception as exc:
            raise RuntimeError(
                f"Retrieval AI Muamalah gagal: {exc}"
            ) from exc

        return [
            cls._adapt_ai_result(result)
            for result in results
        ]
# ==========================================================
# INSTANCE SERVICE
# ==========================================================

muamalah_service = MuamalahService()