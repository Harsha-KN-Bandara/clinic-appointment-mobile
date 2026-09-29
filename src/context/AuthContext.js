import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore login session on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log("Failed to restore authentication:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("LOGIN START");
      console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN API SUCCESS");
      console.log("Response:", response.data);

      const { token: newToken, user: newUser } = response.data;

      await AsyncStorage.setItem("token", newToken);
      console.log("TOKEN SAVED");

      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      console.log("USER SAVED");

      setToken(newToken);
      setUser(newUser);

      console.log("LOGIN COMPLETE");

      return response.data;
    } catch (error) {
      console.log("LOGIN ERROR:", error);
      console.log("LOGIN ERROR MESSAGE:", error.message);
      console.log("LOGIN RESPONSE:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      throw new Error(errorMessage);
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log("REGISTER START");

      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      console.log("REGISTER API SUCCESS");
      console.log("Response:", response.data);

      return response.data;
    } catch (error) {
      console.log("REGISTER ERROR:", error);
      console.log("REGISTER ERROR MESSAGE:", error.message);
      console.log("REGISTER RESPONSE:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed";
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.log("Logout storage error:", error.message);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);