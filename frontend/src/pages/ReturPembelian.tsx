import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import PaymentsIcon from "@mui/icons-material/Payments";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";

import CariFakturPembelianDialog from "../components/returPembelian/CariFakturPembelianDialog";
import CariBarangReturPembelianDialog from "../components/returPembelian/CariBarangReturPembelianDialog";

import { useReturPembelian } from "../hooks/useReturPembelian";

import type {
  ReturPembelianCreate,
  KondisiRetur,
} from "../types/returPembelian";

import type { Pembelian } from "../types/pembelian";

import { usePermissions } from "../hooks/usePermissions";

/* =========================================================
   TYPE BARANG
========================================================= */

type BarangModel = {
  barang_id: number;
  kode_barang: string;
  nama_barang: string;
  qty_beli: number;
  qty_retur: number;
  harga: number;
};

/* =========================================================
   TYPE ITEM RETUR
========================================================= */

type ReturItem = {
  barang: BarangModel;
  qty: number;
  harga: number;
  kondisi: KondisiRetur;
};

/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(value: number): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}
/* =========================================================
   PAGE
========================================================= */

export default function ReturPembelian() {

  // =====================================
  // PERMISSION
  // =====================================

  const {
    hasPermission,
    loading: permissionLoading,
  } = usePermissions();

  const canView =
    !permissionLoading &&
    hasPermission("retur_pembelian.view");

  const canCreate =
    !permissionLoading &&
    hasPermission("retur_pembelian.create");

  const canUpdate =
    !permissionLoading &&
    hasPermission("retur_pembelian.update");

  const canDelete =
    !permissionLoading &&
    hasPermission("retur_pembelian.delete");

  const canApprove =
    !permissionLoading &&
    hasPermission("retur_pembelian.approve");

  const canReject =
    !permissionLoading &&
    hasPermission("retur_pembelian.reject");
  /* =======================================================
     RETUR PEMBELIAN HOOK
  ======================================================= */

  const {
    create,
    loading,
    loadData,
    data,
    total,
    approve,
    reject,
  } = useReturPembelian();


  /* =======================================================
     STATE
  ======================================================= */

  const [faktur, setFaktur] =
    useState<Pembelian | null>(null);

  const [daftarRetur, setDaftarRetur] =
    useState<ReturItem[]>([]);

  const [bukaDialogFaktur, setBukaDialogFaktur] =
    useState(false);

  const [bukaDialogBarang, setBukaDialogBarang] =
    useState(false);

  const [catatan, setCatatan] =
    useState("");

  const [error, setError] =
    useState("");

  const [returDipilih, setReturDipilih] =
    useState<number | null>(null);

  const [bukaDialogReject, setBukaDialogReject] =
    useState(false);

  const [alasanReject, setAlasanReject] =
    useState("");

  const handleApprove = useCallback(
    async (id: number) => {
      if (permissionLoading || !canApprove) {
       return;
      }

    try {
      await approve(id);
    } catch (error) {
        console.error(
         "Gagal menyetujui retur pembelian:",
          error
        );
      }
    },
    
    [
      approve,
      canApprove,
      permissionLoading,
    ]
  );

  /* =======================================================
     GRAND TOTAL
  ======================================================= */

  const grandTotal = useMemo(() => {
    return daftarRetur.reduce(
      (hasil, item) =>
        hasil + item.qty * item.harga,
      0
    );
  }, [daftarRetur]);

  /* =======================================================
     TOTAL QTY
  ======================================================= */

  const totalQty = useMemo(() => {
    return daftarRetur.reduce(
      (hasil, item) =>
        hasil + item.qty,
      0
    );
  }, [daftarRetur]);

  /* =======================================================
     PILIH FAKTUR
  ======================================================= */

  const pilihFaktur = useCallback(
    (data: Pembelian) => {

      setFaktur(data);

      setDaftarRetur([]);

      setError("");

      setBukaDialogFaktur(false);
    },
    []
  );

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = useCallback(() => {

    setFaktur(null);

    setDaftarRetur([]);

    setCatatan("");

    setError("");

  }, []);

  /* =======================================================
     PILIH BARANG
  ======================================================= */

  const pilihBarang = useCallback(
    (barang: BarangModel) => {

      const sudahAda =
        daftarRetur.some(
          (item) =>
            item.barang.barang_id ===
            barang.barang_id
        );

      if (sudahAda) {

        setError(
          "Barang tersebut sudah ditambahkan ke retur."
        );

        return;
      }

      setDaftarRetur((old) => [
        ...old,
        {
          barang,
          qty: 1,
          harga: barang.harga,
          kondisi: "BAIK",
        },
      ]);

      setError("");

      setBukaDialogBarang(false);
    },
    [daftarRetur]
  );

  /* =======================================================
     HAPUS BARANG
  ======================================================= */

  const hapusBarang = useCallback(
    (barangId: number) => {

      setDaftarRetur((old) =>
        old.filter(
          (item) =>
            item.barang.barang_id !==
            barangId
        )
      );

      setError("");

    },
    []
  );

  /* =======================================================
     HITUNG SUBTOTAL
  ======================================================= */

  const hitungSubtotal = useCallback(
    (item: ReturItem): number => {
      return item.qty * item.harga;
    },
    []
  );

  /* =======================================================
     UBAH QTY
  ======================================================= */

  const ubahQty = useCallback(
    (
      barangId: number,
      qty: number
    ) => {

      if (!Number.isFinite(qty)) {
        return;
      }

      setDaftarRetur((prev) =>
        prev.map((item) => {

          if (
            item.barang.barang_id !==
            barangId
          ) {
            return item;
          }

          const maksimal =
            item.barang.qty_beli;

          if (qty < 1) {
            return item;
          }

          if (qty > maksimal) {
            setError(
              `Qty retur tidak boleh lebih dari Qty Beli (${maksimal}).`
            );

            return item;
          }

          setError("");

          return {
            ...item,
            qty,
          };
        })
      );
    },
    []
  );

  /* =======================================================
     UBAH HARGA
  ======================================================= */

  const ubahHarga = useCallback(
    (
      barangId: number,
      harga: number
    ) => {

      if (
        !Number.isFinite(harga) ||
        harga <= 0
      ) {
        return;
      }

      setDaftarRetur((prev) =>
        prev.map((item) =>
          item.barang.barang_id ===
          barangId
            ? {
                ...item,
                harga,
              }
            : item
        )
      );
    },
    []
  );

  /* =======================================================
     UBAH KONDISI
  ======================================================= */

  const ubahKondisi = useCallback(
    (
      barangId: number,
      kondisi: KondisiRetur
    ) => {

      setDaftarRetur((prev) =>
        prev.map((item) =>
          item.barang.barang_id ===
          barangId
            ? {
                ...item,
                kondisi,
              }
            : item
        )
      );
    },
    []
  );

  /* =======================================================
     SIMPAN RETUR
  ======================================================= */

  const simpanRetur = async (): Promise<void> => {

    setError("");

    if (permissionLoading || !canCreate) {
      setError(
        "Anda tidak memiliki izin untuk membuat Retur Pembelian."
      );
      return;
    }

    /* -----------------------------------------------------
       VALIDASI FAKTUR
    ----------------------------------------------------- */

    if (!faktur) {

      setError(
        "Pilih faktur pembelian terlebih dahulu."
      );

      return;
    }

    /* -----------------------------------------------------
       VALIDASI BARANG
    ----------------------------------------------------- */

    if (
      daftarRetur.length === 0
    ) {

      setError(
        "Belum ada barang yang dipilih untuk diretur."
      );

      return;
    }

    /* -----------------------------------------------------
       VALIDASI QTY DAN HARGA
    ----------------------------------------------------- */

    for (const item of daftarRetur) {

      if (
        item.qty < 1
      ) {

        setError(
          `Qty retur untuk ${item.barang.nama_barang} harus lebih dari 0.`
        );

        return;
      }

      if (
        item.qty >
        item.barang.qty_beli
      ) {

        setError(
          `Qty retur ${item.barang.nama_barang} melebihi Qty Beli.`
        );

        return;
      }

      if (
        item.harga <= 0
      ) {

        setError(
          `Harga ${item.barang.nama_barang} harus lebih dari 0.`
        );

        return;
      }

      if (
        item.kondisi !== "BAIK" &&
        item.kondisi !== "RUSAK"
      ) {

        setError(
          `Kondisi ${item.barang.nama_barang} tidak valid.`
        );

        return;
      }
    }

    /* -----------------------------------------------------
       PAYLOAD
    ----------------------------------------------------- */

    const payload: ReturPembelianCreate = {

      pembelian_id:
        faktur.id,

      supplier_id:
        faktur.supplier_id,

      created_by: 1,

      alasan:
        catatan.trim() || undefined,

      jenis_refund:
        "CASH",

      detail:
        daftarRetur.map(
          (item) => ({
            barang_id:
              item.barang.barang_id,

            qty:
              item.qty,

            harga:
              item.harga,

            kondisi:
              item.kondisi,
          })
        ),
    };

    /* -----------------------------------------------------
       SIMPAN
    ----------------------------------------------------- */

    try {

      await create(payload);

      await loadData();

      resetForm();

      alert(
        "Retur pembelian berhasil disimpan."
      );

    } catch (err) {

      console.error(
        "Gagal menyimpan retur pembelian:",
        err
      );

      setError(
        "Gagal menyimpan retur pembelian. Periksa kembali data atau koneksi backend."
      );
    }
  };

    if (permissionLoading) {
      return (
        <Box sx={{ p: 3 }}>
        <Typography>
        Memuat hak akses...
        </Typography>
        </Box>
      );
    }

    if (!canView) {
      return (
        <Box sx={{ p: 3 }}>
        <Alert severity="error">
        Anda tidak memiliki izin untuk melihat Retur Pembelian.
        </Alert>
        </Box>
      );
    }

    if (!canCreate) {
      return (
        <Box sx={{ p: 3 }}>
        <Alert severity="info">
        Anda memiliki akses untuk melihat Retur Pembelian,
        tetapi tidak memiliki izin untuk membuat retur.
          </Alert>
          </Box>
      );
    }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor: "#f4f7fb",
        px: {
          xs: 2,
          md: 4,
        },
        py: 4,
      }}
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          md: "center",
        }}
        spacing={2}
        mb={3}
      >

        <Box>

          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
          >

            <AssignmentReturnIcon
              sx={{
                fontSize: 38,
                color: "#123f7a",
              }}
            />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#123f7a",
              }}
            >
              Retur Pembelian
            </Typography>

          </Stack>

          <Typography
            sx={{
              mt: 0.5,
              color: "#64748b",
              fontSize: 16,
            }}
          >
            Kelola pengembalian barang pembelian
            dengan aman dan terstruktur.
          </Typography>

        </Box>

        <Stack
          direction="row"
          spacing={1}
        >

          <Button
            variant="outlined"
            startIcon={
              <RestartAltIcon />
            }
            onClick={loadData}
            disabled={loading}
            sx={{
              height: 44,
              borderRadius: 2,
              fontWeight: 700,
              px: 2,
            }}
          >
            REFRESH
          </Button>

          <Button
            variant="contained"
            startIcon={
              <RestartAltIcon />
            }
            onClick={resetForm}
            sx={{
              height: 44,
              borderRadius: 2,
              fontWeight: 700,
              px: 2,
              backgroundColor: "#ddb62d",
              color: "#082d63",

              "&:hover": {
                backgroundColor: "#cda91f",
              },
            }}
          >
            RESET FORM
          </Button>

        </Stack>

      </Stack>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>
      )}

      {/* ===================================================
          STATISTIC CARDS
      =================================================== */}

      <Grid
        container
        spacing={2}
        mb={3}
      >

        {/* FAKTUR */}

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >

          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #dbe4ef",
              boxShadow:
                "0 4px 14px rgba(15, 45, 80, 0.06)",
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
                    color="text.secondary"
                    fontSize={14}
                  >
                    Faktur Dipilih
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      mt: 0.7,
                      fontWeight: 800,
                      color: "#123f7a",
                    }}
                  >
                    {faktur
                      ? faktur.no_faktur
                      : "-"}
                  </Typography>

                </Box>

                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor:
                      "#eaf1ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >

                  <ReceiptLongIcon
                    sx={{
                      color: "#2875d8",
                      fontSize: 28,
                    }}
                  />

                </Box>

              </Stack>

            </CardContent>

          </Card>

        </Grid>

        {/* JUMLAH BARANG */}

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >

          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #dbe4ef",
              boxShadow:
                "0 4px 14px rgba(15, 45, 80, 0.06)",
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
                    color="text.secondary"
                    fontSize={14}
                  >
                    Jumlah Barang Retur
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 0.5,
                      fontWeight: 800,
                      color: "#123f7a",
                    }}
                  >
                    {daftarRetur.length}
                  </Typography>

                </Box>

                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor:
                      "#f0eaff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >

                  <InventoryIcon
                    sx={{
                      color: "#7548e8",
                      fontSize: 28,
                    }}
                  />

                </Box>

              </Stack>

            </CardContent>

          </Card>

        </Grid>

        {/* TOTAL */}

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >

          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #dbe4ef",
              boxShadow:
                "0 4px 14px rgba(15, 45, 80, 0.06)",
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
                    color="text.secondary"
                    fontSize={14}
                  >
                    Total Nilai Retur
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 0.5,
                      fontWeight: 800,
                      color: "#168c4d",
                    }}
                  >
                    {formatRupiah(
                      grandTotal
                    )}
                  </Typography>

                </Box>

                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor:
                      "#e8f7ef",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >

                  <PaymentsIcon
                    sx={{
                      color: "#168c4d",
                      fontSize: 28,
                    }}
                  />

                </Box>

              </Stack>

            </CardContent>

          </Card>

        </Grid>

      </Grid>

      {/* ===================================================
          STEP 1 - PILIH FAKTUR
      =================================================== */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: "1px solid #dbe4ef",
          boxShadow:
            "0 4px 14px rgba(15, 45, 80, 0.05)",
        }}
      >

        <CardContent
          sx={{
            p: 3,
            "&:last-child": {
              pb: 3,
            },
          }}
        >

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            mb={1}
          >

            <ReceiptLongIcon
              sx={{
                color: "#123f7a",
              }}
            />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "#123f7a",
              }}
            >
              1. Pilih Faktur Pembelian
            </Typography>

          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Grid
            container
            spacing={2}
            alignItems="center"
          >

            <Grid
              size={{
                xs: 12,
                md: 8,
              }}
            >

              <TextField
                fullWidth
                label="Faktur Pembelian"
                value={
                  faktur
                    ? faktur.no_faktur
                    : ""
                }
                placeholder="Pilih faktur pembelian"
                InputProps={{
                  readOnly: true,
                }}
              />

            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >

              <Button
                fullWidth
                variant="contained"
                startIcon={
                  <SearchIcon />
                }
                onClick={() =>
                  setBukaDialogFaktur(true)
                }
                sx={{
                  height: 56,
                  borderRadius: 2,
                  fontWeight: 800,
                  backgroundColor:
                    "#123f7a",

                  "&:hover": {
                    backgroundColor:
                      "#0d315f",
                  },
                }}
              >
                PILIH FAKTUR
              </Button>

            </Grid>

          </Grid>

        </CardContent>

      </Card>
      <Dialog
  open={bukaDialogReject}
  onClose={() => {
    if (!loading) {
      setBukaDialogReject(false);
    }
  }}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>
    Tolak Retur Pembelian
  </DialogTitle>

  <DialogContent>
    <TextField
      autoFocus
      fullWidth
      multiline
      minRows={3}
      margin="dense"
      label="Alasan Penolakan"
      value={alasanReject}
      onChange={(e) => setAlasanReject(e.target.value)}
      disabled={loading}
    />
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() => setBukaDialogReject(false)}
      disabled={loading}
    >
      Batal
    </Button>

    <Button
      color="error"
      variant="contained"
      onClick={async () => {
        if (!returDipilih || !alasanReject.trim()) {
          return;
        }

        try {
          await reject(
            returDipilih,
            alasanReject.trim()
          );

          setBukaDialogReject(false);
          setReturDipilih(null);
          setAlasanReject("");
        } catch (error) {
          console.error(
            "Gagal menolak retur pembelian:",
            error
          );
        }
      }}
      disabled={
        loading ||
        !returDipilih ||
        !alasanReject.trim()
      }
    >
      Tolak Retur
    </Button>
  </DialogActions>
