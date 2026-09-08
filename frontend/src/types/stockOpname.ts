// ======================================================
// DETAIL STOCK OPNAME
// ======================================================

export interface StockOpnameDetailCreate {
  barang_id: number;
  stok_sistem: number;
  stok_fisik: number;
  selisih: number;
  keterangan?: string;
}

// ======================================================
// CREATE
// ======================================================

export interface StockOpnameCreate {
  nomor: string;
  keterangan?: string;
  created_by: number;
  detail: StockOpnameDetailCreate[];
}

// ======================================================
// DATA STOCK OPNAME
// ======================================================

export interface StockOpname {
  id: number;
  nomor: string;
  tanggal: string;
  status: "DRAFT" | "PROSES" | "SELESAI" | "DIBATALKAN";
  keterangan?: string;
  created_by: number;
  approved_by?: number | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
  detail: StockOpnameDetailCreate[];
}

// ======================================================
// PAGINATION
// ======================================================

export interface StockOpnamePaginationResponse {
  items: StockOpname[];
  total: number;
  page: number;
  size: number;
  pages: number;
}