// ============================================
// LAPORAN SERVICE
// KASE AI
// ============================================

export interface LaporanSummary {
  total_penjualan: number;
  total_pembelian: number;
  laba: number;
  jumlah_transaksi: number;

  [key: string]: unknown;
}

export interface LaporanPenjualan {
  id?: number;
  no_transaksi?: string;
  tanggal?: string;
  pelanggan?: string;
  total?: number;
  status?: string;

  [key: string]: unknown;
}

export interface LaporanPembelian {
  id?: number;
  no_transaksi?: string;
  no_faktur?: string;
  tanggal?: string;
  supplier?: string;
  total?: number;
  status?: string;

  [key: string]: unknown;
}


// ============================================
// KONFIGURASI API
// ============================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL;

const API_PREFIX =
  `${API_BASE_URL}/api/v1`;

const LAPORAN_URL =
  `${API_PREFIX}/laporan`;


// ============================================
// REQUEST HELPER
// ============================================

async function request<T>(
  url: string
): Promise<T> {

  const token =
    localStorage.getItem(
      "access_token"
    );

  const response = await fetch(
    url,
    {
      method: "GET",

      headers: {
        Accept:
          "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
      },
    }
  );


  const contentType =
    response.headers.get(
      "content-type"
    ) || "";


  if (!response.ok) {

    const text =
      await response.text();

    throw new Error(
      `API Laporan gagal ` +
      `(${response.status}): ` +
      `${text.slice(0, 300)}`
    );
  }


  if (
    !contentType.includes(
      "application/json"
    )
  ) {

    const text =
      await response.text();

    throw new Error(
      "API Laporan tidak " +
      "mengembalikan JSON. " +
      `Response: ${text.slice(0, 300)}`
    );
  }


  return response.json();
}


// ============================================
// SUMMARY
// GET /api/v1/laporan/summary
// ============================================

export async function getSummary() {

  return request<LaporanSummary>(
    `${LAPORAN_URL}/summary`
  );
}


// ============================================
// PENJUALAN
// GET /api/v1/laporan/penjualan
// ============================================

export async function getPenjualan() {

  return request<LaporanPenjualan[]>(
    `${LAPORAN_URL}/penjualan`
  );
}


// ============================================
// PEMBELIAN
// GET /api/v1/laporan/pembelian
// ============================================

export async function getPembelian() {

  return request<LaporanPembelian[]>(
    `${LAPORAN_URL}/pembelian`
  );
}


// ============================================
// FILTER PENJUALAN
//
// GET /api/v1/laporan/penjualan/filter
// ============================================

export interface FilterPenjualanParams {
  tanggal_awal?: string;
  tanggal_akhir?: string;
  kategori_id?: number;
  supplier_id?: number;
  pelanggan_id?: number;
  barang_id?: number;
  kasir_id?: number;
  metode_bayar?: string;
  status?: string;
  keyword?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}


export async function filterPenjualan(
  params: FilterPenjualanParams = {}
) {

  const query =
    new URLSearchParams();


  if (params.tanggal_awal) {
    query.set(
      "tanggal_awal",
      params.tanggal_awal
    );
  }


  if (params.tanggal_akhir) {
    query.set(
      "tanggal_akhir",
      params.tanggal_akhir
    );
  }


  if (
    params.kategori_id !== undefined
  ) {
    query.set(
      "kategori_id",
      String(params.kategori_id)
    );
  }


  if (
    params.supplier_id !== undefined
  ) {
    query.set(
      "supplier_id",
      String(params.supplier_id)
    );
  }


  if (
    params.pelanggan_id !== undefined
  ) {
    query.set(
      "pelanggan_id",
      String(params.pelanggan_id)
    );
  }


  if (
    params.barang_id !== undefined
  ) {
    query.set(
      "barang_id",
      String(params.barang_id)
    );
  }


  if (
    params.kasir_id !== undefined
  ) {
    query.set(
      "kasir_id",
      String(params.kasir_id)
    );
  }


  if (params.metode_bayar) {
    query.set(
      "metode_bayar",
      params.metode_bayar
    );
  }


  if (params.status) {
    query.set(
      "status",
      params.status
    );
  }


  if (params.keyword) {
    query.set(
      "keyword",
      params.keyword
    );
  }


  query.set(
    "sort_by",
    params.sort_by ||
      "created_at"
  );


  query.set(
    "sort_order",
    params.sort_order ||
      "DESC"
  );


  query.set(
    "page",
    String(params.page || 1)
  );


  query.set(
    "limit",
    String(params.limit || 20)
  );


  const queryString =
    query.toString();


  const url =
    `${LAPORAN_URL}` +
    `/penjualan/filter` +
    `?${queryString}`;


  return request(
    url
  );
}


// ============================================
// RETUR PENJUALAN
// ============================================

export async function getReturPenjualan() {

  return request(
    `${LAPORAN_URL}/retur-penjualan`
  );
}


// ============================================
// RETUR PEMBELIAN
// ============================================

export async function getReturPembelian() {

  return request(
    `${LAPORAN_URL}/retur-pembelian`
  );
}


// ============================================
// STOK
// ============================================

export async function getStok() {

  return request(
    `${LAPORAN_URL}/stok`
  );
}


// ============================================
// MUTASI STOK
// ============================================

export async function getMutasiStok() {

  return request(
    `${LAPORAN_URL}/mutasi-stok`
  );
}


// ============================================
// PRODUK TERLARIS
// ============================================

export async function getProdukTerlaris(
  limit = 10
) {

  return request(
    `${LAPORAN_URL}` +
    `/produk-terlaris?limit=${limit}`
  );
}


// ============================================
// PELANGGAN
// ============================================

export async function getPelanggan() {

  return request(
    `${LAPORAN_URL}/pelanggan`
  );
}


// ============================================
// SUPPLIER
// ============================================

export async function getSupplier() {

  return request(
    `${LAPORAN_URL}/supplier`
  );
}


// ============================================
// LABA RUGI
// ============================================

export async function getLabaRugi() {

  return request(
    `${LAPORAN_URL}/laba-rugi`
  );
}


// ============================================
// NILAI PERSEDIAAN
// ============================================

export async function getNilaiPersediaan() {

  return request(
    `${LAPORAN_URL}/nilai-persediaan`
  );
}


// ============================================
// EXPORT PDF PENJUALAN
// ============================================

export function getPenjualanPdfUrl() {

  return (
    `${LAPORAN_URL}` +
    `/penjualan/pdf`
  );
}


// ============================================
// EXPORT EXCEL PENJUALAN
// ============================================

export function getPenjualanExcelUrl() {

  return (
    `${LAPORAN_URL}` +
    `/penjualan/excel`
  );
}


// ============================================
// SERVICE OBJECT
// ============================================

export const laporanService = {

  getSummary,

  getPenjualan,

  getPembelian,

  filterPenjualan,

  getReturPenjualan,

  getReturPembelian,

  getStok,

  getMutasiStok,

  getProdukTerlaris,

  getPelanggan,

  getSupplier,

  getLabaRugi,

  getNilaiPersediaan,

  getPenjualanPdfUrl,

  getPenjualanExcelUrl,
};


export default laporanService;