export interface DetailReturPenjualanCreate {

  barang_id: number;

  qty: number;

  harga: number;

}


export type JenisRefund =
  | "CASH"
  | "TRANSFER"
  | "PIUTANG";


export interface ReturPenjualanCreate {

  penjualan_id: number;

  pelanggan_id?: number | null;

  alasan?: string | null;

  jenis_refund?: JenisRefund;

  detail: DetailReturPenjualanCreate[];

}


export interface ReturPenjualanDetail {

  id: number;

  retur_id: number;

  barang_id: number;

  qty: number;

  harga: number;

  subtotal: number;

  kondisi?: string | null;

}


export interface ReturPenjualan {

  id: number;

  no_retur: string;

  tanggal: string;

  penjualan_id: number;

  pelanggan_id: number;

  created_by: number;

  total: number;

  status: string;

  alasan?: string | null;

  jenis_refund: JenisRefund;

  detail: ReturPenjualanDetail[];

}


export interface ReturPenjualanPaginationResponse {

  items: ReturPenjualan[];

  total: number;

  page: number;

  size: number;

  pages: number;

}