import { useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
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

import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";

import CariBarangDialog from "../components/mutasiStok/CariBarangDialog";
import { useMutasiStok } from "../hooks/useMutasiStok";

import type { Barang } from "../types/barang";

export default function MutasiStok() {
  const {
    create,
    data,
    loading,
  } = useMutasiStok();

  const [barang, setBarang] =
    useState<Barang | null>(null);

  const [
    bukaDialogBarang,
    setBukaDialogBarang,
  ] = useState(false);

  const [jenis, setJenis] =
    useState("MASUK");

  const [qty, setQty] =
    useState(1);

  const [keterangan, setKeterangan] =
    useState("");

  const simpan = async () => {
    if (!barang) {
      alert("Pilih barang terlebih dahulu.");
      return;
    }

    if (
      !Number.isFinite(Number(qty)) ||
      Number(qty) <= 0
    ) {
      alert("Qty harus lebih dari 0.");
      return;
    }

    try {
      await create({
        barang_id: barang.id,
        jenis,
        qty: Number(qty),
        keterangan:
          keterangan.trim() || undefined,
      });

      alert("Mutasi stok berhasil disimpan.");

      setBarang(null);
      setQty(1);
      setJenis("MASUK");
      setKeterangan("");
    } catch (error: any) {
      console.error(
        "Gagal menyimpan mutasi stok:",
        error
      );

      const message =
        error?.response?.data?.detail ||
        error?.message ||
        "Mutasi stok gagal disimpan.";

      alert(message);
    }
  };

  const formatTanggal = (
    tanggal: string
  ) => {
    if (!tanggal) return "-";

    const date = new Date(tanggal);

    if (Number.isNaN(date.getTime())) {
      return tanggal;
    }

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatQty = (value: number | string) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "-";
    }

    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 2,
    }).format(number);
  };

  const getJenisTampilan = (
    item: any
  ) => {
    const qtyValue = Number(item.qty);

    /*
     * Backend memetakan:
     * MASUK  -> PENYESUAIAN (+)
     * KELUAR -> PENYESUAIAN (-)
     *
     * Karena itu untuk riwayat kita tampilkan
     * kembali sebagai MASUK / KELUAR berdasarkan
     * tanda qty.
     */
    if (item.jenis === "PENYESUAIAN") {
      if (qtyValue >= 0) {
        return "MASUK";
      }

      return "KELUAR";
    }

    return item.jenis || "-";
  };

  return (
    <Box p={2}>

      <Typography
        variant="h5"
        mb={2}
      >
        Mutasi Stok
      </Typography>

      {/* =========================
          FORM MUTASI
      ========================== */}
      <Card>
        <CardContent>

          <Grid
            container
            spacing={2}
          >

            <Grid size={{ xs: 12 }}>
              <Stack
                direction="row"
                spacing={2}
              >

                <TextField
                  fullWidth
                  label="Barang"
                  value={
                    barang
                      ? barang.nama_barang
                      : ""
                  }
                  InputProps={{
                    readOnly: true,
                  }}
                />

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    setBukaDialogBarang(true)
                  }
                >
                  Pilih
                </Button>

              </Stack>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                select
                fullWidth
                label="Jenis"
                value={jenis}
                onChange={(e) =>
                  setJenis(e.target.value)
                }
              >
                <MenuItem value="MASUK">
                  MASUK
                </MenuItem>

                <MenuItem value="KELUAR">
                  KELUAR
                </MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Qty"
                value={qty}
                inputProps={{
                  min: 1,
                }}
                onChange={(e) =>
                  setQty(
                    Number(e.target.value)
                  )
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Keterangan"
                value={keterangan}
                onChange={(e) =>
                  setKeterangan(
                    e.target.value
                  )
                }
              />
            </Grid>

          </Grid>

        </CardContent>
      </Card>

      {/* =========================
          RIWAYAT MUTASI
      ========================== */}
      <Paper
        sx={{
          mt: 3,
          overflow: "hidden",
        }}
      >

        <Box
          px={2}
          py={1.5}
          sx={{
            borderBottom:
              "1px solid",
            borderColor:
              "divider",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
          >
            Riwayat Mutasi Stok
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Daftar mutasi stok terbaru
          </Typography>
        </Box>

        <TableContainer>
          <Table>

            <TableHead>
              <TableRow>

                <TableCell>
                  Tanggal
                </TableCell>

                <TableCell>
                  Barang
                </TableCell>

                <TableCell>
                  Jenis
                </TableCell>

                <TableCell align="right">
                  Qty
                </TableCell>

                <TableCell>
                  Keterangan
                </TableCell>

              </TableRow>
            </TableHead>

            <TableBody>

              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <CircularProgress
                      size={28}
                    />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mt={1}
                    >
                      Memuat riwayat...
                    </Typography>
                  </TableCell>
                </TableRow>

              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography
                      color="text.secondary"
                    >
                      Belum ada riwayat
                      mutasi stok.
                    </Typography>
                  </TableCell>
                </TableRow>

              ) : (
                data.map((item) => {

                  const qtyValue =
                    Number(item.qty);

                  const jenisTampilan =
                    getJenisTampilan(item);

                  return (
                    <TableRow
                      key={item.id}
                      hover
                    >

                      <TableCell>
                        {formatTanggal(
                          item.tanggal
                        )}
                      </TableCell>

                      <TableCell>
                        Barang ID:{" "}
                        {item.barang_id}
                      </TableCell>

                      <TableCell>
                        <Typography
                          fontWeight={600}
                          sx={{
                            color:
                              jenisTampilan ===
                              "MASUK"
                                ? "success.main"
                                : jenisTampilan ===
                                  "KELUAR"
                                ? "error.main"
                                : "inherit",
                          }}
                        >
                          {jenisTampilan}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          fontWeight={600}
                          sx={{
                            color:
                              qtyValue >= 0
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          {qtyValue >= 0
                            ? "+"
                            : ""}
                          {formatQty(
                            qtyValue
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {item.keterangan ||
                          "-"}
                      </TableCell>

                    </TableRow>
                  );
                })
              )}

            </TableBody>

          </Table>
        </TableContainer>

      </Paper>

      {/* =========================
          BUTTON SIMPAN
      ========================== */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        mt={2}
      >

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={simpan}
          disabled={loading}
        >
          Simpan
        </Button>

      </Stack>

      {/* =========================
          DIALOG PILIH BARANG
      ========================== */}
      <CariBarangDialog
        open={bukaDialogBarang}
        onClose={() =>
          setBukaDialogBarang(false)
        }
        onSelect={(item) => {
          setBarang(item);
          setBukaDialogBarang(false);
        }}
      />

    </Box>
  );
}