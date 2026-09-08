import api from "../api/axios";

import type {
  Muamalah,
  MuamalahCreate,
  MuamalahUpdate,
  MuamalahDeleteResponse,
  MuamalahSearchResult,
  MuamalahAISource,
  MuamalahSearchParams,
} from "../types/muamalah";


// ==========================================================
// SERVICE AI MUAMALAH
// ==========================================================

export const muamalahService = {

  // ========================================================
  // GET SEMUA MATERI
  // ========================================================

  async getAll(): Promise<Muamalah[]> {

    const { data } = await api.get<Muamalah[]>(
      "/muamalah/"
    );

    return data;
  },


  // ========================================================
  // GET MATERI BERDASARKAN ID
  // ========================================================

  async getById(
    materiId: number
  ): Promise<Muamalah> {

    const { data } = await api.get<Muamalah>(
      `/muamalah/${materiId}`
    );

    return data;
  },


  // ========================================================
  // SEARCH MATERI
  // ========================================================

  async search(
    params: MuamalahSearchParams
  ): Promise<MuamalahSearchResult[]> {

    const { data } =
      await api.get<MuamalahSearchResult[]>(
        "/muamalah/search/",
        {
          params: {
            q: params.q,
          },
        }
      );

    return data;
  },


  // ========================================================
  // SEARCH MATERI UNTUK AI
  // ========================================================

  async searchForAI(
    q: string,
    limit: number = 5
  ): Promise<MuamalahAISource[]> {

    const { data } =
      await api.get<MuamalahAISource[]>(
        "/muamalah/ai/search/",
        {
          params: {
            q,
            limit,
          },
        }
      );

    return data;
  },


  // ========================================================
  // CREATE MATERI
  // ========================================================
  //
  // KHUSUS ADMIN
  //
  // User/Kasir akan mendapatkan 403 dari backend.
  // ========================================================

  async create(
    payload: MuamalahCreate
  ): Promise<Muamalah> {

    const { data } =
      await api.post<Muamalah>(
        "/muamalah/",
        payload
      );

    return data;
  },


  // ========================================================
  // UPDATE MATERI
  // ========================================================
  //
  // KHUSUS ADMIN
  // ========================================================

  async update(
    materiId: number,
    payload: MuamalahUpdate
  ): Promise<Muamalah> {

    const { data } =
      await api.put<Muamalah>(
        `/muamalah/${materiId}`,
        payload
      );

    return data;
  },


  // ========================================================
  // DELETE MATERI
  // ========================================================
  //
  // KHUSUS ADMIN
  // ========================================================

  async remove(
    materiId: number
  ): Promise<MuamalahDeleteResponse> {

    const { data } =
      await api.delete<MuamalahDeleteResponse>(
        `/muamalah/${materiId}`
      );

    return data;
  },


  // ========================================================
  // AKTIFKAN MATERI
  // ========================================================
  //
  // KHUSUS ADMIN
  // ========================================================

  async activate(
    materiId: number
  ): Promise<Muamalah> {

    const { data } =
      await api.post<Muamalah>(
        `/muamalah/${materiId}/activate`
      );

    return data;
  },


  // ========================================================
  // NONAKTIFKAN MATERI
  // ========================================================
  //
  // KHUSUS ADMIN
  // ========================================================

  async deactivate(
    materiId: number
  ): Promise<Muamalah> {

    const { data } =
      await api.post<Muamalah>(
        `/muamalah/${materiId}/deactivate`
      );

    return data;
  },

};