import { useEffect, useState } from "react";

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
} from "@mui/material";

import type {
  Supplier,
  SupplierCreate,
  SupplierUpdate,
} from "../../types/supplier";

interface SupplierDialogProps {
  open: boolean;
  supplier?: Supplier | null;
  loading: boolean;
  onClose: () => void;
  onSave: (
    data: SupplierCreate | SupplierUpdate
  ) => Promise<void>;
}

const initialForm: SupplierCreate = {
  nama: "",
  alamat: "",
  telepon: "",
  email: "",
  kontak: "",
  aktif: true,
};

export default function SupplierDialog({
  open,
  supplier,
  loading,
  onClose,
  onSave,
}: SupplierDialogProps) {
  const [form, setForm] =
    useState<SupplierCreate>(initialForm);

  useEffect(() => {
    if (supplier) {
      setForm({
        nama: supplier.nama,
        alamat: supplier.alamat ?? "",
        telepon: supplier.telepon ?? "",
        email: supplier.email ?? "",
        kontak: supplier.kontak ?? "",
        aktif: supplier.aktif,
      });
    } else {
      setForm(initialForm);
    }
  }, [supplier, open]);

  const handleChange = (
    field: keyof SupplierCreate,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.nama.trim()) {
      alert("Nama supplier wajib diisi.");
      return;
    }

    await onSave(form);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {supplier ? "Edit Supplier" : "Tambah Supplier"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Nama Supplier"
            value={form.nama}
            onChange={(e) =>
              handleChange("nama", e.target.value)
            }
            required
            fullWidth
          />

          <TextField
            label="Kontak"
            value={form.kontak}
            onChange={(e) =>
              handleChange("kontak", e.target.value)
            }
            fullWidth
          />

          <TextField
            label="Telepon"
            value={form.telepon}
            onChange={(e) =>
              handleChange("telepon", e.target.value)
            }
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              handleChange("email", e.target.value)
            }
            fullWidth
          />

          <TextField
            label="Alamat"
            value={form.alamat}
            onChange={(e) =>
              handleChange("alamat", e.target.value)
            }
            multiline
            minRows={3}
            fullWidth
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={form.aktif}
                onChange={(e) =>
                  handleChange(
                    "aktif",
                    e.target.checked
                  )
                }
              />
            }
            label="Aktif"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Batal
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {supplier ? "Update" : "Simpan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}