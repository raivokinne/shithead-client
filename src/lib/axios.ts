import axios from "axios";

export const instance = axios.create({
  baseURL: "http://10.13.54.132:8000/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true
});

export const getCurrentUser = async () => {
  try {
    const response = await instance.get("/user");
    return response.data;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
};

export const getCsrfToken = async () => {
  try {
    await fetch("http://10.13.54.132:8000/sanctum/csrf-cookie", {
      credentials: "include"
    });
  } catch (error) {
    console.error("Failed to get CSRF token", error);
  }
};

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const isTokenExpired = (token: string) => {
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const exp = decoded.exp * 1000;
    return Date.now() > exp;
  } catch (error) {
    return true;
  }
};
