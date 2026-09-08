import api from "../api/axios";

import type {
  Pelanggan,
  PelangganCreate,
  PelangganUpdate,
} from "../types/pelanggan";

/* =====================================================
   SERVICE PELANGGAN
===================================================== */

export const pelangganService = {

  /* ===================================================
     GET SEMUA PELANGGAN
  =================================================== */

  async getAll(): Promise<Pelanggan[]> {
    const response = await api.get<Pelanggan[]>(
      "/pelanggan/"
    );

    return response.data;
  },

  /* ===================================================
     GET DETAIL PELANGGAN
  =================================================== */

  async getById(
    id: number
  ): Promise<Pelanggan> {

    const response = await api.get<Pelanggan>(
      `/pelanggan/${id}`
    );

    return response.data;
  },

  /* ===================================================
     TAMBAH PELANGGAN
  =================================================== */

  async create(
    data: PelangganCreate
  ): Promise<Pelanggan> {

    const response =
      await api.post<Pelanggan>(
        "/pelanggan/",
        data
      );

    return response.data;
  },

  /* ===================================================
     UPDATE PELANGGAN
  =================================================== */

  async update(
    id: number,
    data: PelangganUpdate
  ): Promise<Pelanggan> {

    const response =
      await api.put<Pelanggan>(
        `/pelanggan/${id}`,
        data
      );

    return response.data;
  },

  /* ===================================================
     HAPUS PELANGGAN
  =================================================== */

  async remove(
    id: number
  ): Promise<void> {

    await api.delete(
      `/pelanggan/${id}`
    );
  },
};