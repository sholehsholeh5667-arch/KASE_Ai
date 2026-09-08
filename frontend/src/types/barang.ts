export interface Barang {
    id: number;

    kode_barang: string;

    nama_barang: string;

    alias_barang?: string;

    kategori_id?: number;

    supplier_default?: number;

    satuan?: string;

    harga_beli: number;

    harga_jual: number;

    stok: number;

    stok_minimum: number;

    lokasi_rak?: string;

    foto?: string;

    aktif: boolean;
}

export interface BarangPaginationResponse {

    items: Barang[];

    total: number;

    page: number;

    size: number;

    pages: number;

}