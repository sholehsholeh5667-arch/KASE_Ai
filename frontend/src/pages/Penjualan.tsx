import { useState } from "react";

import {
  CheckCircle,
  Description,
  LocalPrintshop,
  ReceiptLong,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import type { Barang } from "../types/barang";

import { usePenjualan } from "../hooks/usePenjualan";

import {
  openPenjualanPrint,
} from "../services/penjualanService";

import KeranjangTable from "../components/penjualan/KeranjangTable";
import CariBarangDialog from "../components/penjualan/CariBarangDialog";
import PembayaranDialog from "../components/penjualan/PembayaranDialog";


// =====================================================
// FORMAT RUPIAH
// =====================================================

const formatRupiah = (
  value: number
) => {
  return Number(
    value || 0
  ).toLocaleString(
    "id-ID"
  );
};


// =====================================================
// FORMAT TANGGAL
// =====================================================

const formatTanggal = (
  value: string
) => {
  if (!value) {
    return "-";
  }

  const tanggal =
    new Date(value);

  if (
    Number.isNaN(
      tanggal.getTime()
    )
  ) {
    return value;
  }

  return tanggal.toLocaleString(
    "id-ID",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


// =====================================================
// PAGE PENJUALAN
// =====================================================

export default function Penjualan() {

  // ===================================================
  // HOOK
  // ===================================================

  const {
    loading,

    keranjang,

    diskonJenis,

    diskonNilai,

    bayar,

    metodeBayar,

    totalItem,

    subtotal,

    diskon,

    pajak,

    grandTotal,

    kembalian,

    openCariBarang,

    openPembayaran,

    setDiskonJenis,

    setDiskonNilai,

    setBayar,

    setMetodeBayar,

    tambahBarang,

    tambahQty,

    kurangiQty,

    hapusBarang,

    bukaCariBarang,

    tutupCariBarang,

    bukaPembayaran,

    tutupPembayaran,

    simpanTransaksi,

  } = usePenjualan();


  // ===================================================
  // HASIL TRANSAKSI
  // ===================================================

  const [
    transaksiBerhasil,
    setTransaksiBerhasil,
  ] = useState<ReturnType<
    typeof usePenjualan
  >["transaksiTerakhir"]>(null);


  // ===================================================
  // SNACKBAR
  // ===================================================

  const [
    snackbar,
    setSnackbar,
  ] = useState({
    open: false,
    message: "",
    severity:
      "success" as
        | "success"
        | "error",
  });


  // ===================================================
  // PILIH BARANG
  // ===================================================

  const handlePilihBarang = (
    barang: Barang
  ) => {

    tambahBarang(
      barang
    );

    tutupCariBarang();

  };


  // ===================================================
  // BUKA PEMBAYARAN
  // ===================================================

  const handlePembayaran = () => {

    if (
      keranjang.length === 0
    ) {

      setSnackbar({
        open: true,
        message:
          "Keranjang masih kosong.",
        severity: "error",
      });

      return;
    }

    bukaPembayaran();

  };


  // ===================================================
  // SIMPAN TRANSAKSI
  // ===================================================

  const handleSimpan =
    async () => {

      try {

        const result =
          await simpanTransaksi();

        if (
          !result ||
          !result.success
        ) {

          setSnackbar({
            open: true,
            message:
              result?.message ??
              "Transaksi gagal disimpan.",
            severity: "error",
          });

          return result;

        }

        /*
         * Ambil hasil transaksi
         * yang dikembalikan hook.
         */
        const hasil =
          result.data;

        if (hasil) {

          setTransaksiBerhasil(
            hasil
          );

        }

        setSnackbar({
          open: true,
          message:
            "Transaksi berhasil disimpan.",
          severity: "success",
        });

        return result;

      } catch (error) {

        console.error(
          "Gagal menyimpan transaksi:",
          error
        );

        setSnackbar({
          open: true,
          message:
            "Terjadi kesalahan saat menyimpan transaksi.",
          severity: "error",
        });

        return {
          success: false,
          message:
            "Terjadi kesalahan saat menyimpan transaksi.",
        };

      }

    };


  // ===================================================
  // TUTUP HASIL TRANSAKSI
  // ===================================================

  const handleTutupHasil =
    () => {

      setTransaksiBerhasil(
        null
      );

    };


  // ===================================================
  // CETAK STRUK
  // ===================================================

  const handleCetakStruk =
    () => {

      if (
        !transaksiBerhasil
      ) {

        return;
      }

      openPenjualanPrint(
        transaksiBerhasil.id,
        "struk"
      );

    };


  // ===================================================
  // CETAK FAKTUR
  // ===================================================

  const handleCetakFaktur =
    () => {

      if (
        !transaksiBerhasil
      ) {

        return;
      }

      openPenjualanPrint(
        transaksiBerhasil.id,
        "faktur"
      );

    };


  // ===================================================
  // UI
  // ===================================================

  return (

    <Box
      sx={{
        minHeight:
          "100%",
        backgroundColor:
          "#f5f7fb",
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border:
            "1px solid",
          borderColor:
            "divider",
          p: {
            xs: 2,
            md: 3,
          },
          mb: 3,
        }}
      >

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
          spacing={2}
        >

          <Box>

            <Typography
              variant="h5"
              fontWeight={800}
              color="#0b2d63"
            >
              Penjualan
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              Transaksi penjualan
              barang
            </Typography>

          </Box>

          <Button
            variant="contained"
            startIcon={
              <ReceiptLong />
            }
            onClick={
              bukaCariBarang
            }
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 1.2,
              fontWeight: 700,
              textTransform:
                "none",
              boxShadow:
                "none",
            }}
          >
            Tambah Barang
          </Button>

        </Stack>

      </Paper>


      {/* =================================================
          RINGKASAN
      ================================================= */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border:
                "1px solid",
              borderColor:
                "divider",
              p: 2.5,
              height: "100%",
            }}
          >

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Total Item
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                mt: 0.5,
              }}
            >
              {totalItem}
            </Typography>

          </Paper>

        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border:
                "1px solid",
              borderColor:
                "divider",
              p: 2.5,
              height: "100%",
            }}
          >

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Subtotal
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                mt: 0.5,
              }}
            >
              Rp{" "}
              {formatRupiah(
                subtotal
              )}
            </Typography>

          </Paper>

        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border:
                "1px solid",
              borderColor:
                "divider",
              p: 2.5,
              height: "100%",
            }}
          >

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Diskon
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
              color="error.main"
              sx={{
                mt: 0.5,
              }}
            >
              Rp{" "}
              {formatRupiah(
                diskon
              )}
            </Typography>

          </Paper>

        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border:
                "1px solid",
              borderColor:
                "success.light",
              backgroundColor:
                "#f0fdf4",
              p: 2.5,
              height: "100%",
            }}
          >

            <Typography
              variant="body2"
              color="success.dark"
              fontWeight={600}
            >
              Grand Total
            </Typography>

            <Typography
              variant="h5"
              fontWeight={900}
              color="success.dark"
              sx={{
                mt: 0.5,
              }}
            >
              Rp{" "}
              {formatRupiah(
                grandTotal
              )}
            </Typography>

          </Paper>

        </Grid>

      </Grid>


      {/* =================================================
          PAJAK
      ================================================= */}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border:
            "1px solid",
          borderColor:
            "divider",
          px: 2.5,
          py: 1.5,
          mb: 3,
        }}
      >

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          spacing={1}
        >

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Pajak
          </Typography>

          <Typography
            variant="body2"
            fontWeight={700}
          >
            Rp{" "}
            {formatRupiah(
              pajak
            )}
          </Typography>

        </Stack>

      </Paper>


      {/* =================================================
          KERANJANG
      ================================================= */}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border:
            "1px solid",
          borderColor:
            "divider",
          overflow:
            "hidden",
        }}
      >

        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom:
              "1px solid",
            borderColor:
              "divider",
          }}
        >

          <Typography
            fontWeight={800}
            color="#0b2d63"
          >
            Keranjang Penjualan
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Barang yang akan
            diproses dalam transaksi
          </Typography>

        </Box>

        <KeranjangTable
          items={
            keranjang
          }
          onTambahQty={
            tambahQty
          }
          onKurangiQty={
            kurangiQty
          }
          onHapus={
            hapusBarang
          }
        />

      </Paper>


      {/* =================================================
          FOOTER
      ================================================= */}

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          borderRadius: 3,
          border:
            "1px solid",
          borderColor:
            "divider",
          p: 2,
        }}
      >

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="flex-end"
          spacing={1.5}
        >

          <Button
            variant="outlined"
            startIcon={
              <ReceiptLong />
            }
            onClick={
              bukaCariBarang
            }
            sx={{
              borderRadius: 2,
              textTransform:
                "none",
              fontWeight: 700,
            }}
          >
            Tambah Barang
          </Button>


          <Button
            variant="contained"
            color="success"
            onClick={
              handlePembayaran
            }
            disabled={
              keranjang.length ===
              0
            }
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform:
                "none",
              fontWeight: 800,
              boxShadow:
                "none",
            }}
          >
            Pembayaran
          </Button>

        </Stack>

      </Paper>


      {/* =================================================
          CARI BARANG
      ================================================= */}

      <CariBarangDialog
        open={
          openCariBarang
        }
        onClose={
          tutupCariBarang
        }
        onPilih={
          handlePilihBarang
        }
      />


      {/* =================================================
          PEMBAYARAN
      ================================================= */}

      <PembayaranDialog
        open={
          openPembayaran
        }
        grandTotal={
          grandTotal
        }
        bayar={
          bayar
        }
        metodeBayar={
          metodeBayar
        }
        diskonJenis={
          diskonJenis
        }
        diskonNilai={
          diskonNilai
        }
        kembalian={
          kembalian
        }
        loading={
          loading
        }
        onClose={
          tutupPembayaran
        }
        setBayar={
          setBayar
        }
        setMetodeBayar={
          setMetodeBayar
        }
        setDiskonJenis={
          setDiskonJenis
        }
        setDiskonNilai={
          setDiskonNilai
        }
        onSimpan={
          handleSimpan
        }
      />


      {/* =================================================
          TRANSAKSI BERHASIL
      ================================================= */}

      <Dialog
        open={
          Boolean(
            transaksiBerhasil
          )
        }
        onClose={
          handleTutupHasil
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >

            <CheckCircle
              color="success"
              sx={{
                fontSize: 40,
              }}
            />

            <Box>

              <Typography
                variant="h6"
                fontWeight={800}
              >
                Transaksi Berhasil
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Penjualan berhasil
                disimpan.
              </Typography>

            </Box>

          </Stack>

        </DialogTitle>


        <DialogContent>

          {transaksiBerhasil && (

            <Stack spacing={2.5}>

              {/* NOMOR FAKTUR */}

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor:
                    "#f8fafc",
                  border:
                    "1px solid",
                  borderColor:
                    "divider",
                }}
              >

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Nomor Faktur
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={900}
                  color="#0b2d63"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  {
                    transaksiBerhasil
                      .no_faktur
                  }
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                  }}
                >
                  {formatTanggal(
                    transaksiBerhasil
                      .tanggal
                  )}
                </Typography>

              </Paper>


              {/* RINGKASAN */}

              <Stack
                spacing={1.2}
              >

                <Stack
                  direction="row"
                  justifyContent="space-between"
                >

                  <Typography
                    color="text.secondary"
                  >
                    Subtotal
                  </Typography>

                  <Typography
                    fontWeight={700}
                  >
                    Rp{" "}
                    {formatRupiah(
                      transaksiBerhasil
                        .subtotal
                    )}
                  </Typography>

                </Stack>


                <Stack
                  direction="row"
                  justifyContent="space-between"
                >

                  <Typography
                    color="text.secondary"
                  >
                    Diskon
                  </Typography>

                  <Typography
                    fontWeight={700}
                    color="error.main"
                  >
                    Rp{" "}
                    {formatRupiah(
                      transaksiBerhasil
                        .diskon
                    )}
                  </Typography>

                </Stack>


                <Stack
                  direction="row"
                  justifyContent="space-between"
                >

                  <Typography
                    color="text.secondary"
                  >
                    Pajak
                  </Typography>

                  <Typography
                    fontWeight={700}
                  >
                    Rp{" "}
                    {formatRupiah(
                      transaksiBerhasil
                        .pajak
                    )}
                  </Typography>

                </Stack>


                <Divider />


                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >

                  <Typography
                    fontWeight={800}
                  >
                    Grand Total
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight={900}
                    color="success.main"
                  >
                    Rp{" "}
                    {formatRupiah(
                      transaksiBerhasil
                        .grand_total
                    )}
                  </Typography>

                </Stack>


                <Stack
                  direction="row"
                  justifyContent="space-between"
                >

                  <Typography
                    color="text.secondary"
                  >
                    Metode Pembayaran
                  </Typography>

                  <Typography
                    fontWeight={700}
                  >
                    {
                      transaksiBerhasil
                        .metode_bayar
                    }
                  </Typography>

                </Stack>


                <Stack
                  direction="row"
                  justifyContent="space-between"
                >

                  <Typography
                    color="text.secondary"
                  >
                    Dibayar
                  </Typography>

                  <Typography
                    fontWeight={700}
                  >
                    Rp{" "}
                    {formatRupiah(
                      transaksiBerhasil
                        .dibayar
                    )}
                  </Typography>

                </Stack>


                <Stack
                  direction="row"
                  justifyContent="space-between"
                >

                  <Typography
                    color="text.secondary"
                  >
                    Kembalian
                  </Typography>

                  <Typography
                    fontWeight={800}
                    color="primary.main"
                  >
                    Rp{" "}
                    {formatRupiah(
                      transaksiBerhasil
                        .kembalian
                    )}
                  </Typography>

                </Stack>


                <Stack
                  direction="row"
                  justifyContent="space-between"
                >

                  <Typography
                    color="text.secondary"
                  >
                    Status
                  </Typography>

                  <Typography
                    fontWeight={700}
                    color="success.main"
                  >
                    {
                      transaksiBerhasil
                        .status
                    }
                  </Typography>

                </Stack>

              </Stack>

            </Stack>

          )}

        </DialogContent>


        {/* =================================================
            TOMBOL
        ================================================= */}

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            gap: 1,
            flexWrap: "wrap",
          }}
        >

          <Button
            variant="outlined"
            startIcon={
              <Description />
            }
            onClick={
              handleCetakFaktur
            }
            disabled={
              !transaksiBerhasil
            }
            sx={{
              borderRadius: 2,
              textTransform:
                "none",
              fontWeight: 700,
            }}
          >
            Cetak Faktur
          </Button>


          <Button
            variant="contained"
            startIcon={
              <LocalPrintshop />
            }
            onClick={
              handleCetakStruk
            }
            disabled={
              !transaksiBerhasil
            }
            sx={{
              borderRadius: 2,
              textTransform:
                "none",
              fontWeight: 800,
              boxShadow:
                "none",
            }}
          >
            Cetak Struk
          </Button>


          <Button
            variant="text"
            onClick={
              handleTutupHasil
            }
            sx={{
              borderRadius: 2,
              textTransform:
                "none",
              fontWeight: 700,
            }}
          >
            Tutup
          </Button>

        </DialogActions>

      </Dialog>


      {/* =================================================
          SNACKBAR
      ================================================= */}

      <Snackbar
        open={
          snackbar.open
        }
        autoHideDuration={
          3500
        }
        onClose={() =>
          setSnackbar(
            (prev) => ({
              ...prev,
              open: false,
            })
          )
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >

        <Alert
          severity={
            snackbar.severity
          }
          variant="filled"
          onClose={() =>
            setSnackbar(
              (prev) => ({
                ...prev,
                open: false,
              })
            )
          }
        >
          {
            snackbar.message
          }
        </Alert>

      </Snackbar>

    </Box>
  );
}