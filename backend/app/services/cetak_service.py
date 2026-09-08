from decimal import Decimal
from html import escape

from fastapi import HTTPException
from sqlalchemy.orm import Session, selectinload

from app.models.settings import Settings

from app.models.penjualan import Penjualan
from app.models.detail_penjualan import DetailPenjualan

from app.models.pembelian import Pembelian
from app.models.detail_pembelian import DetailPembelian


# ==========================================================
# FORMAT RUPIAH
# ==========================================================

def rupiah(value) -> str:

    if value is None:
        value = Decimal("0")

    value = Decimal(str(value))

    return (
        "Rp "
        + f"{value:,.0f}"
        .replace(",", ".")
    )


# ==========================================================
# FORMAT TANGGAL
# ==========================================================

def format_tanggal(value) -> str:

    if not value:
        return "-"

    try:
        return value.strftime(
            "%d-%m-%Y %H:%M"
        )
    except Exception:
        return str(value)


# ==========================================================
# AMBIL SETTING TOKO
# ==========================================================

def get_settings(
    db: Session,
) -> Settings:

    setting = (
        db.query(Settings)
        .filter(Settings.id == 1)
        .first()
    )

    if setting is None:

        setting = Settings(
            id=1,
            store_name="KASE AI",
            owner_name="",
            address="",
            phone="",
            email="",
            logo="",
            currency="IDR",
            tax=0,
            thermal_printer="",
            receipt_width=80,
            backup_auto=False,
            language="id",
        )

        db.add(setting)
        db.commit()
        db.refresh(setting)

    return setting


# ==========================================================
# CSS CETAK
# ==========================================================

def build_css(
    jenis: str,
    receipt_width: int,
) -> str:

    if jenis == "struk":

        width = (
            58
            if receipt_width not in (58, 80)
            else receipt_width
        )

        return f"""
        @page {{
            size: {width}mm auto;
            margin: 0;
        }}

        * {{
            box-sizing: border-box;
        }}

        body {{
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #000;
        }}

        .page {{
            width: {width}mm;
            margin: 0 auto;
            padding: 4mm;
        }}

        .center {{
            text-align: center;
        }}

        .right {{
            text-align: right;
        }}

        .bold {{
            font-weight: bold;
        }}

        .store-name {{
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 2px;
        }}

        .small {{
            font-size: 9px;
        }}

        .line {{
            border-top: 1px dashed #000;
            margin: 7px 0;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
        }}

        td {{
            vertical-align: top;
            padding: 2px 0;
        }}

        .item-name {{
            font-weight: bold;
        }}

        .item-detail {{
            font-size: 9px;
        }}

        .total {{
            font-size: 13px;
            font-weight: bold;
        }}

        .print-button {{
            display: block;
            margin: 15px auto;
            padding: 10px 20px;
            border: 0;
            background: #0d47a1;
            color: white;
            border-radius: 5px;
            cursor: pointer;
        }}

        @media print {{
            .print-button {{
                display: none;
            }}
        }}
        """

    return """
    @page {
        size: A4;
        margin: 15mm;
    }

    * {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12px;
        color: #000;
    }

    .page {
        width: 100%;
        margin: 0 auto;
    }

    .header {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 20px;
    }

    .store-name {
        font-size: 22px;
        font-weight: bold;
    }

    .invoice-title {
        font-size: 24px;
        font-weight: bold;
        text-align: right;
    }

    .meta {
        margin-bottom: 20px;
    }

    .meta table {
        width: 100%;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        border-top: 1px solid #000;
        border-bottom: 1px solid #000;
        padding: 8px;
        text-align: left;
    }

    td {
        padding: 8px;
        border-bottom: 1px solid #ddd;
        vertical-align: top;
    }

    .right {
        text-align: right;
    }

    .center {
        text-align: center;
    }

    .bold {
        font-weight: bold;
    }

    .summary {
        width: 45%;
        margin-left: auto;
        margin-top: 20px;
    }

    .summary td {
        border: 0;
        padding: 5px;
    }

    .grand-total {
        font-size: 16px;
        font-weight: bold;
        border-top: 2px solid #000 !important;
    }

    .footer {
        margin-top: 50px;
        text-align: center;
        font-size: 11px;
    }

    .print-button {
        display: block;
        margin: 20px auto;
        padding: 10px 20px;
        border: 0;
        background: #0d47a1;
        color: white;
        border-radius: 5px;
        cursor: pointer;
    }

    @media print {
        .print-button {
            display: none;
        }
    }
    """


# ==========================================================
# HEADER TOKO
# ==========================================================

