import api from "../api/axios";

import type {
  ReturPembelian,
  ReturPembelianCreate,
  ReturPembelianPaginationResponse,
} from "../types/returPembelian";

/* =========================================================
   RETUR PEMBELIAN SERVICE
========================================================= */

export const returPembelianService = {

  /* =======================================================
     GET ALL
     Mengambil daftar retur pembelian
  ======================================================= */

  async getAll(
  page: number = 1,
  size: number = 10,
  search: string = ""
): Promise<ReturPembelianPaginationResponse> {

  const response =
    await api.get<ReturPembelian[]>(
      "/retur-pembelian",
      {
        params: {
          page,
          size,
          search,
        },
      }
    );

  const data = response.data;

  return {
    items: Array.isArray(data) ? data : [],
    total: Array.isArray(data) ? data.length : 0,
    page,
    size,
    pages: Math.ceil(
      (Array.isArray(data) ? data.length : 0) / size
    ),
  };
},
  /* =======================================================
     GET BY ID
     Mengambil detail retur pembelian
  ======================================================= */

  async getById(
    id: number
  ): Promise<ReturPembelian> {

    const response =
      await api.get<ReturPembelian>(
        `/retur-pembelian/${id}`
      );

    return response.data;
  },

  /* =======================================================
     CREATE
     Membuat retur pembelian baru
  ======================================================= */

  async create(
    payload: ReturPembelianCreate
  ): Promise<ReturPembelian> {

    const response =
      await api.post<ReturPembelian>(
        "/retur-pembelian",
        payload
      );

    return response.data;
  },

  /* =======================================================
     UPDATE
     Mengubah retur pembelian
  ======================================================= */

  async update(
    id: number,
    payload: Partial<ReturPembelianCreate>
  ): Promise<ReturPembelian> {

    const response =
      await api.put<ReturPembelian>(
        `/retur-pembelian/${id}`,
        payload
      );

    return response.data;
  },
    /* =======================================================
     APPROVE
     Menyetujui retur pembelian
  ======================================================= */

  async approve(
    id: number
  ): Promise<ReturPembelian> {

    const response =
      await api.post<ReturPembelian>(
        `/retur-pembelian/${id}/approve`
      );

    return response.data;
  },

  /* =======================================================
     REJECT
     Menolak retur pembelian
  ======================================================= */

  async reject(
    id: number,
    alasan: string
  ): Promise<ReturPembelian> {

    const response =
      await api.post<ReturPembelian>(
        `/retur-pembelian/${id}/reject`,
        { alasan }
      );

    return response.data;
  },

  /* =======================================================
     DELETE
     Menghapus retur pembelian
  ======================================================= */

  async remove(
    id: number
  ): Promise<void> {

    await api.delete(
      `/retur-pembelian/${id}`
    );
  },
};