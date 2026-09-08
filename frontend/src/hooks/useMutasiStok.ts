import { useEffect, useState } from "react";

import { mutasiStokService } from "../services/mutasiStokService";

import type {
  MutasiStok,
  MutasiStokCreate,
  MutasiStokUpdate,
} from "../types/mutasiStok";

export function useMutasiStok() {

  // =====================================
  // STATE
  // =====================================

  const [loading, setLoading] =
    useState(false);

  const [data, setData] =
    useState<MutasiStok[]>([]);

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
        await mutasiStokService.getAll(
          page,
          size,
          search
        );

      setData(result.items);

      setTotal(result.total);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  // =====================================
  // CREATE
  // =====================================

  const create = async (
    payload: MutasiStokCreate
  ) => {

    await mutasiStokService.create(
      payload
    );

    await loadData();

  };

  // =====================================
  // UPDATE
  // =====================================

  const update = async (
    id: number,
    payload: MutasiStokUpdate
  ) => {

    await mutasiStokService.update(
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

    await mutasiStokService.remove(
      id
    );

    await loadData();

  };

  // =====================================
  // AUTO LOAD
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