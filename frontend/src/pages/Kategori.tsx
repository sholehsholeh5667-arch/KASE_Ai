import {
  useEffect,
  useState,
} from "react";

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
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

import type {
  Kategori,
} from "../types/kategori";

import {
  kategoriService,
} from "../services/kategoriService";

import KategoriTable from "../components/kategori/KategoriTable";

import KategoriDialog from "../components/kategori/KategoriDialog";

import DeleteKategoriDialog from "../components/kategori/DeleteKategoriDialog";


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

const KategoriPage = () => {

  // ========================================================
  // DATA
  // ========================================================

  const [
    kategori,
    setKategori,
  ] = useState<Kategori[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);


  // ========================================================
  // SELECTED
  // ========================================================

  const [
    selectedKategori,
    setSelectedKategori,
  ] = useState<Kategori | null>(null);


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
  // CLEAR FOCUS
  // ========================================================

  const clearFocus = () => {

    requestAnimationFrame(() => {

      const activeElement =
        document.activeElement;

      if (
        activeElement instanceof HTMLElement
      ) {
        activeElement.blur();
      }

    });

  };


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
  // LOAD DATA
  // ========================================================

  const loadData = async () => {

    try {

      setLoading(true);

      const result =
        await kategoriService.getAll(
          page,
          size,
          search,
        );

      setKategori(
        result.items ?? []
      );

      setTotal(
        Number(
          result.total ?? 0
        )
      );

    } catch (error: any) {

      console.error(
        "Gagal mengambil data kategori:",
        error
      );

      const detail =
        error?.response?.data?.detail;

      showMessage(
        "error",
        typeof detail === "string"
          ? detail
          : "Gagal mengambil data kategori."
      );

    } finally {

      setLoading(false);

    }

  };


  // ========================================================
  // LOAD SAAT HALAMAN DIBUKA
  // ========================================================

  useEffect(() => {

    void loadData();

  }, [
    page,
    size,
    search,
  ]);


  // ========================================================
  // TAMBAH
  // ========================================================

  const handleTambah = () => {

    clearFocus();

    setSelectedKategori(null);

    setOpenDialog(true);

  };


  // ========================================================
  // EDIT
  // ========================================================

  const handleEdit = (
    data: Kategori
  ) => {

    clearFocus();

    setSelectedKategori(data);

    setOpenDialog(true);

  };


  // ========================================================
  // SIMPAN
  // ========================================================

  const handleSave = async (
    data: Partial<Kategori>
  ) => {

    try {

      setLoading(true);

      if (selectedKategori) {

        await kategoriService.update(
          selectedKategori.id,
          data
        );

        showMessage(
          "success",
          "Kategori berhasil diperbarui."
        );

      } else {

        await kategoriService.create(
          data
        );

        showMessage(
          "success",
          "Kategori berhasil ditambahkan."
        );

      }

      setOpenDialog(false);

      setSelectedKategori(null);

      await loadData();

    } catch (error: any) {

      console.error(
        "Gagal menyimpan kategori:",
        error
      );

      const detail =
        error?.response?.data?.detail;

      showMessage(
        "error",
        typeof detail === "string"
          ? detail
          : "Gagal menyimpan kategori."
      );

    } finally {

      setLoading(false);

    }

  };


  // ========================================================
  // HAPUS
  // ========================================================

  const handleDelete = (
    data: Kategori
  ) => {

    clearFocus();

    setSelectedKategori(data);

    setOpenDelete(true);

  };


  // ========================================================
  // KONFIRMASI HAPUS
  // ========================================================

  const handleConfirmDelete =
    async () => {

      if (!selectedKategori) {
        return;
      }

      try {

        setLoading(true);

        await kategoriService.remove(
          selectedKategori.id
        );

        setOpenDelete(false);

        setSelectedKategori(null);

        showMessage(
          "success",
          "Kategori berhasil dihapus."
        );

        if (
          kategori.length === 1 &&
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
          "Gagal menghapus kategori:",
          error
        );

        const detail =
          error?.response?.data?.detail;

        showMessage(
          "error",
          typeof detail === "string"
            ? detail
            : "Gagal menghapus kategori."
        );

      } finally {

        setLoading(false);

      }

    };


  // ========================================================
  // RESET SEARCH
  // ========================================================

  const handleResetSearch = () => {

    setSearch("");

    setPage(1);

  };


  // ========================================================
  // CLOSE KATEGORI DIALOG
  // ========================================================

  const handleCloseDialog = () => {

    setOpenDialog(false);

    setSelectedKategori(null);

    clearFocus();

  };


  // ========================================================
  // CLOSE DELETE DIALOG
  // ========================================================

  const handleCloseDelete = () => {

    setOpenDelete(false);

    setSelectedKategori(null);

    clearFocus();

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
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
        >

          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                "#0b2a5b",
              color: "#ffffff",
              flexShrink: 0,
            }}
          >

            <CategoryOutlinedIcon />

          </Box>


          <Box>

            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                color:
                  "#0b2a5b",
                lineHeight: 1.2,
              }}
            >
              Master Kategori
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mt={0.5}
            >
              Kelola kategori barang
              dengan mudah dan rapi.
            </Typography>

          </Box>

        </Stack>


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
              textTransform:
                "none",
              fontWeight: 600,
            }}
          >
            Refresh
          </Button>


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
              textTransform:
                "none",
              fontWeight: 700,
              backgroundColor:
                "#0b2a5b",
              "&:hover": {
                backgroundColor:
                  "#123d7a",
              },
            }}
          >
            Tambah Kategori
          </Button>

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
            SEARCH
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
              size="small"
              placeholder="Cari nama kategori..."
              value={search}
              onChange={(event) => {

                setSearch(
                  event.target.value
                );

                setPage(1);

              }}
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
                  handleResetSearch
                }
                sx={{
                  minWidth: 100,
                  borderRadius: 2,
                  textTransform:
                    "none",
                  whiteSpace:
                    "nowrap",
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

          <KategoriTable
            rows={kategori}
            loading={loading}
            onEdit={
              handleEdit
            }
            onDelete={
              handleDelete
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
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 2,
            flexWrap: "wrap",
            borderTop:
              "1px solid #e2e8f0",
            backgroundColor:
              "#ffffff",
          }}
        >

          <Box>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Total kategori
            </Typography>

            <Typography
              variant="body1"
              fontWeight={800}
              sx={{
                color:
                  "#0b2a5b",
              }}
            >
              {total} data
            </Typography>

          </Box>


          {total > 0 && (

            <Pagination
              page={page}
              count={totalPage}
              color="primary"
              shape="rounded"
              disabled={loading}
              onChange={(
                _event,
                value
              ) => {
                setPage(value);
              }}
            />

          )}

        </Box>

      </Paper>


      {/* ====================================================
          KATEGORI DIALOG
      ==================================================== */}

      <KategoriDialog
        open={
          openDialog
        }
        kategori={
          selectedKategori
        }
        onClose={
          handleCloseDialog
        }
        onSave={
          handleSave
        }
      />


      {/* ====================================================
          DELETE DIALOG
      ==================================================== */}

      <DeleteKategoriDialog
        open={
          openDelete
        }
        loading={
          loading
        }
        title="Hapus Kategori"
        message={
          `Apakah yakin ingin menghapus ` +
          `"${selectedKategori?.nama}"?`
        }
        onClose={
          handleCloseDelete
        }
        onConfirm={
          handleConfirmDelete
        }
      />


      {/* ====================================================
          SNACKBAR
      ==================================================== */}

      <Snackbar
        open={
          snackbar.open
        }
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
          vertical:
            "bottom",
          horizontal:
            "right",
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
          {
            snackbar.message
          }
        </Alert>

      </Snackbar>

    </Box>
  );
};


export default KategoriPage;