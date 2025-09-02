import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { LoadingStats } from "../components/UI/LoadingSpinner";
import { WelcomeCard } from "../components/UI/EmptyState";
import { useJadwal, useControl, useHistory } from "../hooks/useApi";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [stats, setStats] = useState({
    // Dose log status
    dosesTotalToday: 0, // jumlah obat seharusnya hari ini
    dosesTakenToday: 0, // taken (diminum/diambil)
    dosesPendingToday: 0, // pending (belum waktunya / belum diambil)
    dosesMissedToday: 0, // missed (waktu terlewat dan belum diambil)

    // Other stats retained
    upcomingControls: 0,
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

      // Fetch data with better error handling
      let jadwalData = [];
      let controlData = [];
      let historyData = [];

      try {
        const jadwalResponse = await getAllJadwal();

        if (jadwalResponse) {
          if (jadwalResponse.data && Array.isArray(jadwalResponse.data)) {
            jadwalData = jadwalResponse.data;
          } else if (Array.isArray(jadwalResponse)) {
            jadwalData = jadwalResponse;
          } else {
            jadwalData = [];
          }
        } else {
          jadwalData = [];
        }
      } catch (err) {
        jadwalData = [];
      }

      try {
        const controlResponse = await getAllControl();

        if (controlResponse) {
          if (controlResponse.data && Array.isArray(controlResponse.data)) {
            controlData = controlResponse.data;
          } else if (Array.isArray(controlResponse)) {
            controlData = controlResponse;
          } else {
            controlData = [];
          }
        } else {
          controlData = [];
        }
      } catch (err) {
        controlData = [];
      }

      try {
        const historyResponse = await getAllHistory();

        // Handle different response formats
        if (historyResponse) {
          if (historyResponse.data && Array.isArray(historyResponse.data)) {
            // Format: { success: true, message: "...", data: [...] }
            historyData = historyResponse.data;
          } else if (Array.isArray(historyResponse)) {
            // Format: [...]
            historyData = historyResponse;
          } else if (historyResponse.success && historyResponse.data) {
            // Another possible format
            historyData = Array.isArray(historyResponse.data)
              ? historyResponse.data
              : [];
          } else {
            historyData = [];
          }
        } else {
          historyData = [];
        }
      } catch (err) {
        historyData = [];
      }

      const today = new Date().toISOString().split("T")[0];
      const now = new Date();

      // Build list of all scheduled dose times for today
      const scheduledTimesToday = (() => {
        try {
          const allTimes = [];
          for (const item of jadwalData || []) {
            if (!item || !item.jam_awal) continue;
            const times = Array.isArray(item.jam_awal)
              ? item.jam_awal
              : [item.jam_awal];
            for (const t of times) {
              if (!t) continue;
              try {
                const dt = new Date(`${today}T${t}`);
                if (!isNaN(dt.getTime())) allTimes.push(dt);
              } catch (_) {
                // ignore invalid time
              }
            }
          }
          // Sort ascending to help allocation
          return allTimes.sort((a, b) => a - b);
        } catch (_) {
          return [];
        }
      })();

      const totalScheduledToday = scheduledTimesToday.length;

      // Upcoming controls
      const upcomingControls = controlData.filter((item) => {
        if (!item || !item.tanggal) return false;
        try {
          return item.tanggal >= today && !item.isDone;
        } catch (err) {
          return false;
        }
      }).length;

      // Taken today from history (diminum/diambil) based on created_at
      const takenTodayCount = historyData.filter((item) => {
        try {
          if (!item || typeof item.created_at !== "string") return false;
          const isToday = item.created_at.startsWith(today);
          const isTaken =
            item.status === "diminum" || item.status === "diambil";
          return isToday && isTaken;
        } catch (_) {
          return false;
        }
      }).length;

      // Derive pending and missed by comparing scheduled times to now and allocating taken to past first
      const pastScheduled = scheduledTimesToday.filter((dt) => dt < now).length;
      const futureScheduled = totalScheduledToday - pastScheduled;
      const allocatedToPast = Math.min(takenTodayCount, pastScheduled);
      const remainingTaken = Math.max(0, takenTodayCount - allocatedToPast);
      const missed = Math.max(0, pastScheduled - allocatedToPast);
      const pending = Math.max(0, futureScheduled - remainingTaken);

      setStats({
        dosesTotalToday: totalScheduledToday,
        dosesTakenToday: Math.min(takenTodayCount, totalScheduledToday),
        dosesPendingToday: Math.min(
          pending,
          Math.max(
            0,
            totalScheduledToday - Math.min(takenTodayCount, totalScheduledToday)
          )
        ),
        dosesMissedToday: Math.min(
          missed,
          Math.max(
            0,
            totalScheduledToday - Math.min(takenTodayCount, totalScheduledToday)
          )
        ),
        upcomingControls,
      });
    } catch (error) {
      toast.error(
        "Gagal memuat data dashboard. Silakan coba refresh atau periksa koneksi internet."
      );
      setError(
        "Gagal memuat data dashboard. Silakan coba refresh atau periksa koneksi internet."
      );

      setStats({
        dosesTotalToday: 0,
        dosesTakenToday: 0,
        dosesPendingToday: 0,
        dosesMissedToday: 0,
        upcomingControls: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4 space-y-8">
        {/* Header */}
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

            {!loading && (
              <button
                onClick={loadStats}
                className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
              >
                <span className="mr-2">🔄</span>
                Refresh Data
              </button>
            )}
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

        {/* Main Stats */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-10">
            <LoadingStats />
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 rounded-3xl"></div>
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl mr-4 shadow-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Statistik Hari Ini
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Overview aktivitas kesehatan Anda
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {/* Total Scheduled Today */}
                <div className="relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-blue-400/10 rounded-full -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform"></div>
                  <div className="relative text-center">
                    <div className="text-2xl mb-2">⌚</div>
                    <div className="text-2xl font-bold mb-1 text-blue-600">
                      {stats.dosesTotalToday}
                    </div>
                    <div className="text-sm font-semibold text-gray-600">
                      Jadwal Obat Hari Ini
                    </div>
                  </div>
                </div>

                {/* Taken Today */}
                <div className="relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-green-400/10 rounded-full -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform"></div>
                  <div className="relative text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="text-2xl font-bold mb-1 text-green-600">
                      {stats.dosesTakenToday}
                    </div>
                    <div className="text-sm font-semibold text-gray-600">
                      Diambil/Diminum
                    </div>
                  </div>
                </div>

                {/* Pending Today */}
                <div className="relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200/50">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-yellow-400/10 rounded-full -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform"></div>
                  <div className="relative text-center">
                    <div className="text-2xl mb-2">⏳</div>
                    <div className="text-2xl font-bold mb-1 text-yellow-600">
                      {stats.dosesPendingToday}
                    </div>
                    <div className="text-sm font-semibold text-gray-600">
                      Menunggu Waktu
                    </div>
                  </div>
                </div>

                {/* Missed Today */}
                <div className="relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group bg-gradient-to-br from-red-50 to-pink-50 border border-red-200/50">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-red-400/10 rounded-full -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform"></div>
                  <div className="relative text-center">
                    <div className="text-2xl mb-2">❌</div>
                    <div className="text-2xl font-bold mb-1 text-red-600">
                      {stats.dosesMissedToday}
                    </div>
                    <div className="text-sm font-semibold text-gray-600">
                      Terlewat
                    </div>
                  </div>
                </div>

                {/* Upcoming Controls */}
                <div className="relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200/50">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-orange-400/10 rounded-full -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform"></div>
                  <div className="relative text-center">
                    <div className="text-2xl mb-2">🏥</div>
                    <div className="text-2xl font-bold mb-1 text-orange-600">
                      {stats.upcomingControls}
                    </div>
                    <div className="text-sm font-semibold text-gray-600">
                      Jadwal Kontrol
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 rounded-3xl"></div>
          <div className="relative">
            <div className="flex items-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl mr-4 shadow-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Aksi Cepat
                </h2>
                <p className="text-gray-600 mt-1">
                  Navigasi cepat ke fitur utama
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => navigateTo("/jadwal")}
                className="group relative p-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="flex items-center relative z-10">
                  <span className="text-2xl mr-4">💊</span>
                  <div className="text-left">
                    <div className="font-bold text-lg">Kelola Jadwal Obat</div>
                    <div className="text-blue-100 text-sm">
                      Tambah & edit jadwal
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateTo("/control")}
                className="group relative p-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-orange-500/25 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="flex items-center relative z-10">
                  <span className="text-2xl mr-4">🏥</span>
                  <div className="text-left">
                    <div className="font-bold text-lg">Jadwal Kontrol</div>
                    <div className="text-orange-100 text-sm">
                      Kontrol dokter
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigateTo("/history")}
                className="group relative p-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-green-500/25 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="flex items-center relative z-10">
                  <span className="text-2xl mr-4">📊</span>
                  <div className="text-left">
                    <div className="font-bold text-lg">Lihat Riwayat</div>
                    <div className="text-green-100 text-sm">
                      Aktivitas kesehatan
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
