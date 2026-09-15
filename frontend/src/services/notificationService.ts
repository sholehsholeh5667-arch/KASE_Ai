import api from "./api";

export interface NotificationItem {
  id: number;
  user_id: number;
  judul: string;
  pesan: string;
  tipe: string;
  dibaca: boolean;
  created_at: string;
}

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const response = await api.get<NotificationItem[]>("/notifications");
  return response.data;
};