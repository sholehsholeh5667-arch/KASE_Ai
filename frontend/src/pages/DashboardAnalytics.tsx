import { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  Refresh,
  TrendingUp,
  TrendingDown,
  Inventory2,
  People,
  LocalShipping,
  WarningAmber,
  ShoppingCart,
  Assessment,
  AttachMoney,
} from "@mui/icons-material";

import { useDashboard } from "../hooks/useDashboard";

/* =========================================================
   HELPER
========================================================= */

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

/* =========================================================
   DASHBOARD ANALYTICS
========================================================= */

export default function DashboardAnalytics() {
  const {
    data,
    loading,
    error,
    reload,
  } = useDashboard();

  /* =======================================================
     DATA DASAR
  ======================================================= */

  const totalBarang =
    data?.jumlah_barang ?? 0;

  const totalSupplier =
    data?.jumlah_supplier ?? 0;

  const totalPelanggan =
    data?.jumlah_pelanggan ?? 0;

  const totalTransaksi =
    data?.jumlah_transaksi ?? 0;

  const penjualan =
    data?.penjualan_hari_ini ?? 0;

  const pembelian =
    data?.pembelian_hari_ini ?? 0;

  const labaKotor =
    data?.laba_kotor ?? 0;

  const stokMenipis =
    data?.stok_hampir_habis ?? 0;

  const produkTerlaris =
    data?.barang_terlaris ?? [];

  const stokHampirHabis =
    data?.barang_hampir_habis ?? [];

  /* =======================================================
     ANALISIS
  ======================================================= */

  const rasioLaba = useMemo(() => {
    if (penjualan <= 0) {
      return 0;
    }

    return Math.min(
      Math.max(
        (labaKotor / penjualan) * 100,
        0
      ),
      100
    );
  }, [penjualan, labaKotor]);

  const rasioStok = useMemo(() => {
    if (totalBarang <= 0) {
      return 0;
    }

    return Math.min(
      Math.max(
        ((totalBarang - stokMenipis) /
          totalBarang) *
          100,
        0
      ),
      100
    );
  }, [totalBarang, stokMenipis]);

  const totalQtyTerjual = useMemo(() => {
    return produkTerlaris.reduce(
      (total, item) =>
        total + Number(item.qty || 0),
      0
    );
  }, [produkTerlaris]);

  const produkTeratas =
    produkTerlaris.length > 0
      ? produkTerlaris[0]
      : null;

  const kondisiUsaha = useMemo(() => {
    if (stokMenipis > 0) {
      return {
        label: "Perlu Perhatian",
        color: "warning" as const,
        text:
          "Beberapa barang memiliki stok rendah dan perlu segera diperiksa.",
      };
    }

    if (penjualan > 0 && labaKotor > 0) {
      return {
        label: "Positif",
        color: "success" as const,
        text:
          "Penjualan dan laba kotor menunjukkan aktivitas usaha yang positif.",
      };
    }

    return {
      label: "Normal",
      color: "info" as const,
      text:
        "Belum cukup data untuk memberikan penilaian usaha yang lebih jauh.",
    };
  }, [
    stokMenipis,
    penjualan,
    labaKotor,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading && !data) {
    return (
      <Box
        sx={{
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          color="primary"
        >
          Dashboard Analytics
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 1, mb: 3 }}
        >
          Memuat data analitik...
        </Typography>

        <LinearProgress />
      </Box>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !data) {
    return (
      <Box
        sx={{
          p: {
            xs: 2,
            md: 4,
          },
        }}
      >
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
     UI
  ======================================================= */

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        backgroundColor: "#f4f7fb",
        minHeight: "100%",
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
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Assessment
              sx={{
                fontSize: 34,
                color: "#123b73",
              }}
            />

            <Typography
              variant="h4"
              fontWeight={800}
              color="#123b73"
            >
              Dashboard Analytics
            </Typography>
          </Stack>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Analisis performa dan kondisi usaha KASE AI.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={reload}
          disabled={loading}
          sx={{
            backgroundColor: "#d9b52f",
            color: "#102f5c",
            fontWeight: 700,
            px: 2.5,
            "&:hover": {
              backgroundColor: "#c9a622",
            },
          }}
        >
          {loading
            ? "Memuat..."
            : "Refresh Data"}
        </Button>
      </Box>

      {/* ===================================================
          STATUS USAHA
      =================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: "1px solid #e1e7ef",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: {
                xs: "flex-start",
                md: "center",
              },
              flexDirection: {
                xs: "column",
                md: "row",
              },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight={700}
              >
                STATUS KONDISI USAHA
              </Typography>

              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                Ringkasan analitik saat ini
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {kondisiUsaha.text}
              </Typography>
            </Box>

            <Chip
              label={kondisiUsaha.label}
              color={kondisiUsaha.color}
              sx={{
                fontWeight: 700,
                px: 1,
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* ===================================================
          KPI UTAMA
      =================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {/* PENJUALAN */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e1e7ef",
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  color="text.secondary"
                  fontWeight={600}
                >
                  Penjualan Hari Ini
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="#123b73"
                  sx={{ mt: 1 }}
                >
                  {formatRupiah(penjualan)}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  backgroundColor: "#e8f5ee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp color="success" />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* PEMBELIAN */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e1e7ef",
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  color="text.secondary"
                  fontWeight={600}
                >
                  Pembelian Hari Ini
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="#123b73"
                  sx={{ mt: 1 }}
                >
                  {formatRupiah(pembelian)}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  backgroundColor: "#eef2ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingCart color="primary" />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* LABA */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e1e7ef",
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  color="text.secondary"
                  fontWeight={600}
                >
                  Laba Kotor
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="#123b73"
                  sx={{ mt: 1 }}
                >
                  {formatRupiah(labaKotor)}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  backgroundColor: "#fff7df",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AttachMoney
                  sx={{ color: "#c49b13" }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* TRANSAKSI */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e1e7ef",
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  color="text.secondary"
                  fontWeight={600}
                >
                  Total Transaksi
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="#123b73"
                  sx={{ mt: 1 }}
                >
                  {formatNumber(totalTransaksi)}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  backgroundColor: "#f2eaff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Assessment
                  sx={{ color: "#7c4dff" }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* ===================================================
          STATISTIK MASTER DATA
      =================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e1e7ef",
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  backgroundColor: "#edf4ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Inventory2 color="primary" />
              </Box>

              <Box>
                <Typography
                  color="text.secondary"
                >
                  Total Barang
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="#123b73"
                >
                  {formatNumber(totalBarang)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e1e7ef",
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  backgroundColor: "#fff7e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LocalShipping
                  sx={{ color: "#c49b13" }}
                />
              </Box>

              <Box>
                <Typography
                  color="text.secondary"
                >
                  Total Supplier
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="#123b73"
                >
                  {formatNumber(totalSupplier)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e1e7ef",
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  backgroundColor: "#f1eaff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <People
                  sx={{ color: "#7c4dff" }}
                />
              </Box>

              <Box>
                <Typography
                  color="text.secondary"
                >
                  Total Pelanggan
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="#123b73"
                >
                  {formatNumber(totalPelanggan)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* ===================================================
          ANALISIS KEUANGAN & STOK
      =================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {/* ANALISIS LABA */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e1e7ef",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color="#123b73"
                >
                  Analisis Laba
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Perbandingan laba kotor terhadap penjualan.
                </Typography>
              </Box>

              {labaKotor > 0 ? (
                <TrendingUp color="success" />
              ) : (
                <TrendingDown color="error" />
              )}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  mb={0.8}
                >
                  <Typography>
                    Penjualan
                  </Typography>

                  <Typography fontWeight={700}>
                    {formatRupiah(penjualan)}
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={100}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                  }}
                />
              </Box>

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  mb={0.8}
                >
                  <Typography>
                    Laba Kotor
                  </Typography>

                  <Typography fontWeight={700}>
                    {formatRupiah(labaKotor)}
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={rasioLaba}
                  color="success"
                  sx={{
                    height: 8,
                    borderRadius: 5,
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Rasio laba kotor saat ini:{" "}
                <strong>
                  {rasioLaba.toFixed(1)}%
                </strong>
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* ANALISIS STOK */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e1e7ef",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color="#123b73"
                >
                  Analisis Stok
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Kondisi persediaan barang saat ini.
                </Typography>
              </Box>

              <Inventory2 color="primary" />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  mb={0.8}
                >
                  <Typography>
                    Stok relatif aman
                  </Typography>

                  <Typography fontWeight={700}>
                    {formatNumber(
                      Math.max(
                        totalBarang -
                          stokMenipis,
                        0
                      )
                    )}
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={rasioStok}
                  color="success"
                  sx={{
                    height: 8,
                    borderRadius: 5,
                  }}
                />
              </Box>

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  mb={0.8}
                >
                  <Typography>
                    Stok perlu perhatian
                  </Typography>

                  <Typography
                    fontWeight={700}
                    color={
                      stokMenipis > 0
                        ? "error.main"
                        : "text.primary"
                    }
                  >
                    {formatNumber(stokMenipis)}
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={
                    totalBarang > 0
                      ? Math.min(
                          (stokMenipis /
                            totalBarang) *
                            100,
                          100
                        )
                      : 0
                  }
                  color="error"
                  sx={{
                    height: 8,
                    borderRadius: 5,
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {stokMenipis > 0
                  ? `${formatNumber(
                      stokMenipis
                    )} barang perlu diperiksa atau dipertimbangkan untuk pembelian ulang.`
                  : "Tidak ada barang yang masuk daftar stok menipis."}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* ===================================================
          PRODUK TERLARIS + STOK
      =================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1.1fr 1fr",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {/* PRODUK TERLARIS */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e1e7ef",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color="#123b73"
                >
                  Produk Terlaris
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Produk dengan jumlah penjualan tertinggi.
                </Typography>
              </Box>

              <TrendingUp color="success" />
            </Stack>

            <Divider sx={{ my: 2 }} />

            {produkTerlaris.length === 0 ? (
              <Typography
                color="text.secondary"
                sx={{ py: 3 }}
              >
                Belum ada data produk terlaris.
              </Typography>
            ) : (
              <Stack spacing={0}>
                {produkTerlaris
                  .slice(0, 5)
                  .map((item, index) => {
                    const qty =
                      Number(item.qty) || 0;

                    const percentage =
                      totalQtyTerjual > 0
                        ? (qty /
                            totalQtyTerjual) *
                          100
                        : 0;

                    return (
                      <Box
                        key={`${item.nama}-${index}`}
                        sx={{
                          py: 1.5,
                          borderBottom:
                            index <
                            Math.min(
                              produkTerlaris.length,
                              5
                            ) -
                              1
                              ? "1px solid #edf0f4"
                              : "none",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={0.8}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{
                              minWidth: 0,
                            }}
                          >
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                backgroundColor:
                                  index === 0
                                    ? "#d9b52f"
                                    : "#edf2f7",
                                color:
                                  index === 0
                                    ? "#123b73"
                                    : "#536273",
                                display: "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {index + 1}
                            </Box>

                            <Typography
                              fontWeight={
                                index === 0
                                  ? 700
                                  : 500
                              }
                              noWrap
                            >
                              {item.nama}
                            </Typography>
                          </Stack>

                          <Typography
                            fontWeight={800}
                            color="#123b73"
                            sx={{
                              ml: 2,
                              flexShrink: 0,
                            }}
                          >
                            {formatNumber(qty)}
                          </Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={Math.min(
                            percentage,
                            100
                          )}
                          sx={{
                            height: 5,
                            borderRadius: 5,
                          }}
                        />
                      </Box>
                    );
                  })}
              </Stack>
            )}

            {produkTeratas && (
              <Alert
                severity="success"
                icon={<TrendingUp />}
                sx={{ mt: 2 }}
              >
                Produk teratas:{" "}
                <strong>
                  {produkTeratas.nama}
                </strong>{" "}
                dengan{" "}
                <strong>
                  {formatNumber(
                    Number(
                      produkTeratas.qty
                    )
                  )}
                </strong>{" "}
                unit.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* STOK HAMPIR HABIS */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e1e7ef",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color="#123b73"
                >
                  Stok Perlu Perhatian
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Barang yang mendekati atau berada di bawah batas minimum.
                </Typography>
              </Box>

              <WarningAmber color="error" />
            </Stack>

            <Divider sx={{ my: 2 }} />

            {stokHampirHabis.length === 0 ? (
              <Alert severity="success">
                Semua stok dalam kondisi aman.
              </Alert>
            ) : (
              <Stack spacing={0}>
                {stokHampirHabis
                  .slice(0, 5)
                  .map((item, index) => (
                    <Box
                      key={`${item.nama}-${index}`}
                      sx={{
                        py: 1.5,
                        borderBottom:
                          index <
                          Math.min(
                            stokHampirHabis.length,
                            5
                          ) -
                            1
                            ? "1px solid #edf0f4"
                            : "none",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{
                            minWidth: 0,
                          }}
                        >
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              backgroundColor:
                                "#fff0f0",
                              color: "#d32f2f",
                              display: "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {index + 1}
                          </Box>

                          <Typography
                            noWrap
                            sx={{
                              minWidth: 0,
                            }}
                          >
                            {item.nama}
                          </Typography>
                        </Stack>

                        <Chip
                          label={`Stok ${formatNumber(
                            Number(item.stok)
                          )}`}
                          color="error"
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        />
                      </Stack>
                    </Box>
                  ))}
              </Stack>
            )}

            {stokMenipis > 0 && (
              <Alert
                severity="warning"
                icon={<WarningAmber />}
                sx={{ mt: 2 }}
              >
                Terdapat{" "}
                <strong>
                  {formatNumber(
                    stokMenipis
                  )}
                </strong>{" "}
                barang yang perlu diperhatikan.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* ===================================================
          RINGKASAN ANALITIK
      =================================================== */}

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e1e7ef",
          mb: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            mb={2}
          >
            <Assessment color="primary" />

            <Typography
              variant="h6"
              fontWeight={800}
              color="#123b73"
            >
              Ringkasan Analitik
            </Typography>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#f7f9fc",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Aktivitas Penjualan
              </Typography>

              <Typography
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                {formatNumber(
                  totalTransaksi
                )}{" "}
                transaksi
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                dengan penjualan{" "}
                {formatRupiah(
                  penjualan
                )}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#f7f9fc",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Kondisi Persediaan
              </Typography>

              <Typography
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                {formatNumber(
                  stokMenipis
                )}{" "}
                stok menipis
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                dari{" "}
                {formatNumber(
                  totalBarang
                )}{" "}
                barang terdaftar
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#f7f9fc",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Performa Laba
              </Typography>

              <Typography
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                {formatRupiah(
                  labaKotor
                )}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                laba kotor hari ini
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ===================================================
          CATATAN DATA
      =================================================== */}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mt: 2,
          mb: 2,
        }}
      >
        Analytics menggunakan data yang tersedia dari
        backend Dashboard saat ini. Perbandingan tren
        historis akan ditambahkan setelah endpoint data
        periode tersedia.
      </Typography>
    </Box>
  );
}