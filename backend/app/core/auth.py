from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from jose import jwt, JWTError

from app.core.config import settings


# ==========================================================
# HTTP BEARER
# ==========================================================
#
# Digunakan untuk membaca JWT dari header:
#
# Authorization: Bearer <token>
#
# Keuntungan:
# - Cocok dengan login JSON yang sudah ada
# - Swagger tidak lagi meminta client_id/client_secret
# - Frontend tetap menggunakan Bearer Token
# - Cocok untuk sistem JWT KasirAI
#
# ==========================================================

bearer_scheme = HTTPBearer(
    auto_error=True
)


# ==========================================================
# CREATE ACCESS TOKEN
# ==========================================================

def create_access_token(data: dict):

    payload = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload.update({
        "exp": expire
    })

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


# ==========================================================
# DECODE TOKEN
# ==========================================================

def decode_token(token: str):

    try:

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[
                settings.ALGORITHM
            ]
        )

        return payload

    except JWTError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Token tidak valid "
                "atau sudah kedaluwarsa."
            ),
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )


# ==========================================================
# GET CURRENT USER
# ==========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    )
):

    token = credentials.credentials

    payload = decode_token(token)

    # ======================================================
    # USER ID
    # ======================================================

    user_id = payload.get("id")

    if user_id is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Token tidak memiliki user ID."
            ),
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # ======================================================
    # USERNAME
    # ======================================================

    username = payload.get("sub")

    if username is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Token tidak memiliki username."
            ),
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # ======================================================
    # ROLE
    # ======================================================

    role = payload.get("role")

    if role is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Token tidak memiliki role."
            ),
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # ======================================================
    # RETURN CURRENT USER
    # ======================================================

    return {
        "id": user_id,
        "username": username,
        "role": role,
    }


# ==========================================================
# GET CURRENT ADMIN
# ==========================================================

def get_current_admin(
    current_user: dict = Depends(
        get_current_user
    )
):

    role = str(
        current_user.get(
            "role",
            ""
        )
    ).strip().upper()

    # ======================================================
    # HANYA ADMIN
    # ======================================================

    if role != "ADMIN":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Akses ditolak. "
                "Fitur ini hanya dapat digunakan "
                "oleh Admin."
            ),
        )

    return current_user