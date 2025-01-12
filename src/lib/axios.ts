import axios from "axios";

export const instance = axios.create({
	// baseURL: "https://api.troika.id.lv",
	// baseURL: "http://localhost:8000",
	baseURL: "http://192.168.8.108:8000",
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
	withCredentials: true,
});

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
