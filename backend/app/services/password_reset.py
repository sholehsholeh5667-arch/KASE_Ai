import hashlib
import secrets
import smtplib

from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.repositories.user import user_repository


# ==========================================================
# UTC NOW
# ==========================================================

def utcnow() -> datetime:
    """
    Menghasilkan waktu UTC dalam bentuk naive datetime.

    Database KasirAI saat ini menggunakan MySQL DATETIME
    dan SQLAlchemy mengembalikannya sebagai datetime naive.
    Karena itu seluruh perbandingan waktu reset password
    menggunakan UTC naive secara konsisten.
    """
    return datetime.now(timezone.utc).replace(
        tzinfo=None
    )


# ==========================================================
# GENERATE RESET TOKEN
# ==========================================================

def generate_reset_token() -> str:
    return secrets.token_urlsafe(48)


# ==========================================================
# HASH RESET TOKEN
# ==========================================================

def hash_reset_token(token: str) -> str:
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


# ==========================================================
# CREATE RESET TOKEN
# ==========================================================

def create_reset_token(
    db: Session,
    user: User,
) -> str:

    token = generate_reset_token()

    token_hash = hash_reset_token(
        token
    )

    expires_at = (
        utcnow()
        + timedelta(
            minutes=settings.RESET_PASSWORD_EXPIRE_MINUTES
        )
    )

    user_repository.save_reset_token(
        db=db,
        user=user,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    return token


# ==========================================================
# SEND RESET EMAIL
# ==========================================================

def send_reset_email(
    user: User,
    token: str,
):
    if not user.email:
        raise ValueError(
            "Email user belum terdaftar."
        )

    if not settings.SMTP_HOST:
        raise RuntimeError(
            "SMTP belum dikonfigurasi."
        )

    reset_link = (
        f"{settings.FRONTEND_URL}"
        f"/reset-password?token={token}"
    )

    message = EmailMessage()

    message["Subject"] = (
        "Reset Password KasirAI"
    )

    message["From"] = (
        settings.SMTP_FROM
        or settings.SMTP_USERNAME
    )

    message["To"] = user.email

    message.set_content(
        f"""
Halo {user.nama},

Kami menerima permintaan reset password
akun KasirAI Anda.

Gunakan link berikut untuk membuat
password baru:

{reset_link}

Link berlaku selama
{settings.RESET_PASSWORD_EXPIRE_MINUTES} menit.

Jika Anda tidak meminta reset password,
abaikan email ini.

KasirAI
"""
    )

    with smtplib.SMTP(
        settings.SMTP_HOST,
        settings.SMTP_PORT,
        timeout=20,
    ) as server:

        if settings.SMTP_USE_TLS:
            server.starttls()

        server.login(
            settings.SMTP_USERNAME,
            settings.SMTP_PASSWORD,
        )

        server.send_message(
            message
        )


# ==========================================================
# RESET PASSWORD
# ==========================================================

def reset_password(
    db: Session,
    token: str,
    new_password: str,
):
    token_hash = hash_reset_token(
        token
    )

    user = (
        user_repository
        .get_by_reset_token_hash(
            db,
            token_hash,
        )
    )

    if user is None:
        raise ValueError(
            "Token reset password tidak valid."
        )

    if user.reset_token_expires is None:
        raise ValueError(
            "Token reset password tidak valid."
        )

    # ======================================================
    # CEK KADALUARSA
    # ======================================================

    if utcnow() > user.reset_token_expires:

        user_repository.clear_reset_token(
            db,
            user,
        )

        raise ValueError(
            "Token reset password sudah kedaluwarsa."
        )

    # ======================================================
    # HASH PASSWORD BARU
    # ======================================================

    from app.core.security import hash_password

    user.password_hash = hash_password(
        new_password
    )

    # ======================================================
    # HAPUS TOKEN SETELAH BERHASIL
    # ======================================================

    user_repository.clear_reset_token(
        db,
        user,
    )

    return user