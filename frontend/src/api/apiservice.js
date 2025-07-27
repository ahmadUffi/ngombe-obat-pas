import axios from "axios";

// Base URL from environment variable
// const BASE_URL = import.meta.env.VITE_BASE_URL || "http://163.53.195.57:5000";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export class apiService {
  // ===============================
  // AUTH ENDPOINTS
  // ===============================

  /**
   * Login user dengan email dan password
   * @param {Object} credentials - {email, password}
   * @returns {Promise<Object>} - {access_token}
   */
  static async login(credentials) {
    try {
      const response = await axios.post(
        `${BASE_URL}/v1/api/login`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      throw err;
    }
  }

  // ===============================
  // JADWAL ENDPOINTS
  // ===============================

  /**
   * Membuat jadwal obat baru
   * @param {Object} jadwalData - Data jadwal obat
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Response message
   */
  static async inputJadwal(jadwalData, token) {
    try {
      const response = await axios.post(
        `${BASE_URL}/v1/api/jadwal/input`,
        jadwalData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Gagal input jadwal:", err.response?.data || err.message);
      throw err;
    }
  }

  /**
   * Mendapatkan semua jadwal user untuk web interface
   * @param {string} token - JWT token
   * @returns {Promise<Array>} - Array of jadwal objects
   */
  static async getAllJadwal(token) {
    try {
      const response = await axios.get(
        `${BASE_URL}/v1/api/jadwal/get-for-web`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(
        "Gagal mengambil jadwal:",
        err.response?.data || err.message
      );
      throw err;
    }
  }

  /**
   * Update stok obat dari web interface
   * @param {number} id_obat - ID obat
   * @param {number} newStock - Stok baru
   * @param {string} token - JWT token (optional, will get from localStorage if not provided)
   * @returns {Promise<Object>} - Response message
   */
  static async updateStockObat(id_obat, newStock, token = null) {
    try {
      const authToken = token || this.getToken();
      const response = await axios.put(
        `${BASE_URL}/v1/api/jadwal/update-stock-obat-web`,
        { id_obat, newStock },
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(
        "Gagal update stok obat:",
        err.response?.data || err.message
      );
      throw err;
    }
  }

  /**
   * Menghapus jadwal berdasarkan ID
   * @param {number} jadwal_id - ID jadwal
   * @param {string} token - JWT token (optional, will get from localStorage if not provided)
   * @returns {Promise<Object>} - Response message
   */
  static async deleteJadwal(jadwal_id, token = null) {
    try {
      const authToken = token || this.getToken();
      const response = await axios.delete(`${BASE_URL}/v1/api/jadwal/delete`, {
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : undefined,
          "Content-Type": "application/json",
        },
        data: { jadwal_id },
      });
      return response.data;
    } catch (err) {
      console.error("Gagal hapus jadwal:", err.response?.data || err.message);
      throw err;
    }
  }

  // ===============================
  // CONTROL ENDPOINTS
  // ===============================

  /**
   * Membuat kontrol baru
   * @param {Object} controlData - Data kontrol
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Response message
   */
  static async createControl(controlData, token) {
    try {
      const response = await axios.post(
        `${BASE_URL}/v1/api/kontrol/create-kontrol`,
        controlData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Gagal buat kontrol:", err.response?.data || err.message);
      throw err;
    }
  }

  /**
   * Mendapatkan semua kontrol user
   * @param {string} token - JWT token
   * @returns {Promise<Array>} - Array of control objects
   */
  static async getAllControl(token) {
    try {
      const response = await axios.get(
        `${BASE_URL}/v1/api/kontrol/get-all-kontrol`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(
        "Gagal mengambil kontrol:",
        err.response?.data || err.message
      );
      throw err;
    }
  }

  /**
   * Mengedit kontrol berdasarkan ID
   * @param {number} id - ID kontrol
   * @param {Object} controlData - Data kontrol yang diupdate
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Response message
   */
  static async editControl(id, controlData, token) {
    try {
      const response = await axios.put(
        `${BASE_URL}/v1/api/kontrol/edit/${id}`,
        controlData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Gagal edit kontrol:", err.response?.data || err.message);
      throw err;
    }
  }

  /**
   * Menandai kontrol sebagai selesai
   * @param {number} id - ID kontrol
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Response message
   */
  static async markControlDone(id, token) {
    try {
      const response = await axios.patch(
        `${BASE_URL}/v1/api/kontrol/done`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Mark done response:", response.data);
      return response.data;
    } catch (err) {
      console.error(
        "Gagal tandai kontrol selesai:",
        err.response?.data || err.message
      );
      throw err;
    }
  }

  /**
   * Menghapus kontrol berdasarkan ID
   * @param {number} id - ID kontrol
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Response message
   */
  static async deleteControl(id, token) {
    try {
      const response = await axios.delete(
        `${BASE_URL}/v1/api/kontrol/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Gagal hapus kontrol:", err.response?.data || err.message);
      throw err;
    }
  }

  // ===============================
  // HISTORY ENDPOINTS
  // ===============================

  /**
   * Menambahkan history baru
   * @param {Object} historyData - Data history
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Response message
   */
  static async addHistory(historyData, token) {
    try {
      const response = await axios.post(
        `${BASE_URL}/v1/api/history/input-history`,
        historyData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Gagal tambah history:", err.response?.data || err.message);
      throw err;
    }
  }

  /**
   * Mendapatkan semua history user
   * @param {string} token - JWT token
   * @returns {Promise<Array>} - Array of history objects
   */
  static async getAllHistory(token) {
    try {
      const response = await axios.get(
        `${BASE_URL}/v1/api/history/get-all-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(
        "Gagal mengambil history:",
        err.response?.data || err.message
      );
      throw err;
    }
  }

  // ===============================
  // PERINGATAN ENDPOINTS
  // ===============================

  /**
   * Membuat peringatan baru
   * @param {Object} warningData - Data peringatan
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Response message
   */
  static async createWarning(warningData, token) {
    try {
      const response = await axios.post(
        `${BASE_URL}/v1/api/peringatan/create-peringatan`,
        warningData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(
        "Gagal buat peringatan:",
        err.response?.data || err.message
      );
      throw err;
    }
  }

  /**
   * Mendapatkan semua peringatan user
   * @param {string} token - JWT token
   * @returns {Promise<Array>} - Array of warning objects
   */
  static async getAllWarnings(token) {
    try {
      const response = await axios.get(
        `${BASE_URL}/v1/api/peringatan/get-all-peringatan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(
        "Gagal mengambil peringatan:",
        err.response?.data || err.message
      );
      throw err;
    }
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  /**
   * Get token from localStorage
   * @returns {string|null} - JWT token
   */
  static getToken() {
    return localStorage.getItem("access_token");
  }

  /**
   * Set token to localStorage
   * @param {string} token - JWT token
   */
  static setToken(token) {
    localStorage.setItem("access_token", token);
  }

  /**
   * Remove token from localStorage
   */
  static removeToken() {
    localStorage.removeItem("access_token");
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if token exists
   */
  static isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }
}
