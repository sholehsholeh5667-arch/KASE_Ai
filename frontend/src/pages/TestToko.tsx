import { useEffect, useState } from "react";
import { getCurrentToko } from "../services/tokoService";
import type { Toko } from "../types/toko";

export default function TestToko() {
  const [toko, setToko] = useState<Toko | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadToko() {
      try {
        const data = await getCurrentToko();

        console.log("CURRENT TOKO:", data);

        setToko(data);
      } catch (err: any) {
        console.error("GET CURRENT TOKO ERROR:", err);

        setError(
          err.response?.data?.detail ??
          "Gagal mengambil toko aktif."
        );
      } finally {
        setLoading(false);
      }
    }

    loadToko();
  }, []);

  if (loading) {
    return <div>Memuat toko aktif...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Gagal</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>TEST TOKO AKTIF</h1>

      {toko && (
        <div>
          <p>
            <strong>ID:</strong> {toko.id}
          </p>

          <p>
            <strong>Nama:</strong> {toko.nama}
          </p>

          <p>
            <strong>Kode:</strong> {toko.kode}
          </p>

          <p>
            <strong>Deskripsi:</strong>{" "}
            {toko.deskripsi ?? "-"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {toko.aktif ? "Aktif" : "Tidak Aktif"}
          </p>
        </div>
      )}
    </div>
  );
}