// ======================================
// Detail Mutasi Stok
// ======================================

export interface MutasiStok {

  id: number;

  barang_id: number;

  tanggal: string;

  jenis: string;

  qty: number;

  keterangan?: string;

  created_by?: number;

}

// ======================================
// Create
// ======================================

export interface MutasiStokCreate {

  barang_id: number;

  jenis: string;

  qty: number;

  keterangan?: string;

  created_by?: number;

}

// ======================================
// Update
// ======================================

export interface MutasiStokUpdate {

  jenis?: string;

  qty?: number;

  keterangan?: string;

}

// ======================================
// Pagination
// ======================================

export interface MutasiStokPaginationResponse {

  items: MutasiStok[];

  total: number;

  page: number;

  size: number;

  pages: number;

}