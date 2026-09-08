// ==========================================================
// TYPE AI MUAMALAH
// ==========================================================

/**
 * Status materi Muamalah.
 */
export type StatusMateriMuamalah = "AKTIF" | "NONAKTIF";

/**
 * Data utama materi Muamalah.
 *
 * Materi ini dikelola oleh Admin.
 * User/Kasir hanya dapat membaca dan menggunakan materi.
 */
export interface Muamalah {
  id: number;

  kategori: string;

  judul: string;

  pertanyaan?: string | null;

  isi_materi: string;

  referensi_kitab?: string | null;

  juz?: string | null;

  halaman?: string | null;

  sumber?: string | null;

  aktif: boolean;

  created_at: string;

  updated_at: string;
}


// ==========================================================
// CREATE MATERI
// ==========================================================

/**
 * Payload untuk menambahkan materi baru.
 *
 * Hanya Admin yang boleh menggunakan endpoint ini.
 */
export interface MuamalahCreate {
  kategori: string;

  judul: string;

  pertanyaan?: string | null;

  isi_materi: string;

  referensi_kitab?: string | null;

  juz?: string | null;

  halaman?: string | null;

  sumber?: string | null;

  aktif?: boolean;
}


// ==========================================================
// UPDATE MATERI
// ==========================================================

/**
 * Payload untuk mengubah materi.
 *
 * Hanya Admin yang boleh melakukan update.
 */
export interface MuamalahUpdate {
  kategori?: string;

  judul?: string;

  pertanyaan?: string | null;

  isi_materi?: string;

  referensi_kitab?: string | null;

  juz?: string | null;

  halaman?: string | null;

  sumber?: string | null;

  aktif?: boolean;
}


// ==========================================================
// RESPONSE DELETE
// ==========================================================

export interface MuamalahDeleteResponse {
  message: string;

  id: number;
}


// ==========================================================
// RESPONSE SEARCH
// ==========================================================

/**
 * Hasil pencarian materi Muamalah.
 */
export interface MuamalahSearchResult {
  id: number;

  kategori: string;

  judul: string;

  pertanyaan?: string | null;

  isi_materi: string;

  referensi_kitab?: string | null;

  juz?: string | null;

  halaman?: string | null;

  sumber?: string | null;

  aktif: boolean;

  created_at: string;

  updated_at: string;
}


// ==========================================================
// RESPONSE AI SEARCH
// ==========================================================

/**
 * Materi yang dikirim sebagai sumber
 * untuk membantu AI menjawab pertanyaan pengguna.
 */
export interface MuamalahAISource {
  id: number;

  kategori: string;

  judul: string;

  pertanyaan?: string | null;

  isi_materi: string;

  referensi_kitab?: string | null;

  juz?: string | null;

  halaman?: string | null;

  sumber?: string | null;

  aktif: boolean;
}


// ==========================================================
// PARAMETER SEARCH
// ==========================================================

export interface MuamalahSearchParams {
  q: string;

  limit?: number;
}


// ==========================================================
// RESPONSE LIST
// ==========================================================

export interface MuamalahListResponse {
  items: Muamalah[];

  total: number;

  page?: number;

  size?: number;

  pages?: number;
}


// ==========================================================
// RESPONSE AI
// ==========================================================

export interface MuamalahAIResponse {
  results: MuamalahAISource[];
}


// ==========================================================
// FORM STATE
// ==========================================================

/**
 * State form untuk halaman Admin.
 */
export interface MuamalahFormState {
  kategori: string;

  judul: string;

  pertanyaan: string;

  isi_materi: string;

  referensi_kitab: string;

  juz: string;

  halaman: string;

  sumber: string;

  aktif: boolean;
}


// ==========================================================
// DEFAULT FORM
// ==========================================================

export const defaultMuamalahForm: MuamalahFormState = {
  kategori: "",

  judul: "",

  pertanyaan: "",

  isi_materi: "",

  referensi_kitab: "",

  juz: "",

  halaman: "",

  sumber: "",

  aktif: true,
};