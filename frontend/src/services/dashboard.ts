import api from "../api/axios";

/* ===========================================
   BARANG TERLARIS
=========================================== */

export interface DashboardBarangTerlaris {
  nama: string;
  qty: number;
}

/* ===========================================
   BARANG HAMPIR HABIS
=========================================== */

export interface DashboardBarangHampirHabis {
  nama: string;
  stok: number;
}

/* ===========================================
   DASHBOARD RESPONSE
=========================================== */

export interface DashboardResponse {
  /* KEUANGAN */
  penjualan_hari_ini: number;
  pembelian_hari_ini: number;
  laba_kotor: number;

  /* STATISTIK */
  jumlah_transaksi: number;
  jumlah_barang: number;
  jumlah_supplier: number;
  jumlah_pelanggan: number;

  /* STOK */
  stok_hampir_habis: number;

  /* PRODUK TERLARIS */
  barang_terlaris: DashboardBarangTerlaris[];

  /* BARANG HAMPIR HABIS */
  barang_hampir_habis: DashboardBarangHampirHabis[];
}

/* ===========================================
   GET DASHBOARD
=========================================== */

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>(
    "/dashboard/"
  );

  return response.data;
}