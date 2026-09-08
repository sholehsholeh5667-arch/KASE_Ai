import api from "../api/axios";

import type {
  KitabAskRequest,
  KitabAskResponse,
  KitabTranslationResponse,
  KitabExplanationResponse,
} from "../types/kitab";


// ==========================================================
// SERVICE AI KITAB KUNING
// ==========================================================
//
// Endpoint resmi:
//
// POST /api/v1/ai/process
//
// Semua request Kitab dikirim melalui AIManager
// -> AIRouter
// -> KitabHandler
// -> KitabService
//
// Backend Kitab mendukung:
// - cari_ibarat
// - terjemah
// - jelaskan
// ==========================================================

const AI_ENDPOINT =
  "/ai/process";


// ==========================================================
// SERVICE
// ==========================================================

export const kitabService = {

  // ========================================================
  // TANYA / CARI IBARAT
  // ========================================================

  async ask(
    payload: KitabAskRequest
  ): Promise<KitabAskResponse> {

    const response =
      await api.post<KitabAskResponse>(
        AI_ENDPOINT,
        {
          module: "kitab",

          action:
            payload.action ??
            "cari_ibarat",

          message:
            payload.message,

          kitab:
            payload.kitab,

          bab:
            payload.bab,

          limit:
            payload.limit ?? 5,
        }
      );

    return response.data;
  },


  // ========================================================
  // SEARCH / CARI IBARAT
  // ========================================================
  //
  // Pencarian database menggunakan
  // endpoint AI resmi dengan action cari_ibarat.
  // ========================================================

  async search(
    query: string,
    limit: number = 5
  ): Promise<KitabAskResponse> {

    const keyword =
      query.trim();

    if (!keyword) {

      return {
        status: "error",

        success: false,

        provider: "kitab",

        module: "kitab",

        message:
          "Kata kunci kosong.",

        data: {},
      };

    }

    return await this.ask({
      message: keyword,

      action:
        "cari_ibarat",

      limit,
    });
  },


  // ========================================================
  // TERJEMAH AI
  // ========================================================

  async translate(
    arab: string,
    kitab?: string,
    bab?: string
  ): Promise<KitabTranslationResponse> {

    const text =
      arab.trim();

    if (!text) {

      throw new Error(
        "Teks Arab kosong."
      );

    }


    const response =
      await api.post<KitabAskResponse>(
        AI_ENDPOINT,
        {
          module: "kitab",

          action:
            "terjemah",

          message:
            text,

          kitab:
            kitab,

          bab:
            bab,
        }
      );


    // ======================================================
    // RESPONSE BACKEND
    // ======================================================

    const result =
      response.data;

    const data =
      result.data &&
      typeof result.data === "object"
        ? (
            result.data as Record<
              string,
              unknown
            >
          )
        : {};


    return {

      arab:
        typeof data.teks === "string"
          ? data.teks
          : text,

      terjemah:
        result.message ??
        "",

      source:
        result.provider ??
        "kitab",

      kitab,

      bab,
    };
  },


  // ========================================================
  // JELASKAN AI
  // ========================================================
  //
  // Mengirim teks Arab ke backend:
  //
  // module = kitab
  // action = jelaskan
  //
  // Backend:
  // AIManager
  // -> AIRouter
  // -> KitabHandler
  // -> KitabService.jelaskan()
  // -> AI Provider
  // ========================================================

  async explain(
    arab: string,
    kitab?: string,
    bab?: string
  ): Promise<KitabExplanationResponse> {

    const text =
      arab.trim();

    if (!text) {

      throw new Error(
        "Teks Arab kosong."
      );

    }


    const response =
      await api.post<KitabAskResponse>(
        AI_ENDPOINT,
        {
          module: "kitab",

          action:
            "jelaskan",

          message:
            text,

          kitab:
            kitab,

          bab:
            bab,
        }
      );


    // ======================================================
    // RESPONSE BACKEND
    // ======================================================

    const result =
      response.data;


    const data =
      result.data &&
      typeof result.data === "object"
        ? (
            result.data as Record<
              string,
              unknown
            >
          )
        : {};


    // ======================================================
    // HASIL PENJELASAN
    // ======================================================
    //
    // KitabService backend mengembalikan:
    //
    // result.message = hasil AI
    //
    // data.teks = teks Arab asli
    // ======================================================

    return {

      arab:
        typeof data.teks === "string"
          ? data.teks
          : text,

      penjelasan:
        result.message ??
        "",

      source:
        result.provider ??
        "kitab",

      kitab,

      bab,
    };
  },


  // ========================================================
  // SEARCH UNTUK AI
  // ========================================================
  //
  // Tidak menggunakan GET /kitab/search/.
  // Menggunakan endpoint AI yang sama.
  // ========================================================

  async searchForAI(
    query: string,
    limit: number = 5
  ): Promise<KitabAskResponse> {

    return await this.search(
      query,
      limit
    );
  },

};