import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Package,
  RefreshCw,
  RotateCcw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  Truck,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

import laporanService, {
  type LaporanPenjualan,
  type LaporanPembelian,
  type LaporanSummary,
} from "../services/laporanService";

// =========================================================
// TYPE
// =========================================================

interface LaporanReturPenjualan {
  id?: number;
  no_faktur?: string;
  no_transaksi?: string;
  tanggal?: string;
  pelanggan?: string;
  total?: number;
  status?: string;
  [key: string]: unknown;
}

interface LaporanReturPembelian {
  id?: number;
  no_faktur?: string;
  no_transaksi?: string;
  tanggal?: string;
  supplier?: string;
  total?: number;
  status?: string;
  [key: string]: unknown;
}

interface LaporanStok {
  id?: number;
  kategori_id?: number;
  supplier_default?: number;
  harga_beli?: number;
  harga_jual?: number;
  stok?: number;
  kode_barang?: string;
  nama_barang?: string;
  alias_barang?: string;
  satuan?: string;
  stok_minimum?: number;
  lokasi_rak?: string;
  foto?: string | null;
  aktif?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

interface LaporanMutasiStok {
  id?: number;
  tanggal?: string;
  barang_id?: number;
  created_by?: number;
  jenis?: string;
  qty?: number;
  stok_awal?: number;
  stok_akhir?: number;
  referensi?: string | null;
  keterangan?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

interface ProdukTerlaris {
  nama_barang?: string;
  total_terjual?: number;
  [key: string]: unknown;
}

interface LaporanPelanggan {
  nama?: string;
  jumlah_transaksi?: number;
  total_belanja?: number;
  [key: string]: unknown;
}

interface LaporanSupplier {
  nama?: string;
  jumlah_pembelian?: number;
  total_pembelian?: number;
  [key: string]: unknown;
}

interface LabaRugi {
  omzet?: number;
  hpp?: number;
  retur?: number;
  laba_kotor?: number;
  laba_bersih?: number;
  [key: string]: unknown;
}

interface NilaiPersediaan {
  jumlah_barang?: number;
  total_stok?: number;
  nilai_persediaan?: number;
  [key: string]: unknown;
}

// =========================================================
// DOWNLOAD FILE
// =========================================================

async function downloadFile(
  url: string,
  fallbackFilename: string
) {
  let token = localStorage.getItem("access_token");

  if (token) {
    token = token.replace(/^Bearer\s+/i, "").trim();
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Export gagal (${response.status}): ${text.slice(0, 300)}`
    );
  }

  const blob = await response.blob();

  let filename = fallbackFilename;

  const disposition =
    response.headers.get("content-disposition");

  if (disposition) {
    const match =
      disposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      );

    if (match?.[1]) {
      filename = match[1].replace(/['"]/g, "");
    }
  }

  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);
}

// =========================================================
// HELPERS
// =========================================================

function formatRupiah(
  value: number | string | null | undefined
) {
  const amount = Number(value ?? 0);

  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatTanggal(
  value: string | null | undefined
) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatNumber(
  value: number | string | null | undefined
) {
  return Number(value ?? 0).toLocaleString("id-ID");
}

function normalizeArray<T>(data: any): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

function normalizeSummary(
  data: any
): LaporanSummary {
  if (!data) {
    return {
      total_penjualan: 0,
      total_pembelian: 0,
      laba: 0,
      jumlah_transaksi: 0,
    };
  }

  const dashboard = data.dashboard ?? data;
  const profitLoss = data.profit_loss ?? {};

  return {
    total_penjualan: Number(
      dashboard.total_penjualan ?? 0
    ),

    total_pembelian: Number(
      dashboard.total_pembelian ?? 0
    ),

    laba: Number(
      dashboard.laba ??
        profitLoss.laba ??
        profitLoss.laba_bersih ??
        profitLoss.net_profit ??
        0
    ),

    jumlah_transaksi: Number(
      dashboard.jumlah_transaksi ??
        dashboard.total_transaksi ??
        0
    ),
  };
}

// =========================================================
// CARD SUMMARY
// =========================================================

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBackground: string;
  valueColor?: string;
}

function SummaryCard({
  title,
  value,
  icon,
  iconBackground,
  valueColor = "#0b2a5b",
}: SummaryCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              sx={{
                color: "#64748b",
                fontSize: 13,
                mb: 0.7,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                color: valueColor,
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              backgroundColor: iconBackground,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// =========================================================
// SECTION
// =========================================================

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function ReportSection({
  title,
  icon,
  children,
}: SectionProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: 3,
        mb: 2.5,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: "#0b2a5b",
            }}
          >
            {icon}
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#0b2a5b",
              fontSize: 18,
            }}
          >
            {title}
          </Typography>
        </Stack>

        {children}
      </CardContent>
    </Card>
  );
}

// =========================================================
// EMPTY TABLE
// =========================================================

function EmptyRow({
  colSpan,
  text = "Belum ada data.",
}: {
  colSpan: number;
  text?: string;
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        align="center"
        sx={{
          py: 4,
          color: "#64748b",
        }}
      >
        {text}
      </TableCell>
    </TableRow>
  );
}

// =========================================================
// TABLE STYLE
// =========================================================

const tableHeadSx = {
  fontWeight: 700,
  color: "#334155",
  backgroundColor: "#f8fafc",
  whiteSpace: "nowrap",
};

const tableContainerSx = {
  border: "1px solid #e2e8f0",
  borderRadius: 2,
  overflowX: "auto",
};

// =========================================================
// COMPONENT
// =========================================================

export default function Laporan() {
  // -------------------------------------------------------
  // DATE
  // -------------------------------------------------------

  const today = new Date();

  const firstDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const toInputDate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // -------------------------------------------------------
  // STATE
  // -------------------------------------------------------

  const [tanggalMulai, setTanggalMulai] =
    useState(toInputDate(firstDay));

  const [tanggalAkhir, setTanggalAkhir] =
    useState(toInputDate(today));

  const [summary, setSummary] =
    useState<LaporanSummary | null>(null);

  const [penjualan, setPenjualan] =
    useState<LaporanPenjualan[]>([]);

  const [pembelian, setPembelian] =
    useState<LaporanPembelian[]>([]);

  const [returPenjualan, setReturPenjualan] =
    useState<LaporanReturPenjualan[]>([]);

  const [returPembelian, setReturPembelian] =
    useState<LaporanReturPembelian[]>([]);

  const [stok, setStok] =
    useState<LaporanStok[]>([]);

  const [mutasiStok, setMutasiStok] =
    useState<LaporanMutasiStok[]>([]);

  const [produkTerlaris, setProdukTerlaris] =
    useState<ProdukTerlaris[]>([]);

  const [pelanggan, setPelanggan] =
    useState<LaporanPelanggan[]>([]);

  const [supplier, setSupplier] =
    useState<LaporanSupplier[]>([]);

  const [labaRugi, setLabaRugi] =
    useState<LabaRugi | null>(null);

  const [nilaiPersediaan, setNilaiPersediaan] =
    useState<NilaiPersediaan | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [exporting, setExporting] =
    useState<"pdf" | "excel" | null>(null);

  const [error, setError] =
    useState("");

  // =======================================================
  // LOAD SEMUA LAPORAN
  // =======================================================

  const loadLaporan = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        laporanService.getSummary(),
        laporanService.getPenjualan(),
        laporanService.getPembelian(),
        laporanService.getReturPenjualan(),
        laporanService.getReturPembelian(),
        laporanService.getStok(),
        laporanService.getMutasiStok(),
        laporanService.getProdukTerlaris(10),
        laporanService.getPelanggan(),
        laporanService.getSupplier(),
        laporanService.getLabaRugi(),
        laporanService.getNilaiPersediaan(),
      ]);

      // -----------------------------------------------------
      // SUMMARY
      // -----------------------------------------------------

      if (results[0].status === "fulfilled") {
        setSummary(
          normalizeSummary(results[0].value)
        );
      }

      // -----------------------------------------------------
      // PENJUALAN
      // -----------------------------------------------------

      if (results[1].status === "fulfilled") {
        setPenjualan(
          normalizeArray<LaporanPenjualan>(
            results[1].value
          )
        );
      }

      // -----------------------------------------------------
      // PEMBELIAN
      // -----------------------------------------------------

      if (results[2].status === "fulfilled") {
        setPembelian(
          normalizeArray<LaporanPembelian>(
            results[2].value
          )
        );
      }

      // -----------------------------------------------------
      // RETUR PENJUALAN
      // -----------------------------------------------------

      if (results[3].status === "fulfilled") {
        setReturPenjualan(
          normalizeArray<LaporanReturPenjualan>(
            results[3].value
          )
        );
      }

      // -----------------------------------------------------
      // RETUR PEMBELIAN
      // -----------------------------------------------------

      if (results[4].status === "fulfilled") {
        setReturPembelian(
          normalizeArray<LaporanReturPembelian>(
            results[4].value
          )
        );
      }

      // -----------------------------------------------------
      // STOK
      // -----------------------------------------------------

      if (results[5].status === "fulfilled") {
        setStok(
          normalizeArray<LaporanStok>(
            results[5].value
          )
        );
      }

      // -----------------------------------------------------
      // MUTASI STOK
      // -----------------------------------------------------

      if (results[6].status === "fulfilled") {
        setMutasiStok(
          normalizeArray<LaporanMutasiStok>(
            results[6].value
          )
        );
      }

      // -----------------------------------------------------
      // PRODUK TERLARIS
      // -----------------------------------------------------

      if (results[7].status === "fulfilled") {
        setProdukTerlaris(
          normalizeArray<ProdukTerlaris>(
            results[7].value
          )
        );
      }

      // -----------------------------------------------------
      // PELANGGAN
      // -----------------------------------------------------

      if (results[8].status === "fulfilled") {
        setPelanggan(
          normalizeArray<LaporanPelanggan>(
            results[8].value
          )
        );
      }

      // -----------------------------------------------------
      // SUPPLIER
      // -----------------------------------------------------

      if (results[9].status === "fulfilled") {
        setSupplier(
          normalizeArray<LaporanSupplier>(
            results[9].value
          )
        );
      }

      // -----------------------------------------------------
      // LABA RUGI
      // -----------------------------------------------------

      if (results[10].status === "fulfilled") {
        setLabaRugi(
          results[10].value as LabaRugi
        );
      }

      // -----------------------------------------------------
      // NILAI PERSEDIAAN
      // -----------------------------------------------------

      if (results[11].status === "fulfilled") {
        setNilaiPersediaan(
          results[11].value as NilaiPersediaan
        );
      }

      // -----------------------------------------------------
      // CEK ERROR
      // -----------------------------------------------------

      const failedCount =
        results.filter(
          (item) => item.status === "rejected"
        ).length;

      if (failedCount > 0) {
        setError(
          `${failedCount} bagian laporan gagal dimuat. Silakan tekan Refresh.`
        );
      }
    } catch (err) {
      console.error(
        "Gagal memuat laporan:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat data laporan."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadLaporan();
  }, [loadLaporan]);

  // =======================================================
  // FILTER PENJUALAN
  // =======================================================

  const handleFilter = async () => {
    try {
      setLoading(true);
      setError("");

      const result =
        await laporanService.filterPenjualan({
          tanggal_awal: tanggalMulai,
          tanggal_akhir: tanggalAkhir,
          page: 1,
          limit: 100,
          sort_by: "created_at",
          sort_order: "DESC",
        });

      const items =
        (
          result as {
            items?: LaporanPenjualan[];
          }
        )?.items ?? [];

      setPenjualan(
        Array.isArray(items)
          ? items
          : []
      );
    } catch (err) {
      console.error(
        "Gagal memfilter penjualan:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal memfilter penjualan."
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // RESET
  // =======================================================

  const handleReset = () => {
    setTanggalMulai(
      toInputDate(firstDay)
    );

    setTanggalAkhir(
      toInputDate(today)
    );

    loadLaporan();
  };

  // =======================================================
  // EXPORT PDF
  // =======================================================

  const handleExportPdf = async () => {
    try {
      setExporting("pdf");
      setError("");

      await downloadFile(
        laporanService.getPenjualanPdfUrl(),
        "laporan_penjualan.pdf"
      );
    } catch (err) {
      console.error(
        "Export PDF gagal:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Export PDF gagal."
      );
    } finally {
      setExporting(null);
    }
  };

  // =======================================================
  // EXPORT EXCEL
  // =======================================================

  const handleExportExcel = async () => {
    try {
      setExporting("excel");
      setError("");

      await downloadFile(
        laporanService.getPenjualanExcelUrl(),
        "laporan_penjualan.xlsx"
      );
    } catch (err) {
      console.error(
        "Export Excel gagal:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Export Excel gagal."
      );
    } finally {
      setExporting(null);
    }
  };

  // =======================================================
  // SUMMARY
  // =======================================================

  const summaryData =
    normalizeSummary(summary);

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
        maxWidth: 1600,
        mx: "auto",
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#0b2a5b",
            fontSize: {
              xs: 26,
              md: 32,
            },
          }}
        >
          Laporan
        </Typography>

        <Typography
          sx={{
            color: "#64748b",
            mt: 0.5,
          }}
        >
          Ringkasan transaksi dan kondisi usaha KASE AI.
        </Typography>
      </Box>

      {/* ===================================================
          FILTER + EXPORT
      =================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent>
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "stretch",
              md: "center",
            }}
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#0b2a5b",
                  mb: 0.5,
                }}
              >
                Periode Penjualan
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                Filter tanggal saat ini diterapkan pada
                laporan penjualan.
              </Typography>
            </Box>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
            >
              <TextField
                size="small"
                label="Mulai"
                type="date"
                value={tanggalMulai}
                onChange={(event) =>
                  setTanggalMulai(
                    event.target.value
                  )
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                size="small"
                label="Akhir"
                type="date"
                value={tanggalAkhir}
                onChange={(event) =>
                  setTanggalAkhir(
                    event.target.value
                  )
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <Button
                variant="contained"
                startIcon={
                  <BarChart3 size={17} />
                }
                onClick={handleFilter}
                disabled={loading}
                sx={{
                  backgroundColor: "#0b2a5b",
                  minHeight: 40,
                  "&:hover": {
                    backgroundColor: "#071d42",
                  },
                }}
              >
                Tampilkan
              </Button>

              <Button
                variant="outlined"
                startIcon={
                  <RefreshCw size={17} />
                }
                onClick={handleReset}
                disabled={loading}
                sx={{
                  minHeight: 40,
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
            sx={{ mt: 2 }}
          >
            <Button
              variant="outlined"
              startIcon={
                exporting === "pdf" ? (
                  <CircularProgress size={16} />
                ) : (
                  <FileText size={17} />
                )
              }
              onClick={handleExportPdf}
              disabled={
                exporting !== null
              }
              sx={{
                textTransform: "none",
              }}
            >
              Export PDF
            </Button>

            <Button
              variant="outlined"
              startIcon={
                exporting === "excel" ? (
                  <CircularProgress size={16} />
                ) : (
                  <FileSpreadsheet size={17} />
                )
              }
              onClick={handleExportExcel}
              disabled={
                exporting !== null
              }
              sx={{
                textTransform: "none",
              }}
            >
              Export Excel
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* ===================================================
          LOADING
      =================================================== */}

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 5,
          }}
        >
          <Stack
            alignItems="center"
            spacing={1}
          >
            <CircularProgress />

            <Typography
              sx={{
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Memuat laporan...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* ===================================================
          CONTENT
      =================================================== */}

      {!loading && (
        <>
          {/* =================================================
              SUMMARY
          ================================================= */}

          <Grid
            container
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <SummaryCard
                title="Total Penjualan"
                value={formatRupiah(
                  summaryData.total_penjualan
                )}
                icon={
                  <TrendingUp size={20} />
                }
                iconBackground="#22c55e"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <SummaryCard
                title="Total Pembelian"
                value={formatRupiah(
                  summaryData.total_pembelian
                )}
                icon={
                  <ShoppingCart size={20} />
                }
                iconBackground="#3b82f6"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <SummaryCard
                title="Laba Bersih"
                value={formatRupiah(
                  summaryData.laba
                )}
                icon={
                  summaryData.laba >= 0 ? (
                    <TrendingUp size={20} />
                  ) : (
                    <TrendingDown size={20} />
                  )
                }
                iconBackground={
                  summaryData.laba >= 0
                    ? "#16a34a"
                    : "#dc2626"
                }
                valueColor={
                  summaryData.laba >= 0
                    ? "#16a34a"
                    : "#dc2626"
                }
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <SummaryCard
                title="Jumlah Transaksi"
                value={formatNumber(
                  summaryData.jumlah_transaksi
                )}
                icon={
                  <BarChart3 size={20} />
                }
                iconBackground="#8b5cf6"
              />
            </Grid>
          </Grid>

          {/* =================================================
              NILAI PERSEDIAAN
          ================================================= */}

          <Grid
            container
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <SummaryCard
                title="Jumlah Barang"
                value={formatNumber(
                  nilaiPersediaan?.jumlah_barang
                )}
                icon={
                  <Package size={20} />
                }
                iconBackground="#0ea5e9"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <SummaryCard
                title="Total Stok"
                value={formatNumber(
                  nilaiPersediaan?.total_stok
                )}
                icon={
                  <ArrowUpFromLine
                    size={20}
                  />
                }
                iconBackground="#14b8a6"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <SummaryCard
                title="Nilai Persediaan"
                value={formatRupiah(
                  nilaiPersediaan?.nilai_persediaan
                )}
                icon={
                  <Wallet size={20} />
                }
                iconBackground="#f59e0b"
              />
            </Grid>
          </Grid>

          {/* =================================================
              PENJUALAN
          ================================================= */}

          <ReportSection
            title="Penjualan"
            icon={
              <TrendingUp size={20} />
            }
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={tableContainerSx}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeadSx}>
                      No
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      No Transaksi
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Tanggal
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Pelanggan
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Total
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {penjualan.length > 0 ? (
                    penjualan.map(
                      (item, index) => (
                        <TableRow
                          key={
                            item.id ??
                            index
                          }
                          hover
                        >
                          <TableCell>
                            {index + 1}
                          </TableCell>

                          <TableCell>
                            {item.no_transaksi ??
                              "-"}
                          </TableCell>

                          <TableCell>
                            {formatTanggal(
                              item.tanggal
                            )}
                          </TableCell>

                          <TableCell>
                            {item.pelanggan ??
                              "-"}
                          </TableCell>

                          <TableCell align="right">
                            {formatRupiah(
                              item.total
                            )}
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                item.status ??
                                "Selesai"
                              }
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <EmptyRow
                      colSpan={6}
                      text="Belum ada data penjualan."
                    />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ReportSection>

          {/* =================================================
              PEMBELIAN
          ================================================= */}

          <ReportSection
            title="Pembelian"
            icon={
              <ShoppingCart size={20} />
            }
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={tableContainerSx}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeadSx}>
                      No
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      No Faktur
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Tanggal
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Supplier
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Total
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pembelian.length > 0 ? (
                    pembelian.map(
                      (item, index) => (
                        <TableRow
                          key={
                            item.id ??
                            index
                          }
                          hover
                        >
                          <TableCell>
                            {index + 1}
                          </TableCell>

                          <TableCell>
                            {item.no_faktur ??
                              item.no_transaksi ??
                              "-"}
                          </TableCell>

                          <TableCell>
                            {formatTanggal(
                              item.tanggal
                            )}
                          </TableCell>

                          <TableCell>
                            {item.supplier ??
                              "-"}
                          </TableCell>

                          <TableCell align="right">
                            {formatRupiah(
                              item.total
                            )}
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                item.status ??
                                "Selesai"
                              }
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <EmptyRow
                      colSpan={6}
                      text="Belum ada data pembelian."
                    />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ReportSection>

          {/* =================================================
              RETUR PENJUALAN
          ================================================= */}

          <ReportSection
            title="Retur Penjualan"
            icon={
              <RotateCcw size={20} />
            }
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={tableContainerSx}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeadSx}>
                      No
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      No Faktur
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Tanggal
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Pelanggan
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Total
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {returPenjualan.length > 0 ? (
                    returPenjualan.map(
                      (item, index) => (
                        <TableRow
                          key={
                            item.id ??
                            index
                          }
                          hover
                        >
                          <TableCell>
                            {index + 1}
                          </TableCell>

                          <TableCell>
                            {item.no_faktur ??
                              item.no_transaksi ??
                              "-"}
                          </TableCell>

                          <TableCell>
                            {formatTanggal(
                              item.tanggal
                            )}
                          </TableCell>

                          <TableCell>
                            {item.pelanggan ??
                              "-"}
                          </TableCell>

                          <TableCell align="right">
                            {formatRupiah(
                              item.total
                            )}
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                item.status ??
                                "Selesai"
                              }
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <EmptyRow
                      colSpan={6}
                      text="Belum ada data retur penjualan."
                    />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ReportSection>

          {/* =================================================
              RETUR PEMBELIAN
          ================================================= */}

          <ReportSection
            title="Retur Pembelian"
            icon={
              <RotateCcw size={20} />
            }
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={tableContainerSx}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeadSx}>
                      No
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      No Faktur
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Tanggal
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Supplier
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Total
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {returPembelian.length > 0 ? (
                    returPembelian.map(
                      (item, index) => (
                        <TableRow
                          key={
                            item.id ??
                            index
                          }
                          hover
                        >
                          <TableCell>
                            {index + 1}
                          </TableCell>

                          <TableCell>
                            {item.no_faktur ??
                              item.no_transaksi ??
                              "-"}
                          </TableCell>

                          <TableCell>
                            {formatTanggal(
                              item.tanggal
                            )}
                          </TableCell>

                          <TableCell>
                            {item.supplier ??
                              "-"}
                          </TableCell>

                          <TableCell align="right">
                            {formatRupiah(
                              item.total
                            )}
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                item.status ??
                                "Selesai"
                              }
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <EmptyRow
                      colSpan={6}
                      text="Belum ada data retur pembelian."
                    />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ReportSection>

          {/* =================================================
              STOK
          ================================================= */}

          <ReportSection
            title="Stok Barang"
            icon={
              <Package size={20} />
            }
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={tableContainerSx}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeadSx}>
                      No
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Kode
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Nama Barang
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Stok
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Minimum
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Satuan
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Lokasi
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {stok.length > 0 ? (
                    stok.map(
                      (item, index) => {
                        const jumlahStok =
                          Number(
                            item.stok ?? 0
                          );

                        const minimum =
                          Number(
                            item.stok_minimum ??
                              0
                          );

                        let statusLabel =
                          "Aman";

                        let statusColor:
                          | "success"
                          | "warning"
                          | "error" =
                          "success";

                        if (
                          jumlahStok <
                          minimum
                        ) {
                          statusLabel =
                            "Stok Rendah";
                          statusColor =
                            "error";
                        } else if (
                          jumlahStok ===
                          minimum
                        ) {
                          statusLabel =
                            "Minimum";
                          statusColor =
                            "warning";
                        }

                        return (
                          <TableRow
                            key={
                              item.id ??
                              index
                            }
                            hover
                          >
                            <TableCell>
                              {index + 1}
                            </TableCell>

                            <TableCell>
                              {item.kode_barang ??
                                "-"}
                            </TableCell>

                            <TableCell>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                }}
                              >
                                {item.nama_barang ??
                                  "-"}
                              </Typography>
                            </TableCell>

                            <TableCell align="right">
                              {formatNumber(
                                jumlahStok
                              )}
                            </TableCell>

                            <TableCell align="right">
                              {formatNumber(
                                minimum
                              )}
                            </TableCell>

                            <TableCell>
                              {item.satuan ??
                                "-"}
                            </TableCell>

                            <TableCell>
                              {item.lokasi_rak ??
                                "-"}
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                color={
                                  statusColor
                                }
                                label={
                                  statusLabel
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )
                  ) : (
                    <EmptyRow
                      colSpan={8}
                      text="Belum ada data stok."
                    />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ReportSection>

          {/* =================================================
              MUTASI STOK
          ================================================= */}

          <ReportSection
            title="Mutasi Stok"
            icon={
              <RefreshCw size={20} />
            }
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={tableContainerSx}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeadSx}>
                      No
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Tanggal
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Barang ID
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Jenis
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Qty
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Stok Awal
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Stok Akhir
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Referensi
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Keterangan
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {mutasiStok.length > 0 ? (
                    mutasiStok.map(
                      (item, index) => {
                        const qty =
                          Number(
                            item.qty ?? 0
                          );

                        return (
                          <TableRow
                            key={
                              item.id ??
                              index
                            }
                            hover
                          >
                            <TableCell>
                              {index + 1}
                            </TableCell>

                            <TableCell>
                              {formatTanggal(
                                item.tanggal
                              )}
                            </TableCell>

                            <TableCell>
                              {item.barang_id ??
                                "-"}
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                variant="outlined"
                                label={
                                  item.jenis ??
                                  "-"
                                }
                              />
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              <Stack
                                direction="row"
                                spacing={0.5}
                                justifyContent="flex-end"
                                alignItems="center"
                              >
                                {qty >= 0 ? (
                                  <ArrowUpFromLine
                                    size={15}
                                  />
                                ) : (
                                  <ArrowDownToLine
                                    size={15}
                                  />
                                )}

                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    color:
                                      qty >=
                                      0
                                        ? "#16a34a"
                                        : "#dc2626",
                                  }}
                                >
                                  {qty > 0
                                    ? `+${formatNumber(
                                        qty
                                      )}`
                                    : formatNumber(
                                        qty
                                      )}
                                </Typography>
                              </Stack>
                            </TableCell>

                            <TableCell align="right">
                              {formatNumber(
                                item.stok_awal
                              )}
                            </TableCell>

                            <TableCell align="right">
                              {formatNumber(
                                item.stok_akhir
                              )}
                            </TableCell>

                            <TableCell>
                              {item.referensi ??
                                "-"}
                            </TableCell>

                            <TableCell>
                              {item.keterangan ??
                                "-"}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )
                  ) : (
                    <EmptyRow
                      colSpan={9}
                      text="Belum ada data mutasi stok."
                    />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ReportSection>

          {/* =================================================
              PRODUK TERLARIS
          ================================================= */}

          <ReportSection
            title="Produk Terlaris"
            icon={
              <BarChart3 size={20} />
            }
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={tableContainerSx}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeadSx}>
                      Peringkat
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Nama Barang
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Total Terjual
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {produkTerlaris.length > 0 ? (
                    produkTerlaris.map(
                      (item, index) => (
                        <TableRow
                          key={index}
                          hover
                        >
                          <TableCell>
                            <Chip
                              size="small"
                              label={`#${index + 1}`}
                              color={
                                index === 0
                                  ? "primary"
                                  : "default"
                              }
                            />
                          </TableCell>

                          <TableCell>
                            {item.nama_barang ??
                              "-"}
                          </TableCell>

                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: 700,
                              }}
                            >
                              {formatNumber(
                                item.total_terjual
                              )}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <EmptyRow
                      colSpan={3}
                      text="Belum ada data produk terlaris."
                    />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ReportSection>

