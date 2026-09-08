import api from "./api";

import type {
  Supplier,
  SupplierCreate,
  SupplierUpdate,
  SupplierPaginationResponse,
} from "../types/supplier";

class SupplierService {
  async getAll(
    search: string = "",
    page: number = 1,
    size: number = 10
  ): Promise<SupplierPaginationResponse> {
    const response = await api.get<SupplierPaginationResponse>("/supplier/", {
      params: {
        search,
        page,
        size,
      },
    });

    return response.data;
  }

  async getById(id: number): Promise<Supplier> {
    const response = await api.get<Supplier>(`/supplier/${id}`);
    return response.data;
  }

  async create(data: SupplierCreate): Promise<Supplier> {
    const response = await api.post<Supplier>("/supplier/", data);
    return response.data;
  }

  async update(id: number, data: SupplierUpdate): Promise<Supplier> {
    const response = await api.put<Supplier>(`/supplier/${id}`, data);
    return response.data;
  }

  async remove(id: number): Promise<void> {
    await api.delete(`/supplier/${id}`);
  }
}

export default new SupplierService();