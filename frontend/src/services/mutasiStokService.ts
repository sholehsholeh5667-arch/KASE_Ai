import api from "../api/axios";

import type {
  MutasiStok,
  MutasiStokCreate,
  MutasiStokUpdate,
  MutasiStokPaginationResponse,
} from "../types/mutasiStok";

export const mutasiStokService = {

  // =====================================
  // Ambil Semua Data
  // =====================================

  async getAll(
    page: number = 1,
    size: number = 10,
    search: string = ""
  ): Promise<MutasiStokPaginationResponse> {

    const { data } =
      await api.get<MutasiStokPaginationResponse>(
        "/mutasi-stok",
        {
          params: {
            page,
            size,
            search,
          },
        }
      );

    return data;

  },

  // =====================================
  // Ambil Berdasarkan ID
  // =====================================

  async getById(
    id: number
  ): Promise<MutasiStok> {

    const { data } =
      await api.get<MutasiStok>(
        `/mutasi-stok/${id}`
      );

    return data;

  },

  // =====================================
  // Simpan
  // =====================================

  async create(
    payload: MutasiStokCreate
  ): Promise<MutasiStok> {

    const { data } =
      await api.post<MutasiStok>(
        "/mutasi-stok",
        payload
      );

    return data;

  },

  // =====================================
  // Update
  // =====================================

  async update(
    id: number,
    payload: MutasiStokUpdate
  ): Promise<MutasiStok> {

    const { data } =
      await api.put<MutasiStok>(
        `/mutasi-stok/${id}`,
        payload
      );

    return data;

  },

  // =====================================
  // Hapus
  // =====================================

  async remove(
    id: number
  ): Promise<void> {

    await api.delete(
      `/mutasi-stok/${id}`
    );

  },

};