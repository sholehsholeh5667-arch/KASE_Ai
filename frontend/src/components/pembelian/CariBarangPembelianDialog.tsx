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

import { barangService } from "../../services/barangService";
import type { Barang } from "../../types/barang";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (barang: Barang) => void;
}

export default function CariBarangPembelianDialog({
  open,
  onClose,
  onSelect,
}: Props) {

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [barang, setBarang] = useState<Barang[]>([]);

  const loadBarang = async () => {

    try {

      setLoading(true);

      const result =
        await barangService.getAll(
          1,
          100,
          search
        );

      setBarang(result.items);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    if (open) {

      loadBarang();

    }

  }, [open]);

  useEffect(() => {

    if (!open) return;

    const timer = setTimeout(() => {

      loadBarang();

    }, 300);

    return () => clearTimeout(timer);

  }, [search]);

  return (

    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >

      <DialogTitle>
        Cari Barang
      </DialogTitle>

      <DialogContent>

        <TextField
          fullWidth
          margin="normal"
          label="Cari Barang"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <Table>

          <TableHead>

            <TableRow>

              <TableCell>Kode</TableCell>

              <TableCell>Nama Barang</TableCell>

              <TableCell align="right">
                Stok
              </TableCell>

              <TableCell align="right">
                Harga Jual
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
                  colSpan={5}
                  align="center"
                >

                  <CircularProgress />

                </TableCell>

              </TableRow>

            )}

            {!loading &&
              barang.length === 0 && (

              <TableRow>

                <TableCell
                  colSpan={5}
                  align="center"
                >

                  Data barang tidak ditemukan.

                </TableCell>

              </TableRow>

            )}

            {!loading &&
              barang.map((item) => (

              <TableRow
                key={item.id}
              >

                <TableCell>
                  {item.kode_barang}
                </TableCell>

                <TableCell>
                  {item.nama_barang}
                </TableCell>

                <TableCell align="right">
                  {item.stok}
                </TableCell>

                <TableCell align="right">
                  Rp{" "}
                  {Number(item.harga_jual).toLocaleString("id-ID")}
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