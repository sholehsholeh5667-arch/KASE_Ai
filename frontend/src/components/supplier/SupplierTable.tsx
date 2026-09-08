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

import type { Supplier } from "../../types/supplier";


interface Props {
  suppliers: Supplier[];

  loading: boolean;

  onEdit?: (
    supplier: Supplier,
  ) => void;

  onDelete?: (
    supplier: Supplier,
  ) => void;
}


export default function SupplierTable({
  suppliers,
  loading,
  onEdit,
  onDelete,
}: Props) {

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


  return (
    <TableContainer
      component={Paper}
    >

      <Table>

        <TableHead>

          <TableRow>

            <TableCell>
              ID
            </TableCell>

            <TableCell>
              Nama Supplier
            </TableCell>

            <TableCell>
              Telepon
            </TableCell>

            <TableCell>
              Alamat
            </TableCell>

            <TableCell
              width={120}
            >
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

          {suppliers.length === 0 && (

            <TableRow>

              <TableCell
                colSpan={6}
                align="center"
              >
                Tidak ada data
              </TableCell>

            </TableRow>

          )}


          {suppliers.map(
            (supplier) => (

              <TableRow
                key={supplier.id}
                hover
              >

                <TableCell>
                  {supplier.id}
                </TableCell>

                <TableCell>
                  {supplier.nama}
                </TableCell>

                <TableCell>
                  {supplier.telepon || "-"}
                </TableCell>

                <TableCell>
                  {supplier.alamat || "-"}
                </TableCell>

                <TableCell>

                  <Chip
                    label={
                      supplier.aktif
                        ? "Aktif"
                        : "Nonaktif"
                    }
                    color={
                      supplier.aktif
                        ? "success"
                        : "default"
                    }
                    size="small"
                  />

                </TableCell>


                <TableCell
                  align="center"
                >

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >

                    {onEdit && (

                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() =>
                          onEdit(supplier)
                        }
                      >
                        <EditIcon />
                      </IconButton>

                    )}


                    {onDelete && (

                      <IconButton
                        color="error"
                        size="small"
                        onClick={() =>
                          onDelete(supplier)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>

                    )}

                  </Box>

                </TableCell>

              </TableRow>

            ),
          )}

        </TableBody>

      </Table>

    </TableContainer>
  );
}