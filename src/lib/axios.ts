import axios from "axios";

export const instance = axios.create({
  baseURL: "http://localhost:7734/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
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

instance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
