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
  Alert,
  Box,
} from "@mui/material";

import { useEffect, useState } from "react";

import { getPenjualanById } from "../../services/penjualanService";

import type {
  DetailPenjualan,
} from "../../types/penjualan";


interface BarangRetur {

  barang_id: number;

  kode_barang: string;

  nama_barang: string;

  qty_jual: number;

  qty_retur: number;

  harga: number;

}


interface Props {

  open: boolean;

  penjualanId: number | null;

  onClose: () => void;

  onSelect: (
    barang: BarangRetur
  ) => void;

}


export default function CariBarangReturDialog({

  open,

  penjualanId,

  onClose,

  onSelect,

}: Props) {

  const [barang, setBarang] =
    useState<BarangRetur[]>([]);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");


  // =====================================
  // LOAD DETAIL PENJUALAN
  // =====================================

  useEffect(() => {

    if (!open) {
      return;
    }


    if (!penjualanId) {

      setBarang([]);

      setError(
        "Silakan pilih faktur penjualan terlebih dahulu."
      );

      return;

    }


    let active = true;


    const loadBarang = async () => {

      try {

        setLoading(true);

        setError("");

        setBarang([]);


        const penjualan =
          await getPenjualanById(
            penjualanId
          );


        if (!active) {
          return;
        }


        const detail =
          penjualan.detail ?? [];


        const hasil:
          BarangRetur[] =
          detail.map(
            (
              item: DetailPenjualan
            ) => ({

              barang_id:
                item.barang_id,

              kode_barang:
                `BRG-${item.barang_id}`,

              nama_barang:
                `Barang #${item.barang_id}`,

              qty_jual:
                item.qty,

              qty_retur:
                0,

              harga:
                Number(
                  item.harga_jual
                ),

            })
          );


        setBarang(
          hasil
        );


      } catch (err) {

        console.error(
          "Gagal mengambil detail penjualan:",
          err
        );


        if (!active) {
          return;
        }


        setBarang([]);


        setError(
          "Gagal mengambil detail barang dari faktur."
        );


      } finally {

        if (active) {

          setLoading(false);

        }

      }

    };


    void loadBarang();


    return () => {

      active = false;

    };

  }, [
    open,
    penjualanId,
  ]);


  // =====================================
  // RENDER
  // =====================================

  return (

    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >

      <DialogTitle>
        Pilih Barang Retur
      </DialogTitle>


      <DialogContent>

        {loading && (

          <Box
            display="flex"
            justifyContent="center"
            py={4}
          >

            <CircularProgress />

          </Box>

        )}


        {!loading &&
          error && (

            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>

          )}


        {!loading &&
          !error &&
          barang.length === 0 && (

            <Alert
              severity="info"
            >
              Tidak ada barang pada transaksi ini.
            </Alert>

          )}


        {!loading &&
          !error &&
          barang.length > 0 && (

            <Table>

              <TableHead>

                <TableRow>

                  <TableCell>
                    Barang ID
                  </TableCell>

                  <TableCell>
                    Kode
                  </TableCell>

                  <TableCell>
                    Nama Barang
                  </TableCell>

                  <TableCell align="right">
                    Qty Jual
                  </TableCell>

                  <TableCell align="right">
                    Harga
                  </TableCell>

                  <TableCell align="center">
                    Aksi
                  </TableCell>

                </TableRow>

              </TableHead>


              <TableBody>

                {barang.map(
                  (item) => (

                    <TableRow
                      key={
                        item.barang_id
                      }
                      hover
                    >

                      <TableCell>

                        {
                          item.barang_id
                        }

                      </TableCell>


                      <TableCell>

                        {
                          item.kode_barang
                        }

                      </TableCell>


                      <TableCell>

                        {
                          item.nama_barang
                        }

                      </TableCell>


                      <TableCell
                        align="right"
                      >

                        {
                          item.qty_jual
                        }

                      </TableCell>


                      <TableCell
                        align="right"
                      >

                        Rp{" "}

                        {
                          item.harga.toLocaleString(
                            "id-ID"
                          )
                        }

                      </TableCell>


                      <TableCell
                        align="center"
                      >

                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => {

                            onSelect(
                              item
                            );

                            onClose();

                          }}
                        >
                          Pilih
                        </Button>

                      </TableCell>

                    </TableRow>

                  )
                )}

              </TableBody>

            </Table>

          )}

      </DialogContent>

    </Dialog>

  );

}