export type DashboardBarangTerlaris = {
  nama: string;
  qty: number;
};

export type DashboardBarangHampirHabis = {
  nama: string;
  stok: number;
};

export type DashboardResponse = {
  penjualan_hari_ini: number;
  pembelian_hari_ini: number;
  laba_kotor: number;
  jumlah_transaksi: number;
  jumlah_barang: number;
  stok_hampir_habis: number;
  jumlah_supplier: number;
  jumlah_pelanggan: number;
  barang_terlaris: DashboardBarangTerlaris[];
  barang_hampir_habis: DashboardBarangHampirHabis[];
};