          {/* =================================================
              PELANGGAN
          ================================================= */}

          <ReportSection
            title="Pelanggan"
            icon={
              <Users size={20} />
            }
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={tableContainerSx}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeadSx}>
                      No
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Nama Pelanggan
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Jumlah Transaksi
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Total Belanja
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pelanggan.length > 0 ? (
                    pelanggan.map(
                      (item, index) => (
                        <TableRow
                          key={index}
                          hover
                        >
                          <TableCell>
                            {index + 1}
                          </TableCell>

                          <TableCell>
                            {item.nama ??
                              "-"}
                          </TableCell>

                          <TableCell align="right">
                            {formatNumber(
                              item.jumlah_transaksi
                            )}
                          </TableCell>

                          <TableCell align="right">
                            {formatRupiah(
                              item.total_belanja
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <EmptyRow
                      colSpan={4}
                      text="Belum ada data pelanggan."
                    />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ReportSection>

          {/* =================================================
              SUPPLIER
          ================================================= */}

          <ReportSection
            title="Supplier"
            icon={
              <Truck size={20} />
            }
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={tableContainerSx}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeadSx}>
                      No
                    </TableCell>

                    <TableCell sx={tableHeadSx}>
                      Nama Supplier
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Jumlah Pembelian
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={tableHeadSx}
                    >
                      Total Pembelian
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {supplier.length > 0 ? (
                    supplier.map(
                      (item, index) => (
                        <TableRow
                          key={index}
                          hover
                        >
                          <TableCell>
                            {index + 1}
                          </TableCell>

                          <TableCell>
                            {item.nama ??
                              "-"}
                          </TableCell>

                          <TableCell align="right">
                            {formatNumber(
                              item.jumlah_pembelian
                            )}
                          </TableCell>

                          <TableCell align="right">
                            {formatRupiah(
                              item.total_pembelian
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <EmptyRow
                      colSpan={4}
                      text="Belum ada data supplier."
                    />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ReportSection>

          {/* =================================================
              LABA RUGI
          ================================================= */}

          <ReportSection
            title="Laba Rugi"
            icon={
              <Wallet size={20} />
            }
          >
            <Grid
              container
              spacing={2}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: 13,
                      }}
                    >
                      Omzet
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontWeight: 800,
                        color: "#0b2a5b",
                      }}
                    >
                      {formatRupiah(
                        labaRugi?.omzet
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: 13,
                      }}
                    >
                      HPP
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontWeight: 800,
                        color: "#dc2626",
                      }}
                    >
                      {formatRupiah(
                        labaRugi?.hpp
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: 13,
                      }}
                    >
                      Retur
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontWeight: 800,
                        color: "#f59e0b",
                      }}
                    >
                      {formatRupiah(
                        labaRugi?.retur
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: 13,
                      }}
                    >
                      Laba Bersih
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontWeight: 800,
                        color:
                          Number(
                            labaRugi?.laba_bersih ??
                              0
                          ) >= 0
                            ? "#16a34a"
                            : "#dc2626",
                      }}
                    >
                      {formatRupiah(
                        labaRugi?.laba_bersih
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "#f8fafc",
                borderRadius: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                {Number(
                  labaRugi?.laba_kotor ?? 0
                ) >= 0 ? (
                  <TrendingUp
                    size={18}
                  />
                ) : (
                  <TrendingDown
                    size={18}
                  />
                )}

                <Typography
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Laba Kotor:
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 800,
                    color:
                      Number(
                        labaRugi?.laba_kotor ??
                          0
                      ) >= 0
                        ? "#16a34a"
                        : "#dc2626",
                  }}
                >
                  {formatRupiah(
                    labaRugi?.laba_kotor
                  )}
                </Typography>
              </Stack>
            </Box>
          </ReportSection>
        </>
      )}
    </Box>
  );
}