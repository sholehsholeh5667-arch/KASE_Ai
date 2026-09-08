import {
  Alert,
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import { useState } from "react";

import { useReturPenjualan } from "../hooks/useReturPenjualan";

import CariFakturPenjualanDialog from "../components/returPenjualan/CariFakturPenjualanDialog";
import CariBarangReturDialog from "../components/returPenjualan/CariBarangReturDialog";
import { usePermissions } from "../hooks/usePermissions";
import type { ReturPenjualan } from "../types/returPenjualan";

interface Penjualan {
  id: number;
  no_faktur: string;
  tanggal: string;
  pelanggan: string;
  grand_total: number;
}

interface KeranjangReturItem {
  barang_id: number;
  kode_barang: string;
  nama_barang: string;
  qty_jual: number;
  qty_retur: number;
  harga: number;
}

type ReturPenjualanWithReason =
  ReturPenjualan & {
    alasan?: string | null;
  };

export default function ReturPenjualan() {

  // =====================================
  // PERMISSION
  // =====================================

  const {
    hasPermission,
    loading: permissionLoading,
  } = usePermissions();

  const canView =
    !permissionLoading &&
    hasPermission(
      "retur_penjualan.view"
    );

  const canCreate =
    !permissionLoading &&
    hasPermission(
      "retur_penjualan.create"
    );

  const canUpdate =
    !permissionLoading &&
    hasPermission(
      "retur_penjualan.update"
    );

  const canDelete =
    !permissionLoading &&
    hasPermission(
      "retur_penjualan.delete"
    );


  // =====================================
  // HOOK RETUR PENJUALAN
  // =====================================

  const {
    loading,
    data,
    total,
    search,
    setSearch,
    create,
    update,
    remove,
    approve,
    reject,
    loadData,
  } = useReturPenjualan({
    enabled: canView,
  });


  // =====================================
  // STATE
  // =====================================

  const [openFaktur, setOpenFaktur] =
    useState(false);

  const [openBarang, setOpenBarang] =
    useState(false);

  // lanjutkan state lainnya...
  const [penjualan, setPenjualan] =
    useState<Penjualan | null>(null);

  const [keranjang, setKeranjang] =
    useState<KeranjangReturItem[]>([]);

  const [alasan, setAlasan] =
    useState("");
    const [selectedRetur, setSelectedRetur] =
      useState<ReturPenjualan | null>(null);

    const [openRejectDialog, setOpenRejectDialog] =
      useState(false);

    const [rejectAlasan, setRejectAlasan] =
      useState("");

    const [processingAction, setProcessingAction] =
      useState(false);

  // =====================================
  // TAMBAH BARANG
  // =====================================

  const tambahBarangRetur = (
    barang: KeranjangReturItem
  ) => {

    if (
      permissionLoading ||
      !canCreate
    ) {
      return;
    }

    const existing =
      keranjang.find(
        (item) =>
          item.barang_id ===
          barang.barang_id
      );

    if (existing) {

      alert(
        "Barang sudah dipilih."
      );

      return;

    }

    setKeranjang([
      ...keranjang,
      {
        ...barang,
        qty_retur: 1,
      },
    ]);

  };

  // =====================================
  // UPDATE QTY
  // =====================================

  const ubahQtyRetur = (
    barangId: number,
    qty: number
  ) => {

    if (
      permissionLoading ||
      !canCreate
    ) {
      return;
    }

    setKeranjang(

      keranjang.map((item) =>

        item.barang_id === barangId

          ? {
              ...item,
              qty_retur: qty,
            }

          : item

      )

    );

  };

  // =====================================
  // HAPUS BARANG
  // =====================================

  const hapusBarangRetur = (
    barangId: number
  ) => {

    if (
      permissionLoading ||
      !canCreate
    ) {
      return;
    }

    setKeranjang(

      keranjang.filter(

        (item) =>

          item.barang_id !== barangId

      )

    );

  };

  // =====================================
  // GRAND TOTAL
  // =====================================

  const grandTotal =
    keranjang.reduce(

      (total, item) =>

        total +

        item.qty_retur *

        item.harga,

      0

    );

// =====================================
// SIMPAN RETUR
// =====================================

const simpanRetur = async () => {

  if (!penjualan) {

    alert(
      "Silakan pilih faktur."
    );

    return;
  }


  if (
    keranjang.length === 0
  ) {

    alert(
      "Belum ada barang."
    );

    return;
  }


  if (
    alasan.trim() === ""
  ) {

    alert(
      "Alasan retur wajib diisi."
    );

    return;
  }


  try {

    await create({

      penjualan_id:
        penjualan.id,

      alasan:
        alasan.trim(),

      jenis_refund:
        "CASH",

      detail:
        keranjang.map(
          (item) => ({

            barang_id:
              item.barang_id,

            qty:
              item.qty_retur,

            harga:
              item.harga,

          })
        ),

    });


    alert(
      "Retur berhasil disimpan."
    );

    setKeranjang([]);
    setPenjualan(null);
    setAlasan("");

    await loadData();

  } catch (error) {

    console.error(
      "Gagal menyimpan retur:",
      error
    );

    alert(
      "Gagal menyimpan retur."
    );

  }

};

  // =====================================
  // EDIT RETUR RIWAYAT
  // Permission: retur_penjualan.update
  // =====================================

    const handleEditRetur = async (
      retur: ReturPenjualan
    ) => {

    if (!canUpdate) {
      alert(
        "Anda tidak memiliki izin untuk mengubah Retur Penjualan."
      );
      return;
    }

    if (retur.status !== "DRAFT") {
      alert(
        "Hanya retur dengan status DRAFT yang dapat diubah."
      );
      return;
    }

    const returWithReason =
      retur as ReturPenjualanWithReason;

    const alasanBaru =
      window.prompt(
        "Masukkan alasan retur:",
        returWithReason.alasan ?? ""
      );

    if (alasanBaru === null) {
      return;
    }

    if (alasanBaru.trim() === "") {
      alert(
        "Alasan retur wajib diisi."
      );
      return;
    }

    try {

      setProcessingAction(true);

      await update(
        retur.id,
        {
          alasan:
            alasanBaru.trim(),
        }
      );

      alert(
        "Retur berhasil diubah."
      );

    } catch (error) {

      console.error(
        "Gagal mengubah retur:",
        error
      );

      alert(
        "Gagal mengubah retur."
      );

    } finally {

      setProcessingAction(false);

    }

  };


  // =====================================
  // HAPUS RETUR RIWAYAT
  // Permission: retur_penjualan.delete
  // =====================================

  const handleDeleteRetur = async (
    retur: ReturPenjualan
  ) => {

    if (!canDelete) {
      alert(
        "Anda tidak memiliki izin untuk menghapus Retur Penjualan."
      );
      return;
    }

    if (retur.status !== "DRAFT") {
      alert(
        "Retur yang sudah diproses tidak dapat dihapus."
      );
      return;
    }

    const yakin =
      window.confirm(
        `Hapus retur ${retur.no_retur}?`
      );

    if (!yakin) {
      return;
    }

    try {

      setProcessingAction(true);

      await remove(
        retur.id
      );

      alert(
        "Retur berhasil dihapus."
      );

    } catch (error) {

      console.error(
        "Gagal menghapus retur:",
        error
      );

      alert(
        "Gagal menghapus retur."
      );

    } finally {

      setProcessingAction(false);

    }

  };


  // =====================================
  // SETUJUI RETUR
  // Permission: retur_penjualan.update
  // =====================================

  const handleApproveRetur = async (
    retur: ReturPenjualan
  ) => {

    if (!canUpdate) {
      alert(
        "Anda tidak memiliki izin untuk menyetujui Retur Penjualan."
      );
      return;
    }

    if (retur.status !== "DRAFT") {
      alert(
        "Hanya retur dengan status DRAFT yang dapat disetujui."
      );
      return;
    }

    const yakin =
      window.confirm(
        `Setujui retur ${retur.no_retur}?`
      );

    if (!yakin) {
      return;
    }

    try {

      setProcessingAction(true);

      await approve(
        retur.id
      );

      alert(
        "Retur berhasil disetujui."
      );

    } catch (error) {

      console.error(
        "Gagal menyetujui retur:",
        error
      );

      alert(
        "Gagal menyetujui retur."
      );

    } finally {

      setProcessingAction(false);

    }

  };


  // =====================================
  // BUKA DIALOG TOLAK
  // Permission: retur_penjualan.update
  // =====================================

  const handleOpenReject = (
    retur: ReturPenjualan
  ) => {

    if (!canUpdate) {
      alert(
        "Anda tidak memiliki izin untuk menolak Retur Penjualan."
      );
      return;
    }

    if (retur.status !== "DRAFT") {
      alert(
        "Hanya retur dengan status DRAFT yang dapat ditolak."
      );
      return;
    }

    setSelectedRetur(
      retur
    );

    setRejectAlasan("");

    setOpenRejectDialog(
      true
    );

  };


  // =====================================
  // TOLAK RETUR
  // Permission: retur_penjualan.update
  // =====================================

  const handleRejectRetur = async () => {

    if (!selectedRetur) {
      return;
    }

    if (!canUpdate) {
      alert(
        "Anda tidak memiliki izin untuk menolak Retur Penjualan."
      );
      return;
    }

    const alasanTolak =
      rejectAlasan.trim();

    if (alasanTolak === "") {
      alert(
        "Alasan penolakan wajib diisi."
      );
      return;
    }

    try {

      setProcessingAction(true);

      await reject(
        selectedRetur.id,
        alasanTolak
      );

      alert(
        "Retur berhasil ditolak."
      );

      setOpenRejectDialog(
        false
      );

      setSelectedRetur(
        null
      );

      setRejectAlasan("");

    } catch (error) {

      console.error(
        "Gagal menolak retur:",
        error
      );

      alert(
        "Gagal menolak retur."
      );

    } finally {

      setProcessingAction(false);

    }

  };


  if (permissionLoading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
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
          Anda tidak memiliki izin untuk melihat Retur Penjualan.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>

  <Typography
    variant="h4"
    fontWeight="bold"
    mb={3}
  >
    Retur Penjualan
  </Typography>

  <Paper sx={{ p: 3 }}>

    <Grid
      container
      spacing={2}
    >

      <Grid size={{ xs: 12, md: 4 }}>

        <TextField
          fullWidth
          label="No Retur"
          value="Otomatis"
          disabled
        />

      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>

        <TextField
          fullWidth
          type="date"
          label="Tanggal Retur"
          InputLabelProps={{
            shrink: true,
          }}
        />

      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>

        <TextField
          fullWidth
          label="No Faktur"
          value={
            penjualan?.no_faktur ?? ""
          }
          InputProps={{
            readOnly: true,
          }}
        />

        {canCreate && (
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() =>
              setOpenFaktur(true)
            }
          >
            Cari Faktur
          </Button>
        )}

      </Grid>

    </Grid>

    <Divider sx={{ my: 3 }} />

    <Grid
      container
      spacing={2}
    >

      <Grid size={{ xs: 12, md: 6 }}>

        <TextField
          fullWidth
          label="Pelanggan"
          value={
            penjualan?.pelanggan ?? ""
          }
          InputProps={{
            readOnly: true,
          }}
        />

      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>

        <TextField
          fullWidth
          label="Alasan Retur"
          value={alasan}
          onChange={(e) =>
            setAlasan(
              e.target.value
            )
          }
        />

      </Grid>

    </Grid>

    <Divider sx={{ my: 3 }} />

    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
    >

      <TextField
        label="Cari Retur"
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        sx={{
          width: 350,
        }}
      />

      {canCreate && (
        <Button
          variant="contained"
          disabled={!penjualan}
          onClick={() =>
            setOpenBarang(true)
          }
        >
          Tambah Barang Retur
        </Button>
      )}

    </Box>

    <Table>

      <TableHead>

        <TableRow>

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
            Qty Retur
          </TableCell>

          <TableCell align="right">
            Harga
          </TableCell>

          <TableCell align="right">
            Subtotal
          </TableCell>

          <TableCell align="center">
            Aksi
          </TableCell>

        </TableRow>

      </TableHead>

      <TableBody>

        {loading && (

          <TableRow>

            <TableCell
              colSpan={7}
              align="center"
            >

              <CircularProgress />

            </TableCell>

          </TableRow>

        )}

        {!loading &&
          keranjang.length === 0 && (

          <TableRow>

            <TableCell
              colSpan={7}
              align="center"
            >

              Belum ada barang retur.

            </TableCell>

          </TableRow>

        )}

        {!loading &&
          keranjang.map((item) => (

          <TableRow
            key={item.barang_id}
          >

            <TableCell>

              {item.kode_barang}

            </TableCell>

            <TableCell>

              {item.nama_barang}

            </TableCell>

            <TableCell align="right">

              {item.qty_jual}

            </TableCell>

            <TableCell align="right">

              <TextField
                type="number"
                size="small"
                value={item.qty_retur}
                disabled={!canCreate}
                inputProps={{
                  min: 1,
                  max: item.qty_jual,
                }}
                onChange={(e) =>
                  ubahQtyRetur(
                    item.barang_id,
                    Number(
                      e.target.value
                    )
                  )
                }
                sx={{
                  width: 90,
                }}
              />

            </TableCell>

            <TableCell align="right">

              Rp{" "}

              {item.harga.toLocaleString(
                "id-ID"
              )}

            </TableCell>

            <TableCell align="right">

              Rp{" "}

              {(
                item.qty_retur *
                item.harga
              ).toLocaleString("id-ID")}

            </TableCell>

            <TableCell align="center">

              {canCreate && (
                <Button
                  color="error"
                  onClick={() =>
                    hapusBarangRetur(
                      item.barang_id
                    )
                  }
                >
                  Hapus
                </Button>
              )}

            </TableCell>

          </TableRow>

        ))}

      </TableBody>

    </Table>
        <Divider sx={{ my: 3 }} />

    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >

      <Typography
        variant="h5"
        fontWeight="bold"
      >
        Grand Total Retur : Rp{" "}
        {grandTotal.toLocaleString("id-ID")}
      </Typography>

      <Typography
        color="text.secondary"
      >
        Jumlah Item : {keranjang.length}
      </Typography>

    </Box>

    <Box
      mt={3}
      display="flex"
      gap={2}
      justifyContent="flex-end"
    >

      {canCreate && (
        <Button
          variant="contained"
          color="success"
          size="large"
          disabled={
            !penjualan ||
            keranjang.length === 0
          }
          onClick={simpanRetur}
        >
          Simpan Retur
        </Button>
      )}

      <Button
        variant="outlined"
        color="error"
        size="large"
        onClick={() => {

          setKeranjang([]);

          setPenjualan(null);

          setAlasan("");

        }}
      >
        Batal
      </Button>

    </Box>

    <Divider sx={{ my: 3 }} />

    <Typography
      variant="h6"
    >
      Riwayat Retur Penjualan
    </Typography>

    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mt: 0.5 }}
    >
      Total data: {total}
    </Typography>

    <Table sx={{ mt: 2 }}>

      <TableHead>

        <TableRow>

          <TableCell>No Retur</TableCell>

          <TableCell>Tanggal</TableCell>

          <TableCell>Penjualan</TableCell>

          <TableCell>Status</TableCell>

          <TableCell align="right">
            Total
          </TableCell>

          <TableCell align="center">
            Aksi
          </TableCell>

        </TableRow>

      </TableHead>

      <TableBody>

        {loading && (

          <TableRow>

            <TableCell
              colSpan={6}
              align="center"
            >

              <CircularProgress />

            </TableCell>

          </TableRow>

        )}

        {!loading &&
          data.length === 0 && (

          <TableRow>

            <TableCell
              colSpan={6}
              align="center"
            >

              Belum ada data retur.

            </TableCell>

          </TableRow>

        )}

        {!loading &&
          data.map((item) => (

          <TableRow
            key={item.id}
          >

            <TableCell>

              {item.no_retur}

            </TableCell>

            <TableCell>

              {item.tanggal}

            </TableCell>

            <TableCell>

              {item.penjualan_id}

            </TableCell>

            <TableCell>

              {item.status === "DRAFT"
                ? "DRAFT"
                : item.status === "SELESAI"
                ? "SELESAI"
                : item.status === "BATAL"
                ? "DITOLAK"
                : item.status}

            </TableCell>

            <TableCell align="right">

              Rp{" "}

              {Number(
                item.total
              ).toLocaleString("id-ID")}

            </TableCell>

            <TableCell align="center">

              {item.status === "DRAFT" &&
                canUpdate && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      void handleEditRetur(
                        item
                      )
                    }
                    disabled={
                      processingAction
                    }
                    sx={{
                      mr: 1,
                      mb: 1,
                    }}
                  >
                    Edit
                  </Button>
                )}

              {item.status === "DRAFT" &&
                canDelete && (
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() =>
                      void handleDeleteRetur(
                        item
                      )
                    }
                    disabled={
                      processingAction
                    }
                    sx={{
                      mr: 1,
                      mb: 1,
                    }}
                  >
                    Hapus
                  </Button>
                )}

              {item.status === "DRAFT" &&
                canUpdate && (
                  <Button
                    size="small"
                    color="success"
                    variant="outlined"
                    onClick={() =>
                      void handleApproveRetur(
                        item
                      )
                    }
                    disabled={
                      processingAction
                    }
                    sx={{
                      mr: 1,
                      mb: 1,
                    }}
                  >
                    Setujui
                  </Button>
                )}

              {item.status === "DRAFT" &&
                canUpdate && (
                  <Button
                    size="small"
                    color="warning"
                    variant="outlined"
                    onClick={() =>
                      handleOpenReject(
                        item
                      )
                    }
                    disabled={
                      processingAction
                    }
                    sx={{
                      mb: 1,
                    }}
                  >
                    Tolak
                  </Button>
                )}

              {item.status !== "DRAFT" && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Tidak ada aksi
                </Typography>
              )}

            </TableCell>

          </TableRow>

        ))}

      </TableBody>

    </Table>

  </Paper>

  <CariFakturPenjualanDialog
  open={openFaktur}
  onClose={() => setOpenFaktur(false)}
  onSelect={(item) => {
    setPenjualan(item);
    setOpenFaktur(false);
  }}
