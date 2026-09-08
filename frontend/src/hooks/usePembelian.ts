import { useEffect, useState } from "react";

import { pembelianService } from "../services/pembelianService";

import type {
  Pembelian,
  PembelianCreate,
} from "../types/pembelian";

export function usePembelian() {

  // =====================================
  // STATE
  // =====================================

  const [loading, setLoading] =
    useState(false);

  const [data, setData] =
    useState<Pembelian[]>([]);

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
        await pembelianService.getAll(
          page,
          size,
          search
        );

      setData(result.items);

      setTotal(result.total);

    } finally {

      setLoading(false);

    }

  };

  // =====================================
  // CREATE
  // =====================================

  const create = async (
    payload: PembelianCreate
  ) => {

    await pembelianService.create(
      payload
    );

    await loadData();

  };

  // =====================================
  // UPDATE
  // =====================================

  const update = async (
    id: number,
    payload: Partial<PembelianCreate>
  ) => {

    await pembelianService.update(
      id,
      payload
    );

    await loadData();

  };

  // =====================================
  // DELETE
  // =====================================

  const remove = async (
    id: number
  ) => {

    await pembelianService.remove(
      id
    );

    await loadData();

  };

  // =====================================
  // EFFECT
  // =====================================

  useEffect(() => {

    loadData();

  }, [page, size, search]);

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

  };

}