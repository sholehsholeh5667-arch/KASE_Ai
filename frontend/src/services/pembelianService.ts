import api from "../api/axios";

import type {
  Pembelian,
  PembelianPaginationResponse,
  PembelianCreate,
} from "../types/pembelian";


// ==========================================================
// RESPONSE ASLI BACKEND
// ==========================================================

interface PembelianApiResponse {
  data: Pembelian[];
  total: number;
}


// ==========================================================
// SERVICE PEMBELIAN
// ==========================================================

export const pembelianService = {

  // ========================================================
  // GET ALL PEMBELIAN
  // ========================================================

  async getAll(
    page: number = 1,
    size: number = 10,
    search: string = ""
  ): Promise<PembelianPaginationResponse> {

    const response =
      await api.get<PembelianApiResponse>(
        "/pembelian",
        {
          params: {
            page,
            size,
            search,
          },
        }
      );

    const data =
      response.data;

    const items =
      Array.isArray(data.data)
        ? data.data
        : [];

    const total =
      Number(data.total ?? 0);

    const pages =
      Math.max(
        1,
        Math.ceil(
          total / size
        )
      );

    return {
      items,
      total,
      page,
      size,
      pages,
    };
  },


  // ========================================================
  // GET PEMBELIAN BY ID
  // ========================================================

  async getById(
    id: number
  ): Promise<Pembelian> {

    const { data } =
      await api.get<Pembelian>(
        `/pembelian/${id}`
      );

    return data;
  },


  // ========================================================
  // CREATE PEMBELIAN
  // ========================================================

  async create(
    payload: PembelianCreate
  ): Promise<Pembelian> {

    const { data } =
      await api.post<Pembelian>(
        "/pembelian",
        payload
      );

    return data;
  },


  // ========================================================
  // UPDATE PEMBELIAN
  // ========================================================

  async update(
    id: number,
    payload: Partial<PembelianCreate>
  ): Promise<Pembelian> {

    const { data } =
      await api.put<Pembelian>(
        `/pembelian/${id}`,
        payload
      );

    return data;
  },


  // ========================================================
  // DELETE PEMBELIAN
  // ========================================================

  async remove(
    id: number
  ): Promise<void> {

    await api.delete(
      `/pembelian/${id}`
    );
  },

};