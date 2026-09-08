export type UserRole =
  | "owner"
  | "admin"
  | "kasir"
  | "gudang"
  | "akuntan";

export interface UserMember {
  id: number;
  nama: string;
  username: string;
  email: string | null;
  role: string;
  aktif: boolean;
  toko_id: number;
  toko_status: string;
}

export interface UserMe {
  id: number;
  nama: string;
  username: string;
  email?: string | null;
  role: string;
  aktif: boolean;
}

export interface CreateMemberPayload {
  nama: string;
  username: string;
  password: string;
  email?: string | null;
  role: UserRole;
  aktif?: boolean;
}

export interface UpdateMemberPayload {
  nama?: string;
  email?: string | null;
  role?: UserRole;
}

export interface UpdateMemberStatusPayload {
  aktif: boolean;
}