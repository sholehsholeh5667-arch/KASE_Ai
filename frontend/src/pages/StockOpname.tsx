import {
  useCallback,
  useState,
} from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
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
  Chip,
  IconButton,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useStockOpname } from "../hooks/useStockOpname";
import CariBarangDialog from "../components/stockOpname/CariBarangDialog";
import type { Barang } from "../types/barang";

type OpnameItem = {
  barang: Barang;
  stok_fisik: number;
  keterangan: string;
};

export default function StockOpname() {
  const {
    create,
    loadData,
    data,
    loading,
  } = useStockOpname();

  const [catatan, setCatatan] = useState("");
  const [daftarBarang, setDaftarBarang] = useState<OpnameItem[]>([]);
  const [bukaDialogBarang, setBukaDialogBarang] = useState(false);
  const [detailOpname, setDetailOpname] = useState<any | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);

  // ======================================================
  // RESET FORM
  // ======================================================

  const resetForm = useCallback((): void => {
    setDaftarBarang([]);
    setCatatan("");
  }, []);

  // ======================================================
  // PILIH BARANG
  // ======================================================

  const pilihBarang = useCallback(
    (barang: Barang) => {
      const sudahAda = daftarBarang.find(
        (item) => item.barang.id === barang.id
      );

      if (sudahAda) {
        alert("Barang sudah dipilih.");
        return;
      }

      setDaftarBarang((old) => [
        ...old,
        {
          barang,
          stok_fisik: Math.max(0, Number(barang.stok ?? 0)),
          keterangan: "",
        },
      ]);

      setBukaDialogBarang(false);
    },
    [daftarBarang]
  );

  // ======================================================
  // HITUNG SELISIH
  // ======================================================

  const hitungSelisih = useCallback(
    (item: OpnameItem): number => {
      return item.stok_fisik - Number(item.barang.stok ?? 0);
    },
    []
  );

  // ======================================================
  // UBAH STOK FISIK
  // ======================================================

  const ubahStokFisik = useCallback(
    (barangId: number, stok: number) => {
      const nilai = Number.isFinite(stok) ? Math.max(0, stok) : 0;

      setDaftarBarang((old) =>
        old.map((item) =>
          item.barang.id === barangId
            ? {
                ...item,
                stok_fisik: nilai,
              }
            : item
        )
      );
    },
    []
  );

  // ======================================================
  // UBAH KETERANGAN
  // ======================================================

  const ubahKeterangan = useCallback(
    (barangId: number, keterangan: string) => {
      setDaftarBarang((old) =>
        old.map((item) =>
          item.barang.id === barangId
            ? {
                ...item,
                keterangan,
              }
            : item
        )
      );
    },
    []
  );

  // ======================================================
  // HAPUS BARANG
  // ======================================================

  const hapusBarang = useCallback((barangId: number) => {
    setDaftarBarang((old) =>
      old.filter((item) => item.barang.id !== barangId)
    );
  }, []);

  // ======================================================
  // TOTAL SELISIH
  // ======================================================

  const totalSelisih = daftarBarang.reduce(
    (total, item) => total + hitungSelisih(item),
    0
  );

  // ======================================================
  // SIMPAN STOCK OPNAME
  // ======================================================

  const simpanStockOpname = async () => {
    if (daftarBarang.length === 0) {
      alert("Belum ada barang. Silakan tambah barang terlebih dahulu.");
      return;
    }

    try {
      setMenyimpan(true);

      await create({
        nomor: "",
        // Pertahankan kontrak backend saat ini.
        // Sebaiknya nanti diganti dengan ID user login dari auth context.
        created_by: 1,
        keterangan: catatan.trim(),
        detail: daftarBarang.map((item) => ({
          barang_id: item.barang.id,
          stok_sistem: Number(item.barang.stok ?? 0),
          stok_fisik: item.stok_fisik,
          selisih: hitungSelisih(item),
          keterangan: item.keterangan.trim(),
        })),
      });

      alert("Stock Opname berhasil disimpan.");
      resetForm();
      await loadData();
    } catch (error) {
      console.error("Gagal menyimpan Stock Opname:", error);
      alert("Stock Opname gagal disimpan. Silakan cek koneksi/API.");
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        p: { xs: 1.5, sm: 2, md: 3 },
        overflowX: "hidden",
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        mb={2}
        sx={{ fontSize: { xs: "1.35rem", sm: "1.5rem" } }}
      >
        Stock Opname
      </Typography>

      {/* ======================================================
          FORM STOCK OPNAME
      ====================================================== */}

      <Card sx={{ width: "100%", boxSizing: "border-box" }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            mb={3}
            sx={{ width: "100%" }}
          >
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setBukaDialogBarang(true)}
              sx={{ minHeight: 46 }}
            >
              Tambah Barang
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={simpanStockOpname}
              disabled={menyimpan || daftarBarang.length === 0}
              sx={{ minHeight: 46 }}
            >
              {menyimpan ? "Menyimpan..." : "Simpan"}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="warning"
              startIcon={<RestartAltIcon />}
              onClick={resetForm}
              disabled={menyimpan}
              sx={{ minHeight: 46 }}
            >
              Reset
            </Button>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <TextField
            label="Catatan"
            fullWidth
            multiline
            rows={2}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Contoh: Stock opname rak depan"
          />
        </CardContent>
      </Card>

      {/* ======================================================
          DAFTAR BARANG
      ====================================================== */}

      <Card sx={{ mt: 2, width: "100%", boxSizing: "border-box" }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            mb={1.5}
          >
            <Typography variant="h6" fontWeight="bold">
              Barang yang Dicek
            </Typography>

            <Chip
              label={`Jumlah item: ${daftarBarang.length} • Selisih: ${totalSelisih}`}
              size="small"
              color={totalSelisih === 0 ? "success" : "warning"}
              variant="outlined"
            />
          </Stack>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              width: "100%",
              maxWidth: "100%",
              overflowX: "auto",
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: { xs: 760, sm: 900 },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Kode</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    Nama Barang
                  </TableCell>
                  <TableCell align="right">Stok Sistem</TableCell>
                  <TableCell align="right">Stok Fisik</TableCell>
                  <TableCell align="right">Selisih</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    Keterangan
                  </TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {daftarBarang.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Belum ada barang.
                    </TableCell>
                  </TableRow>
                ) : (
                  daftarBarang.map((item) => {
                    const selisih = hitungSelisih(item);

                    return (
                      <TableRow key={item.barang.id}>
                        <TableCell>
                          {item.barang.kode_barang}
                        </TableCell>

                        <TableCell>
                          {item.barang.nama_barang}
                        </TableCell>

                        <TableCell align="right">
                          {item.barang.stok}
                        </TableCell>

                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.stok_fisik}
                            inputProps={{ min: 0, step: 1 }}
                            onChange={(e) =>
                              ubahStokFisik(
                                item.barang.id,
                                Number(e.target.value)
                              )
                            }
                            sx={{ width: 105 }}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Chip
                            size="small"
                            label={selisih > 0 ? `+${selisih}` : selisih}
                            color={
                              selisih === 0
                                ? "success"
                                : selisih > 0
                                  ? "info"
                                  : "error"
                            }
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={item.keterangan}
                            onChange={(e) =>
                              ubahKeterangan(
                                item.barang.id,
                                e.target.value
                              )
                            }
                            placeholder="Keterangan"
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() =>
                              hapusBarang(item.barang.id)
                            }
                          >
                            Hapus
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ======================================================
          RIWAYAT STOCK OPNAME
      ====================================================== */}

      <Card sx={{ mt: 2, width: "100%", boxSizing: "border-box" }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Typography variant="h6" fontWeight="bold" mb={1.5}>
            Riwayat Stock Opname
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              width: "100%",
              maxWidth: "100%",
              overflowX: "auto",
            }}
          >
            <Table
              size="small"
              sx={{ minWidth: { xs: 720, sm: 900 } }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Nomor</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Keterangan</TableCell>
                  <TableCell align="center">
                    Jumlah Item
                  </TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Memuat riwayat...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Belum ada riwayat Stock Opname.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((opname) => (
                    <TableRow key={opname.id}>
                      <TableCell>{opname.nomor}</TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {new Date(opname.tanggal).toLocaleString(
                          "id-ID"
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={opname.status}
                          color={
                            opname.status === "DRAFT"
                              ? "warning"
                              : "success"
                          }
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        {opname.keterangan || "-"}
                      </TableCell>

                      <TableCell align="center">
                        {opname.detail?.length ?? 0}
                      </TableCell>

                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => setDetailOpname(opname)}
                          aria-label="Lihat detail"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ======================================================
          DIALOG CARI BARANG
      ====================================================== */}

      <CariBarangDialog
        open={bukaDialogBarang}
        onClose={() => setBukaDialogBarang(false)}
        onSelect={pilihBarang}
      />

      {/* ======================================================
          DETAIL RIWAYAT
      ====================================================== */}

      {detailOpname && (
        <Card
          sx={{
            position: "fixed",
            inset: { xs: 8, sm: 24 },
            zIndex: 1300,
            overflow: "auto",
            maxHeight: "calc(100vh - 16px)",
            boxShadow: 8,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" fontWeight="bold">
                Detail Stock Opname
              </Typography>

              <Button
                size="small"
                onClick={() => setDetailOpname(null)}
              >
                Tutup
              </Button>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={0.75} mb={2}>
              <Typography>
                <strong>Nomor:</strong> {detailOpname.nomor || "-"}
              </Typography>
              <Typography>
                <strong>Tanggal:</strong>{" "}
                {detailOpname.tanggal
                  ? new Date(detailOpname.tanggal).toLocaleString(
                      "id-ID"
                    )
                  : "-"}
              </Typography>
              <Typography>
                <strong>Status:</strong>{" "}
                {detailOpname.status || "-"}
              </Typography>
              <Typography>
                <strong>Keterangan:</strong>{" "}
                {detailOpname.keterangan || "-"}
              </Typography>
            </Stack>

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ overflowX: "auto" }}
            >
              <Table
                size="small"
                sx={{ minWidth: 650 }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Barang</TableCell>
                    <TableCell align="right">
                      Stok Sistem
                    </TableCell>
                    <TableCell align="right">
                      Stok Fisik
                    </TableCell>
                    <TableCell align="right">
                      Selisih
                    </TableCell>
                    <TableCell>Keterangan</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {detailOpname.detail?.length ? (
                    detailOpname.detail.map(
                      (detail: any, index: number) => (
                        <TableRow
                          key={detail.id ?? index}
                        >
                          <TableCell>
                            {detail.nama_barang ??
                              detail.barang?.nama_barang ??
                              detail.barang_id ??
                              "-"}
                          </TableCell>
                          <TableCell align="right">
                            {detail.stok_sistem ?? 0}
                          </TableCell>
                          <TableCell align="right">
                            {detail.stok_fisik ?? 0}
                          </TableCell>
                          <TableCell align="right">
                            {detail.selisih ?? 0}
                          </TableCell>
                          <TableCell>
                            {detail.keterangan || "-"}
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Detail barang tidak tersedia.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
