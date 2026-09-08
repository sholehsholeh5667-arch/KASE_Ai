import api from "./api";
import type { Toko } from "../types/toko";

export async function getCurrentToko(): Promise<Toko> {
  const response = await api.get("/toko/current");

  return response.data;
}