import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
} from "@mui/material";

import type { Kategori } from "../../types/kategori";

interface Props {
  open: boolean;
  kategori: Kategori | null;
  onClose: () => void;
  onSave: (data: Partial<Kategori>) => void;
}

const initialForm: Partial<Kategori> = {
  nama: "",
  deskripsi: "",
  aktif: true,
};

export default function KategoriDialog({
  open,
  kategori,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] =
    useState<Partial<Kategori>>(initialForm);

  useEffect(() => {
    if (kategori) {
      setForm({
        nama: kategori.nama,
        deskripsi: kategori.deskripsi,
        aktif: kategori.aktif,
      });
    } else {
      setForm(initialForm);
    }
  }, [kategori, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitch = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      aktif: e.target.checked,
    }));
  };

  const handleSubmit = () => {
    if (!form.nama?.trim()) {
      alert("Nama kategori wajib diisi.");
      return;
    }

    onSave(form);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {kategori
          ? "Edit Kategori"
          : "Tambah Kategori"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>

          <TextField
            label="Nama Kategori"
            name="nama"
            value={form.nama ?? ""}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Deskripsi"
            name="deskripsi"
            value={form.deskripsi ?? ""}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />

          <FormControlLabel
            control={
              <Switch
                checked={Boolean(form.aktif)}
                onChange={handleSwitch}
              />
            }
            label="Aktif"
          />

        </Stack>
      </DialogContent>

      <DialogActions>

        <Button
          onClick={onClose}
          color="inherit"
        >
          Batal
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Simpan
        </Button>

      </DialogActions>
    </Dialog>
  );
}