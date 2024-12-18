import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { instance } from "@/lib/axios";

interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
  password_confirmation: string;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("token"),
    isAuthenticated: !!localStorage.getItem("token"),
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setState((prev) => ({
          ...prev,
          user: firebaseUser,
          isAuthenticated: true,
          isLoading: false,
        }));
      } else if (!state.token) {
        setState((prev) => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }));
      }
    });

    return () => unsubscribe();
  }, [state.token]);

  const googleLogin = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      setState({
        user,
        token: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Google login failed",
      }));
      throw new Error(error.message || "Google login failed");
    }
  }, []);

  const githubLogin = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const provider = new GithubAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      setState({
        user,
        token: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "GitHub login failed",
      }));
      throw new Error(error.message || "GitHub login failed");
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await instance.post("/login", credentials);
      const { token, user } = response.data;

      localStorage.setItem("token", token);

      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Custom login failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      await updateProfile(userCredential.user, { displayName: credentials.name });

      setState({
        user: userCredential.user,
        token: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return userCredential.user;
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      if (state.token) {
        await instance.post("/logout");
        localStorage.removeItem("token");
      } else {
        await signOut(auth);
      }

      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.message || "Logout failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  }, [state.token]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
    googleLogin,
    githubLogin,
  };
};

