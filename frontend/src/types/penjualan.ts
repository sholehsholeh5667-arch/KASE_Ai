/* ==========================================================
   DETAIL PENJUALAN
========================================================== */

export interface DetailPenjualan {
  id: number;

  barang_id: number;

  qty: number;

  harga_jual: number;

  subtotal: number;
}


/* ==========================================================
   PENJUALAN
========================================================== */

export interface Penjualan {
  id: number;

  no_faktur: string;

  tanggal: string;

  pelanggan_id: number | null;

  subtotal: number;

  diskon: number;

  pajak: number;

  grand_total: number;

  metode_bayar: string;

  dibayar: number;

  kembalian: number;

  status: string;

  keterangan: string | null;

  detail: DetailPenjualan[];
}

/* ==========================================================
   ITEM KERANJANG
========================================================== */

export interface PenjualanItem {

  barang_id: number;

  nama_barang: string;

  harga_jual: number;

  qty: number;

}

export interface PenjualanItemCreate {
  barang_id: number;

  qty: number;

  harga_jual: number;
}
/* ==========================================================
   CREATE
========================================================== */

export interface PenjualanCreate {
  pelanggan_id: number | null;

  diskon: number;

  pajak: number;

  metode_bayar: string;

  dibayar: number;

  keterangan: string;

  items: PenjualanItemCreate[];
}


/* ==========================================================
   UPDATE
========================================================== */

export interface PenjualanUpdate {
  pelanggan_id?: number | null;

  diskon?: number;

  pajak?: number;

  metode_bayar?: string;

  dibayar?: number;

  status?: string;

  keterangan?: string;
}


/* ==========================================================
   RESPONSE LIST
========================================================== */

export interface PenjualanListResponse {
  data: Penjualan[];

  total: number;
}


/* ==========================================================
   METODE PEMBAYARAN
========================================================== */

export const METODE_PEMBAYARAN = [
  "TUNAI",
  "QRIS",
  "TRANSFER",
  "DEBIT",
] as const;

export type MetodePembayaran =
  typeof METODE_PEMBAYARAN[number];


/* ==========================================================
   STATUS PENJUALAN
========================================================== */

export const STATUS_PENJUALAN = [
  "DRAFT",
  "SELESAI",
  "DIBATALKAN",
] as const;

export type StatusPenjualan =
  typeof STATUS_PENJUALAN[number];