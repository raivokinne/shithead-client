import { ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { User as UserType } from "@/types";

export interface AuthState {
  user: UserType & FirebaseUser;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<any>;
  register: (credentials: RegisterCredentials) => Promise<any>;
  logout: () => Promise<void>;
  clearError: () => void;
  googleLogin: () => Promise<any>;
  githubLogin: () => Promise<any>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  password_confirmation: string;
}

export interface AuthProviderProps {
  children: ReactNode;
}
