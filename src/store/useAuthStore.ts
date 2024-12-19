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
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await instance.post("/auth/login", credentials);
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
        error.response?.data?.error || error.message || "Login failed";
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
      const response = await instance.post("/auth/register", credentials);
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
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || "Registration failed";
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
      const firebaseUser = result.user;

      const idToken = await firebaseUser.getIdToken();
      const response = await instance.post("/auth/firebase", {
        token: idToken,
        provider: 'google'
      });

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
        throw new Error("Failed to authenticate with backend");
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Google login failed",
        isAuthenticated: false,
      });
      throw error;
    }
  },

  githubLogin: async () => {
    set({ isLoading: true, error: null });
    const provider = new GithubAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const idToken = await firebaseUser.getIdToken();
      const response = await instance.post("/auth/firebase", {
        token: idToken,
        provider: 'github'
      });

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
        throw new Error("Failed to authenticate with backend");
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "GitHub login failed",
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await instance.post("/auth/logout");

      const { token } = get();
      if (token) {
        localStorage.removeItem("token");
      }

      if (auth.currentUser) {
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
      set({
        isLoading: false,
        error: error.message || "Logout failed",
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

if (typeof window !== 'undefined') {
  instance.get("/user")
    .then((response) => {
      useAuthStore.setState({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    })
    .catch(() => {
      localStorage.removeItem("token");
      useAuthStore.setState({
        user: {} as User,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });
}
