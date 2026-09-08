from datetime import datetime

from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:

    def get_by_username(
        self,
        db: Session,
        username: str
    ):
        return (
            db.query(User)
            .filter(
                User.username == username
            )
            .first()
        )

    def get_by_email(
        self,
        db: Session,
        email: str
    ):
        return (
            db.query(User)
            .filter(
                User.email == email
            )
            .first()
        )

    def get_by_reset_token_hash(
        self,
        db: Session,
        token_hash: str
    ):
        return (
            db.query(User)
            .filter(
                User.reset_token_hash
                == token_hash
            )
            .first()
        )

    def save_reset_token(
        self,
        db: Session,
        user: User,
        token_hash: str,
        expires_at: datetime
    ):
        user.reset_token_hash = token_hash
        user.reset_token_expires = expires_at

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    def clear_reset_token(
        self,
        db: Session,
        user: User
    ):
        user.reset_token_hash = None
        user.reset_token_expires = None

        db.add(user)
        db.commit()
        db.refresh(user)

        return user


user_repository = UserRepository()