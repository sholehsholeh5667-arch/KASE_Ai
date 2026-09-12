import api from "../api/axios";

import type {
  Barang,
  BarangPaginationResponse,
} from "../types/barang";

export const barangService = {

  // =====================================
  // AMBIL SEMUA BARANG
  // =====================================

  async getAll(
    page: number = 1,
    size: number = 10,
    search: string = "",
  ): Promise<BarangPaginationResponse> {

    const { data } =
      await api.get<BarangPaginationResponse>(
        "/barang/",
        {
          params: {
            page,
            size,
            search,
          },
        },
      );

    return data;
  },


  // =====================================
  // AMBIL BARANG BERDASARKAN ID
  // =====================================

  async getById(
    id: number,
  ): Promise<Barang> {

    const { data } =
      await api.get<Barang>(
        `/barang/${id}`,
      );

    return data;
  },


  // =====================================
  // TAMBAH BARANG
  // =====================================

  async create(
    payload: Partial<Barang>,
  ): Promise<Barang> {

    const { data } =
      await api.post<Barang>(
        "/barang/",
        payload,
      );

    return data;
  },


  // =====================================
  // UPDATE BARANG
  // =====================================

  async update(
    id: number,
    payload: Partial<Barang>,
  ): Promise<Barang> {

    const { data } =
      await api.put<Barang>(
        `/barang/${id}`,
        payload,
      );

    return data;
  },

    // =====================================
  // UPLOAD FOTO BARANG
  // =====================================

  async uploadFoto(
  id: number,
  file: File,
): Promise<Barang> {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/barang/${id}/foto`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
},
  // =====================================
  // HAPUS BARANG
  // =====================================

  async remove(
    id: number,
  ): Promise<void> {

    await api.delete(
      `/barang/${id}`,
    );
  },


  // =====================================
  // CARI BARANG
  // =====================================

  async search(
    keyword: string,
  ): Promise<Barang[]> {

    const { data } =
      await api.get<BarangPaginationResponse>(
        "/barang/",
        {
          params: {
            page: 1,
            size: 100,
            search: keyword,
          },
        },
      );

    return data.items;
  },
};