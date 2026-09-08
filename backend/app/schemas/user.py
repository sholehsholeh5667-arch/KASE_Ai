from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
)


# ==========================================================
# USER CREATE
# ==========================================================

class UserCreate(BaseModel):
    nama: str
    username: str
    password: str
    email: EmailStr | None = None
    role: str = "kasir"
    aktif: bool = True


# ==========================================================
# USER LOGIN
# ==========================================================

class UserLogin(BaseModel):
    username: str
    password: str


# ==========================================================
# USER RESPONSE
# ==========================================================

class UserResponse(BaseModel):
    id: int
    nama: str
    username: str
    email: str | None = None
    role: str
    aktif: bool

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# USER UPDATE
# ==========================================================

class UserUpdate(BaseModel):
    nama: str | None = None
    email: EmailStr | None = None
    role: str | None = None
    aktif: bool | None = None


# ==========================================================
# USER STATUS UPDATE
# ==========================================================

class UserStatusUpdate(BaseModel):
    aktif: bool


# ==========================================================
# USER DETAIL / MEMBER RESPONSE
# ==========================================================

class UserMemberResponse(BaseModel):

    id: int
    nama: str
    username: str
    email: str | None = None

    role: str
    aktif: bool

    toko_id: int
    toko_status: str

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# TOKEN
# ==========================================================

class Token(BaseModel):
    access_token: str
    token_type: str