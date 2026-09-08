export interface Supplier {
  id: number;

  nama: string;

  kode_supplier?: string | null;

  alamat?: string | null;

  telepon?: string | null;

  email?: string | null;

  kontak?: string | null;

  kota?: string | null;

  provinsi?: string | null;

  kode_pos?: string | null;

  catatan?: string | null;

  aktif: boolean;

  created_at?: string;

  updated_at?: string;
}

export interface SupplierCreate {
  nama: string;

  kode_supplier?: string;

  alamat?: string;

  telepon?: string;

  email?: string;

  kontak?: string;

  kota?: string;

  provinsi?: string;

  kode_pos?: string;

  catatan?: string;

  aktif: boolean;
}

export interface SupplierUpdate {
  nama?: string;

  kode_supplier?: string;

  alamat?: string;

  telepon?: string;

  email?: string;

  kontak?: string;

  kota?: string;

  provinsi?: string;

  kode_pos?: string;

  catatan?: string;

  aktif?: boolean;
}

export interface SupplierPaginationResponse {
  items: Supplier[];

  total: number;

  page: number;

  size: number;

  pages: number;
}