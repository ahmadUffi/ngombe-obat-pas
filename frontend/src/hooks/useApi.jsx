import { useState, useCallback } from "react";
import { apiService } from "../api/apiservice";

/**
 * Custom hook untuk API operations dengan loading dan error handling
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.response?.data?.error || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { callApi, loading, error, setError };
};

/**
 * Custom hook untuk authentication
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    apiService.isAuthenticated()
  );
  const [token, setToken] = useState(apiService.getToken());
  const { callApi, loading, error, setError } = useApi();

  const login = useCallback(
    async (credentials) => {
      const result = await callApi(apiService.login, credentials);
      if (result.access_token) {
        apiService.setToken(result.access_token);
        setToken(result.access_token);
        setIsAuthenticated(true);
      }
      return result;
    },
    [callApi]
  );

  const logout = useCallback(() => {
    apiService.removeToken();
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    token,
    login,
    logout,
    loading,
    error,
    setError,
  };
};

/**
 * Custom hook untuk jadwal operations
 */
export const useJadwal = () => {
  const { callApi, loading, error, setError } = useApi();
  const token = apiService.getToken();

  const getAllJadwal = useCallback(async () => {
    return await callApi(apiService.getAllJadwal, token);
  }, [callApi, token]);

  const createJadwal = useCallback(
    async (jadwalData) => {
      return await callApi(apiService.inputJadwal, jadwalData, token);
    },
    [callApi, token]
  );

  const updateStock = useCallback(
    async (id_obat, newStock) => {
      return await callApi(
        apiService.updateStockObat,
        id_obat,
        newStock,
        token
      );
    },
    [callApi, token]
  );

  const deleteJadwal = useCallback(
    async (jadwal_id) => {
      return await callApi(apiService.deleteJadwal, jadwal_id, token);
    },
    [callApi, token]
  );

  return {
    getAllJadwal,
    createJadwal,
    updateStock,
    deleteJadwal,
    loading,
    error,
    setError,
  };
};

/**
 * Custom hook untuk control operations
 */
export const useControl = () => {
  const { callApi, loading, error, setError } = useApi();
  const token = apiService.getToken();

  const getAllControl = useCallback(async () => {
    return await callApi(apiService.getAllControl, token);
  }, [callApi, token]);

  const createControl = useCallback(
    async (controlData) => {
      return await callApi(apiService.createControl, controlData, token);
    },
    [callApi, token]
  );

  const editControl = useCallback(
    async (id, controlData) => {
      return await callApi(apiService.editControl, id, controlData, token);
    },
    [callApi, token]
  );

  const markDone = useCallback(
    async (id) => {
      return await callApi(apiService.markControlDone, id, token);
    },
    [callApi, token]
  );

  const deleteControl = useCallback(
    async (id) => {
      return await callApi(apiService.deleteControl, id, token);
    },
    [callApi, token]
  );

  return {
    getAllControl,
    createControl,
    editControl,
    markDone,
    deleteControl,
    loading,
    error,
    setError,
  };
};

/**
 * Custom hook untuk history operations
 */
export const useHistory = () => {
  const { callApi, loading, error, setError } = useApi();
  const token = apiService.getToken();

  const getAllHistory = useCallback(async () => {
    try {
      const response = await callApi(apiService.getAllHistory, token);
      return response; // Return the complete response object
    } catch (error) {
      console.error("Error in getAllHistory:", error);
      throw error;
    }
  }, [callApi, token]);

  const addHistory = useCallback(
    async (historyData) => {
      return await callApi(apiService.addHistory, historyData, token);
    },
    [callApi, token]
  );

  return {
    getAllHistory,
    addHistory,
    loading,
    error,
    setError,
  };
};
