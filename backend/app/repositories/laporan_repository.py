"""
Laporan Repository
==================

Repository untuk mengambil data laporan dari database.
"""

from sqlalchemy import text
from sqlalchemy.orm import Session


class LaporanRepository:
    """
    Repository laporan.
    """

    def __init__(self, db: Session):
        self.db = db

    # ==================================================
    # Dashboard
    # ==================================================

    def get_dashboard_summary(self):

        result = {
            "total_penjualan": 0,
            "total_pembelian": 0,
            "total_retur_penjualan": 0,
            "total_retur_pembelian": 0,
            "jumlah_transaksi": 0,
            "jumlah_barang": 0,
            "jumlah_pelanggan": 0,
            "jumlah_supplier": 0,
        }

        queries = {

            # ------------------------------------------
            # Total Penjualan
            # ------------------------------------------

            "total_penjualan":
                """
                SELECT COALESCE(
                    SUM(grand_total),
                    0
                )
                FROM penjualan
                """,

            # ------------------------------------------
            # Total Pembelian
            # ------------------------------------------

            "total_pembelian":
                """
                SELECT COALESCE(
                    SUM(total),
                    0
                )
                FROM pembelian
                """,

            # ------------------------------------------
            # Total Retur Penjualan
            # ------------------------------------------

            "total_retur_penjualan":
                """
                SELECT COALESCE(
                    SUM(total),
                    0
                )
                FROM retur_penjualan
                """,

            # ------------------------------------------
            # Total Retur Pembelian
            # ------------------------------------------

            "total_retur_pembelian":
                """
                SELECT COALESCE(
                    SUM(total),
                    0
                )
                FROM retur_pembelian
                """,

            # ------------------------------------------
            # Jumlah Transaksi
            # ------------------------------------------

            "jumlah_transaksi":
                """
                SELECT COUNT(*)
                FROM penjualan
                """,

            # ------------------------------------------
            # Jumlah Barang
            # ------------------------------------------

            "jumlah_barang":
                """
                SELECT COUNT(*)
                FROM barang
                """,

            # ------------------------------------------
            # Jumlah Pelanggan
            # ------------------------------------------

            "jumlah_pelanggan":
                """
                SELECT COUNT(*)
                FROM pelanggan
                """,

            # ------------------------------------------
            # Jumlah Supplier
            # ------------------------------------------

            "jumlah_supplier":
                """
                SELECT COUNT(*)
                FROM supplier
                """,
        }

        for key, sql in queries.items():

            value = self.db.scalar(
                text(sql)
            )

            result[key] = value or 0

        return result

    # ==================================================
    # Penjualan
    # ==================================================

    async def get_penjualan(self):

        sql = text("""
            SELECT
                j.*,
                p.nama AS pelanggan,
                j.grand_total AS total
            FROM penjualan j
            LEFT JOIN pelanggan p
                ON p.id = j.pelanggan_id
            ORDER BY j.created_at DESC
        """)

        result = self.db.execute(sql)

        return result.mappings().all()

    # ==================================================
    # Pembelian
    # ==================================================

    async def get_pembelian(self):

        sql = text("""
            SELECT *
            FROM pembelian
            ORDER BY created_at DESC
        """)

        result = self.db.execute(sql)

        return result.mappings().all()

    # ==================================================
    # RETUR PENJUALAN
    # ==================================================

    async def get_retur_penjualan(self):

        sql = text("""
            SELECT
                rp.id,

                -- Nomor retur
                rp.no_retur,

                -- Nomor faktur penjualan asal
                p.no_faktur AS no_faktur,

                -- Tanggal retur
                rp.created_at AS tanggal,

                -- ID pelanggan
                rp.pelanggan_id,

                -- Nama pelanggan
                COALESCE(
                    pl.nama,
                    'Pelanggan Umum'
                ) AS pelanggan,

                -- Total retur
                rp.total,

                -- Status retur
                rp.status,

                -- Data tambahan
                rp.penjualan_id,
                rp.created_by,
                rp.alasan,
                rp.jenis_refund,
                rp.created_at,
                rp.updated_at

            FROM retur_penjualan rp

            LEFT JOIN penjualan p
                ON p.id = rp.penjualan_id

            LEFT JOIN pelanggan pl
                ON pl.id = rp.pelanggan_id

            ORDER BY rp.created_at DESC
        """)

        result = self.db.execute(sql)

        return result.mappings().all()

    # ==================================================
    # RETUR PEMBELIAN
    # ==================================================

    async def get_retur_pembelian(self):

        sql = text("""
            SELECT
                rp.id,

                -- Nomor faktur pembelian asal
                pb.no_faktur AS no_faktur,

                -- Tanggal retur
                rp.created_at AS tanggal,

                -- ID supplier
                rp.supplier_id,

                -- Nama supplier
                COALESCE(
                    s.nama,
                    '-'
                ) AS supplier,

                -- Total retur
                rp.total,

                -- Status retur
                rp.status,

                -- Data tambahan
                rp.pembelian_id,
                rp.created_by,
                rp.alasan,
                rp.jenis_refund,
                rp.created_at,
                rp.updated_at

            FROM retur_pembelian rp

            LEFT JOIN pembelian pb
                ON pb.id = rp.pembelian_id

            LEFT JOIN supplier s
                ON s.id = rp.supplier_id

            ORDER BY rp.created_at DESC
        """)

        result = self.db.execute(sql)

        return result.mappings().all()

    # ==================================================
    # Persediaan
    # ==================================================

    def get_stock(self):

        sql = text("""
            SELECT *
            FROM barang
            ORDER BY nama_barang
        """)

        result = self.db.execute(sql)

        return result.mappings().all()

    # ==================================================
    # Mutasi Stok
    # ==================================================

    def get_stock_mutation(self):

        sql = text("""
            SELECT *
            FROM mutasi_stok
            ORDER BY created_at DESC
        """)

        result = self.db.execute(sql)

        return result.mappings().all()

    # ==================================================
    # Produk Terlaris
    # ==================================================

    def get_top_product(
        self,
        limit: int = 10
    ):

        sql = text("""
            SELECT
                b.nama_barang,
                SUM(dp.qty) AS total_terjual
            FROM detail_penjualan dp
            JOIN barang b
                ON b.id = dp.barang_id
            GROUP BY b.id, b.nama_barang
            ORDER BY total_terjual DESC
            LIMIT :limit
        """)

        result = self.db.execute(
            sql,
            {
                "limit": limit
            }
        )

        return result.mappings().all()

    # ==================================================
    # Pelanggan
    # ==================================================

    async def get_customer_report(self):

        sql = text("""
            SELECT
                p.nama,
                COUNT(j.id) AS jumlah_transaksi,
                COALESCE(
                    SUM(j.grand_total),
                    0
                ) AS total_belanja
            FROM pelanggan p
            LEFT JOIN penjualan j
                ON j.pelanggan_id = p.id
            GROUP BY p.id, p.nama
            ORDER BY total_belanja DESC
        """)

        result = self.db.execute(sql)

        return result.mappings().all()

    # ==================================================
    # Supplier
    # ==================================================

    async def get_supplier_report(self):

        sql = text("""
            SELECT
                s.nama,
                COUNT(pb.id) AS jumlah_pembelian,
                COALESCE(
                    SUM(pb.total),
                    0
                ) AS total_pembelian
            FROM supplier s
            LEFT JOIN pembelian pb
                ON pb.supplier_id = s.id
            GROUP BY s.id, s.nama
            ORDER BY total_pembelian DESC
        """)

        result = self.db.execute(sql)

        return result.mappings().all()

    # ==================================================
    # Laba Rugi
    # ==================================================

    def get_profit_loss(
        self,
        tanggal_awal=None,
        tanggal_akhir=None
    ):
        """
        Mengambil laporan laba rugi.

        Jika tanggal_awal dan tanggal_akhir diberikan,
        laporan hanya menghitung transaksi dalam periode tersebut.

        Jika filter tanggal tidak diberikan,
        seluruh periode transaksi dihitung.
        """

        # ==================================================
        # FILTER TANGGAL PENJUALAN
        # ==================================================

        filter_penjualan = ""
        params = {}

        if tanggal_awal:
            filter_penjualan += """
                AND p.tanggal >= :tanggal_awal
            """

            params["tanggal_awal"] = tanggal_awal

        if tanggal_akhir:
            filter_penjualan += """
                AND p.tanggal <= :tanggal_akhir
            """

            params["tanggal_akhir"] = tanggal_akhir

        # ==================================================
        # OMZET PENJUALAN
        # ==================================================

        penjualan = self.db.scalar(
            text(
                f"""
                SELECT COALESCE(
                    SUM(p.grand_total),
                    0
                )
                FROM penjualan p
                WHERE 1=1
                {filter_penjualan}
                """
            ),
            params
        )

        # ==================================================
        # HPP
        #
        # HPP = qty barang terjual x harga beli
        #
        # Hanya barang yang benar-benar terjual
        # yang dihitung sebagai HPP.
        # ==================================================

        filter_hpp = ""

        if tanggal_awal:
            filter_hpp += """
                AND p.tanggal >= :tanggal_awal
            """

        if tanggal_akhir:
            filter_hpp += """
                AND p.tanggal <= :tanggal_akhir
            """

        hpp = self.db.scalar(
            text(
                f"""
                SELECT COALESCE(
                    SUM(
                        dp.qty * b.harga_beli
                    ),
                    0
                )
                FROM detail_penjualan dp
                JOIN penjualan p
                    ON p.id = dp.penjualan_id
                JOIN barang b
                    ON b.id = dp.barang_id
                WHERE 1=1
                {filter_hpp}
                """
            ),
            params
        )

        # ==================================================
        # RETUR PENJUALAN
        # ==================================================

        filter_retur = ""
        retur_params = {}

        if tanggal_awal:
            filter_retur += """
                AND rp.tanggal >= :tanggal_awal
            """

            retur_params["tanggal_awal"] = tanggal_awal

        if tanggal_akhir:
            filter_retur += """
                AND rp.tanggal <= :tanggal_akhir
            """

            retur_params["tanggal_akhir"] = tanggal_akhir

        retur = self.db.scalar(
            text(
                f"""
                SELECT COALESCE(
                    SUM(rp.total),
                    0
                )
                FROM retur_penjualan rp
                WHERE 1=1
                {filter_retur}
                """
            ),
            retur_params
        )

        # ==================================================
        # NORMALISASI
        # ==================================================

        omzet = float(penjualan or 0)
        hpp = float(hpp or 0)
        retur = float(retur or 0)

        # ==================================================
        # LABA KOTOR
        # ==================================================

        laba_kotor = omzet - hpp

        # ==================================================
        # LABA BERSIH
        # ==================================================

        laba_bersih = laba_kotor - retur

        # ==================================================
        # HASIL
        # ==================================================

        return {
            "omzet": omzet,
            "hpp": hpp,
            "retur": retur,
            "laba_kotor": laba_kotor,
            "laba_bersih": laba_bersih
        }

    # ==================================================
    # Nilai Persediaan
    # ==================================================

    def get_inventory_value(self):

        sql = text("""
            SELECT
                COUNT(*) AS jumlah_barang,

                COALESCE(
                    SUM(stok),
                    0
                ) AS total_stok,

                COALESCE(
                    SUM(
                        stok * harga_beli
                    ),
                    0
                ) AS nilai_persediaan

            FROM barang
        """)

        result = self.db.execute(sql)

        row = result.mappings().first()

        return dict(row) if row else {
            "jumlah_barang": 0,
            "total_stok": 0,
            "nilai_persediaan": 0
        }

    # ==================================================
    # Filter Penjualan
    # ==================================================

    async def filter_penjualan(
        self,
        tanggal_awal=None,
        tanggal_akhir=None,
        kategori_id=None,
        supplier_id=None,
        pelanggan_id=None,
        barang_id=None,
        kasir_id=None,
        metode_bayar=None,
        status=None,
        keyword=None,
        sort_by="created_at",
        sort_order="DESC",
        page=1,
        limit=20
    ):
        """
        Filter laporan penjualan secara dinamis.
        """

        query = """
            SELECT *
            FROM penjualan
            WHERE 1=1
        """

        params = {}

        # ==================================================
        # Filter Tanggal
        # ==================================================

        if tanggal_awal:
            query += """
                AND tanggal >= :tanggal_awal
            """

            params["tanggal_awal"] = tanggal_awal

        if tanggal_akhir:
            query += """
                AND tanggal <= :tanggal_akhir
            """

            params["tanggal_akhir"] = tanggal_akhir

        # ==================================================
        # Filter Pelanggan
        # ==================================================

        if pelanggan_id:
            query += """
                AND pelanggan_id = :pelanggan_id
            """

            params["pelanggan_id"] = pelanggan_id

        # ==================================================
        # Filter Kasir
        # ==================================================

        if kasir_id:
            query += """
                AND user_id = :kasir_id
            """

            params["kasir_id"] = kasir_id

        # ==================================================
        # Filter Metode Bayar
        # ==================================================

        if metode_bayar:
            query += """
                AND metode_bayar = :metode_bayar
            """

            params["metode_bayar"] = metode_bayar

        # ==================================================
        # Filter Status
        # ==================================================

        if status:
            query += """
                AND status = :status
            """

            params["status"] = status

        # ==================================================
        # Keyword
        # ==================================================

        if keyword:
            query += """
                AND (
                    no_faktur LIKE :keyword
                    OR keterangan LIKE :keyword
                )
            """

            params["keyword"] = f"%{keyword}%"

        # ==================================================
        # Sorting
        # ==================================================

        allowed_sort = {
            "created_at",
            "tanggal",
            "grand_total",
            "no_faktur"
        }

        if sort_by not in allowed_sort:
            sort_by = "created_at"

        sort_order = sort_order.upper()

        if sort_order not in (
            "ASC",
            "DESC"
        ):
            sort_order = "DESC"

        query += f"""
            ORDER BY {sort_by} {sort_order}
        """

        # ==================================================
        # Pagination
        # ==================================================

        offset = (page - 1) * limit

        query += """
            LIMIT :limit
            OFFSET :offset
        """

        params["limit"] = limit
        params["offset"] = offset

        result = self.db.execute(
            text(query),
            params
        )

        items = result.mappings().all()

        # ==================================================
        # Total Data
        # ==================================================

        count_query = """
            SELECT COUNT(*) AS total
            FROM penjualan
            WHERE 1=1
        """

        count_params = {}

        if tanggal_awal:
            count_query += """
                AND tanggal >= :tanggal_awal
            """

            count_params["tanggal_awal"] = tanggal_awal

        if tanggal_akhir:
            count_query += """
                AND tanggal <= :tanggal_akhir
            """

            count_params["tanggal_akhir"] = tanggal_akhir

        if pelanggan_id:
            count_query += """
                AND pelanggan_id = :pelanggan_id
            """

            count_params["pelanggan_id"] = pelanggan_id

        if kasir_id:
            count_query += """
                AND user_id = :kasir_id
            """

            count_params["kasir_id"] = kasir_id

        if metode_bayar:
            count_query += """
                AND metode_bayar = :metode_bayar
            """

            count_params["metode_bayar"] = metode_bayar

        if status:
            count_query += """
                AND status = :status
            """

            count_params["status"] = status

        if keyword:
            count_query += """
                AND (
                    no_faktur LIKE :keyword
                    OR keterangan LIKE :keyword
                )
            """

            count_params["keyword"] = f"%{keyword}%"

        total = self.db.scalar(
            text(count_query),
            count_params
        )

        return {
            "items": items,
            "page": page,
            "limit": limit,
            "total": total or 0
        }