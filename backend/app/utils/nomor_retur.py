from datetime import datetime

from sqlalchemy.orm import Session

from app.models.retur_penjualan import ReturPenjualan


def generate_nomor_retur(db: Session) -> str:
    """
    Generate nomor retur penjualan.

    Format:
    RTR-YYYYMMDD-0001

    Contoh:
    RTR-20260811-0001
    """

    today = datetime.now().strftime("%Y%m%d")

    prefix = f"RTR-{today}"

    terakhir = (
        db.query(ReturPenjualan)
        .filter(
            ReturPenjualan.no_retur.like(
                f"{prefix}-%"
            )
        )
        .order_by(
            ReturPenjualan.no_retur.desc()
        )
        .first()
    )

    if terakhir:
        nomor = int(
            terakhir.no_retur.split("-")[-1]
        ) + 1
    else:
        nomor = 1

    return f"{prefix}-{nomor:04d}"