import api from "./api";
import type {
  Penjualan,
  PenjualanCreate,
  PenjualanUpdate,
} from "../types/penjualan";

// =====================================================
// BASE URL
// =====================================================

const URL = "/penjualan";

// =====================================================
// GET ALL
// =====================================================

export async function getPenjualan():
  Promise<Penjualan[]> {

  const { data } =
    await api.get<Penjualan[]>(
      URL
    );

  return data;
}

// =====================================================
// GET BY ID
// =====================================================

export async function getPenjualanById(
  id: number
): Promise<Penjualan> {

  const { data } =
    await api.get<Penjualan>(
      `${URL}/${id}`
    );

  return data;
}

// =====================================================
// CREATE
// =====================================================

export async function createPenjualan(
  payload: PenjualanCreate
): Promise<Penjualan> {

  const { data } =
    await api.post<Penjualan>(
      URL,
      payload
    );

  return data;
}

// =====================================================
// UPDATE
// =====================================================

export async function updatePenjualan(
  id: number,
  payload: PenjualanUpdate
): Promise<Penjualan> {

  const { data } =
    await api.put<Penjualan>(
      `${URL}/${id}`,
      payload
    );

  return data;
}

// =====================================================
// DELETE
// =====================================================

export async function deletePenjualan(
  id: number
): Promise<void> {

  await api.delete(
    `${URL}/${id}`
  );
}

// =====================================================
// CETAK / PREVIEW STRUK
// =====================================================

export function getPenjualanPrintUrl(
  id: number,
  jenis:
    | "struk"
    | "faktur" = "struk"
): string {

  return (
    `${import.meta.env.VITE_API_URL}/api/v1/penjualan/` +
    `${id}/print-preview` +
    `?jenis=${jenis}`
  );
}

// =====================================================
// BUKA PREVIEW STRUK
// =====================================================

export async function openPenjualanPrint(
  id: number,
  jenis: "struk" | "faktur" = "struk"
): Promise<void> {

  // Buka tab terlebih dahulu agar tidak diblokir browser
  const printWindow = window.open(
    "",
    "_blank"
  );

  if (!printWindow) {
    throw new Error(
      "Browser memblokir tab cetak. Izinkan pop-up untuk aplikasi ini."
    );
  }

  try {
    const response = await api.get(
      `/penjualan/${id}/print-preview`,
      {
        params: {
          jenis,
        },
        responseType: "blob",
      }
    );

    const blobUrl = window.URL.createObjectURL(
      response.data
    );

    printWindow.location.href = blobUrl;

    // Bersihkan URL blob setelah beberapa saat
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 60000);

  } catch (error) {

    printWindow.close();

    throw error;
  }
}