export interface DetailPembelianCreate {
  barang_id: number;
  qty: number;
  harga_beli: number;
}

export interface PembelianCreate {
  supplier_id: number;
  detail: DetailPembelianCreate[];
}

export interface Pembelian {
  id: number;
  no_faktur: string;
  tanggal: string;
  supplier_id: number;
  subtotal: number;
  diskon: number;
  pajak: number;
  grand_total: number;
  status: string;
}

export interface PembelianPaginationResponse {
  items: Pembelian[];
  total: number;
  page: number;
  size: number;
  pages: number;
}