import api from "../api/axios";

import type {
  DashboardResponse,
} from "../types/dashboard";

export const dashboardService = {

  // =====================================
  // Ambil data Dashboard Analytics
  // =====================================

  async getDashboard(): Promise<DashboardResponse> {

    const { data } =
      await api.get<DashboardResponse>(
        "/dashboard"
      );

    return data;
  },

};