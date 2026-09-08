// src/components/barang/BarangForm.tsx

import {
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Box,
  Typography,
  Stack,
} from "@mui/material";

import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ImageIcon from "@mui/icons-material/Image";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ChangeCircleOutlinedIcon from "@mui/icons-material/ChangeCircleOutlined";

import { useEffect, useRef, useState } from "react";

import type { Barang } from "../../types/barang";

interface BarangFormProps {
  formData: Barang;
  onChange: (field: keyof Barang, value: any) => void;

  // File foto baru yang dipilih dari kamera/galeri
  onFotoChange?: (file: File | null) => void;
}

export default function BarangForm({
  formData,
  onChange,
  onFotoChange,
}: BarangFormProps) {

  const cameraInputRef =
    useRef<HTMLInputElement>(null);

  const galleryInputRef =
    useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(formData.foto || null);

  // ==========================================================
  // SINKRONISASI FOTO SAAT TAMBAH / EDIT
  // ==========================================================

  useEffect(() => {
    setPreviewUrl(formData.foto || null);
  }, [formData.foto]);

  // ==========================================================
  // PILIH FOTO
  // ==========================================================

  const handleFotoSelected = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Validasi tipe file
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Format foto harus JPG, PNG, atau WEBP.");

      event.target.value = "";
      return;
    }

    // Validasi ukuran maksimal 5 MB
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Ukuran foto maksimal 5 MB.");

      event.target.value = "";
      return;
    }

    // Buat preview
    const objectUrl =
      URL.createObjectURL(file);

    setPreviewUrl(objectUrl);

    // Kirim File ke parent
    onFotoChange?.(file);

    // Simpan penanda lokal bahwa ada foto baru
    onChange("foto", objectUrl);

    // Reset input supaya file yang sama
    // bisa dipilih kembali
    event.target.value = "";
  };

  // ==========================================================
  // HAPUS FOTO
  // ==========================================================

  const handleDeleteFoto = () => {

    setPreviewUrl(null);

    onFotoChange?.(null);

    onChange("foto", "");
  };

  // ==========================================================
  // FOTO URL
  // ==========================================================

  const getFotoUrl = () => {

    if (!previewUrl) {
      return null;
    }

    // Foto baru dari browser
    if (previewUrl.startsWith("blob:")) {
      return previewUrl;
    }

    // Foto lama yang tersimpan di backend
    if (previewUrl.startsWith("http")) {
      return previewUrl;
    }

    // Path dari backend
    return `${import.meta.env.VITE_API_URL}/${previewUrl}`;
  };

  const fotoUrl = getFotoUrl();

  return (
    <Grid
      container
      spacing={2}
      sx={{ mt: 1 }}
    >

      {/* ======================================================
          FOTO BARANG
      ====================================================== */}

      <Grid size={12}>

        <Box
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            p: 2,
            backgroundColor: "#f8fafc",
          }}
        >

          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ mb: 1.5 }}
          >
            Foto Barang
          </Typography>

          {/* INPUT KAMERA */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            hidden
            onChange={handleFotoSelected}
          />

          {/* INPUT GALERI */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handleFotoSelected}
          />

          {/* PREVIEW */}
          {fotoUrl && (
            <Box
              sx={{
                mb: 2,
                width: "100%",
                maxWidth: 300,
                height: 220,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
              }}
            >
              <img
                src={fotoUrl}
                alt={formData.nama_barang || "Foto barang"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
          >

            <Button
              variant="contained"
              startIcon={<PhotoCameraIcon />}
              onClick={() =>
                cameraInputRef.current?.click()
              }
            >
              Ambil Foto
            </Button>

            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() =>
                galleryInputRef.current?.click()
              }
            >
              Pilih dari Galeri
            </Button>

            {fotoUrl && (
              <>
                <Button
                  variant="outlined"
                  startIcon={
                    <ChangeCircleOutlinedIcon />
                  }
                  onClick={() =>
                    galleryInputRef.current?.click()
                  }
                >
                  Ganti Foto
                </Button>

                <Button
                  color="error"
                  variant="outlined"
                  startIcon={
                    <DeleteOutlineIcon />
                  }
                  onClick={handleDeleteFoto}
                >
                  Hapus
                </Button>
              </>
            )}

          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 1 }}
          >
            JPG, PNG, atau WEBP. Maksimal 5 MB.
          </Typography>

        </Box>

      </Grid>

      {/* ======================================================
          KODE BARANG
      ====================================================== */}

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Kode Barang"
          value={formData.kode_barang}
          onChange={(e) =>
            onChange(
              "kode_barang",
              e.target.value
            )
          }
        />
      </Grid>

      {/* ======================================================
          NAMA BARANG
      ====================================================== */}

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Nama Barang"
          value={formData.nama_barang}
          onChange={(e) =>
            onChange(
              "nama_barang",
              e.target.value
            )
          }
        />
      </Grid>

      {/* ======================================================
          ALIAS BARANG
      ====================================================== */}

      <Grid size={12}>
        <TextField
          fullWidth
          label="Alias Barang"
          value={formData.alias_barang ?? ""}
          onChange={(e) =>
            onChange(
              "alias_barang",
              e.target.value
            )
          }
        />
      </Grid>

      {/* ======================================================
          SATUAN
      ====================================================== */}

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Satuan"
          value={formData.satuan ?? ""}
          onChange={(e) =>
            onChange(
              "satuan",
              e.target.value
            )
          }
        />
      </Grid>

      {/* ======================================================
          LOKASI RAK
      ====================================================== */}

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Lokasi Rak"
          value={formData.lokasi_rak ?? ""}
          onChange={(e) =>
            onChange(
              "lokasi_rak",
              e.target.value
            )
          }
        />
      </Grid>

      {/* ======================================================
          HARGA BELI
      ====================================================== */}

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          type="number"
          label="Harga Beli"
          value={formData.harga_beli}
          onChange={(e) =>
            onChange(
              "harga_beli",
              Number(e.target.value)
            )
          }
        />
      </Grid>

      {/* ======================================================
          HARGA JUAL
      ====================================================== */}

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          type="number"
          label="Harga Jual"
          value={formData.harga_jual}
          onChange={(e) =>
            onChange(
              "harga_jual",
              Number(e.target.value)
            )
          }
        />
      </Grid>

      {/* ======================================================
          STOK
      ====================================================== */}

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          type="number"
          label="Stok"
          value={formData.stok}
          onChange={(e) =>
            onChange(
              "stok",
              Number(e.target.value)
            )
          }
        />
      </Grid>

      {/* ======================================================
          STOK MINIMUM
      ====================================================== */}

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          type="number"
          label="Stok Minimum"
          value={formData.stok_minimum}
          onChange={(e) =>
            onChange(
              "stok_minimum",
              Number(e.target.value)
            )
          }
        />
      </Grid>

      {/* ======================================================
          STATUS AKTIF
      ====================================================== */}

      <Grid size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.aktif}
              onChange={(e) =>
                onChange(
                  "aktif",
                  e.target.checked
                )
              }
            />
          }
          label="Barang Aktif"
        />
      </Grid>

    </Grid>
  );
}