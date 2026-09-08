import {
  useCallback,
  useState,
} from "react";

import {
  kitabService,
} from "../services/kitabService";

import type {
  KitabAskResponse,
  KitabTranslationResponse,
  KitabExplanationResponse,
} from "../types/kitab";


// ==========================================================
// HOOK AI KITAB KUNING
// ==========================================================

export function useKitab() {

  // ========================================================
  // RESPONSE AI / ASK
  // ========================================================

  const [answer, setAnswer] =
    useState<KitabAskResponse | null>(
      null
    );


  // ========================================================
  // HASIL AI / REFERENSI
  // ========================================================

  const [aiResults, setAiResults] =
    useState<any[]>([]);


  // ========================================================
  // TRANSLATION
  // ========================================================

  const [translation, setTranslation] =
    useState<KitabTranslationResponse | null>(
      null
    );


  // ========================================================
  // EXPLANATION
  // ========================================================

  const [explanation, setExplanation] =
    useState<KitabExplanationResponse | null>(
      null
    );


  // ========================================================
  // LOADING
  // ========================================================

  const [aiLoading, setAiLoading] =
    useState(false);


  const [translationLoading, setTranslationLoading] =
    useState(false);


  const [explanationLoading, setExplanationLoading] =
    useState(false);


  // ========================================================
  // ERROR
  // ========================================================

  const [error, setError] =
    useState<string | null>(
      null
    );


  // ========================================================
  // ASK KITAB
  // ========================================================

  const ask =
    useCallback(
      async (
        question: string
      ): Promise<KitabAskResponse | null> => {

        const keyword =
          question.trim();


        if (!keyword) {

          setError(
            "Pertanyaan tidak boleh kosong."
          );

          return null;
        }


        try {

          setAiLoading(true);

          setError(null);

          setAnswer(null);

          setAiResults([]);


          console.log(
            "========================================"
          );

          console.log(
            "[AI KITAB] Pertanyaan:",
            keyword
          );


          // =================================================
          // REQUEST KE BACKEND
          // =================================================

          const result =
            await kitabService.ask({
              module: "kitab",

              action:
                "cari_ibarat",

              message:
                keyword,

              limit: 5,
            });


          console.log(
            "[AI KITAB] Response:",
            result
          );


          // =================================================
          // SIMPAN RESPONSE
          // =================================================

          setAnswer(
            result
          );


          // =================================================
          // AMBIL CONTEXT DATABASE
          // =================================================

          const dataObject =
            result.data &&
            typeof result.data === "object"
              ? (
                  result.data as Record<
                    string,
                    unknown
                  >
                )
              : {};


          const context =
            Array.isArray(
              dataObject.context
            )
              ? dataObject.context
              : [];


          setAiResults(
            context
          );


          console.log(
            "[AI KITAB] Jumlah referensi:",
            context.length
          );


          console.log(
            "========================================"
          );


          return result;

        } catch (err: any) {

          console.error(
            "========================================"
          );

          console.error(
            "[AI KITAB] ERROR:",
            err
          );

          console.error(
            "[AI KITAB] STATUS:",
            err?.response?.status
          );

          console.error(
            "[AI KITAB] DATA:",
            err?.response?.data
          );

          console.error(
            "========================================"
          );


          setAnswer(null);

          setAiResults([]);


          setError(
            err?.response?.data?.detail ??
            err?.response?.data?.message ??
            err?.message ??
            "Gagal memproses Kitab Kuning."
          );


          return null;

        } finally {

          setAiLoading(false);

        }

      },
      []
    );


  // ========================================================
  // TRANSLATE
  // ========================================================

  const translate =
    useCallback(
      async (
        arab: string,
        kitab?: string,
        bab?: string
      ): Promise<
        KitabTranslationResponse | null
      > => {

        const text =
          arab.trim();


        if (!text) {

          setError(
            "Teks Arab kosong."
          );

          return null;
        }


        try {

          setTranslationLoading(
            true
          );

          setError(null);


          const result =
            await kitabService.translate(
              text,
              kitab,
              bab
            );


          console.log(
            "[AI KITAB] Translation:",
            result
          );


          setTranslation(
            result
          );


          return result;

        } catch (err: any) {

          console.error(
            "[AI KITAB] Translation error:",
            err
          );


          setError(
            err?.response?.data?.detail ??
            err?.response?.data?.message ??
            err?.message ??
            "Gagal menerjemahkan teks Arab."
          );


          return null;

        } finally {

          setTranslationLoading(
            false
          );

        }

      },
      []
    );


  // ========================================================
  // EXPLAIN / JELASKAN AI
  // ========================================================

  const explain =
    useCallback(
      async (
        arab: string,
        kitab?: string,
        bab?: string
      ): Promise<
        KitabExplanationResponse | null
      > => {

        const text =
          arab.trim();


        if (!text) {

          setError(
            "Teks Arab kosong."
          );

          return null;
        }


        try {

          setExplanationLoading(
            true
          );

          setError(null);


          const result =
            await kitabService.explain(
              text,
              kitab,
              bab
            );


          console.log(
            "[AI KITAB] Explanation:",
            result
          );


          setExplanation(
            result
          );


          return result;

        } catch (err: any) {

          console.error(
            "[AI KITAB] Explanation error:",
            err
          );


          setError(
            err?.response?.data?.detail ??
            err?.response?.data?.message ??
            err?.message ??
            "Gagal menjelaskan teks kitab."
          );


          return null;

        } finally {

          setExplanationLoading(
            false
          );

        }

      },
      []
    );


  // ========================================================
  // SEARCH
  // ========================================================

  const search =
    useCallback(
      async (
        query: string
      ): Promise<KitabAskResponse | null> => {

        return await ask(
          query
        );

      },
      [ask]
    );


  // ========================================================
  // CLEAR
  // ========================================================

  const clear =
    useCallback(
      (): void => {

        setAnswer(null);

        setAiResults([]);

        setTranslation(null);

        setExplanation(null);

        setError(null);

      },
      []
    );


  // ========================================================
  // RETURN
  // ========================================================

  return {

    // ------------------------------------------------------
    // ASK
    // ------------------------------------------------------

    answer,

    aiResults,

    aiLoading,


    // ------------------------------------------------------
    // TRANSLATION
    // ------------------------------------------------------

    translation,

    translationLoading,

    translate,


    // ------------------------------------------------------
    // EXPLANATION
    // ------------------------------------------------------

    explanation,

    explanationLoading,

    explain,


    // ------------------------------------------------------
    // ERROR
    // ------------------------------------------------------

    error,


    // ------------------------------------------------------
    // ACTIONS
    // ------------------------------------------------------

    ask,

    search,

    clear,

  };

}