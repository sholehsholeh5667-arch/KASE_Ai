import secrets

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)

from app.repositories.user import (
    user_repository,
)

from app.core.security import (
    verify_password,
)

from app.core.auth import (
    create_access_token,
)

from app.services.password_reset import (
    create_reset_token,
    send_reset_email,
    reset_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = user_repository.get_by_username(
        db,
        data.username
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Username atau password salah"
        )

    if not user.aktif:
        raise HTTPException(
            status_code=401,
            detail="Akun tidak aktif"
        )

    try:
        valid = verify_password(
            data.password,
            user.password_hash
        )

    except (ValueError, TypeError):
        valid = False

    if not valid:
        raise HTTPException(
            status_code=401,
            detail="Username atau password salah"
        )

    token = create_access_token(
        {
            "id": user.id,
            "sub": user.username,
            "role": user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse
)
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    user = user_repository.get_by_email(
        db,
        data.email
    )

    # Jangan membocorkan apakah email terdaftar.
    generic_message = (
        "Jika email terdaftar, "
        "link reset password telah dikirim."
    )

    if user is None:
        return {
            "message": generic_message
        }

    if not user.aktif:
        return {
            "message": generic_message
        }

    if not user.email:
        return {
            "message": generic_message
        }

    try:
        token = create_reset_token(
            db=db,
            user=user
        )

        send_reset_email(
            user=user,
            token=token
        )

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Gagal mengirim link reset password."
        )

    return {
        "message": generic_message
    }


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse
)
def reset_password_endpoint(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    try:
        reset_password(
            db=db,
            token=data.token,
            new_password=data.new_password
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    return {
        "message": (
            "Password berhasil diubah. "
            "Silakan login kembali."
        )
    }