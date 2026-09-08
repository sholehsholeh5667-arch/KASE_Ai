import { useEffect, useState } from "react";

import { barangService } from "../services/barangService";

import type { Barang } from "../types/barang";

export function useBarang() {

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<Barang[]>([]);

  const loadData = async (
    page: number = 1,
    size: number = 100,
    search: string = ""
  ) => {

    try {

      setLoading(true);

      const result = await barangService.getAll(
        page,
        size,
        search
      );

      setData(result.items);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadData();

  }, []);

  return {

    loading,

    data,

    loadData,

  };

}