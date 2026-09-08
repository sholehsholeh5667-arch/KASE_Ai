import api from "../api/axios";

import type {
  CreateMemberPayload,
  UpdateMemberPayload,
  UpdateMemberStatusPayload,
  UserMe,
  UserMember,
} from "../types/user";

import type {
  Permission,
} from "../types/permission";


export interface UpdateRolePermissionsResponse {
  message: string;

  role: {
    id: number;
    kode: string;
    nama: string;
  };

  permissions: Permission[];
}


export const userService = {

  // ========================================================
  // CURRENT USER
  // ========================================================

  async me(): Promise<UserMe> {

    const response =
      await api.get<UserMe>(
        "/users/me"
      );

    return response.data;
  },


  // ========================================================
  // DAFTAR ANGGOTA TOKO
  // ========================================================

  async getMembers(
    search: string = "",
    includeInactive: boolean = true
  ): Promise<UserMember[]> {

    const response =
      await api.get<UserMember[]>(
        "/users/members",
        {
          params: {
            ...(search.trim()
              ? {
                  search:
                    search.trim(),
                }
              : {}),

            include_inactive:
              includeInactive,
          },
        }
      );

    return response.data;
  },


  // ========================================================
  // DETAIL ANGGOTA
  // ========================================================

  async getMember(
    userId: number
  ): Promise<UserMember> {

    const response =
      await api.get<UserMember>(
        `/users/members/${userId}`
      );

    return response.data;
  },


  // ========================================================
  // TAMBAH ANGGOTA
  // ========================================================

  async createMember(
    payload: CreateMemberPayload
  ): Promise<UserMember> {

    const response =
      await api.post<UserMember>(
        "/users/members",
        payload
      );

    return response.data;
  },


  // ========================================================
  // UPDATE ANGGOTA
  // ========================================================

  async updateMember(
    userId: number,
    payload: UpdateMemberPayload
  ): Promise<UserMember> {

    const response =
      await api.put<UserMember>(
        `/users/members/${userId}`,
        payload
      );

    return response.data;
  },


  // ========================================================
  // UPDATE STATUS ANGGOTA
  // ========================================================

  async updateMemberStatus(
    userId: number,
    payload: UpdateMemberStatusPayload
  ): Promise<UserMember> {

    const response =
      await api.patch<UserMember>(
        `/users/members/${userId}/status`,
        payload
      );

    return response.data;
  },


  // ========================================================
  // PERMISSION USER YANG SEDANG LOGIN
  // ========================================================

  async getMyPermissions(): Promise<Permission[]> {

    const response =
      await api.get<Permission[]>(
        "/permissions/me"
      );

    return response.data;
  },


  // ========================================================
  // PERMISSION BERDASARKAN ROLE
  // ========================================================

  async getRolePermissions(
    roleCode: string
  ): Promise<Permission[]> {

    const normalizedRole =
      roleCode
        .trim()
        .toLowerCase();

    const response =
      await api.get<Permission[]>(
        `/permissions/role/${normalizedRole}`
      );

    return response.data;
  },


  // ========================================================
  // SIMPAN / UPDATE PERMISSION ROLE
  // ========================================================

  async updateRolePermissions(
    roleCode: string,
    permissions: string[]
  ): Promise<UpdateRolePermissionsResponse> {

    const normalizedRole =
      roleCode
        .trim()
        .toLowerCase();

    const response =
      await api.put<UpdateRolePermissionsResponse>(
        `/permissions/role/${normalizedRole}`,
        {
          permissions,
        }
      );

    return response.data;
  },

};