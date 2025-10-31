// frontend/src/hooks/useAxios.js

import axios from "axios";
import { useContext, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import AuthContext from "../context/AuthContext";
import axiosInstance from "../api/AxiosInstance";

const baseURL = axiosInstance.defaults.baseURL;

// ✅ controla refresh simultâneo
let refreshPromise = null;

const useAxios = () => {
  const { authTokens, setUser, setAuthTokens, logoutUser } =
    useContext(AuthContext);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL,
      headers: { Authorization: `Bearer ${authTokens?.access}` },
    });

    instance.interceptors.request.use(async (req) => {
      if (!authTokens?.access || !authTokens?.refresh) return req;

      const user = jwtDecode(authTokens.access);
      const isExpired = Date.now() >= user.exp * 1000;

      if (!isExpired) return req;

      console.warn("🔄 Access expirado → Solicitando refresh…");

      // ✅ Se refresh já está acontecendo → aguardar o mesmo
      if (!refreshPromise) {
        refreshPromise = instance
          .post(
            "token/refresh/",
            { refresh: authTokens.refresh },
            { headers: { "Content-Type": "application/json" } }
          )
          .then((response) => {
            console.log("✅ Novo access token:", response.data.access);

            // Atualiza auth
            localStorage.setItem("authTokens", JSON.stringify(response.data));
            setAuthTokens(response.data);
            setUser(jwtDecode(response.data.access));

            return response.data.access;
          })
          .catch((error) => {
            console.error("❌ Refresh falhou:", error?.response?.data || error);
            logoutUser();
            throw error;
          })
          .finally(() => {
            refreshPromise = null; // ✅ Libera para o futuro
          });
      }

      const newAccess = await refreshPromise;
      req.headers.Authorization = `Bearer ${newAccess}`;
      return req;
    });

    return instance;
  }, [authTokens, setUser, setAuthTokens, logoutUser]);

  return api;
};

export default useAxios;