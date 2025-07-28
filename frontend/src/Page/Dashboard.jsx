import React, { useState, useEffect } from "react";
import Layout from "../components/Utility/Layout";
import { LoadingStats } from "../components/Utility/LoadingSpinner";
import { WelcomeCard } from "../components/Utility/EmptyState";
import { useJadwal, useControl, useHistory } from "../hooks/useApi";

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayMedications: 0,
    upcomingControls: 0,
    completedToday: 0,
    totalSchedules: 0,
    stockAlert: 0, // Obat yang perlu perhatian (< 6)
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getAllJadwal } = useJadwal();
  const { getAllControl } = useControl();
  const { getAllHistory } = useHistory();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [jadwalData, controlData, historyData] = await Promise.all([
        getAllJadwal().catch(() => []),
        getAllControl().catch(() => []),
        getAllHistory().catch(() => []),
      ]);

      const today = new Date().toISOString().split("T")[0];
      const now = new Date();

      // Today's remaining medications
      const todayMedications = jadwalData.filter((item) => {
        if (!item.jam_awal) return false;
        const times = Array.isArray(item.jam_awal)
          ? item.jam_awal
          : [item.jam_awal];
        return times.some((time) => {
          const medicationTime = new Date(`${today}T${time}`);
          return medicationTime >= now;
        });
      }).length;

      // Upcoming controls
      const upcomingControls = controlData.filter(
        (item) => item.tanggal >= today && !item.isDone
      ).length;

      // Completed today
      const completedToday = historyData.filter(
        (item) =>
          item.created_at?.startsWith(today) && item.status === "diminum"
      ).length;

      // Stock alert: obat yang perlu perhatian (< 6)
      const stockAlert = jadwalData.filter(
        (item) => item.jumlah_obat < 6
      ).length;

      setStats({
        todayMedications,
        upcomingControls,
        completedToday,
        totalSchedules: jadwalData.length,
        stockAlert,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  // Helper function untuk menentukan kondisi stok
  const getStockCondition = (jumlahObat) => {
    if (jumlahObat === 0) {
      return {
        status: "habis",
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: "❌",
      };
    } else if (jumlahObat < 6) {
      return {
        status: "hampir habis",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        icon: "⚠️",
      };
    } else {
      return {
        status: "aman",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: "✅",
      };
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang di SmedBox!</p>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">⚠️ {error}</p>
              <button
                onClick={loadStats}
                className="mt-2 text-red-700 hover:text-red-900 underline text-sm"
              >
                Coba lagi
              </button>
            </div>
          )}
        </div>

        {/* Welcome Card for New Users */}
        {!loading &&
          stats.totalSchedules === 0 &&
          stats.upcomingControls === 0 && (
            <div className="mb-8">
              <WelcomeCard />
            </div>
          )}

        {/* Main Stats */}
        {loading ? (
          <LoadingStats />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today's Medications */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <span className="text-2xl">💊</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.todayMedications}
                  </p>
                  <p className="text-gray-600 text-sm">Obat Hari Ini</p>
                </div>
              </div>
            </div>

            {/* Completed Today */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completedToday}
                  </p>
                  <p className="text-gray-600 text-sm">Sudah Diminum</p>
                </div>
              </div>
            </div>

            {/* Upcoming Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <span className="text-2xl">🏥</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.upcomingControls}
                  </p>
                  <p className="text-gray-600 text-sm">Jadwal Kontrol</p>
                </div>
              </div>
            </div>

            {/* Stock Alert */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.stockAlert}
                  </p>
                  <p className="text-gray-600 text-sm">Perlu Perhatian</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigateTo("/jadwal")}
              className="flex items-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <span className="text-xl mr-3">💊</span>
              <span className="font-medium">Kelola Jadwal Obat</span>
            </button>

            <button
              onClick={() => navigateTo("/control")}
              className="flex items-center p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <span className="text-xl mr-3">🏥</span>
              <span className="font-medium">Jadwal Kontrol</span>
            </button>

            <button
              onClick={() => navigateTo("/history")}
              className="flex items-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <span className="text-xl mr-3">📊</span>
              <span className="font-medium">Lihat Riwayat</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
