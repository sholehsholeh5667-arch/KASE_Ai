import {
  DataGrid,
  type GridColDef,
} from "@mui/x-data-grid";

import {
  Button,
  Stack,
} from "@mui/material";

import type { Barang } from "../../types/barang";


/* ==========================================================
   PROPS
========================================================== */

interface BarangTableProps {
  rows: Barang[];

  loading: boolean;

  /**
   * Callback edit.
   *
   * undefined:
   * → tombol Edit tidak ditampilkan.
   */
  onEdit?: (barang: Barang) => void;

  /**
   * Callback delete.
   *
   * undefined:
   * → tombol Hapus tidak ditampilkan.
   */
  onDelete?: (barang: Barang) => void;
}


/* ==========================================================
   TABLE
========================================================== */

export default function BarangTable({
  rows,
  loading,
  onEdit,
  onDelete,
}: BarangTableProps) {

  /* ========================================================
     KOLOM
  ======================================================== */

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
    },

    {
      field: "kode_barang",
      headerName: "Kode",
      width: 140,
    },

    {
      field: "nama_barang",
      headerName: "Nama Barang",
      flex: 1,
      minWidth: 180,
    },

    {
      field: "stok",
      headerName: "Stok",
      width: 90,
    },

    {
      field: "harga_beli",
      headerName: "Harga Beli",
      width: 140,

      valueFormatter: (value) =>
        `Rp ${Number(value).toLocaleString("id-ID")}`,
    },

    {
      field: "harga_jual",
      headerName: "Harga Jual",
      width: 140,

      valueFormatter: (value) =>
        `Rp ${Number(value).toLocaleString("id-ID")}`,
    },

    /* ======================================================
       AKSI
    ====================================================== */

    {
      field: "aksi",
      headerName: "Aksi",

      /*
       * Lebar cukup untuk 2 tombol.
       * Jika hanya satu tombol, ruang tetap aman.
       */
      width: 180,

      sortable: false,

      filterable: false,

      renderCell: (params) => {

        /*
         * Tidak ada permission update/delete
         * → tidak perlu menampilkan kolom aksi.
         *
         * Namun DataGrid masih membutuhkan renderCell,
         * sehingga kita kembalikan null.
         */

        if (!onEdit && !onDelete) {
          return null;
        }


        return (
          <Stack
            direction="row"
            spacing={1}
          >

            {/* ============================================
                EDIT
            ============================================ */}

            {onEdit && (
              <Button
                size="small"
                variant="contained"
                onClick={() =>
                  onEdit(params.row)
                }
              >
                Edit
              </Button>
            )}


            {/* ============================================
                DELETE
            ============================================ */}

            {onDelete && (
              <Button
                size="small"
                color="error"
                variant="contained"
                onClick={() =>
                  onDelete(params.row)
                }
              >
                Hapus
              </Button>
            )}

          </Stack>
        );
      },
    },
  ];


  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <DataGrid
      rows={rows}
      columns={columns}

      loading={loading}

      autoHeight

      disableRowSelectionOnClick

      pageSizeOptions={[
        10,
        25,
        50,
      ]}

      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 10,
          },
        },
      }}
    />
  );
}