from sqlalchemy import text
from app.core.database import engine

print("=" * 70)
print("CEK MUTASI STOK TIDAK KONSISTEN")
print("=" * 70)

conn = engine.connect()

sql = text("""
SELECT
    id,
    barang_id,
    jenis,
    qty,
    stok_awal,
    stok_akhir,
    referensi
FROM mutasi_stok
WHERE stok_akhir <> stok_awal +
    CASE
        WHEN jenis IN (
            'PEMBELIAN',
            'RETUR_PENJUALAN',
            'STOCK_OPNAME_MASUK'
        )
        THEN qty

        WHEN jenis IN (
            'PENJUALAN',
            'RETUR_PEMBELIAN',
            'STOCK_OPNAME_KELUAR'
        )
        THEN -qty

        ELSE 0
    END
ORDER BY id
""")

rows = conn.execute(sql).fetchall()

print()
print("JUMLAH MUTASI BERMASALAH :", len(rows))
print()

for row in rows:
    print(
        "ID=", row.id,
        "| BARANG=", row.barang_id,
        "| JENIS=", row.jenis,
        "| QTY=", row.qty,
        "| AWAL=", row.stok_awal,
        "| AKHIR=", row.stok_akhir,
        "| REF=", row.referensi
    )

print()
print("=" * 70)
print("SELESAI")
print("=" * 70)

conn.close()