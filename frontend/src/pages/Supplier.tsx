import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Pagination,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import type { Supplier } from "../types/supplier";

import supplierService from "../services/supplierService";

import SupplierTable from "../components/supplier/SupplierTable";
import SupplierDialog from "../components/supplier/SupplierDialog";
import DeleteSupplierDialog from "../components/supplier/DeleteSupplierDialog";

import { usePermissions } from "../hooks/usePermissions";


/* ==========================================================
   SNACKBAR
========================================================== */

type SnackbarState = {
  open: boolean;
  severity: "success" | "error";
  message: string;
};


/* ==========================================================
   PAGE
========================================================== */

const SupplierPage = () => {

  /* ========================================================
     PERMISSION
  ======================================================== */

  const {
    hasPermission,
    loading: permissionLoading,
  } = usePermissions();

  const canView =
    !permissionLoading &&
    hasPermission("supplier.view");

  const canCreate =
    !permissionLoading &&
    hasPermission("supplier.create");

  const canUpdate =
    !permissionLoading &&
    hasPermission("supplier.update");

  const canDelete =
    !permissionLoading &&
    hasPermission("supplier.delete");


  /* ========================================================
     DATA
  ======================================================== */

  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null);

  const [openDialog, setOpenDialog] =
    useState(false);

  const [openDelete, setOpenDelete] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const [size] =
    useState(10);

  const [total, setTotal] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [snackbar, setSnackbar] =
    useState<SnackbarState>({
      open: false,
      severity: "success",
      message: "",
    });


  /* ========================================================
     MESSAGE
  ======================================================== */

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


  /* ========================================================
     LOAD DATA
  ======================================================== */

  const loadData = async () => {

    if (permissionLoading) {
      return;
    }

    if (!canView) {
      setSuppliers([]);
      setTotal(0);
      return;
    }

    try {

      setLoading(true);

      const result =
        await supplierService.getAll(
          search,
          page,
          size,
        );

      setSuppliers(result.items);
      setTotal(result.total);

    } catch (error) {

      console.error(
        "Gagal mengambil data supplier:",
        error,
      );

      showMessage(
        "error",
        "Gagal mengambil data supplier",
      );

    } finally {

      setLoading(false);

    }
  };


  /* ========================================================
     LOAD EFFECT
  ======================================================== */

  useEffect(() => {

    if (!permissionLoading) {
      void loadData();
    }

  }, [
    page,
    search,
    permissionLoading,
    canView,
  ]);


  /* ========================================================
     TAMBAH
  ======================================================== */

  const handleTambah = () => {

    if (permissionLoading) {
      return;
    }

    if (!canCreate) {

      showMessage(
        "error",
        "Anda tidak memiliki izin untuk menambah supplier.",
      );

      return;
    }

    setSelectedSupplier(null);

    setOpenDialog(true);
  };


  /* ========================================================
     EDIT
  ======================================================== */

  const handleEdit = (
    supplier: Supplier,
  ) => {

    if (permissionLoading) {
      return;
    }

    if (!canUpdate) {

      showMessage(
        "error",
        "Anda tidak memiliki izin untuk mengubah supplier.",
      );

      return;
    }

    setSelectedSupplier(supplier);

    setOpenDialog(true);
  };


  /* ========================================================
     SAVE
  ======================================================== */

  const handleSave = async (
    data: any,
  ) => {

    if (permissionLoading) {

      showMessage(
        "error",
        "Hak akses masih dimuat. Silakan coba lagi.",
      );

      return;
    }

    if (
      selectedSupplier &&
      !canUpdate
    ) {

      showMessage(
        "error",
        "Anda tidak memiliki izin untuk mengubah supplier.",
      );

      return;
    }

    if (
      !selectedSupplier &&
      !canCreate
    ) {

      showMessage(
        "error",
        "Anda tidak memiliki izin untuk menambah supplier.",
      );

      return;
    }

    try {

      setLoading(true);

      if (selectedSupplier) {

        await supplierService.update(
          selectedSupplier.id,
          data,
        );

      } else {

        await supplierService.create(
          data,
        );

      }

      showMessage(
        "success",
        selectedSupplier
          ? "Supplier berhasil diperbarui."
          : "Supplier berhasil ditambahkan.",
      );

      setOpenDialog(false);

      setSelectedSupplier(null);

      await loadData();

    } catch (error: any) {

      console.error(
        "Gagal menyimpan supplier:",
        error,
      );

      const detail =
        error?.response?.data?.detail;

      showMessage(
        "error",
        typeof detail === "string"
          ? detail
          : "Gagal menyimpan data supplier.",
      );

    } finally {

      setLoading(false);

    }
  };


  /* ========================================================
     DELETE
  ======================================================== */

  const handleDelete = (
    supplier: Supplier,
  ) => {

    if (permissionLoading) {
      return;
    }

    if (!canDelete) {

      showMessage(
        "error",
        "Anda tidak memiliki izin untuk menghapus supplier.",
      );

      return;
    }

    setSelectedSupplier(supplier);

    setOpenDelete(true);
  };


  /* ========================================================
     CONFIRM DELETE
  ======================================================== */

  const handleConfirmDelete =
    async () => {

      if (!selectedSupplier) {
        return;
      }

      if (!canDelete) {

        showMessage(
          "error",
          "Anda tidak memiliki izin untuk menghapus supplier.",
        );

        return;
      }

      try {

        setLoading(true);

        await supplierService.remove(
          selectedSupplier.id,
        );

        showMessage(
          "success",
          "Supplier berhasil dihapus.",
        );

        setOpenDelete(false);

        setSelectedSupplier(null);

        await loadData();

      } catch (error: any) {

        console.error(
          "Gagal menghapus supplier:",
          error,
        );

        const detail =
          error?.response?.data?.detail;

        showMessage(
          "error",
          typeof detail === "string"
            ? detail
            : "Gagal menghapus data supplier.",
        );

      } finally {

        setLoading(false);

      }
    };


  /* ========================================================
     NO VIEW
  ======================================================== */

  if (
    !permissionLoading &&
    !canView
  ) {

    return (
      <Box
        p={3}
      >

        <Alert
          severity="error"
        >
          Anda tidak memiliki izin untuk melihat Supplier.
        </Alert>

      </Box>
    );
  }


  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <Box p={3}>

      <Typography
        variant="h4"
        gutterBottom
      >
        Master Supplier
      </Typography>


      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        mb={2}
        flexWrap="wrap"
      >

        <TextField
          label="Cari Supplier"
          size="small"
          value={search}
          onChange={(e) => {

            setSearch(
              e.target.value,
            );

            setPage(1);

          }}
          sx={{
            width: 300,
            maxWidth: "100%",
          }}
        />


        {canCreate && (
          <Button
            variant="contained"
            onClick={handleTambah}
            disabled={loading}
          >
            Tambah Supplier
          </Button>
        )}

      </Box>


      <SupplierTable
        suppliers={suppliers}
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


      <Box
        mt={3}
        display="flex"
        justifyContent="center"
      >

        <Pagination
          page={page}
          count={Math.ceil(
            total / size,
          )}
          color="primary"
          onChange={(_, value) =>
            setPage(value)
          }
        />

      </Box>


      <SupplierDialog
        open={openDialog}
        supplier={selectedSupplier}
        loading={loading}

        onClose={() => {
          setOpenDialog(false);
          setSelectedSupplier(null);
        }}

        onSave={handleSave}
      />


      <DeleteSupplierDialog
        open={openDelete}
        supplier={selectedSupplier}
        loading={loading}

        onClose={() => {
          setOpenDelete(false);
          setSelectedSupplier(null);
        }}

        onConfirm={handleConfirmDelete}
      />


      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}

        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
      >

        <Alert
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>

      </Snackbar>

    </Box>
  );
};


export default SupplierPage;