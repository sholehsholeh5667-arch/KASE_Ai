import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
} from "@mui/material";

import supplierService from "../../services/supplierService";
import type { Supplier } from "../../types/supplier";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (supplier: Supplier) => void;
}

export default function CariSupplierDialog({
  open,
  onClose,
  onSelect,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const loadSupplier = async () => {
    try {
      setLoading(true);

      const result =
        await supplierService.getAll(
          search,
          1,
          100
        );

      setSuppliers(result.items);
    } catch (error) {
      console.error(
        "Gagal memuat supplier:",
        error
      );

      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadSupplier();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      loadSupplier();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Cari Supplier
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Cari Supplier"
          margin="normal"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Kode
              </TableCell>

              <TableCell>
                Nama Supplier
              </TableCell>

              <TableCell>
                Telepon
              </TableCell>

              <TableCell align="center">
                Aksi
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                >
                  <CircularProgress />
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              suppliers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                  >
                    Data supplier
                    tidak ditemukan.
                  </TableCell>
                </TableRow>
              )}

            {suppliers.map((item) => (
              <TableRow
                key={item.id}
              >
                <TableCell>
                  {item.kode_supplier}
                </TableCell>

                <TableCell>
                  {item.nama_supplier}
                </TableCell>

                <TableCell>
                  {item.telepon}
                </TableCell>

                <TableCell align="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    Pilih
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}