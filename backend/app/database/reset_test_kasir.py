from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


db = SessionLocal()

try:
    user = (
        db.query(User)
        .filter(User.username == "admin2")
        .first()
    )

    if user is None:
        raise RuntimeError("User admin2 tidak ditemukan.")

    user.password_hash = hash_password("Kasir@12345")
    user.role = "kasir"
    user.aktif = True

    db.commit()

    print("=" * 60)
    print("PASSWORD KASIR BERHASIL DIUBAH")
    print("=" * 60)
    print("Username : admin2")
    print("Role     : kasir")
    print("Password : Kasir@12345")

except Exception:
    db.rollback()
    raise

finally:
    db.close()