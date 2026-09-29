import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  // Falls back to your Mac's LAN IP + port if the env var isn't set
  baseURL: `${process.env.EXPO_PUBLIC_API_URL || "http://10.215.219.187:5000"}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;