export interface Pelanggan {
  id: number;
  nama: string;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
}

export interface PelangganCreate {
  nama: string;
  alamat?: string | null;
  telepon?: string | null;
  email?: string | null;
}

export interface PelangganUpdate {
  nama?: string | null;
  alamat?: string | null;
  telepon?: string | null;
  email?: string | null;
}