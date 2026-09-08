from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.toko import Toko
from app.models.toko_user import TokoUser


# ==========================================================
# ROLE YANG BOLEH DIBERIKAN KEPADA ANGGOTA TOKO
# ==========================================================

ALLOWED_MEMBER_ROLES = {
    "admin",
    "kasir",
    "gudang",
    "akuntan",
}


class UserService:
    """
    Service untuk pengelolaan anggota toko.

    Struktur:

        users
          |
          +--- role
          |
        toko_users
          |
          +--- toko_id
          +--- user_id
          +--- status
          +--- aktif
    """

    # ======================================================
    # NORMALIZE ROLE
    # ======================================================

    @staticmethod
    def normalize_role(
        role: str,
    ) -> str:

        return (
            str(role)
            .strip()
            .lower()
        )

    # ======================================================
    # VALIDATE MEMBER ROLE
    # ======================================================

    @staticmethod
    def validate_member_role(
        role: str,
    ) -> str:

        role = (
            UserService
            .normalize_role(
                role
            )
        )

        if role not in ALLOWED_MEMBER_ROLES:

            raise ValueError(
                "Role anggota tidak valid. "
                "Role yang diperbolehkan: "
                "admin, kasir, gudang, akuntan."
            )

        return role

    # ======================================================
    # GET MEMBERS
    # ======================================================

    @staticmethod
    def get_members(
        db: Session,
        toko_id: int,
        search: str | None = None,
        include_inactive: bool = False,
    ):
        """
        Mengambil daftar anggota dari satu toko.

        Data dibatasi berdasarkan toko_id.
        """

        query = (
            db.query(
                User,
                TokoUser,
            )
            .join(
                TokoUser,
                TokoUser.user_id == User.id,
            )
            .join(
                Toko,
                Toko.id == TokoUser.toko_id,
            )
            .filter(
                TokoUser.toko_id == toko_id,
                Toko.aktif.is_(True),
            )
        )

        # --------------------------------------------------
        # HANYA KEANGGOTAAN OWNER / MEMBER
        # --------------------------------------------------

        query = query.filter(
            TokoUser.status.in_(
                [
                    "owner",
                    "member",
                ]
            )
        )

        # --------------------------------------------------
        # FILTER AKTIF
        # --------------------------------------------------

        if not include_inactive:

            query = query.filter(
                TokoUser.aktif.is_(True),
                User.aktif.is_(True),
            )

        # --------------------------------------------------
        # SEARCH
        # --------------------------------------------------

        if search:

            keyword = (
                search
                .strip()
            )

            if keyword:

                like_value = (
                    f"%{keyword}%"
                )

                query = query.filter(
                    User.nama.ilike(
                        like_value
                    )
                    |
                    User.username.ilike(
                        like_value
                    )
                    |
                    User.email.ilike(
                        like_value
                    )
                )

        # --------------------------------------------------
        # QUERY
        # --------------------------------------------------

        rows = (
            query
            .order_by(
                User.nama.asc()
            )
            .all()
        )

        # --------------------------------------------------
        # RESPONSE
        # --------------------------------------------------

        return [
            {
                "id": user.id,
                "nama": user.nama,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "aktif": user.aktif,
                "toko_id": toko_user.toko_id,
                "toko_status": toko_user.status,
            }
            for user, toko_user in rows
        ]

    # ======================================================
    # GET MEMBER DETAIL
    # ======================================================

    @staticmethod
    def get_member(
        db: Session,
        toko_id: int,
        user_id: int,
    ):
        """
        Mengambil detail satu anggota
        berdasarkan toko aktif.
        """

        row = (
            db.query(
                User,
                TokoUser,
            )
            .join(
                TokoUser,
                TokoUser.user_id == User.id,
            )
            .filter(
                TokoUser.toko_id == toko_id,
                TokoUser.user_id == user_id,
                TokoUser.status.in_(
                    [
                        "owner",
                        "member",
                    ]
                ),
            )
            .first()
        )

        if row is None:
            return None

        user, toko_user = row

        return {
            "id": user.id,
            "nama": user.nama,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "aktif": user.aktif,
            "toko_id": toko_user.toko_id,
            "toko_status": toko_user.status,
        }

    # ======================================================
    # CREATE MEMBER
    # ======================================================

    @staticmethod
    def create_member(
        db: Session,
        toko_id: int,
        nama: str,
        username: str,
        password_hash: str,
        role: str,
        email: str | None = None,
    ):
        """
        Membuat user baru sekaligus
        mendaftarkannya ke toko.
        """

        nama = nama.strip()
        username = username.strip()

        # --------------------------------------------------
        # VALIDASI NAMA
        # --------------------------------------------------

        if not nama:

            raise ValueError(
                "Nama wajib diisi."
            )

        # --------------------------------------------------
        # VALIDASI USERNAME
        # --------------------------------------------------

        if not username:

            raise ValueError(
                "Username wajib diisi."
            )

        # --------------------------------------------------
        # VALIDASI ROLE
        # --------------------------------------------------

        role = (
            UserService
            .validate_member_role(
                role
            )
        )

        # --------------------------------------------------
        # CEK TOKO
        # --------------------------------------------------

        toko = (
            db.query(Toko)
            .filter(
                Toko.id == toko_id,
                Toko.aktif.is_(True),
            )
            .first()
        )

        if toko is None:

            raise ValueError(
                "Toko tidak ditemukan "
                "atau tidak aktif."
            )

        # --------------------------------------------------
        # CEK USERNAME
        # --------------------------------------------------

        existing_username = (
            db.query(User)
            .filter(
                User.username
                == username,
            )
            .first()
        )

        if existing_username is not None:

            raise ValueError(
                "Username sudah digunakan."
            )

        # --------------------------------------------------
        # CEK EMAIL
        # --------------------------------------------------

        if email:

            email = (
                email
                .strip()
                .lower()
            )

            existing_email = (
                db.query(User)
                .filter(
                    User.email == email,
                )
                .first()
            )

            if existing_email is not None:

                raise ValueError(
                    "Email sudah digunakan."
                )

        # --------------------------------------------------
        # BUAT USER
        # --------------------------------------------------

        user = User(
            nama=nama,
            username=username,
            password_hash=password_hash,
            role=role,
            email=email,
            aktif=True,
        )

        db.add(user)

        db.flush()

        # --------------------------------------------------
        # HUBUNGKAN KE TOKO
        # --------------------------------------------------

        toko_user = TokoUser(
            toko_id=toko_id,
            user_id=user.id,
            status="member",
            aktif=True,
        )

        db.add(toko_user)

        # --------------------------------------------------
        # COMMIT
        # --------------------------------------------------

        db.commit()

        db.refresh(user)
        db.refresh(toko_user)

        # --------------------------------------------------
        # RETURN
        # --------------------------------------------------

        return {
            "id": user.id,
            "nama": user.nama,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "aktif": user.aktif,
            "toko_id": toko_user.toko_id,
            "toko_status": toko_user.status,
        }

    # ======================================================
    # UPDATE MEMBER
    # ======================================================

    @staticmethod
    def update_member(
        db: Session,
        toko_id: int,
        user_id: int,
        nama: str | None = None,
        email: str | None = None,
        role: str | None = None,
    ):
        """
        Mengubah data anggota biasa.

        Owner tidak diubah melalui endpoint ini.
        """

        row = (
            db.query(
                User,
                TokoUser,
            )
            .join(
                TokoUser,
                TokoUser.user_id == User.id,
            )
            .filter(
                TokoUser.toko_id == toko_id,
                TokoUser.user_id == user_id,
                TokoUser.status == "member",
            )
            .first()
        )

        if row is None:
            return None

        user, toko_user = row

        # --------------------------------------------------
        # NAMA
        # --------------------------------------------------

        if nama is not None:

            nama = nama.strip()

            if not nama:

                raise ValueError(
                    "Nama tidak boleh kosong."
                )

            user.nama = nama

        # --------------------------------------------------
        # EMAIL
        # --------------------------------------------------

        if email is not None:

            email = (
                email
                .strip()
                .lower()
            )

            duplicate = (
                db.query(User)
                .filter(
                    User.email == email,
                    User.id != user_id,
                )
                .first()
            )

            if duplicate is not None:

                raise ValueError(
                    "Email sudah digunakan."
                )

            user.email = email

        # --------------------------------------------------
        # ROLE
        # --------------------------------------------------

        if role is not None:

            user.role = (
                UserService
                .validate_member_role(
                    role
                )
            )

        # --------------------------------------------------
        # COMMIT
        # --------------------------------------------------

        db.commit()

        db.refresh(user)

        # --------------------------------------------------
        # RETURN
        # --------------------------------------------------

        return {
            "id": user.id,
            "nama": user.nama,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "aktif": user.aktif,
            "toko_id": toko_user.toko_id,
            "toko_status": toko_user.status,
        }

    # ======================================================
    # UPDATE STATUS MEMBER
    # ======================================================

    @staticmethod
    def set_member_status(
        db: Session,
        toko_id: int,
        user_id: int,
        aktif: bool,
    ):
        """
        Mengaktifkan atau menonaktifkan
        keanggotaan user pada toko.
        """

        row = (
            db.query(
                User,
                TokoUser,
            )
            .join(
                TokoUser,
                TokoUser.user_id == User.id,
            )
            .filter(
                TokoUser.toko_id == toko_id,
                TokoUser.user_id == user_id,
            )
            .first()
        )

        if row is None:
            return None

        user, toko_user = row

        # --------------------------------------------------
        # OWNER TIDAK BOLEH DINONAKTIFKAN
        # --------------------------------------------------

        if toko_user.status == "owner":

            raise ValueError(
                "Owner tidak dapat "
                "dinonaktifkan melalui endpoint anggota."
            )

        # --------------------------------------------------
        # UBAH STATUS TOKO USER
        # --------------------------------------------------

        toko_user.aktif = aktif

        # --------------------------------------------------
        # STATUS USER GLOBAL
        # --------------------------------------------------

        if not aktif:

            active_memberships = (
                db.query(TokoUser)
                .filter(
                    TokoUser.user_id
                    == user_id,
                    TokoUser.aktif.is_(True),
                )
                .count()
            )

            if active_memberships == 0:

                user.aktif = False

        else:

            user.aktif = True

        # --------------------------------------------------
        # COMMIT
        # --------------------------------------------------

        db.commit()

        db.refresh(user)
        db.refresh(toko_user)

        # --------------------------------------------------
        # RETURN
        # --------------------------------------------------

        return {
            "id": user.id,
            "nama": user.nama,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "aktif": user.aktif,
            "toko_id": toko_user.toko_id,
            "toko_status": toko_user.status,
        }


# ==========================================================
# INSTANCE
# ==========================================================

user_service = UserService()