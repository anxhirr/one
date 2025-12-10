export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'store_manager' | 'store_representative' | null;
  roleId: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

