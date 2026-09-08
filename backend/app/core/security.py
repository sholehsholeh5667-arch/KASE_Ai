import base64
import hashlib
import hmac
import json
import time

import bcrypt

from app.core.config import settings


# ==========================================================
# PASSWORD HASH
# ==========================================================

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(
        password.encode(),
        salt,
    )
    return hashed.decode()


# ==========================================================
# VERIFY PASSWORD
# ==========================================================

def verify_password(
    password: str,
    hashed: str,
) -> bool:
    return bcrypt.checkpw(
        password.encode(),
        hashed.encode(),
    )


# ==========================================================
# BASE64 URL SAFE
# ==========================================================

def _base64url_encode(data: bytes) -> str:
    return (
        base64.urlsafe_b64encode(data)
        .rstrip(b"=")
        .decode()
    )


# ==========================================================
# CREATE JWT ACCESS TOKEN
# ==========================================================

def create_access_token(
    data: dict,
    expires_minutes: int = 60,
) -> str:

    # ------------------------------------------------------
    # COPY DATA
    # ------------------------------------------------------

    payload = dict(data)

    # ------------------------------------------------------
    # EXPIRED TIME
    # ------------------------------------------------------

    payload["exp"] = int(
        time.time()
        + (
            expires_minutes
            * 60
        )
    )

    # ------------------------------------------------------
    # JWT HEADER
    # ------------------------------------------------------

    header = {
        "alg": "HS256",
        "typ": "JWT",
    }

    # ------------------------------------------------------
    # ENCODE HEADER
    # ------------------------------------------------------

    encoded_header = _base64url_encode(
        json.dumps(
            header,
            separators=(",", ":"),
        ).encode()
    )

    # ------------------------------------------------------
    # ENCODE PAYLOAD
    # ------------------------------------------------------

    encoded_payload = _base64url_encode(
        json.dumps(
            payload,
            separators=(",", ":"),
        ).encode()
    )

    # ------------------------------------------------------
    # SIGNATURE INPUT
    # ------------------------------------------------------

    signing_input = (
        f"{encoded_header}."
        f"{encoded_payload}"
    )

    # ------------------------------------------------------
    # SECRET KEY
    # ------------------------------------------------------

    secret_key = str(
        settings.SECRET_KEY
    ).encode()

    # ------------------------------------------------------
    # HMAC SHA256
    # ------------------------------------------------------

    signature = hmac.new(
        secret_key,
        signing_input.encode(),
        hashlib.sha256,
    ).digest()

    encoded_signature = (
        _base64url_encode(signature)
    )

    # ------------------------------------------------------
    # FINAL JWT
    # ------------------------------------------------------

    token = (
        f"{signing_input}."
        f"{encoded_signature}"
    )

    return token