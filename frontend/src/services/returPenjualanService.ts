import api from "../api/axios";

import type {
  ReturPenjualan,
  ReturPenjualanCreate,
  ReturPenjualanPaginationResponse,
} from "../types/returPenjualan";


// =====================================================
// SERVICE RETUR PENJUALAN
// =====================================================

export const returPenjualanService = {


  // ===================================================
  // GET ALL
  // ===================================================

  async getAll(
    page: number = 1,
    size: number = 10,
    search: string = ""
  ): Promise<ReturPenjualanPaginationResponse> {

    const { data } =
      await api.get<
        | ReturPenjualan[]
        | ReturPenjualanPaginationResponse
      >(
        "/retur-penjualan/",
        {
          params: {
            page,
            size,
            search,
          },
        }
      );


    // =================================================
    // BACKEND SAAT INI MENGIRIM ARRAY
    // =================================================

    if (Array.isArray(data)) {

      const keyword =
        search
          .trim()
          .toLowerCase();


      const filtered =
        keyword === ""
          ? data
          : data.filter(
              (item) =>
                item.no_retur
                  .toLowerCase()
                  .includes(keyword)
            );


      const total =
        filtered.length;


      const pages =
        total === 0
          ? 0
          : Math.ceil(
              total / size
            );


      const start =
        (page - 1) * size;


      const items =
        filtered.slice(
          start,
          start + size
        );


      return {

        items,

        total,

        page,

        size,

        pages,

      };

    }


    // =================================================
    // JIKA SUATU SAAT BACKEND SUDAH PAGINATION
    // =================================================

    return data;

  },


  // ===================================================
  // GET BY ID
  // ===================================================

  async getById(
    id: number
  ): Promise<ReturPenjualan> {

    const { data } =
      await api.get<ReturPenjualan>(
        `/retur-penjualan/${id}`
      );


    return data;

  },


  // ===================================================
  // CREATE
  // ===================================================

  async create(
    payload: ReturPenjualanCreate
  ): Promise<ReturPenjualan> {

    const { data } =
      await api.post<ReturPenjualan>(
        "/retur-penjualan/",
        payload
      );


    return data;

  },


  // ===================================================
  // UPDATE
  // ===================================================

  async update(
    id: number,
    payload: Partial<ReturPenjualanCreate>
  ): Promise<ReturPenjualan> {

    const { data } =
      await api.put<ReturPenjualan>(
        `/retur-penjualan/${id}`,
        payload
      );


    return data;

  },


  // ===================================================
  // DELETE
  // ===================================================

  async remove(
    id: number
  ): Promise<void> {

    await api.delete(
      `/retur-penjualan/${id}`
    );

  },


  // ===================================================
  // APPROVE
  // ===================================================

  async approve(
    id: number
  ): Promise<ReturPenjualan> {

    const { data } =
      await api.post<ReturPenjualan>(
        `/retur-penjualan/${id}/approve`
      );


    return data;

  },


  // ===================================================
  // REJECT
  // ===================================================

  async reject(
    id: number,
    alasan: string
  ): Promise<ReturPenjualan> {

    const { data } =
      await api.post<ReturPenjualan>(
        `/retur-penjualan/${id}/reject`,
        null,
        {
          params: {
            alasan,
          },
        }
      );


    return data;

  },

};