/>

<CariBarangReturDialog
  open={openBarang}
  penjualanId={penjualan?.id ?? null}
  onClose={() => setOpenBarang(false)}
  onSelect={(barang) => {
    tambahBarangRetur(barang);
    setOpenBarang(false);
  }}
/>

<Dialog
  open={openRejectDialog}
  onClose={() => {
    if (!processingAction) {
      setOpenRejectDialog(false);
      setSelectedRetur(null);
      setRejectAlasan("");
    }
  }}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>
    Tolak Retur Penjualan
  </DialogTitle>

  <DialogContent>

    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mb: 2 }}
  >
      {selectedRetur
        ? `Retur: ${selectedRetur.no_retur}`
        : ""}
    </Typography>

    <TextField
      fullWidth
      multiline
      minRows={4}
      label="Alasan Penolakan"
      value={rejectAlasan}
      onChange={(e) =>
        setRejectAlasan(
          e.target.value
        )
      }
      disabled={
        processingAction
      }
    />

  </DialogContent>

  <DialogActions>

    <Button
      onClick={() => {
        setOpenRejectDialog(false);
        setSelectedRetur(null);
        setRejectAlasan("");
      }}
      disabled={processingAction}
  >
      Batal
    </Button>

    <Button
      variant="contained"
      color="warning"
      onClick={() =>
        void handleRejectRetur()
      }
      disabled={
        processingAction ||
        !selectedRetur
      }
  >
      Tolak Retur
      </Button>

      </DialogActions>

    </Dialog>

      </Box>

    );

  }
