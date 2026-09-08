from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.toko import Toko


class TokoService:
    """
    Service untuk pengelolaan toko.

    Struktur:

        Toko Induk
            |
            +--- Toko Cabang
            +--- Toko Cabang
            +--- dst.

    parent_id:
        None -> Toko Induk
        ID   -> Toko Cabang
    """

    # ======================================================
    # GET CURRENT
    # ======================================================

    @staticmethod
    def get_current(
        db: Session,
        toko: Toko,
    ) -> Toko:
        """
        Mengembalikan toko yang sedang aktif.
        """

        return toko

    # ======================================================
    # GET ALL
    # ======================================================

    @staticmethod
    def get_all(
        db: Session,
    ) -> list[Toko]:
        """
        Mengambil seluruh toko aktif.

        Urutan:
        - toko induk lebih dulu
        - kemudian cabang berdasarkan nama
        """

        return (
            db.query(Toko)
            .filter(
                Toko.aktif.is_(True)
            )
            .order_by(
                Toko.parent_id.asc(),
                Toko.nama.asc(),
            )
            .all()
        )

    # ======================================================
    # GET BY ID
    # ======================================================

    @staticmethod
    def get_by_id(
        db: Session,
        toko_id: int,
    ) -> Toko | None:
        """
        Mengambil toko berdasarkan ID.
        """

        return (
            db.query(Toko)
            .filter(
                Toko.id == toko_id,
            )
            .first()
        )

    # ======================================================
    # GET CABANG
    # ======================================================

    @staticmethod
    def get_cabang(
        db: Session,
        parent_id: int,
    ) -> list[Toko]:
        """
        Mengambil seluruh cabang langsung
        dari satu toko induk.
        """

        return (
            db.query(Toko)
            .filter(
                Toko.parent_id == parent_id,
                Toko.aktif.is_(True),
            )
            .order_by(
                Toko.nama.asc()
            )
            .all()
        )

    # ======================================================
    # CREATE
    # ======================================================

    @staticmethod
    def create(
        db: Session,
        nama: str,
        kode: str,
        parent_id: int | None = None,
        deskripsi: str | None = None,
    ) -> Toko:
        """
        Membuat toko baru.

        parent_id = None:
            membuat Toko Induk.

        parent_id = ID:
            membuat Toko Cabang.
        """

        nama = nama.strip()
        kode = kode.strip()

        if not nama:
            raise ValueError(
                "Nama toko wajib diisi."
            )

        if not kode:
            raise ValueError(
                "Kode toko wajib diisi."
            )

        # --------------------------------------------------
        # CEK KODE DUPLIKAT
        # --------------------------------------------------

        existing = (
            db.query(Toko)
            .filter(
                Toko.kode == kode
            )
            .first()
        )

        if existing is not None:
            raise ValueError(
                f"Kode toko '{kode}' sudah digunakan."
            )

        # --------------------------------------------------
        # VALIDASI PARENT
        # --------------------------------------------------

        parent = None

        if parent_id is not None:

            parent = (
                db.query(Toko)
                .filter(
                    Toko.id == parent_id,
                    Toko.aktif.is_(True),
                )
                .first()
            )

            if parent is None:
                raise ValueError(
                    "Toko induk tidak ditemukan "
                    "atau sudah tidak aktif."
                )

        # --------------------------------------------------
        # BUAT TOKO
        # --------------------------------------------------

        toko = Toko(
            nama=nama,
            kode=kode,
            parent_id=(
                parent.id
                if parent is not None
                else None
            ),
            deskripsi=(
                deskripsi.strip()
                if deskripsi
                else None
            ),
            aktif=True,
        )

        db.add(toko)
        db.commit()
        db.refresh(toko)

        return toko

    # ======================================================
    # UPDATE
    # ======================================================

    @staticmethod
    def update(
        db: Session,
        toko_id: int,
        nama: str | None = None,
        kode: str | None = None,
        parent_id: int | None = None,
        deskripsi: str | None = None,
    ) -> Toko | None:
        """
        Mengubah data toko.

        Validasi penting:
        - toko harus ada
        - kode tidak boleh bentrok
        - toko tidak boleh menjadi induknya sendiri
        - parent harus ada dan aktif
        """

        toko = (
            db.query(Toko)
            .filter(
                Toko.id == toko_id
            )
            .first()
        )

        if toko is None:
            return None

        # --------------------------------------------------
        # NAMA
        # --------------------------------------------------

        if nama is not None:

            nama = nama.strip()

            if not nama:
                raise ValueError(
                    "Nama toko tidak boleh kosong."
                )

            toko.nama = nama

        # --------------------------------------------------
        # KODE
        # --------------------------------------------------

        if kode is not None:

            kode = kode.strip()

            if not kode:
                raise ValueError(
                    "Kode toko tidak boleh kosong."
                )

            duplicate = (
                db.query(Toko)
                .filter(
                    Toko.kode == kode,
                    Toko.id != toko_id,
                )
                .first()
            )

            if duplicate is not None:
                raise ValueError(
                    f"Kode toko '{kode}' "
                    "sudah digunakan toko lain."
                )

            toko.kode = kode

        # --------------------------------------------------
        # DESKRIPSI
        # --------------------------------------------------

        if deskripsi is not None:

            toko.deskripsi = (
                deskripsi.strip()
            )

        # --------------------------------------------------
        # PARENT
        # --------------------------------------------------

        if parent_id is not None:

            # ----------------------------------------------
            # TIDAK BOLEH MENJADI DIRI SENDIRI
            # ----------------------------------------------

            if parent_id == toko_id:
                raise ValueError(
                    "Toko tidak dapat menjadi "
                    "induk dirinya sendiri."
                )

            parent = (
                db.query(Toko)
                .filter(
                    Toko.id == parent_id,
                    Toko.aktif.is_(True),
                )
                .first()
            )

            if parent is None:
                raise ValueError(
                    "Toko induk tidak ditemukan "
                    "atau sudah tidak aktif."
                )

            # ----------------------------------------------
            # CEGAH LOOP SEDERHANA
            # ----------------------------------------------

            current = parent

            while current is not None:

                if current.id == toko_id:
                    raise ValueError(
                        "Struktur induk/cabang tidak valid "
                        "karena akan membentuk siklus."
                    )

                if current.parent_id is None:
                    break

                current = (
                    db.query(Toko)
                    .filter(
                        Toko.id
                        == current.parent_id
                    )
                    .first()
                )

            toko.parent_id = parent_id

        # --------------------------------------------------
        # SIMPAN
        # --------------------------------------------------

        db.commit()
        db.refresh(toko)

        return toko

    # ======================================================
    # SET STATUS
    # ======================================================

    @staticmethod
    def set_status(
        db: Session,
        toko_id: int,
        aktif: bool,
    ) -> Toko | None:
        """
        Mengaktifkan / menonaktifkan toko.

        Catatan:
        Penghapusan permanen tidak dilakukan di sini.
        """

        toko = (
            db.query(Toko)
            .filter(
                Toko.id == toko_id
            )
            .first()
        )

        if toko is None:
            return None

        # --------------------------------------------------
        # AKTIFKAN
        # --------------------------------------------------

        if aktif:

            toko.aktif = True

            db.commit()
            db.refresh(toko)

            return toko

        # --------------------------------------------------
        # NONAKTIFKAN
        # --------------------------------------------------
        #
        # Kita tidak menghapus data.
        #

        toko.aktif = False

        db.commit()
        db.refresh(toko)

        return toko


# ==========================================================
# INSTANCE
# ==========================================================

toko_service = TokoService()