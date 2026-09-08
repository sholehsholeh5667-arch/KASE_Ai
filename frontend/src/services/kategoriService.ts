import api from "./api";
import type { Kategori } from "../types/kategori";

export interface KategoriPagination {
  items: Kategori[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

class KategoriService {
  // =====================================
  // Ambil semua kategori
  // =====================================
  async getAll(
    page: number = 1,
    size: number = 10,
    search: string = ""
  ): Promise<KategoriPagination> {
    const response = await api.get("/kategori", {
      params: {
        page,
        size,
        search,
      },
    });

    return response.data;
  }

  // =====================================
  // Ambil kategori berdasarkan ID
  // =====================================
  async getById(id: number): Promise<Kategori> {
    const response = await api.get(`/kategori/${id}`);
    return response.data;
  }

  // =====================================
  // Tambah kategori
  // =====================================
  async create(
    data: Partial<Kategori>
  ): Promise<Kategori> {
    const response = await api.post(
      "/kategori",
      data
    );

    return response.data;
  }

  // =====================================
  // Update kategori
  // =====================================
  async update(
    id: number,
    data: Partial<Kategori>
  ): Promise<Kategori> {
    const response = await api.put(
      `/kategori/${id}`,
      data
    );

    return response.data;
  }

  // =====================================
  // Hapus kategori
  // =====================================
  async remove(id: number): Promise<void> {
    await api.delete(`/kategori/${id}`);
  }
}

export const kategoriService =
  new KategoriService();

export default kategoriService;