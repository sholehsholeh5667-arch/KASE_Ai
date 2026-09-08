import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Pagination,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import type { Barang } from "../types/barang";

import { barangService } from "../services/barangService";

import BarangTable from "../components/barang/BarangTable";
import BarangDialog from "../components/barang/BarangDialog";
import DeleteDialog from "../components/barang/DeleteDialog";
import { usePermissions } from "../hooks/usePermissions";


// ==========================================================
// SNACKBAR
// ==========================================================

type SnackbarState = {
  open: boolean;
  severity: "success" | "error";
  message: string;
};


// ==========================================================
// PAGE
// ==========================================================

const BarangPage = () => {

  // ========================================================
  // PERMISSION USER LOGIN
  // ========================================================

  const {
    hasPermission,
    loading: permissionLoading,
  } = usePermissions();

  const canView =
    !permissionLoading &&
    hasPermission("barang.view");

  const canCreate =
    !permissionLoading &&
    hasPermission("barang.create");

  const canUpdate =
    !permissionLoading &&
    hasPermission("barang.update");

  const canDelete =
    !permissionLoading &&
    hasPermission("barang.delete");

  // ========================================================
  // DATA
  // ========================================================

  const [barang, setBarang] =
    useState<Barang[]>([]);

  const [loading, setLoading] =
    useState(false);


  // ========================================================
  // SELECTED BARANG
  // ========================================================

  const [
    selectedBarang,
    setSelectedBarang,
  ] = useState<Barang | null>(null);


  // ========================================================
  // DIALOG
  // ========================================================

  const [
    openDialog,
    setOpenDialog,
  ] = useState(false);

  const [
    openDelete,
    setOpenDelete,
  ] = useState(false);


  // ========================================================
  // PAGINATION
  // ========================================================

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    size,
    setSize,
  ] = useState(10);

  const [
    total,
    setTotal,
  ] = useState(0);


  // ========================================================
  // SEARCH
  // ========================================================

  const [
    search,
    setSearch,
  ] = useState("");


  // ========================================================
  // SNACKBAR
  // ========================================================

  const [
    snackbar,
    setSnackbar,
  ] = useState<SnackbarState>({
    open: false,
    severity: "success",
    message: "",
  });


  // ========================================================
  // SHOW MESSAGE
  // ========================================================

  const showMessage = (
    severity: "success" | "error",
    message: string,
  ) => {

    setSnackbar({
      open: true,
      severity,
      message,
    });

  };


  // ========================================================
  // PERMISSION REVALIDATION
  // ========================================================

  useEffect(() => {

    if (permissionLoading) {
      return;
    }

    if (
      openDialog &&
      selectedBarang &&
      !canUpdate
    ) {
      setOpenDialog(false);
      setSelectedBarang(null);

      showMessage(
        "error",
        "Anda tidak memiliki izin untuk mengubah barang."
      );

      return;
    }

    if (
      openDialog &&
      !selectedBarang &&
      !canCreate
    ) {
      setOpenDialog(false);

      showMessage(
        "error",
        "Anda tidak memiliki izin untuk menambah barang."
      );

      return;
    }

    if (
      openDelete &&
      !canDelete
    ) {
      setOpenDelete(false);
      setSelectedBarang(null);

      showMessage(
        "error",
        "Anda tidak memiliki izin untuk menghapus barang."
      );
    }

  }, [
    permissionLoading,
    canCreate,
    canUpdate,
    canDelete,
    openDialog,
    openDelete,
    selectedBarang,
  ]);


  // ========================================================
  // LOAD DATA
  // ========================================================

  const loadData = async () => {

    try {

      setLoading(true);

      const result =
        await barangService.getAll(
          page,
          size,
          search,
        );

      setBarang(
        result.items ?? []
      );

      setTotal(
        Number(
          result.total ?? 0
        )
      );

    } catch (error: any) {

      console.error(
        "Gagal mengambil data:",
        error
      );

      const detail =
        error?.response?.data?.detail;

      showMessage(
        "error",
        typeof detail === "string"
          ? detail
          : "Gagal mengambil data barang."
      );

    } finally {

      setLoading(false);

    }

  };


  // ========================================================
  // EFFECT
  // ========================================================

  useEffect(() => {

    void loadData();

  }, [
    page,
    size,
    search,
  ]);


  // ========================================================
  // TAMBAH BARANG
  // ========================================================

  const handleTambah = () => {

    if (permissionLoading) {
      return;
    }

    if (!canCreate) {
      showMessage(
        "error",
        "Anda tidak memiliki izin untuk menambah barang."
      );
      return;
    }

    setSelectedBarang(null);

    setOpenDialog(true);

  };


  // ========================================================
  // EDIT BARANG
  // ========================================================

  const handleEdit = (
    item: Barang
  ) => {

    if (permissionLoading) {
      return;
    }

    if (!canUpdate) {
      showMessage(
        "error",
        "Anda tidak memiliki izin untuk mengubah barang."
      );
      return;
    }

    setSelectedBarang(item);

    setOpenDialog(true);

  };


  // ========================================================
