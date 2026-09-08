import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import BarangForm from "./BarangForm";
import type { Barang } from "../../types/barang";

interface BarangDialogProps {
  open: boolean;
  barang: Barang | null;
  loading?: boolean;
  onClose: () => void;
  onSave: (
    barang: Partial<Barang>,
    fotoFile?: File | null
  ) => void;
}

const emptyBarang: Partial<Barang> = {
  kode_barang: "",
  nama_barang: "",
  alias_barang: "",
  kategori_id: undefined,
  supplier_default: undefined,
  satuan: "",
  harga_beli: 0,
  harga_jual: 0,
  stok: 0,
  stok_minimum: 0,
  lokasi_rak: "",
  foto: "",
  aktif: true,
};

export default function BarangDialog({
  open,
  barang,
  loading = false,
  onClose,
  onSave,
}: BarangDialogProps) {

  const [formData, setFormData] =
    useState<Partial<Barang>>(emptyBarang);

  // File foto baru
  const [fotoFile, setFotoFile] =
    useState<File | null>(null);

  // ==========================================================
  // RESET FORM SAAT DIALOG DIBUKA / BARANG BERUBAH
  // ==========================================================

  useEffect(() => {

    if (barang) {
      setFormData(barang);
    } else {
      setFormData(emptyBarang);
    }

    // File baru harus selalu di-reset
    // agar tidak terbawa dari barang sebelumnya
    setFotoFile(null);

  }, [barang, open]);

  // ==========================================================
  // PERUBAHAN FORM
  // ==========================================================

  const handleChange = (
    field: keyof Barang,
    value: any
  ) => {

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

  };

  // ==========================================================
  // PERUBAHAN FOTO
  // ==========================================================

  const handleFotoChange = (
    file: File | null
  ) => {

    setFotoFile(file);

  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = () => {

    onSave(
      formData,
      fotoFile
    );

  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >

      <DialogTitle>
        {barang
          ? "Edit Barang"
          : "Tambah Barang"}
      </DialogTitle>

      <DialogContent>

        <BarangForm
          formData={formData as Barang}
          onChange={handleChange}
          onFotoChange={handleFotoChange}
        />

      </DialogContent>

      <DialogActions>

        <Button
          onClick={onClose}
          color="inherit"
          disabled={loading}
        >
          Batal
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "Menyimpan..."
            : "Simpan"}
        </Button>

      </DialogActions>

    </Dialog>
  );
}