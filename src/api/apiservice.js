import axios from "axios";

export class apiService {
  static async getAllData(token) {
    try {
      const response = await axios.get(`${process.env.VITE_BASE_URL}/jadwal`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
      throw err;
    }
  }

  static async inputJadwal(data, token) {
    try {
      const response = await axios.post(
        `${process.env.BASE_URL}/jadwal/input`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Gagal input jadwal:", err.message);
      throw err;
    }
  }
}
