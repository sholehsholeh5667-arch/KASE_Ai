import api from "../api/axios";

import type {
  ReturPenjualan,
  ReturPenjualanCreate,
  ReturPenjualanPaginationResponse,
} from "../types/returPenjualan";

export const returPenjualanService = {

  // =====================================
  // Ambil Semua Data
  // =====================================

  async getAll(
    page: number = 1,
    size: number = 10,
    search: string = ""
  ): Promise<ReturPenjualanPaginationResponse> {

    const { data } = await api.get<ReturPenjualanPaginationResponse>(
      "/retur-penjualan",
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
  ): Promise<ReturPenjualan> {

    const { data } = await api.get<ReturPenjualan>(
      `/retur-penjualan/${id}`
    );

    return data;
  },

  // =====================================
  // Simpan Retur Penjualan
  // =====================================

  async create(
    payload: ReturPenjualanCreate
  ): Promise<ReturPenjualan> {

    const { data } = await api.post<ReturPenjualan>(
      "/retur-penjualan",
      payload
    );

    return data;
  },

  // =====================================
  // Update
  // =====================================

  async update(
    id: number,
    payload: Partial<ReturPenjualanCreate>
  ): Promise<ReturPenjualan> {

    const { data } = await api.put<ReturPenjualan>(
      `/retur-penjualan/${id}`,
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
      `/retur-penjualan/${id}`
    );

  },

};