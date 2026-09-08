import { useEffect, useState } from "react";

import { returPenjualanService } from "../services/returPenjualanService";

import type {
  ReturPenjualan,
  ReturPenjualanCreate,
} from "../types/returPenjualan";


interface UseReturPenjualanOptions {
  /**
   * true  = data boleh dimuat
   * false = API GET tidak dipanggil
   */
  enabled?: boolean;
}


export function useReturPenjualan(
  options: UseReturPenjualanOptions = {}
) {

  const {
    enabled = true,
  } = options;


  // =====================================
  // STATE
  // =====================================

  const [loading, setLoading] =
    useState(false);

  const [data, setData] =
    useState<ReturPenjualan[]>([]);

  const [page, setPage] =
    useState(1);

  const [size, setSize] =
    useState(10);

  const [total, setTotal] =
    useState(0);

  const [search, setSearch] =
    useState("");


  // =====================================
  // LOAD DATA
  // =====================================

  const loadData = async () => {

    /*
     * Permission gate.
     *
     * Jika user tidak mempunyai
     * retur_penjualan.view,
     * jangan melakukan request API.
     */
    if (!enabled) {

      setData([]);

      setTotal(0);

      setLoading(false);

      return;
    }


    try {

      setLoading(true);


      /*
       * RESULT HARUS DIBUAT
       * sebelum result.items / result.total
       * digunakan.
       */
      const result =
        await returPenjualanService.getAll(
          page,
          size,
          search
        );


      /*
       * Pastikan data selalu array.
       *
       * Normal response:
       * {
       *   items: [...],
       *   total: 10
       * }
       */
      setData(
        Array.isArray(result.items)
          ? result.items
          : []
      );


      setTotal(
        typeof result.total === "number"
          ? result.total
          : 0
      );


    } catch (error) {

      console.error(
        "Gagal mengambil data Retur Penjualan:",
        error
      );


      /*
       * Jangan biarkan state menjadi
       * undefined setelah request gagal.
       */
      setData([]);

      setTotal(0);


    } finally {

      setLoading(false);

    }

  };


  // =====================================
  // CREATE
  // =====================================

  const create = async (
    payload: ReturPenjualanCreate
  ) => {

    /*
     * Jika halaman tidak boleh dilihat,
     * jangan izinkan proses dari hook.
     *
     * Permission create tetap diperiksa
     * pada halaman dan backend.
     */
    if (!enabled) {

      throw new Error(
        "Tidak memiliki izin melihat Retur Penjualan."
      );

    }


    const result =
      await returPenjualanService.create(
        payload
      );


    /*
     * Refresh data setelah berhasil.
     */
    await loadData();


    return result;

  };


  // =====================================
  // UPDATE
  // =====================================

  const update = async (
    id: number,
    payload: Partial<ReturPenjualanCreate>
  ) => {

    const result =
      await returPenjualanService.update(
        id,
        payload
      );


    /*
     * Refresh data setelah berhasil.
     */
    await loadData();


    return result;

  };


  // =====================================
  // DELETE
  // =====================================

  const remove = async (
    id: number
  ) => {

    await returPenjualanService.remove(
      id
    );


    /*
     * Refresh data setelah berhasil.
     */
    await loadData();

  };


  // =====================================
  // APPROVE
  // =====================================

  const approve = async (
    id: number
  ) => {

    const result =
      await returPenjualanService.approve(
        id
      );


    /*
     * Refresh data setelah berhasil.
     * Status DRAFT → SELESAI.
     */
    await loadData();


    return result;

  };


  // =====================================
  // REJECT
  // =====================================

  const reject = async (
    id: number,
    alasan: string
  ) => {

    const result =
      await returPenjualanService.reject(
        id,
        alasan
      );


    /*
     * Refresh data setelah berhasil.
     * Status DRAFT → BATAL.
     */
    await loadData();


    return result;

  };


  // =====================================
  // LOAD SAAT PAGE / FILTER BERUBAH
  // =====================================

  useEffect(() => {

    /*
     * Jangan load data jika permission
     * retur_penjualan.view tidak tersedia.
     */
    if (!enabled) {

      setData([]);

      setTotal(0);

      return;

    }


    void loadData();

  }, [
    page,
    size,
    search,
    enabled,
  ]);


  // =====================================
  // RETURN
  // =====================================

  return {

    loading,

    data,

    total,

    page,
    setPage,

    size,
    setSize,

    search,
    setSearch,

    loadData,

    create,

    update,

    remove,

    approve,

    reject,

  };

}