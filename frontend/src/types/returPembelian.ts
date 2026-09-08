/* =========================================================
   KONDISI BARANG RETUR
========================================================= */

export type KondisiRetur =
  | "BAIK"
  | "RUSAK";


/* =========================================================
   JENIS REFUND RETUR
=========================================================

   Harus sama dengan enum database:

   CASH
   POTONG_TAGIHAN
   TUKAR_BARANG
========================================================= */

export type JenisRefundRetur =
  | "CASH"
  | "POTONG_TAGIHAN"
  | "TUKAR_BARANG";


/* =========================================================
   STATUS RETUR PEMBELIAN
=========================================================

   Harus sama dengan enum database:

   PENDING
   DISETUJUI
   DITOLAK
========================================================= */

export type StatusReturPembelian =
  | "PENDING"
  | "DISETUJUI"
  | "DITOLAK";


/* =========================================================
   DETAIL RETUR PEMBELIAN - CREATE
========================================================= */

export interface DetailReturPembelianCreate {

  barang_id: number;

  qty: number;

  /*
   * Harga retur menggunakan harga dari
   * faktur pembelian / detail_pembelian.harga_beli.
   *
   * Frontend menampilkan nilai ini sebagai:
   * Rp 60.000
   *
   * Backend tetap menjadi sumber kebenaran
   * dan mengambil harga dari faktur.
   */
  harga: number;

  kondisi: KondisiRetur;
}


/* =========================================================
   RETUR PEMBELIAN - CREATE
========================================================= */

export interface ReturPembelianCreate {

  /*
   * ID transaksi pembelian yang diretur.
   */
  pembelian_id: number;

  /*
   * Supplier harus sama dengan supplier
   * pada faktur pembelian.
   */
  supplier_id: number;

  /*
   * User yang membuat pengajuan retur.
   */
  created_by: number;

  /*
   * Alasan retur bersifat opsional.
   */
  alasan?: string;

  /*
   * Metode pengembalian dana/barang.
   */
  jenis_refund: JenisRefundRetur;

  /*
   * Daftar barang yang diretur.
   */
  detail: DetailReturPembelianDetailCreate[];
}


/* =========================================================
   ALIAS DETAIL CREATE
=========================================================

   Alias ini dibuat agar type dapat digunakan
   secara eksplisit di beberapa bagian frontend.
========================================================= */

export type DetailReturPembelianDetailCreate =
  DetailReturPembelianCreate;


/* =========================================================
   DETAIL RETUR PEMBELIAN - RESPONSE
========================================================= */

export interface ReturPembelianDetail {

  /*
   * ID detail retur.
   */
  id: number;

  /*
   * ID barang.
   */
  barang_id: number;

  /*
   * Jumlah barang yang diretur.
   */
  qty: number;

  /*
   * Harga historis dari faktur pembelian.
   *
   * Database:
   * DECIMAL(15,2)
   *
   * Frontend:
   * number
   */
  harga: number;

  /*
   * qty × harga
   */
  subtotal: number;

  /*
   * Kondisi barang saat retur.
   */
  kondisi?: KondisiRetur;
}


/* =========================================================
   RETUR PEMBELIAN - RESPONSE
========================================================= */

export interface ReturPembelian {

  /*
   * ID retur.
   */
  id: number;

  /*
   * ID faktur pembelian asal.
   */
  pembelian_id: number;

  /*
   * ID supplier.
   */
  supplier_id: number;

  /*
   * ID user pembuat retur.
   */
  created_by: number;

  /*
   * Alasan retur.
   */
  alasan?: string;

  /*
   * Jenis refund.
   */
  jenis_refund: JenisRefundRetur;

  /*
   * Status proses retur.
   */
  status: StatusReturPembelian;

  /*
   * Total seluruh detail retur.
   */
  total: number;

  /*
   * Waktu dibuat.
   */
  created_at: string;

  /*
   * Waktu terakhir diperbarui.
   */
  updated_at: string;

  /*
   * Detail barang yang diretur.
   */
  detail: ReturPembelianDetail[];
}


/* =========================================================
   PAGINATION RESPONSE
========================================================= */

export interface ReturPembelianPaginationResponse {

  /*
   * Data retur pada halaman aktif.
   */
  items: ReturPembelian[];

  /*
   * Jumlah seluruh data.
   */
  total: number;

  /*
   * Nomor halaman.
   */
  page: number;

  /*
   * Jumlah data per halaman.
   */
  size: number;

  /*
   * Jumlah halaman.
   */
  pages: number;
}