import api from "../api/axios";

import type {
  StockOpname,
  StockOpnameCreate,
} from "../types/stockOpname";

export const stockOpnameService = {

  // =====================================
  // Ambil Semua Data
  // =====================================

  async getAll(): Promise<StockOpname[]> {

    const { data } =
      await api.get<StockOpname[]>(
        "/stok/opname"
      );

    return data;
  },

  // =====================================
  // Ambil Berdasarkan ID
  // =====================================

  async getById(
    id: number
  ): Promise<StockOpname> {

    const { data } =
      await api.get<StockOpname>(
        `/stok/opname/${id}`
      );

    return data;
  },

  // =====================================
  // Simpan Stock Opname
  // =====================================

  async create(
    payload: StockOpnameCreate
  ): Promise<StockOpname> {

    const { data } =
      await api.post<StockOpname>(
        "/stok/opname",
        payload
      );

    return data;
  },

  // =====================================
  // APPROVE
  // =====================================

  async approve(
    id: number
  ): Promise<StockOpname> {

    const { data } =
      await api.post<StockOpname>(
        `/stok/opname/${id}/approve`
      );

    return data;
  },

};