export interface Permission {
  id: number;
  kode: string;
  nama: string;
  modul: string;
  aksi: string;
  deskripsi?: string | null;
}