import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  returPembelianService,
} from "../services/returPembelianService";

import type {
  ReturPembelian,
  ReturPembelianCreate,
} from "../types/returPembelian";


/* =========================================================
   HOOK RETUR PEMBELIAN
========================================================= */

export function useReturPembelian() {

  /* =======================================================
     STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(false);

  const [data, setData] =
    useState<ReturPembelian[]>([]);

  const [page, setPage] =
    useState(1);

  const [size, setSize] =
    useState(10);

  const [total, setTotal] =
    useState(0);

  const [search, setSearch] =
    useState("");


  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData =
    useCallback(
      async () => {

        try {

          setLoading(true);

          const result =
            await returPembelianService.getAll();

          /*
           * Backend saat ini mengembalikan
           * array langsung:
           *
           * [
           *   {...},
           *   {...}
           * ]
           */

          let filtered =
            result.items;

          /*
           * Search dilakukan di frontend
           * karena endpoint backend saat ini
           * belum mengembalikan pagination.
           */

          const keyword =
            search
              .trim()
              .toLowerCase();

          if (keyword) {

            filtered =
              result.items.filter(
                (item) => {

                  const id =
                    String(
                      item.id
                    );

                  const pembelianId =
                    String(
                      item.pembelian_id
                    );

                  const supplierId =
                    String(
                      item.supplier_id
                    );

                  const status =
                    String(
                      item.status ?? ""
                    ).toLowerCase();

                  const alasan =
                    String(
                      item.alasan ?? ""
                    ).toLowerCase();

                  return (
                    id.includes(
                      keyword
                    ) ||
                    pembelianId.includes(
                      keyword
                    ) ||
                    supplierId.includes(
                      keyword
                    ) ||
                    status.includes(
                      keyword
                    ) ||
                    alasan.includes(
                      keyword
                    )
                  );
                }
              );
          }

          setTotal(
            filtered.length
          );

          /*
           * Pagination frontend
           */

          const start =
            (page - 1) *
            size;

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
            "Gagal mengambil data retur pembelian:",
            error
          );

          setData([]);

          setTotal(0);

        } finally {

          setLoading(false);

        }

      },
      [
        page,
        size,
        search,
      ]
    );


  /* =======================================================
     CREATE
  ======================================================= */

  const create =
    useCallback(
      async (
        payload: ReturPembelianCreate
      ) => {

        try {

          setLoading(true);

          await returPembelianService.create(
            payload
          );

          /*
           * Setelah berhasil membuat retur,
           * kembali ke halaman pertama.
           */

          setPage(1);

          /*
           * Ambil ulang data.
           */

          await loadData();

        } finally {

          setLoading(false);

        }

      },
      [loadData]
    );


  /* =======================================================
     UPDATE
  ======================================================= */

  const update =
    useCallback(
      async (
        id: number,
        payload:
          Partial<
            ReturPembelianCreate
          >
      ) => {

        try {

          setLoading(true);

          await returPembelianService.update(
            id,
            payload
          );

          await loadData();

        } finally {

          setLoading(false);

        }

      },
      [loadData]
    );
      /* =======================================================
     APPROVE
  ======================================================= */

  const approve =
    useCallback(
      async (
        id: number
      ) => {

        try {

          setLoading(true);

          await returPembelianService.approve(
            id
          );

          await loadData();

        } finally {

          setLoading(false);

        }

      },
      [loadData]
    );


  /* =======================================================
     REJECT
  ======================================================= */

  const reject =
    useCallback(
      async (
        id: number,
        alasan: string
      ) => {

        try {

          setLoading(true);

          await returPembelianService.reject(
            id,
            alasan
          );

          await loadData();

        } finally {

          setLoading(false);

        }

      },
      [loadData]
    );


  /* =======================================================
     DELETE
  ======================================================= */

  const remove =
    useCallback(
      async (
        id: number
      ) => {

        try {

          setLoading(true);

          await returPembelianService.remove(
            id
          );

          /*
           * Ambil ulang data setelah hapus.
           */

          await loadData();

        } finally {

          setLoading(false);

        }

      },
      [loadData]
    );


  /* =======================================================
     EFFECT
  ======================================================= */

  useEffect(() => {

    loadData();

  }, [loadData]);


  /* =======================================================
     RETURN
  ======================================================= */

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

    approve,
    
    reject,

    remove,

  };

}