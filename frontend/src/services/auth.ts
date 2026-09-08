import api from "../api/axios";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export async function login(
  data: LoginRequest
): Promise<TokenResponse> {
  const response =
    await api.post<TokenResponse>(
      "/auth/login",
      data
    );

  return response.data;
}

export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const response =
    await api.post<ForgotPasswordResponse>(
      "/auth/forgot-password",
      data
    );

  return response.data;
}

export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const response =
    await api.post<ResetPasswordResponse>(
      "/auth/reset-password",
      data
    );

  return response.data;
}