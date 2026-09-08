from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.user import UserCreate


# ==========================================================
# GET USER BY USERNAME
# ==========================================================

def get_user_by_username(
    db: Session,
    username: str,
):
    return (
        db.query(User)
        .filter(
            User.username == username
        )
        .first()
    )


# ==========================================================
# CREATE USER
# ==========================================================

def create_user(
    db: Session,
    user: UserCreate,
):
    db_user = User(
      nama=user.nama,
      username=user.username,
        password_hash=hash_password(
          user.password
        ),
        email=user.email,
        role=user.role,
        aktif=user.aktif,
    )

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return db_user

    except SQLAlchemyError:
        db.rollback()
        raise


# ==========================================================
# AUTHENTICATE USER
# ==========================================================

def authenticate_user(
    db: Session,
    username: str,
    password: str,
):
    user = get_user_by_username(
        db,
        username,
    )

    if user is None:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    if not user.aktif:
        return None

    return user