// SAVE BARANG
// ========================================================

const handleSave = async (
  data: Partial<Barang>,
  fotoFile?: File | null,
) => {

  if (permissionLoading) {
    showMessage(
      "error",
      "Hak akses masih dimuat. Silakan coba lagi.",
    );
    return;
  }

  if (selectedBarang && !canUpdate) {
    showMessage(
      "error",
      "Anda tidak memiliki izin untuk mengubah barang.",
    );
    return;
  }

  if (!selectedBarang && !canCreate) {
    showMessage(
      "error",
      "Anda tidak memiliki izin untuk menambah barang.",
    );
    return;
  }

  try {

    setLoading(true);

    if (selectedBarang) {

      // ==========================================
      // UPDATE BARANG
      // ==========================================

      await barangService.update(
        selectedBarang.id,
        data,
      );

      // ==========================================
      // UPLOAD FOTO BARU
      // ==========================================

      if (fotoFile) {

        await barangService.uploadFoto(
          selectedBarang.id,
          fotoFile,
        );

      }

      showMessage(
        "success",
        "Barang berhasil diperbarui.",
      );

    } else {

      // ==========================================
      // TAMBAH BARANG
      // ==========================================

      const savedBarang =
        await barangService.create(data);

      // ==========================================
      // UPLOAD FOTO
      // ==========================================

      if (fotoFile) {

        await barangService.uploadFoto(
          savedBarang.id,
          fotoFile,
        );

      }

      showMessage(
        "success",
        "Barang berhasil ditambahkan.",
      );
    }

    // ==========================================
    // TUTUP DIALOG
    // ==========================================

    setOpenDialog(false);

    setSelectedBarang(null);

    await loadData();

  } catch (error: any) {

    console.error(
      "Gagal menyimpan data:",
      error,
    );

    const detail =
      error?.response?.data?.detail;

    showMessage(
      "error",
      typeof detail === "string"
        ? detail
        : "Gagal menyimpan data barang.",
    );

  } finally {

      setLoading(false);
    }
  };
  // ========================================================
  // DELETE BARANG
  // ========================================================

  const handleDelete = (
    item: Barang
  ) => {

    if (permissionLoading) {
      return;
    }

    if (!canDelete) {
      showMessage(
        "error",
        "Anda tidak memiliki izin untuk menghapus barang."
      );
      return;
    }

    setSelectedBarang(item);

    setOpenDelete(true);

  };


  // ========================================================
  // CONFIRM DELETE
  // ========================================================

  const handleConfirmDelete =
    async () => {

      if (!selectedBarang) {
        return;
      }

      if (
        permissionLoading ||
        !canDelete
      ) {
        setOpenDelete(false);
        setSelectedBarang(null);

        showMessage(
          "error",
          "Anda tidak memiliki izin untuk menghapus barang."
        );

        return;
      }

      try {

        setLoading(true);

        await barangService.remove(
          selectedBarang.id
        );

        setOpenDelete(false);

        setSelectedBarang(null);

        showMessage(
          "success",
          "Barang berhasil dihapus."
        );

        // Jika halaman terakhir menjadi kosong,
        // kembali ke halaman sebelumnya.
        if (
          barang.length === 1 &&
          page > 1
        ) {

          setPage(
            (previous) =>
              previous - 1
          );

        } else {

          await loadData();

        }

      } catch (error: any) {

        console.error(
          "Gagal menghapus barang:",
          error
        );

        const detail =
          error?.response?.data?.detail;

        showMessage(
          "error",
          typeof detail === "string"
            ? detail
            : "Gagal menghapus barang."
        );

      } finally {

        setLoading(false);

      }

    };


  // ========================================================
  // RESET SEARCH
  // ========================================================

  const handleClearSearch = () => {

    setSearch("");

    setPage(1);

  };


  // ========================================================
  // TOTAL PAGE
  // ========================================================

  const totalPage =
    Math.max(
      1,
      Math.ceil(
        total / size
      )
    );


  // ========================================================
  // UI
  // ========================================================

  if (!permissionLoading && !canView) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
          py: 8,
          px: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              color: "#0b2a5b",
              mb: 1,
            }}
          >
            Akses Ditolak
          </Typography>

          <Typography
            color="text.secondary"
          >
            Anda tidak memiliki izin untuk melihat data barang.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (

    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >

      {/* ====================================================
          HEADER
      ==================================================== */}

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >

        <Box>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >

            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  "#0b2a5b",
                color: "#ffffff",
              }}
            >

              <Inventory2OutlinedIcon />

            </Box>


            <Box>

              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  color:
                    "#0b2a5b",
                }}
              >
                Data Barang
              </Typography>

              <Typography
                color="text.secondary"
                mt={0.3}
              >
                Kelola data barang dan
                produk toko.
              </Typography>

            </Box>

          </Stack>

        </Box>


        <Stack
          direction="row"
          spacing={1.5}
        >

          <Button
            variant="outlined"
            startIcon={
              <RefreshIcon />
            }
            onClick={() =>
              void loadData()
            }
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Refresh
          </Button>


          {canCreate && (
            <Button
              variant="contained"
              startIcon={
                <AddIcon />
              }
              onClick={
                handleTambah
              }
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                backgroundColor:
                  "#0b2a5b",
                "&:hover": {
                  backgroundColor:
                    "#123d7a",
                },
              }}
            >
              Tambah Barang
            </Button>
          )}

        </Stack>

      </Box>


      {/* ====================================================
          MAIN CARD
      ==================================================== */}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border:
            "1px solid #e2e8f0",
          overflow: "hidden",
          backgroundColor:
            "#ffffff",
        }}
      >

        {/* ==================================================
            SEARCH BAR
        ================================================== */}

        <Box
          sx={{
            p: 2.5,
            backgroundColor:
              "#f8fafc",
            borderBottom:
              "1px solid #e2e8f0",
          }}
        >

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
          >

            <TextField
              fullWidth
              placeholder="Cari nama / kode barang..."
              value={search}
              onChange={(event) => {

                setSearch(
                  event.target.value
                );

                setPage(1);

              }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                  >
                    <SearchIcon
                      color="action"
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor:
                  "#ffffff",
                "& .MuiOutlinedInput-root":
                  {
                    borderRadius: 2,
                  },
              }}
            />


            {search && (

              <Button
                variant="outlined"
                onClick={
                  handleClearSearch
                }
                sx={{
                  minWidth: 110,
                  borderRadius: 2,
                  textTransform:
                    "none",
                }}
              >
                Reset
              </Button>

            )}

          </Stack>

        </Box>


        {/* ==================================================
            TABLE
        ================================================== */}

        <Box
          sx={{
            width: "100%",
            overflowX: "auto",
          }}
        >

          <BarangTable
          rows={barang}
          loading={loading}
          
          onEdit={
            canUpdate
            ? handleEdit
            : undefined
          }
          
          onDelete={
            canDelete
            ? handleDelete
            : undefined
          }
        />
        </Box>
        {/* ==================================================
            FOOTER
        ================================================== */}

        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderTop:
              "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Total
            </Typography>

            <Typography
              variant="body2"
              fontWeight={700}
            >
              {total}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              data
            </Typography>

          </Stack>


          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >

            <TextField
              select
              size="small"
              value={size}
              onChange={(event) => {

                setSize(
                  Number(
                    event.target.value
                  )
                );

                setPage(1);

              }}
              SelectProps={{
                native: true,
              }}
              sx={{
                width: 100,
              }}
            >

              <option value={10}>
                10 / halaman
              </option>

              <option value={20}>
                20 / halaman
              </option>

              <option value={50}>
                50 / halaman
              </option>

              <option value={100}>
                100 / halaman
              </option>

            </TextField>


            {total > 0 && (

              <Pagination
                page={page}
                count={totalPage}
                color="primary"
                shape="rounded"
                disabled={loading}
                onChange={(
                  _,
                  value
                ) => {
                  setPage(value);
                }}
              />

            )}

          </Stack>

        </Box>

      </Paper>


      {/* ====================================================
          ADD / EDIT DIALOG
      ==================================================== */}

      <BarangDialog
        open={openDialog}
        barang={
          selectedBarang
        }
        onClose={() => {

          setOpenDialog(false);

          setSelectedBarang(null);

        }}
        onSave={
          handleSave
        }
      />


      {/* ====================================================
          DELETE DIALOG
      ==================================================== */}

      <DeleteDialog
        open={openDelete}
        title="Hapus Barang"
        message={
          `Apakah Anda yakin ingin menghapus ` +
          `"${selectedBarang?.nama_barang}"?`
        }
        loading={loading}
        onClose={() => {

          setOpenDelete(false);

          setSelectedBarang(null);

        }}
        onConfirm={
          handleConfirmDelete
        }
      />


      {/* ====================================================
          SNACKBAR
      ==================================================== */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() =>
          setSnackbar(
            (previous) => ({
              ...previous,
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
              (previous) => ({
                ...previous,
                open: false,
              })
            )
          }
          sx={{
            width: "100%",
          }}
        >
          {snackbar.message}
        </Alert>

      </Snackbar>

    </Box>
  );
};


export default BarangPage;
