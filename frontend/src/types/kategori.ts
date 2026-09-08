export interface Kategori {
  id: number;

  nama: string;

  deskripsi?: string | null;

  aktif: boolean;

  created_at?: string;

  updated_at?: string;
}

export interface KategoriCreate {
  nama: string;

  deskripsi?: string;

  aktif: boolean;
}

export interface KategoriUpdate {
  nama?: string;

  deskripsi?: string;

  aktif?: boolean;
}

export interface KategoriPaginationResponse {
  items: Kategori[];

  total: number;

  page: number;

  size: number;

  pages: number;
}