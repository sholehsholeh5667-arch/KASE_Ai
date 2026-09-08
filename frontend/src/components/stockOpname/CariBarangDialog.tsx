import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
} from "@mui/material";

import { useEffect } from "react";

import { useBarang } from "../../hooks/useBarang";
import type { Barang } from "../../types/barang";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (barang: Barang) => void;
}

export default function CariBarangDialog({
  open,
  onClose,
  onSelect,
}: Props) {

  const {
    loading,
    data: barang,
    loadData,
  } = useBarang();

  useEffect(() => {

    if (open) {

      loadData(1, 100);

    }

  }, [open]);

  return (

    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >

      <DialogTitle>
        Pilih Barang
      </DialogTitle>

      <DialogContent>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell>Kode</TableCell>

              <TableCell>Nama Barang</TableCell>

              <TableCell align="right">
                Stok
              </TableCell>

              <TableCell align="center">
                Aksi
              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {loading ? (

              <TableRow>

                <TableCell
                  colSpan={4}
                  align="center"
                >

                  <CircularProgress />

                </TableCell>

              </TableRow>

            ) : (

              barang.map((item) => (

                <TableRow key={item.id}>

                  <TableCell>
                    {item.kode_barang}
                  </TableCell>

                  <TableCell>
                    {item.nama_barang}
                  </TableCell>

                  <TableCell align="right">
                    {item.stok}
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

              ))

            )}

          </TableBody>

        </Table>

      </DialogContent>

    </Dialog>

  );

}