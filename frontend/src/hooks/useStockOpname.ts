import {
  useEffect,
  useState,
} from "react";

import {
  stockOpnameService,
} from "../services/stockOpnameService";

import type {
  StockOpname,
  StockOpnameCreate,
} from "../types/stockOpname";


export function useStockOpname() {

  // =====================================
  // STATE
  // =====================================

  const [loading, setLoading] =
    useState(false);

  const [data, setData] =
    useState<StockOpname[]>([]);

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

    try {

      setLoading(true);

      const result =
        await stockOpnameService.getAll();

      // Backend mengembalikan array langsung
      const allData =
        Array.isArray(result)
          ? result
          : [];

      // ===================================
      // SEARCH
      // ===================================

      const keyword =
        search.trim().toLowerCase();

      const filtered =
      keyword
      ? allData.filter(
        (item) =>
          String(
            item.id ?? ""
          )
            .toLowerCase()
            .includes(keyword)
      )
    : allData;
      // ===================================
      // TOTAL
      // ===================================

      setTotal(
        filtered.length
      );


      // ===================================
      // PAGINATION FRONTEND
      // ===================================

      const start =
        (page - 1) * size;

      const end =
        start + size;

      const paginated =
        filtered.slice(
          start,
          end
        );


      setData(
        paginated
      );

    } catch (error) {

      console.error(
        "Gagal mengambil data stock opname:",
        error
      );

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
    payload: StockOpnameCreate
  ) => {

    await stockOpnameService.create(
      payload
    );

    setPage(1);

    await loadData();

  };


  // =====================================
  // LOAD SAAT PAGE / SEARCH BERUBAH
  // =====================================

  useEffect(() => {

    loadData();

  }, [
    page,
    size,
    search,
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

  };

}