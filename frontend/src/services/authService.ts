import api from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  emailVerified?: boolean;
  createdAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface GoogleLoginData {
  googleId: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface EmailVerificationResponse {
  user: User;
  token: string;
}

export interface GoogleAuthUrlResponse {
  authUrl: string;
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  }

  async register(data: RegisterData): Promise<{ user: User; message: string }> {
    const response = await api.post<{ user: User; message: string }>('/auth/register', data);
    return response.data;
  }

  async verifyEmail(token: string): Promise<EmailVerificationResponse> {
    const response = await api.post<EmailVerificationResponse>('/auth/verify-email', { token });
    return response.data;
  }

  async googleLogin(idToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/google-login', { idToken });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  }

  async getGoogleAuthUrl(): Promise<string> {
    const response = await api.get<GoogleAuthUrlResponse>('/auth/google/url');
    return response.data.authUrl;
  }

  async googleCallback(code: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/google/callback', { code });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  }

  async googleSignup(code: string, agreements: { termsAgreed: boolean; privacyAgreed: boolean }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/google-signup', { 
      code, 
      termsAgreed: agreements.termsAgreed,
      privacyAgreed: agreements.privacyAgreed
    });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/reset-password', { token, newPassword });
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();