def store_header(
    setting: Settings,
) -> str:

    store_name = escape(
        setting.store_name or "KASE AI"
    )

    owner_name = escape(
        setting.owner_name or ""
    )

    address = escape(
        setting.address or ""
    )

    phone = escape(
        setting.phone or ""
    )

    email = escape(
        setting.email or ""
    )

    logo = escape(
        setting.logo or ""
    )

    logo_html = ""

    if logo:

        logo_html = f"""
        <div class="center">
            <img
                src="{logo}"
                alt="Logo"
                style="max-width:80px;max-height:80px;"
            >
        </div>
        """

    return f"""
    {logo_html}

    <div class="store-name center">
        {store_name}
    </div>

    {
        f'<div class="center">{owner_name}</div>'
        if owner_name else ""
    }

    {
        f'<div class="center">{address}</div>'
        if address else ""
    }

    {
        f'<div class="center">Telp: {phone}</div>'
        if phone else ""
    }

    {
        f'<div class="center">{email}</div>'
        if email else ""
    }
    """


# ==========================================================
# PENJUALAN
# ==========================================================

def get_penjualan(
    db: Session,
    penjualan_id: int,
):

    data = (
        db.query(Penjualan)
        .options(
            selectinload(
                Penjualan.detail
            ).selectinload(
                DetailPenjualan.barang
            ),
            selectinload(
                Penjualan.pelanggan
            ),
        )
        .filter(
            Penjualan.id == penjualan_id
        )
        .first()
    )

    if data is None:

        raise HTTPException(
            status_code=404,
            detail="Penjualan tidak ditemukan.",
        )

    return data


# ==========================================================
# PEMBELIAN
# ==========================================================

def get_pembelian(
    db: Session,
    pembelian_id: int,
):

    data = (
        db.query(Pembelian)
        .options(
            selectinload(
                Pembelian.detail
            ).selectinload(
                DetailPembelian.barang
            ),
            selectinload(
                Pembelian.supplier
            ),
        )
        .filter(
            Pembelian.id == pembelian_id
        )
        .first()
    )

    if data is None:

        raise HTTPException(
            status_code=404,
            detail="Pembelian tidak ditemukan.",
        )

    return data


# ==========================================================
# HTML STRUK PENJUALAN
# ==========================================================

def penjualan_struk(
    setting: Settings,
    data: Penjualan,
) -> str:

    pelanggan = (
        data.pelanggan.nama
        if data.pelanggan
        else "Umum"
    )

    rows = ""

    for detail in data.detail:

        nama = (
            detail.barang.nama_barang
            if detail.barang
            else f"Barang #{detail.barang_id}"
        )

        rows += f"""
        <tr>
            <td colspan="2">
                <div class="item-name">
                    {escape(nama)}
                </div>

                <div class="item-detail">
                    {detail.qty} x
                    {rupiah(detail.harga_jual)}
                </div>
            </td>

            <td class="right">
                {rupiah(detail.subtotal)}
            </td>
        </tr>
        """

    return f"""
    <!DOCTYPE html>
    <html lang="id">

    <head>
        <meta charset="UTF-8">
        <title>
            Struk {escape(data.no_faktur)}
        </title>

        <style>
            {build_css(
                "struk",
                int(setting.receipt_width or 80)
            )}
        </style>
    </head>

    <body>

        <button
            class="print-button"
            onclick="window.print()"
        >
            CETAK
        </button>

        <div class="page">

            {store_header(setting)}

            <div class="line"></div>

            <table>

                <tr>
                    <td>No Faktur</td>
                    <td class="right">
                        {escape(data.no_faktur)}
                    </td>
                </tr>

                <tr>
                    <td>Tanggal</td>
                    <td class="right">
                        {format_tanggal(data.tanggal)}
                    </td>
                </tr>

                <tr>
                    <td>Pelanggan</td>
                    <td class="right">
                        {escape(pelanggan)}
                    </td>
                </tr>

            </table>

            <div class="line"></div>

            <table>

                {rows}

            </table>

            <div class="line"></div>

            <table>

                <tr>
                    <td>Subtotal</td>
                    <td class="right">
                        {rupiah(data.subtotal)}
                    </td>
                </tr>

                <tr>
                    <td>Diskon</td>
                    <td class="right">
                        {rupiah(data.diskon)}
                    </td>
                </tr>

                <tr>
                    <td>Pajak</td>
                    <td class="right">
                        {rupiah(data.pajak)}
                    </td>
                </tr>

                <tr class="total">
                    <td>TOTAL</td>
                    <td class="right">
                        {rupiah(data.grand_total)}
                    </td>
                </tr>

                <tr>
                    <td>Bayar</td>
                    <td class="right">
                        {rupiah(data.dibayar)}
                    </td>
                </tr>

                <tr>
                    <td>Kembalian</td>
                    <td class="right">
                        {rupiah(data.kembalian)}
                    </td>
                </tr>

            </table>

            <div class="line"></div>

            <div class="center small">
                Pembayaran: {escape(data.metode_bayar)}
            </div>

            <br>

            <div class="center">
                Terima kasih
            </div>

        </div>

    </body>

    </html>
    """


