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
} from "@mui/material";

import { useEffect, useState } from "react";

export interface Penjualan {

  id: number;

  no_faktur: string;

  tanggal: string;

  pelanggan: string;

  grand_total: number;

}

interface Props {

  open: boolean;

  onClose: () => void;

  onSelect: (penjualan: Penjualan) => void;

}

export default function CariFakturPenjualanDialog({

  open,

  onClose,

  onSelect,

}: Props) {

  const [data, setData] =
    useState<Penjualan[]>([]);

  useEffect(() => {

    if (!open) return;

    // Dummy sementara
    setData([

      {

        id: 1,

        no_faktur: "PJ-000001",

        tanggal: "2026-08-04",

        pelanggan: "Pelanggan Umum",

        grand_total: 150000,

      },

      {

        id: 2,

        no_faktur: "PJ-000002",

        tanggal: "2026-08-04",

        pelanggan: "Ahmad",

        grand_total: 250000,

      },

    ]);

  }, [open]);

  return (

    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >

      <DialogTitle>

        Pilih Faktur Penjualan

      </DialogTitle>

      <DialogContent>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell>
                No Faktur
              </TableCell>

              <TableCell>
                Tanggal
              </TableCell>

              <TableCell>
                Pelanggan
              </TableCell>

              <TableCell align="right">
                Grand Total
              </TableCell>

              <TableCell align="center">
                Aksi
              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {data.map((item) => (

              <TableRow
                key={item.id}
              >

                <TableCell>

                  {item.no_faktur}

                </TableCell>

                <TableCell>

                  {item.tanggal}

                </TableCell>

                <TableCell>

                  {item.pelanggan}

                </TableCell>

                <TableCell align="right">

                  Rp{" "}

                  {item.grand_total.toLocaleString("id-ID")}

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