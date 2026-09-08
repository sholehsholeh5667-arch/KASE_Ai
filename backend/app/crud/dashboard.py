from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.barang import Barang
from app.models.supplier import Supplier
from app.models.pelanggan import Pelanggan
from app.models.penjualan import Penjualan
from app.models.pembelian import Pembelian


def get_dashboard(db: Session):

    today = date.today()

    total_barang = db.query(Barang).count()

    total_supplier = db.query(Supplier).count()

    total_pelanggan = db.query(Pelanggan).count()

    total_stok = (
        db.query(func.sum(Barang.stok))
        .scalar()
        or 0
    )

    penjualan = (
        db.query(func.sum(Penjualan.grand_total))
        .filter(func.date(Penjualan.tanggal) == today)
        .scalar()
        or 0
    )

    pembelian = (
        db.query(func.sum(Pembelian.total))
        .filter(func.date(Pembelian.tanggal) == today)
        .scalar()
        or 0
    )

    return {
        "total_barang": total_barang,
        "total_supplier": total_supplier,
        "total_pelanggan": total_pelanggan,
        "total_stok": total_stok,
        "penjualan_hari_ini": penjualan,
        "pembelian_hari_ini": pembelian,
    }