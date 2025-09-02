import axios from "axios";

// Base URL dari API documentation
const BASE_URL = import.meta.env.VITE_BASE_URL;

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
      throw err;
    }
  }

  /**
   * Mengirim email reset password
   * @param {Object} data - {email}
   * @returns {Promise<Object>} - Response message
   */
  static async forgotPassword(data) {
    try {
      const response = await axios.post(
        `${BASE_URL}/v1/api/forgot-password`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
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
      return response.data; // Extract the data array from the response
    } catch (err) {
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
      const response = await axios.delete(
        `${BASE_URL}/v1/api/jadwal/delete/${jadwal_id}`,
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : undefined,
          },
        }
      );
      return response.data;
    } catch (err) {
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
      return response.data.data; // Extract the data array from the response
    } catch (err) {
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
        { id, isDone: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
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
          },
        }
      );
      return response.data;
    } catch (err) {
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
      return response.data; // Extract the data array from the response
    } catch (err) {
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
      return response.data.data; // Extract the data array from the response
    } catch (err) {
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

  // ===============================
  // NOTES ENDPOINTS
  // ===============================

  /**
   * Get all notes for authenticated user
   * @param {string} category - Optional category filter
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Notes data
   */
  static async getAllNotes(category = null, token) {
    try {
      const url = category
        ? `${BASE_URL}/v1/api/notes?category=${category}`
        : `${BASE_URL}/v1/api/notes`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get a specific note by ID
   * @param {string} noteId - Note ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Note data
   */
  static async getNoteById(noteId, token) {
    try {
      const response = await axios.get(`${BASE_URL}/v1/api/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Create a new note
   * @param {Object} noteData - {category, message}
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Created note data
   */
  static async createNote(noteData, token) {
    try {
      const response = await axios.post(`${BASE_URL}/v1/api/notes`, noteData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update an existing note
   * @param {string} noteId - Note ID
   * @param {Object} updateData - {category?, message?}
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Updated note data
   */
  static async updateNote(noteId, updateData, token) {
    try {
      const response = await axios.put(
        `${BASE_URL}/v1/api/notes/${noteId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete a note
   * @param {string} noteId - Note ID
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Deleted note data
   */
  static async deleteNote(noteId, token) {
    try {
      const response = await axios.delete(
        `${BASE_URL}/v1/api/notes/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Search notes
   * @param {string} query - Search query
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Search results
   */
  static async searchNotes(query, token) {
    try {
      const response = await axios.get(
        `${BASE_URL}/v1/api/notes/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get notes statistics
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Notes statistics
   */
  static async getNotesStats(token) {
    try {
      const response = await axios.get(`${BASE_URL}/v1/api/notes/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  // ===============================
  // PROFILE ENDPOINTS
  // ===============================

  /**
   * Update user profile
   * @param {Object} profileData - {username, no_hp}
   * @param {string} token - JWT token (optional, will get from localStorage if not provided)
   * @returns {Promise<Object>} - Updated profile data
   */
  static async updateProfile(profileData, token = null) {
    try {
      const authToken = token || this.getToken();

      // Build FormData to support optional image upload
      const form = new FormData();
      if (profileData?.username !== undefined)
        form.append("username", profileData.username);
      if (profileData?.no_hp !== undefined && profileData.no_hp !== null)
        form.append("no_hp", profileData.no_hp);
      if (profileData?.image) form.append("image", profileData.image);

      const response = await axios.put(
        `${BASE_URL}/v1/api/profile/update`,
        form,
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : "",
            // Do NOT set Content-Type manually; let the browser set the multipart boundary
          },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update user avatar
   * @param {string} avatarUrl - Avatar URL
   * @param {string} userId - User ID
   * @param {string} token - JWT token (optional, will get from localStorage if not provided)
   * @returns {Promise<Object>} - Updated avatar data
   */
  static async updatePhoneNumber(phoneNumber, userId, token = null) {
    try {
      const authToken = token || this.getToken();

      const response = await axios.put(
        `${BASE_URL}/v1/api/profile/phone`,
        { no_hp: phoneNumber, user_id: userId },
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : "",
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @deprecated Use updatePhoneNumber instead
   */
  static async updateAvatar(avatarUrl, userId, token = null) {
    try {
      const authToken = token || this.getToken();

      const response = await axios.put(
        `${BASE_URL}/v1/api/profile/avatar`,
        { avatar_url: avatarUrl, user_id: userId },
        {
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : "",
            "Content-Type": "application/json",
            "x-user-id": userId, // Add user_id to headers as backup
          },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  // does logs api

  static async getLogs(token) {
    const authToken = token || this.getToken();

    try {
      const response = await axios.get(
        `${BASE_URL}/v1/api/dose-log/status-today`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }
}
