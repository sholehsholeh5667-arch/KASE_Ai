import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Box,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import type { Kategori } from "../../types/kategori";


/* ==========================================================
   PROPS
========================================================== */

interface Props {
  rows: Kategori[];

  loading: boolean;

  /**
   * Undefined = tidak memiliki
   * permission kategori.update.
   */
  onEdit?: (kategori: Kategori) => void;

  /**
   * Undefined = tidak memiliki
   * permission kategori.delete.
   */
  onDelete?: (kategori: Kategori) => void;
}


/* ==========================================================
   TABLE
========================================================== */

export default function KategoriTable({
  rows,
  loading,
  onEdit,
  onDelete,
}: Props) {

  /* ========================================================
     LOADING
  ======================================================== */

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        mt={5}
      >
        <CircularProgress />
      </Box>
    );
  }


  /* ========================================================
     EMPTY / TABLE
  ======================================================== */

  return (
    <TableContainer component={Paper}>
      <Table>

        <TableHead>
          <TableRow>

            <TableCell width={80}>
              ID
            </TableCell>

            <TableCell>
              Nama
            </TableCell>

            <TableCell>
              Deskripsi
            </TableCell>

            <TableCell width={120}>
              Status
            </TableCell>

            <TableCell
              align="center"
              width={
                onEdit && onDelete
                  ? 150
                  : 100
              }
            >
              Aksi
            </TableCell>

          </TableRow>
        </TableHead>


        <TableBody>

          {rows.length === 0 && (
            <TableRow>

              <TableCell
                colSpan={5}
                align="center"
              >
                Tidak ada data
              </TableCell>

            </TableRow>
          )}


          {rows.map((row) => (

            <TableRow
              key={row.id}
              hover
            >

              <TableCell>
                {row.id}
              </TableCell>

              <TableCell>
                {row.nama}
              </TableCell>

              <TableCell>
                {row.deskripsi || "-"}
              </TableCell>

              <TableCell>

                <Chip
                  label={
                    row.aktif
                      ? "Aktif"
                      : "Nonaktif"
                  }
                  color={
                    row.aktif
                      ? "success"
                      : "default"
                  }
                  size="small"
                />

              </TableCell>


              {/* ==================================================
                  AKSI
              ================================================== */}

              <TableCell align="center">

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >

                  {/* ============================================
                      EDIT
                  ============================================ */}

                  {onEdit && (
                    <IconButton
                      color="primary"
                      onClick={() =>
                        onEdit(row)
                      }
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  )}


                  {/* ============================================
                      DELETE
                  ============================================ */}

                  {onDelete && (
                    <IconButton
                      color="error"
                      onClick={() =>
                        onDelete(row)
                      }
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}

                </Box>

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>
    </TableContainer>
  );
}