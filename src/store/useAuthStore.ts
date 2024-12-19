import { create } from 'zustand';
import { auth } from "@/lib/firebase";
import {
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { instance } from "@/lib/axios";
import {
    AuthState,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/auth";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: {} as User,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await instance.post("/login", credentials);
      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        const userResponse = await instance.get("/user");
        set({
          user: userResponse.data,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return userResponse.data;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await instance.post("/register", credentials);
      if (response.data.success) {
        set({
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

      } else {
        throw new Error("Registration failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  googleLogin: async () => {
    set({ isLoading: true, error: null });
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user: any = result.user;
      set({
        user,
        token: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Google login failed",
      });
      throw new Error(error.message || "Google login failed");
    }
  },

  githubLogin: async () => {
    set({ isLoading: true, error: null });
    const provider = new GithubAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user: any = result.user;
      set({
        user,
        token: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "GitHub login failed",
      });
      throw new Error(error.message || "GitHub login failed");
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { token } = get();
      if (token) {
        localStorage.removeItem("token");
      } else {
        await signOut(auth);
      }

      set({
        user: {} as User,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.message || "Logout failed";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));

if (typeof window !== 'undefined' && localStorage.getItem("token")) {
  instance.get("/user").then((response) => {
    useAuthStore.setState({
      user: response.data,
      isAuthenticated: true,
      isLoading: false,
    });
  }).catch(() => {
    useAuthStore.setState({
      isLoading: false,
      error: "Failed to fetch user",
    });
  });
}
