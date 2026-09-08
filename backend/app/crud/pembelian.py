from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.pembelian import Pembelian
from app.models.detail_pembelian import DetailPembelian
from app.models.barang import Barang

from app.services.mutasi_stok_service import MutasiStokService


def create_pembelian(db: Session, data):
    """
    Membuat transaksi pembelian beserta detailnya
    """

    pembelian = Pembelian(
        no_faktur=data.no_faktur,
        supplier_id=data.supplier_id,
        tanggal=data.tanggal,
        keterangan=data.keterangan,
        total=Decimal("0")
    )

    db.add(pembelian)
    db.flush()   # memperoleh pembelian.id

    total = Decimal("0")

    for item in data.detail:

        subtotal = item.qty * item.harga_beli
        total += subtotal

        detail = DetailPembelian(
            pembelian_id=pembelian.id,
            barang_id=item.barang_id,
            qty=item.qty,
            harga_beli=item.harga_beli,
            subtotal=subtotal
        )

        db.add(detail)

        barang = (
            db.query(Barang)
            .filter(Barang.id == item.barang_id)
            .first()
        )

        if barang is None:
            raise ValueError(
                f"Barang ID {item.barang_id} tidak ditemukan."
            )

        # Update harga beli terakhir
        barang.harga_beli = item.harga_beli

        # Mutasi stok + update stok barang
        MutasiStokService.pembelian(
            db=db,
            barang_id=item.barang_id,
            qty=item.qty,
            pembelian_id=pembelian.id,
            created_by=getattr(data, "created_by", None)
        )

    pembelian.total = total

    db.commit()
    db.refresh(pembelian)

    return pembelian