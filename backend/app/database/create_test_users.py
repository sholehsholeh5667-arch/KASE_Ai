from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


USERS = [
    {
        "username": "owner_test",
        "nama": "Owner Test",
        "password": "Owner@12345",
        "role": "owner",
    },
    {
        "username": "gudang_test",
        "nama": "Gudang Test",
        "password": "Gudang@12345",
        "role": "gudang",
    },
    {
        "username": "akuntan_test",
        "nama": "Akuntan Test",
        "password": "Akuntan@12345",
        "role": "akuntan",
    },
]


db = SessionLocal()

try:
    for data in USERS:

        existing = (
            db.query(User)
            .filter(User.username == data["username"])
            .first()
        )

        if existing:
            print(
                f"{data['username']} sudah ada - dilewati"
            )
            continue

        user = User(
            nama=data["nama"],
            username=data["username"],
            password_hash=hash_password(
                data["password"]
            ),
            role=data["role"],
            aktif=True,
        )

        db.add(user)

        print(
            f"Membuat: {data['username']} "
            f"-> {data['role']}"
        )

    db.commit()

    print()
    print("=" * 60)
    print("AKUN TEST BERHASIL DIBUAT")
    print("=" * 60)

except Exception:
    db.rollback()
    raise

finally:
    db.close()