import { useDashboard } from "../hooks/useDashboard";

import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(value: number | undefined): string {
  return `Rp ${new Intl.NumberFormat("id-ID").format(
    Number(value ?? 0)
  )}`;
}

/* =========================================================
   FORMAT ANGKA
========================================================= */

function formatNumber(value: number | undefined): string {
  return new Intl.NumberFormat("id-ID").format(
    Number(value ?? 0)
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const {
    data,
    loading,
    error,
    reload,
  } = useDashboard();

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading && !data) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={reload}
            >
              Coba Lagi
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  /* =======================================================
     DATA DEFAULT
  ======================================================= */

  const dashboard = data ?? {
    penjualan_hari_ini: 0,
    pembelian_hari_ini: 0,
    laba_kotor: 0,
    jumlah_transaksi: 0,
    jumlah_barang: 0,
    jumlah_supplier: 0,
    jumlah_pelanggan: 0,
    stok_hampir_habis: 0,
    barang_terlaris: [],
    barang_hampir_habis: [],
  };

  /* =======================================================
     TANGGAL
  ======================================================= */

  const tanggalHariIni =
    new Intl.DateTimeFormat(
      "id-ID",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ).format(new Date());

  /* =======================================================
     CARD STYLE
  ======================================================= */

  const cardSx = {
    height: "100%",
    borderRadius: 3,
    border: "1px solid #e3e8ef",
    boxShadow:
      "0 2px 8px rgba(15, 39, 71, 0.06)",
    backgroundColor: "#ffffff",
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor: "#f4f7fb",
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          gap: 2,
          mb: 3,
          flexDirection: {
            xs: "column",
            sm: "row",
          },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: 28,
                md: 34,
              },
              fontWeight: 800,
              color: "#102f63",
              lineHeight: 1.2,
            }}
          >
            Dashboard
          </Typography>

          <Typography
            sx={{
              mt: 0.7,
              color: "#64748b",
              fontSize: 15,
            }}
          >
            Ringkasan kondisi operasional KASE AI.
          </Typography>

          <Typography
            sx={{
              mt: 0.4,
              color: "#94a3b8",
              fontSize: 13,
              textTransform: "capitalize",
            }}
          >
            {tanggalHariIni}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={reload}
          disabled={loading}
          sx={{
            backgroundColor: "#d8b331",
            color: "#102f63",
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            py: 1.2,
            "&:hover": {
              backgroundColor: "#c9a52c",
            },
          }}
        >
          {loading ? "Memuat..." : "Refresh"}
        </Button>
      </Box>

      {/* ===================================================
          ERROR KECIL
      =================================================== */}

      {error && data && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* ===================================================
          RINGKASAN UTAMA
      =================================================== */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        {/* PENJUALAN */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Paper sx={cardSx}>
            <Box sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Penjualan Hari Ini
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: {
                        xs: 22,
                        md: 25,
                      },
                      fontWeight: 800,
                      color: "#102f63",
                    }}
                  >
                    {formatRupiah(
                      dashboard.penjualan_hari_ini
                    )}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#e8f5ee",
                    color: "#16a34a",
                  }}
                >
                  <PointOfSaleIcon />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* TRANSAKSI */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Paper sx={cardSx}>
            <Box sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Transaksi Hari Ini
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#102f63",
                    }}
                  >
                    {formatNumber(
                      dashboard.jumlah_transaksi
                    )}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#eef2ff",
                    color: "#315fd4",
                  }}
                >
                  <ReceiptLongIcon />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* STOK MENIPIS */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Paper sx={cardSx}>
            <Box sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Stok Menipis
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 28,
                      fontWeight: 800,
                      color:
                        dashboard.stok_hampir_habis > 0
                          ? "#dc2626"
                          : "#102f63",
                    }}
                  >
                    {formatNumber(
                      dashboard.stok_hampir_habis
                    )}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fef2f2",
                    color: "#dc2626",
                  }}
                >
                  <WarningAmberIcon />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* LABA */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Paper sx={cardSx}>
            <Box sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Laba Kotor Hari Ini
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: {
                        xs: 22,
                        md: 25,
                      },
                      fontWeight: 800,
                      color: "#102f63",
                    }}
                  >
                    {formatRupiah(
                      dashboard.laba_kotor
                    )}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#fff8df",
                    color: "#b38b00",
                  }}
                >
                  <TrendingUpIcon />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ===================================================
          INFORMASI TOKO
      =================================================== */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Paper sx={cardSx}>
            <Box sx={{ p: 2.5 }}>
              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Total Barang
              </Typography>

              <Typography
                sx={{
                  mt: 0.7,
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#102f63",
                }}
              >
                {formatNumber(
                  dashboard.jumlah_barang
                )}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "#94a3b8",
                }}
              >
                Barang yang terdaftar di toko
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Paper sx={cardSx}>
            <Box sx={{ p: 2.5 }}>
              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Total Supplier
              </Typography>

              <Typography
                sx={{
                  mt: 0.7,
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#102f63",
                }}
              >
                {formatNumber(
                  dashboard.jumlah_supplier
                )}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "#94a3b8",
                }}
              >
                Supplier yang terdaftar
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Paper sx={cardSx}>
            <Box sx={{ p: 2.5 }}>
              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Total Pelanggan
              </Typography>

              <Typography
                sx={{
                  mt: 0.7,
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#102f63",
                }}
              >
                {formatNumber(
                  dashboard.jumlah_pelanggan
                )}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "#94a3b8",
                }}
              >
                Pelanggan yang terdaftar
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ===================================================
          STOK PERLU DIPERHATIKAN
      =================================================== */}

      <Paper
        sx={{
          ...cardSx,
          mb: 3,
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <WarningAmberIcon
              sx={{
                color: "#dc2626",
              }}
            />

            <Typography
              sx={{
                fontSize: 19,
                fontWeight: 800,
                color: "#102f63",
              }}
            >
              Stok Perlu Diperhatikan
            </Typography>
          </Box>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: 14,
              mb: 2,
            }}
          >
            {dashboard.stok_hampir_habis > 0
              ? `${dashboard.stok_hampir_habis} barang perlu segera diperiksa atau dilakukan pembelian ulang.`
              : "Tidak ada barang yang perlu segera diperhatikan."}
          </Typography>

          {dashboard.barang_hampir_habis.length === 0 ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#f8fafc",
                color: "#64748b",
              }}
            >
              Semua stok masih dalam kondisi aman.
            </Box>
          ) : (
            <Box>
              {dashboard.barang_hampir_habis.map(
                (barang, index) => (
                  <Box key={`${barang.nama}-${index}`}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "space-between",
                        py: 1.4,
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            flexShrink: 0,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#fef2f2",
                            color: "#dc2626",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {index + 1}
                        </Box>

                        <Typography
                          sx={{
                            fontSize: 15,
                            color: "#334155",
                            overflow: "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {barang.nama}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: 800,
                          color:
                            barang.stok <= 0
                              ? "#dc2626"
                              : "#d97706",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Stok{" "}
                        {formatNumber(
                          barang.stok
                        )}
                      </Typography>
                    </Box>

                    {index <
                      dashboard
                        .barang_hampir_habis
                        .length -
                        1 && <Divider />}
                  </Box>
                )
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* ===================================================
          PRODUK TERLARIS
      =================================================== */}

      <Paper sx={cardSx}>
        <Box sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <Inventory2Icon
              sx={{
                color: "#b38b00",
              }}
            />

            <Typography
              sx={{
                fontSize: 19,
                fontWeight: 800,
                color: "#102f63",
              }}
            >
              Produk Terlaris
            </Typography>
          </Box>

          {dashboard.barang_terlaris.length === 0 ? (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#f8fafc",
                color: "#64748b",
              }}
            >
              Belum ada data produk terlaris.
            </Box>
          ) : (
            <Box>
              {dashboard.barang_terlaris.map(
                (barang, index) => (
                  <Box key={`${barang.nama}-${index}`}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: 2,
                        py: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor:
                              index === 0
                                ? "#fff8df"
                                : "#f1f5f9",
                            color:
                              index === 0
                                ? "#a17b00"
                                : "#64748b",
                            fontWeight: 800,
                          }}
                        >
                          {index + 1}
                        </Box>

                        <Typography
                          sx={{
                            color: "#334155",
                            fontSize: 15,
                            overflow: "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {barang.nama}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#102f63",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatNumber(
                          barang.qty
                        )}{" "}
                        pcs
                      </Typography>
                    </Box>

                    {index <
                      dashboard
                        .barang_terlaris
                        .length -
                        1 && <Divider />}
                  </Box>
                )
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}