import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { LoadingStats } from "../components/UI/LoadingSpinner";
import { WelcomeCard } from "../components/UI/EmptyState";
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4 space-y-8">
        {/* Header with Enhanced Design */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-6 shadow-2xl">
              <span className="text-3xl">📊</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pantau kesehatan dan kelola jadwal obat Anda dengan mudah
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-200 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-pink-50/50 rounded-3xl"></div>
            <div className="relative">
              <p className="text-red-600 font-semibold flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </p>
              <button
                onClick={loadStats}
                className="mt-3 px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}

        {/* Welcome Card for New Users */}
        {!loading &&
          stats.totalSchedules === 0 &&
          stats.upcomingControls === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 rounded-3xl"></div>
              <div className="relative">
                <WelcomeCard />
              </div>
            </div>
          )}

        {/* Main Stats */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-10">
            <LoadingStats />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Today's Medications */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden group hover:transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="flex items-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                    <span className="text-2xl">💊</span>
                  </div>
                  <div className="ml-6">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {stats.todayMedications}
                    </p>
                    <p className="text-gray-600 font-semibold">Obat Hari Ini</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Completed Today */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden group hover:transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="flex items-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-6">
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {stats.completedToday}
                    </p>
                    <p className="text-gray-600 font-semibold">Sudah Diminum</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Controls */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden group hover:transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="flex items-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <div className="ml-6">
                    <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {stats.upcomingControls}
                    </p>
                    <p className="text-gray-600 font-semibold">
                      Jadwal Kontrol
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Alert */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden group hover:transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-amber-50/50 rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/10 to-amber-400/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="flex items-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl shadow-lg">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="ml-6">
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                      {stats.stockAlert}
                    </p>
                    <p className="text-gray-600 font-semibold">
                      Perlu Perhatian
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 rounded-3xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full translate-y-16 translate-x-16"></div>

          <div className="relative">
            <div className="flex items-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl mr-4 shadow-lg">
                <span className="text-xl text-white">⚡</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Aksi Cepat
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => navigateTo("/jadwal")}
                className="group flex items-center p-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="text-2xl mr-4 relative z-10">💊</span>
                <span className="font-bold text-lg relative z-10">
                  Kelola Jadwal Obat
                </span>
              </button>

              <button
                onClick={() => navigateTo("/control")}
                className="group flex items-center p-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-orange-500/25 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="text-2xl mr-4 relative z-10">🏥</span>
                <span className="font-bold text-lg relative z-10">
                  Jadwal Kontrol
                </span>
              </button>

              <button
                onClick={() => navigateTo("/history")}
                className="group flex items-center p-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-green-500/25 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="text-2xl mr-4 relative z-10">📊</span>
                <span className="font-bold text-lg relative z-10">
                  Lihat Riwayat
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
