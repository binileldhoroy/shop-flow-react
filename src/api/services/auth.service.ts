import axiosInstance from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import { LoginCredentials, AuthResponse, User } from '@types/auth.types';

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  // Logout
  logout: async (refreshToken: string): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, {
      refresh: refreshToken,
    });
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await axiosInstance.post<{ access: string }>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refresh: refreshToken }
    );
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get<User>(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },
};