# ==========================================================
# FAKTUR PENJUALAN
# ==========================================================

def penjualan_faktur(
    setting: Settings,
    data: Penjualan,
) -> str:

    pelanggan = (
        data.pelanggan
        if data.pelanggan
        else None
    )

    rows = ""

    for nomor, detail in enumerate(
        data.detail,
        start=1,
    ):

        nama = (
            detail.barang.nama_barang
            if detail.barang
            else f"Barang #{detail.barang_id}"
        )

        kode = (
            detail.barang.kode_barang
            if detail.barang
            else "-"
        )

        rows += f"""
        <tr>
            <td class="center">
                {nomor}
            </td>

            <td>
                {escape(kode)}
            </td>

            <td>
                {escape(nama)}
            </td>

            <td class="center">
                {detail.qty}
            </td>

            <td class="right">
                {rupiah(detail.harga_jual)}
            </td>

            <td class="right">
                {rupiah(detail.subtotal)}
            </td>
        </tr>
        """

    pelanggan_html = (
        f"""
        <div>
            <strong>Pelanggan</strong><br>
            {escape(pelanggan.nama)}<br>
            {escape(pelanggan.alamat or "")}<br>
            {escape(pelanggan.telepon or "")}
        </div>
        """
        if pelanggan
        else
        """
        <div>
            <strong>Pelanggan</strong><br>
            Umum
        </div>
        """
    )

    return f"""
    <!DOCTYPE html>

    <html lang="id">

    <head>

        <meta charset="UTF-8">

        <title>
            Faktur {escape(data.no_faktur)}
        </title>

        <style>
            {build_css("faktur", 80)}
        </style>

    </head>

    <body>

        <button
            class="print-button"
            onclick="window.print()"
        >
            CETAK FAKTUR
        </button>

        <div class="page">

            <div class="header">

                <div>
                    {store_header(setting)}
                </div>

                <div>
                    <div class="invoice-title">
                        FAKTUR PENJUALAN
                    </div>

                    <div>
                        No:
                        <strong>
                            {escape(data.no_faktur)}
                        </strong>
                    </div>

                    <div>
                        Tanggal:
                        {format_tanggal(data.tanggal)}
                    </div>
                </div>

            </div>

            <div class="meta">

                <table>

                    <tr>

                        <td>
                            {pelanggan_html}
                        </td>

                        <td class="right">
                            <strong>
                                Status
                            </strong><br>
                            {escape(data.status)}
                        </td>

                    </tr>

                </table>

            </div>

            <table>

                <thead>

                    <tr>
                        <th>No</th>
                        <th>Kode</th>
                        <th>Barang</th>
                        <th class="center">Qty</th>
                        <th class="right">Harga</th>
                        <th class="right">Subtotal</th>
                    </tr>

                </thead>

                <tbody>

                    {rows}

                </tbody>

            </table>

            <table class="summary">

                <tr>
                    <td>Subtotal</td>
                    <td class="right">
                        {rupiah(data.subtotal)}
                    </td>
                </tr>

                <tr>
                    <td>Diskon</td>
                    <td class="right">
                        {rupiah(data.diskon)}
                    </td>
                </tr>

                <tr>
                    <td>Pajak</td>
                    <td class="right">
                        {rupiah(data.pajak)}
                    </td>
                </tr>

                <tr class="grand-total">
                    <td>GRAND TOTAL</td>
                    <td class="right">
                        {rupiah(data.grand_total)}
                    </td>
                </tr>

                <tr>
                    <td>Dibayar</td>
                    <td class="right">
                        {rupiah(data.dibayar)}
                    </td>
                </tr>

                <tr>
                    <td>Kembalian</td>
                    <td class="right">
                        {rupiah(data.kembalian)}
                    </td>
                </tr>

            </table>

            <div class="footer">

                <p>
                    Metode pembayaran:
                    <strong>
                        {escape(data.metode_bayar)}
                    </strong>
                </p>

                <p>
                    Terima kasih atas kepercayaan Anda.
                </p>

            </div>

        </div>

    </body>

    </html>
    """


# ==========================================================
# FAKTUR PEMBELIAN
# ==========================================================

