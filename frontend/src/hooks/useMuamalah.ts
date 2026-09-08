import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { muamalahService } from "../services/muamalahService";

import type {
  Muamalah,
  MuamalahCreate,
  MuamalahUpdate,
  MuamalahSearchResult,
  MuamalahAISource,
} from "../types/muamalah";


// ==========================================================
// HOOK AI MUAMALAH
// ==========================================================

export function useMuamalah() {

  const [data, setData] =
    useState<Muamalah[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [searchResults, setSearchResults] =
    useState<MuamalahSearchResult[]>([]);

  const [aiResults, setAiResults] =
    useState<MuamalahAISource[]>([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [aiLoading, setAiLoading] =
    useState(false);


  // ========================================================
  // LOAD SEMUA MATERI
  // ========================================================

  const loadData = useCallback(
    async (): Promise<void> => {

      try {

        setLoading(true);
        setError(null);

        const result =
          await muamalahService.getAll();

        setData(result);

      } catch (err) {

        console.error(
          "Gagal mengambil materi Muamalah:",
          err
        );

        setError(
          "Gagal mengambil materi Muamalah."
        );

      } finally {

        setLoading(false);

      }

    },
    []
  );


  // ========================================================
  // GET BY ID
  // ========================================================

  const getById = useCallback(
    async (
      materiId: number
    ): Promise<Muamalah> => {

      return await muamalahService.getById(
        materiId
      );

    },
    []
  );


  // ========================================================
  // SEARCH MATERI
  // ========================================================

  const search = useCallback(
    async (
      query: string
    ): Promise<MuamalahSearchResult[]> => {

      const keyword = query.trim();

      if (!keyword) {

        setSearchResults([]);

        return [];

      }

      try {

        setSearchLoading(true);
        setError(null);

        const result =
          await muamalahService.search({
            q: keyword,
          });

        setSearchResults(result);

        return result;

      } catch (err: any) {

        console.error(
          "Gagal mencari materi Muamalah:",
          err
        );

        console.error(
          "Response:",
          err?.response?.data
        );

        setSearchResults([]);

        setError(
          err?.response?.data?.detail ??
          "Gagal mencari materi Muamalah."
        );

        return [];

      } finally {

        setSearchLoading(false);

      }

    },
    []
  );


  // ========================================================
  // SEARCH UNTUK AI
  // ========================================================

  const searchForAI = useCallback(
    async (
      query: string,
      limit: number = 5
    ): Promise<MuamalahAISource[]> => {

      const keyword = query.trim();

      if (!keyword) {

        console.log(
          "[AI MUAMALAH] Pertanyaan kosong."
        );

        setAiResults([]);

        return [];

      }

      try {

        setAiLoading(true);
        setError(null);

        console.log(
          "========================================"
        );

        console.log(
          "[AI MUAMALAH] Mencari materi..."
        );

        console.log(
          "[AI MUAMALAH] Pertanyaan:",
          keyword
        );

        console.log(
          "[AI MUAMALAH] Limit:",
          limit
        );


        const result =
          await muamalahService.searchForAI(
            keyword,
            limit
          );


        console.log(
          "[AI MUAMALAH] Hasil backend:",
          result
        );

        console.log(
          "[AI MUAMALAH] Jumlah materi:",
          result.length
        );


        if (result.length === 0) {

          console.warn(
            "[AI MUAMALAH] Tidak ada materi ditemukan."
          );

        } else {

          console.log(
            "[AI MUAMALAH] Materi berhasil ditemukan."
          );

        }


        setAiResults(result);

        console.log(
          "========================================"
        );

        return result;

      } catch (err: any) {

        console.error(
          "========================================"
        );

        console.error(
          "[AI MUAMALAH] Gagal mencari sumber."
        );

        console.error(
          "[AI MUAMALAH] Error:",
          err
        );

        console.error(
          "[AI MUAMALAH] Response backend:",
          err?.response?.data
        );

        console.error(
          "[AI MUAMALAH] Status:",
          err?.response?.status
        );

        console.error(
          "========================================"
        );

        setAiResults([]);

        setError(
          err?.response?.data?.detail ??
          err?.response?.data?.message ??
          err?.message ??
          "Gagal mencari sumber AI Muamalah."
        );

        return [];

      } finally {

        setAiLoading(false);

      }

    },
    []
  );


  // ========================================================
  // CREATE
  // ========================================================

  const create = useCallback(
    async (
      payload: MuamalahCreate
    ): Promise<Muamalah> => {

      const result =
        await muamalahService.create(
          payload
        );

      await loadData();

      return result;

    },
    [loadData]
  );


  // ========================================================
  // UPDATE
  // ========================================================

  const update = useCallback(
    async (
      materiId: number,
      payload: MuamalahUpdate
    ): Promise<Muamalah> => {

      const result =
        await muamalahService.update(
          materiId,
          payload
        );

      await loadData();

      return result;

    },
    [loadData]
  );


  // ========================================================
  // DELETE
  // ========================================================

  const remove = useCallback(
    async (
      materiId: number
    ): Promise<void> => {

      await muamalahService.remove(
        materiId
      );

      await loadData();

    },
    [loadData]
  );


  // ========================================================
  // ACTIVATE
  // ========================================================

  const activate = useCallback(
    async (
      materiId: number
    ): Promise<Muamalah> => {

      const result =
        await muamalahService.activate(
          materiId
        );

      await loadData();

      return result;

    },
    [loadData]
  );


  // ========================================================
  // DEACTIVATE
  // ========================================================

  const deactivate = useCallback(
    async (
      materiId: number
    ): Promise<Muamalah> => {

      const result =
        await muamalahService.deactivate(
          materiId
        );

      await loadData();

      return result;

    },
    [loadData]
  );


  // ========================================================
  // CLEAR SEARCH
  // ========================================================

  const clearSearch = useCallback(
    (): void => {

      setSearchResults([]);
      setError(null);

    },
    []
  );


  // ========================================================
  // CLEAR AI RESULTS
  // ========================================================

  const clearAIResults = useCallback(
    (): void => {

      setAiResults([]);
      setError(null);

    },
    []
  );


  // ========================================================
  // CLEAR ERROR
  // ========================================================

  const clearError = useCallback(
    (): void => {

      setError(null);

    },
    []
  );


  // ========================================================
  // LOAD AWAL
  // ========================================================

  useEffect(() => {

    loadData();

  }, [loadData]);


  // ========================================================
  // RETURN
  // ========================================================

  return {

    data,

    loading,

    error,

    searchResults,

    searchLoading,

    search,

    aiResults,

    aiLoading,

    searchForAI,

    getById,

    create,

    update,

    remove,

    activate,

    deactivate,

    loadData,

    clearSearch,

    clearAIResults,

    clearError,

  };

}