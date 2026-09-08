from app.core.database import SessionLocal
from app.models.retur_pembelian import ReturPembelian
from app.models.retur_pembelian_detail import ReturPembelianDetail

RETUR_ID = 32

db = SessionLocal()

try:
    retur = (
        db.query(ReturPembelian)
        .filter(ReturPembelian.id == RETUR_ID)
        .first()
    )

    if not retur:
        print("❌ Retur ID 32 tidak ditemukan.")
    else:
        print("==============================================")
        print("CLEANUP TEST 5")
        print("==============================================")
        print("Retur ID      :", retur.id)
        print("Pembelian ID  :", retur.pembelian_id)
        print("Status        :", retur.status)
        print("Total         :", retur.total)

        detail = (
            db.query(ReturPembelianDetail)
            .filter(ReturPembelianDetail.retur_id == RETUR_ID)
            .all()
        )

        print("Jumlah detail :", len(detail))

        # Hanya hapus data TEST 5
        for item in detail:
            db.delete(item)

        db.delete(retur)

        db.commit()

        print("----------------------------------------------")
        print("✅ CLEANUP BERHASIL")
        print("Retur ID 32 sudah dihapus.")
        print("Transaksi pembelian asli tidak diubah.")
        print("==============================================")

except Exception as e:
    db.rollback()
    print("❌ CLEANUP GAGAL")
    print("ERROR:", e)

finally:
    db.close()