def pembelian_faktur(
    setting: Settings,
    data: Pembelian,
) -> str:

    rows = ""

    for nomor, detail in enumerate(
        data.detail,
        start=1,
    ):

        nama = (
            detail.barang.nama_barang
            if detail.barang
            else f"Barang #{detail.barang_id}"
        )

        kode = (
            detail.barang.kode_barang
            if detail.barang
            else "-"
        )

        rows += f"""
        <tr>
            <td class="center">
                {nomor}
            </td>

            <td>
                {escape(kode)}
            </td>

            <td>
                {escape(nama)}
            </td>

            <td class="center">
                {detail.qty}
            </td>

            <td class="right">
                {rupiah(detail.harga_beli)}
            </td>

            <td class="right">
                {rupiah(detail.subtotal)}
            </td>
        </tr>
        """

    # ======================================================
    # SUPPLIER
    # ======================================================

    supplier = data.supplier

    if supplier:

        supplier_html = f"""
        <strong>Supplier</strong><br>
        {escape(supplier.nama)}<br>
        {escape(supplier.alamat or "")}<br>
        {escape(supplier.telepon or "")}
        """

    else:

        supplier_html = """
        <strong>Supplier</strong><br>
        -
        """

    # ======================================================
    # FAKTUR PEMBELIAN
    # ======================================================

    return f"""
    <!DOCTYPE html>

    <html lang="id">

    <head>

        <meta charset="UTF-8">

        <title>
            Faktur Pembelian {escape(data.no_faktur)}
        </title>

        <style>
            {build_css("faktur", 80)}
        </style>

    </head>

    <body>

        <button
            class="print-button"
            onclick="window.print()"
        >
            CETAK FAKTUR
        </button>

        <div class="page">

            <!-- =========================================
                 HEADER
            ========================================== -->

            <div class="header">

                <div>
                    {store_header(setting)}
                </div>

                <div>

                    <div class="invoice-title">
                        FAKTUR PEMBELIAN
                    </div>

                    <div>
                        No:
                        <strong>
                            {escape(data.no_faktur)}
                        </strong>
                    </div>

                    <div>
                        Tanggal:
                        {format_tanggal(data.tanggal)}
                    </div>

                </div>

            </div>


            <!-- =========================================
                 SUPPLIER + KETERANGAN
            ========================================== -->

            <div class="meta">

                <table>

                    <tr>

                        <td>
                            {supplier_html}
                        </td>

                        <td class="right">

                            <strong>
                                Keterangan
                            </strong>

                            <br>

                            {escape(
                                data.keterangan
                                or "-"
                            )}

                        </td>

                    </tr>

                </table>

            </div>


            <!-- =========================================
                 DETAIL PEMBELIAN
            ========================================== -->

            <table>

                <thead>

                    <tr>

                        <th>
                            No
                        </th>

                        <th>
                            Kode
                        </th>

                        <th>
                            Barang
                        </th>

                        <th class="center">
                            Qty
                        </th>

                        <th class="right">
                            Harga
                        </th>

                        <th class="right">
                            Subtotal
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {rows}

                </tbody>

            </table>


            <!-- =========================================
                 TOTAL
                 PEMBELIAN TIDAK MENGGUNAKAN
                 DISKON / PAJAK
            ========================================== -->

            <table class="summary">

                <tr>

                    <td>
                        Total Pembelian
                    </td>

                    <td class="right">
                        {rupiah(data.total)}
                    </td>

                </tr>

                <tr class="grand-total">

                    <td>
                        GRAND TOTAL
                    </td>

                    <td class="right">
                        {rupiah(data.grand_total)}
                    </td>

                </tr>

            </table>


            <!-- =========================================
                 FOOTER
            ========================================== -->

            <div class="footer">

                <p>
                    Dokumen pembelian KASE AI
                </p>

            </div>

        </div>

    </body>

    </html>
    """

# ==========================================================
# API SERVICE PENJUALAN
# ==========================================================

def preview_penjualan(
    db: Session,
    penjualan_id: int,
    jenis: str = "struk",
) -> str:

    setting = get_settings(db)

    data = get_penjualan(
        db,
        penjualan_id,
    )

    if jenis == "struk":

        return penjualan_struk(
            setting,
            data,
        )

    if jenis == "faktur":

        return penjualan_faktur(
            setting,
            data,
        )

    raise HTTPException(
        status_code=400,
        detail=(
            "Jenis cetak tidak valid. "
            "Gunakan 'struk' atau 'faktur'."
        ),
    )


# ==========================================================
# API SERVICE PEMBELIAN
# ==========================================================

def preview_pembelian(
    db: Session,
    pembelian_id: int,
    jenis: str = "faktur",
) -> str:

    setting = get_settings(db)

    data = get_pembelian(
        db,
        pembelian_id,
    )

    if jenis == "faktur":

        return pembelian_faktur(
            setting,
            data,
        )

    raise HTTPException(
        status_code=400,
        detail=(
            "Jenis cetak pembelian saat ini "
            "hanya 'faktur'."
        ),
    )