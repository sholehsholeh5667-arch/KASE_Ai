import { useCallback, useEffect, useState } from "react";

import {
  getDashboard,
} from "../services/dashboard";

import type {
  DashboardResponse,
} from "../services/dashboard";


/* ===========================================
   HOOK DASHBOARD
=========================================== */

export function useDashboard() {

  /* =========================================
     DATA
  ========================================= */

  const [data, setData] =
    useState<DashboardResponse | null>(null);


  /* =========================================
     LOADING
  ========================================= */

  const [loading, setLoading] =
    useState<boolean>(true);


  /* =========================================
     ERROR
  ========================================= */

  const [error, setError] =
    useState<string>("");


  /* =========================================
     LOAD DASHBOARD
  ========================================= */

  const loadDashboard = useCallback(
    async () => {

      try {

        setLoading(true);

        setError("");

        const result =
          await getDashboard();

        setData(result);

      } catch (err: any) {

        console.error(
          "Gagal mengambil data dashboard:",
          err
        );

        const message =
          err?.response?.data?.detail ??
          err?.response?.data?.message ??
          err?.message ??
          "Gagal mengambil data dashboard.";

        setError(message);

      } finally {

        setLoading(false);

      }

    },
    []
  );


  /* =========================================
     LOAD SAAT HALAMAN DIBUKA
  ========================================= */

  useEffect(() => {

    loadDashboard();

  }, [loadDashboard]);


  /* =========================================
     RETURN
  ========================================= */

  return {

    data,

    loading,

    error,

    reload: loadDashboard,

  };
}