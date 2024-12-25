import { create } from "zustand";
import { auth } from "@/lib/firebase";
import {
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { instance } from "@/lib/axios";
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth";
import { User as FirebaseUser } from "firebase/auth";
import { User as UserType } from "@/types";

const storage = {
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: any) => {
    localStorage.setItem("user", JSON.stringify(user));
  },
  clearUser: () => {
    localStorage.removeItem("user");
  }
};

export const useAuthStore = create<AuthState>((set, get) => {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const idToken = await firebaseUser.getIdToken();
        const response = await instance.post("/firebase/verify", {
          token: idToken,
        });

        if (response.data.success) {
          storage.setUser(response.data.user);
          set({
            user: response.data.user,
            token: idToken,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        get().logout();
      }
    }
  });

  const storedToken = localStorage.getItem("token");
  const storedUser = storage.getUser();
  const initialState = {
    user: storedUser || ({} as FirebaseUser & UserType),
    token: storedToken,
    isAuthenticated: !!storedToken && !!storedUser,
    isLoading: false,
    error: null,
  };

  return {
    ...initialState,

    login: async (credentials: LoginCredentials) => {
      set({ isLoading: true, error: null });
      try {
        const response = await instance.post("/login", credentials);
        if (response.data.success) {
          const token = response.data.token;
          localStorage.setItem("token", token);

          const userResponse = await instance.get("/user");
          const userData = userResponse.data;
          storage.setUser(userData);

          set({
            user: userData,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return userData;
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
        const response = await instance.post("/register", credentials);
        if (response.data.success) {
          set({
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          return response.data;
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
        const response = await instance.post("/firebase", {
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            avatar: firebaseUser.photoURL,
          },
          token: idToken,
          provider: "google",
        });

        if (response.data.success) {
          const token = response.data.token;
          localStorage.setItem("token", token);
          storage.setUser(firebaseUser);

          set({
            user: firebaseUser as FirebaseUser & UserType,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return firebaseUser;
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
        const response = await instance.post("/firebase", {
          token: idToken,
          provider: "github",
        });

        if (response.data.success) {
          const token = response.data.token;
          localStorage.setItem("token", token);

          const userResponse = await instance.get("/user");
          const userData = userResponse.data;
          storage.setUser(userData);

          set({
            user: userData,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return userData;
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
        await instance.post("/logout");

        const { token } = get();
        if (token) {
          localStorage.removeItem("token");
        }
        storage.clearUser();

        if (auth.currentUser) {
          await signOut(auth);
        }

        set({
          user: {} as UserType & FirebaseUser,
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
  };
});