</Dialog>

      {/* ===================================================
          STEP 2 - BARANG RETUR
      =================================================== */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: "1px solid #dbe4ef",
          boxShadow:
            "0 4px 14px rgba(15, 45, 80, 0.05)",
        }}
      >

        <CardContent
          sx={{
            p: 3,
            "&:last-child": {
              pb: 3,
            },
          }}
        >

          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
            spacing={2}
            mb={1}
          >

            <Box>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >

                <InventoryIcon
                  sx={{
                    color: "#123f7a",
                  }}
                />

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#123f7a",
                  }}
                >
                  2. Barang yang Diretur
                </Typography>

              </Stack>

              <Typography
                color="text.secondary"
                fontSize={14}
                sx={{
                  mt: 0.5,
                }}
              >
                Tambahkan barang dari faktur
                yang dipilih.
              </Typography>

            </Box>

            <Button
              variant="contained"
              startIcon={
                <AddIcon />
              }
              disabled={!faktur}
              onClick={() =>
                setBukaDialogBarang(true)
              }
              sx={{
                minWidth: 185,
                height: 42,
                borderRadius: 2,
                fontWeight: 800,
                backgroundColor: "#ddb62d",
                color: "#082d63",

                "&:hover": {
                  backgroundColor:
                    "#cda91f",
                },
              }}
            >
              TAMBAH BARANG
            </Button>

          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* INFO JIKA BELUM ADA FAKTUR */}

          {!faktur && (
            <Alert
              severity="info"
              icon={
                <ReceiptLongIcon />
              }
              sx={{
                borderRadius: 2,
                mb: 2,
              }}
            >
              Pilih faktur pembelian terlebih
              dahulu untuk menambahkan barang
              retur.
            </Alert>
          )}

          {/* INFO JIKA BELUM ADA BARANG */}

          {faktur &&
            daftarRetur.length === 0 && (
              <Alert
                severity="warning"
                icon={
                  <WarningAmberIcon />
                }
                sx={{
                  borderRadius: 2,
                  mb: 2,
                }}
              >
                Belum ada barang yang dipilih
                untuk diretur.
              </Alert>
            )}

          {/* =================================================
              TABLE
          ================================================= */}

          {daftarRetur.length > 0 && (

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflowX: "auto",
              }}
            >

              <Table
                sx={{
                  minWidth: 1050,
                }}
              >

                <TableHead>

                  <TableRow
                    sx={{
                      backgroundColor:
                        "#f5f8fc",
                    }}
                  >

                    <TableCell
                      sx={{
                        width: 55,
                        minWidth: 55,
                        fontWeight: 800,
                        color: "#123f7a",
                      }}
                    >
                      No
                    </TableCell>

                    <TableCell
                      sx={{
                        minWidth: 220,
                        fontWeight: 800,
                        color: "#123f7a",
                      }}
                    >
                      Barang
                    </TableCell>

                    <TableCell
                      sx={{
                        width: 100,
                        minWidth: 100,
                        fontWeight: 800,
                        color: "#123f7a",
                      }}
                    >
                      Qty Beli
                    </TableCell>

                    <TableCell
                      sx={{
                        width: 130,
                        minWidth: 130,
                        fontWeight: 800,
                        color: "#123f7a",
                      }}
                    >
                      Qty Retur
                    </TableCell>

                    <TableCell
                      sx={{
                        width: 135,
                        minWidth: 135,
                        fontWeight: 800,
                        color: "#123f7a",
                      }}
                    >
                      Kondisi
                    </TableCell>

                    <TableCell
                      sx={{
                        width: 160,
                        minWidth: 160,
                        fontWeight: 800,
                        color: "#123f7a",
                      }}
                    >
                      Harga
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        width: 160,
                        minWidth: 160,
                        fontWeight: 800,
                        color: "#123f7a",
                      }}
                    >
                      Subtotal
                    </TableCell>

                    {/* KOLOM AKSI TETAP */}

                    <TableCell
                      align="center"
                      sx={{
                        width: 80,
                        minWidth: 80,
                        maxWidth: 80,
                        fontWeight: 800,
                        color: "#123f7a",
                        position: "sticky",
                        right: 0,
                        zIndex: 3,
                        backgroundColor:
                          "#f5f8fc",
                      }}
                    >
                      Aksi
                    </TableCell>

                  </TableRow>

                </TableHead>

                <TableBody>

                  {daftarRetur.map(
                    (item, index) => (

                      <TableRow
                        key={
                          item.barang.barang_id
                        }
                        hover
                      >

                        {/* NO */}

                        <TableCell>
                          <Typography
                            fontWeight={600}
                          >
                            {index + 1}
                          </Typography>
                        </TableCell>

                        {/* BARANG */}

                        <TableCell>

                          <Typography
                            fontWeight={700}
                            color="#123f7a"
                          >
                            {
                              item.barang
                                .nama_barang
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Kode:{" "}
                            {
                              item.barang
                                .kode_barang
                            }
                          </Typography>

                        </TableCell>

                        {/* QTY BELI */}

                        <TableCell>

                          <Box
                            sx={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              minWidth: 42,
                              px: 1,
                              py: 0.5,
                              borderRadius: 2,
                              backgroundColor:
                                "#eef2f7",
                              fontWeight: 700,
                            }}
                          >
                            {
                              item.barang
                                .qty_beli
                            }
                          </Box>

                        </TableCell>

                        {/* QTY RETUR */}

                        <TableCell>

                          <TextField
                            type="number"
                            size="small"
                            value={
                              item.qty
                            }
                            onChange={(event) =>
                              ubahQty(
                                item.barang
                                  .barang_id,
                                Number(
                                  event.target
                                    .value
                                )
                              )
                            }
                            inputProps={{
                              min: 1,
                              max:
                                item.barang
                                  .qty_beli,
                            }}
                            sx={{
                              width: 110,
                            }}
                          />

                        </TableCell>

                        {/* KONDISI */}

                        <TableCell>

                          <FormControl
                            size="small"
                            sx={{
                              width: 120,
                            }}
                          >

                            <Select
                              value={
                                item.kondisi
                              }
                              onChange={(event) =>
                                ubahKondisi(
                                  item.barang
                                    .barang_id,
                                  event.target
                                    .value as KondisiRetur
                                )
                              }
                            >

                              <MenuItem value="BAIK">
                                BAIK
                              </MenuItem>

                              <MenuItem value="RUSAK">
                                RUSAK
                              </MenuItem>

                            </Select>

                          </FormControl>

                        </TableCell>

                        {/* HARGA */}

                        <TableCell>

                          <TextField
                            type="number"
                            size="small"
                            value={
                              item.harga
                            }
                            onChange={(event) =>
                              ubahHarga(
                                item.barang
                                  .barang_id,
                                Number(
                                  event.target
                                    .value
                                )
                              )
                            }
                            inputProps={{
                              min: 1,
                            }}
                            sx={{
                              width: 145,
                            }}
                          />

                        </TableCell>

                        {/* SUBTOTAL */}

                        <TableCell
                          align="right"
                        >

                          <Typography
                            fontWeight={800}
                            color="#123f7a"
                            whiteSpace="nowrap"
                          >
                            {formatRupiah(
                              hitungSubtotal(
                                item
                              )
                            )}
                          </Typography>

                        </TableCell>

                        {/* AKSI */}

                        <TableCell
                          align="center"
                          sx={{
                            width: 80,
                            minWidth: 80,
                            maxWidth: 80,
                            position: "sticky",
                            right: 0,
                            zIndex: 2,
                            backgroundColor:
                              "#fff",
                            borderLeft:
                              "1px solid #e3e8ef",
                          }}
                        >

                          <Tooltip
                            title="Hapus barang retur"
                            arrow
                          >

                            <IconButton
                              aria-label="Hapus barang retur"
                              onClick={() =>
                                hapusBarang(
                                  item.barang
                                    .barang_id
                                )
                              }
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                backgroundColor:
                                  "#fff0f0",
                                color:
                                  "#d32f2f",
                                border:
                                  "1px solid #ffd1d1",

                                "&:hover": {
                                  backgroundColor:
                                    "#ffe0e0",
                                  color:
                                    "#b71c1c",
                                },
                              }}
                            >

                              <DeleteIcon
                                fontSize="small"
                              />

                            </IconButton>

                          </Tooltip>

                        </TableCell>

                      </TableRow>

                    )
                  )}

                </TableBody>

              </Table>
              

            </TableContainer>

          )}

          {/* FOOTER TABLE */}

          {daftarRetur.length > 0 && (

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="space-between"
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
              spacing={1}
              sx={{
                mt: 2,
                px: 1,
              }}
            >

              <Typography
                color="text.secondary"
                fontSize={14}
              >
                {daftarRetur.length} jenis barang
                {" • "}
                {totalQty} total qty
              </Typography>

              <Typography
                fontWeight={800}
                color="#168c4d"
                fontSize={18}
              >
                Total:{" "}
                {formatRupiah(
                  grandTotal
                )}
              </Typography>

            </Stack>

          )}

        </CardContent>

      </Card>

      {/* ===================================================
          STEP 3 - KETERANGAN
      =================================================== */}

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: "1px solid #dbe4ef",
          boxShadow:
            "0 4px 14px rgba(15, 45, 80, 0.05)",
        }}
      >

        <CardContent
          sx={{
            p: 3,
            "&:last-child": {
              pb: 3,
            },
          }}
        >

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            mb={1}
          >

            <AssignmentReturnIcon
              sx={{
                color: "#123f7a",
              }}
            />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "#123f7a",
              }}
            >
              3. Keterangan Retur
            </Typography>

          </Stack>

          <Divider sx={{ mb: 2 }} />

          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Alasan / Catatan Retur"
            placeholder="Contoh: Barang rusak, salah kirim, tidak sesuai pesanan, dan sebagainya."
            value={catatan}
            onChange={(event) =>
              setCatatan(
                event.target.value
              )
            }
          />

        </CardContent>

      </Card>

      {/* ===================================================
          RINGKASAN RETUR
      =================================================== */}

      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid #dbe4ef",
          boxShadow:
            "0 4px 14px rgba(15, 45, 80, 0.05)",
        }}
      >

        <CardContent
          sx={{
            p: 3,
            "&:last-child": {
              pb: 3,
            },
          }}
        >

          <Grid
            container
            spacing={3}
            alignItems="center"
          >

            {/* RINGKASAN */}

            <Grid
              size={{
                xs: 12,
                md: 7,
              }}
            >

              <Typography
                color="text.secondary"
                fontSize={14}
              >
                Ringkasan Retur
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#123f7a",
                  mt: 0.5,
                }}
              >
                {daftarRetur.length} barang
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                }}
              >
                Nilai pengembalian:
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: "#168c4d",
                }}
              >
                {formatRupiah(
                  grandTotal
                )}
              </Typography>

            </Grid>

            {/* TOMBOL */}

            <Grid
              size={{
                xs: 12,
                md: 5,
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
                    <RestartAltIcon />
                  }
                  onClick={resetForm}
                  sx={{
                    minHeight: 48,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  BATAL / RESET
                </Button>

                <Button
                  variant="contained"
                  startIcon={
                    <SaveIcon />
                  }
                  onClick={simpanRetur}
                  disabled={
                     permissionLoading ||
                     !canCreate ||
                     loading ||
                     !faktur ||
                     daftarRetur.length === 0
                    }
                  sx={{
                    minHeight: 48,
                    minWidth: 180,
                    borderRadius: 2,
                    fontWeight: 800,
                    backgroundColor:
                      "#123f7a",

                    "&:hover": {
                      backgroundColor:
                        "#0d315f",
                    },
                  }}
                >
                  {loading
                    ? "MENYIMPAN..."
                    : "SIMPAN RETUR"}
                </Button>

              </Stack>

            </Grid>

          </Grid>

        </CardContent>

      </Card>
            {/* ===================================================
          DAFTAR / RIWAYAT RETUR PEMBELIAN
      =================================================== */}
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid #dbe4ef",
          boxShadow:
            "0 4px 14px rgba(15, 45, 80, 0.05)",
          mt: 3,
        }}
      >
        <CardContent
          sx={{
            p: 3,
            "&:last-child": {
              pb: 3,
            },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#123f7a",
                }}
              >
                Riwayat Retur Pembelian
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Daftar retur pembelian yang tersimpan
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Total: {total}
            </Typography>
          </Stack>

          <TableContainer
            component={Paper}
            sx={{
              border: "1px solid #e1e7ef",
              borderRadius: 2,
              overflowX: "auto",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#f5f8fc",
                  }}
                >
                  <TableCell
                    sx={{ fontWeight: 800 }}
                  >
                    ID Retur
                  </TableCell>

                  <TableCell
                    sx={{ fontWeight: 800 }}
                  >
                    ID Pembelian
                  </TableCell>

                  <TableCell
                    sx={{ fontWeight: 800 }}
                  >
                    Supplier
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 800,
                      textAlign: "right",
                    }}
                  >
                    Total
                  </TableCell>

                  <TableCell
                    sx={{ fontWeight: 800 }}
                  >
                    Status
                  </TableCell>

                  <TableCell
                    sx={{ fontWeight: 800 }}
                  >
                    Dibuat Oleh
                  </TableCell>

                  <TableCell
                    sx={{ fontWeight: 800 }}
                  >
                    Tanggal
                  </TableCell>
                  <TableCell
                  sx={{
                    fontWeight: 800,
                    position: "sticky",
                    right: 0,
                    backgroundColor: "#f5f8fc",
                    zIndex: 2,
                  }}
                  >
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                    >
                      Memuat data retur...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                    >
                      Belum ada data retur pembelian.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((retur) => (
                    <TableRow
                      key={retur.id}
                      hover
                    >
                      <TableCell>
                        {retur.id}
                      </TableCell>

                      <TableCell>
                        {retur.pembelian_id}
                      </TableCell>

                      <TableCell>
                        {retur.supplier_id}
                      </TableCell>

                      <TableCell
                        sx={{
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        {formatRupiah(retur.total)}
                      </TableCell>

                      <TableCell>
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: 800,
                            color:
                              retur.status ===
                              "PENDING"
                                ? "#b26a00"
                                : retur.status ===
                                  "DISETUJUI"
                                ? "#168c4d"
                                : "#c62828",
                          }}
                        >
                          {retur.status}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {retur.created_by}
                      </TableCell>

                      <TableCell>
                        {new Date(retur.created_at).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })}
                      </TableCell>
                      <TableCell>
                    {retur.status === "PENDING" && (
                      <Stack direction="row" spacing={1}>
                    {canApprove && (
                      <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleApprove(retur.id)}
                      disabled={loading}
                  >
                      Setujui
                        </Button>
                    )}

                    {canReject && (
                      <Button
                        type="button"
                        size="small"
                        variant="outlined"
                        color="error"
                      onClick={() => {
                        setReturDipilih(retur.id);
                        setAlasanReject("");
                        setBukaDialogReject(true);
                      }}

                        disabled={loading}
                    >
                      Tolak
                        </Button>
                    )}
                      </Stack>
                    )}
                  </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ===================================================
          DIALOG PILIH FAKTUR
      =================================================== */}

      <CariFakturPembelianDialog
        open={
          bukaDialogFaktur
        }
        onClose={() =>
          setBukaDialogFaktur(false)
        }
        onSelect={
          pilihFaktur
        }
      />

      {/* ===================================================
          DIALOG PILIH BARANG
      =================================================== */}

      <CariBarangReturPembelianDialog
        open={
          bukaDialogBarang
        }
        onClose={() =>
          setBukaDialogBarang(false)
        }
        pembelianId={
          faktur?.id ?? 0
        }
        onSelect={
          pilihBarang
        }
      />

    </Box>
  );
}