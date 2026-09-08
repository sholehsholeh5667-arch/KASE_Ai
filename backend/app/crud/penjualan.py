from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.penjualan import Penjualan
from app.models.detail_penjualan import DetailPenjualan
from app.models.barang import Barang


def create_penjualan(db: Session, data):
    """
    Menyimpan transaksi penjualan beserta detailnya,
    sekaligus mengurangi stok barang.
    """

    penjualan = Penjualan(
        no_faktur=data.no_faktur,
        pelanggan_id=data.pelanggan_id,
        tanggal=data.tanggal,
        diskon=data.diskon,
        keterangan=data.keterangan,
        total=Decimal("0"),
        grand_total=Decimal("0")
    )

    db.add(penjualan)
    db.flush()      # mendapatkan penjualan.id

    total = Decimal("0")

    for item in data.detail:

        barang = (
            db.query(Barang)
            .filter(Barang.id == item.barang_id)
            .first()
        )

        if barang is None:
            raise ValueError(
                f"Barang ID {item.barang_id} tidak ditemukan."
            )

        if barang.stok < item.qty:
            raise ValueError(
                f"Stok {barang.nama_barang} tidak mencukupi. "
                f"Sisa stok: {barang.stok}"
            )

        subtotal = item.qty * item.harga_jual
        total += subtotal

        detail = DetailPenjualan(
            penjualan_id=penjualan.id,
            barang_id=item.barang_id,
            qty=item.qty,
            harga_jual=item.harga_jual,
            subtotal=subtotal
        )

        db.add(detail)

        # Kurangi stok
        barang.stok -= item.qty

    penjualan.total = total
    penjualan.grand_total = total - data.diskon

    db.commit()
    db.refresh(penjualan)

    return penjualan