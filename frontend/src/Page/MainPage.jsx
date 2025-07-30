import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { useJadwal, useControl } from "../hooks/useApi";

const MainPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJadwal: 0,
    jadwalKritis: 0,
    controlHariIni: 0,
    totalControl: 0,
  });

  const { getAllJadwal } = useJadwal();
  const { getAllControl } = useControl();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load jadwal stats
      const jadwalData = await getAllJadwal();
      const totalJadwal = jadwalData?.length || 0;

      // Filter berdasarkan kondisi stok baru:
      // Hampir habis: < 6 (tapi > 0) atau Habis: = 0
      const jadwalKritis =
        jadwalData?.filter((item) => item.jumlah_obat < 6).length || 0;

      // Load control stats
      const controlData = await getAllControl();
      const totalControl = controlData?.length || 0;
      const today = new Date().toISOString().split("T")[0];
      const controlHariIni =
        controlData?.filter((item) => item.tanggal === today && !item.isDone)
          .length || 0;

      setStats({
        totalJadwal,
        jadwalKritis,
        controlHariIni,
        totalControl,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      // Set default stats on error
      setStats({
        totalJadwal: 0,
        jadwalKritis: 0,
        controlHariIni: 0,
        totalControl: 0,
      });
    }
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

  const navigationCards = [
    {
      title: "Jadwal Obat",
      description: "Kelola jadwal minum obat Anda",
      icon: "💊",
      path: "/jadwal",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      stats: `${stats.totalJadwal} Total${
        stats.jadwalKritis > 0 ? ` • ${stats.jadwalKritis} Perlu Perhatian` : ""
      }`,
    },
    {
      title: "Kontrol Dokter",
      description: "Jadwal kontrol dengan dokter",
      icon: "🏥",
      path: "/control",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      stats: `${stats.totalControl} Total${
        stats.controlHariIni > 0 ? ` • ${stats.controlHariIni} Hari Ini` : ""
      }`,
    },
    {
      title: "Catatan",
      description: "Catat informasi penting obat",
      icon: "📝",
      path: "/note",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      stats: "Kelola catatan Anda",
    },
  ];

  return (
    <Layout>
      <div className="p-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Selamat Datang di SmedBox
          </h1>
          <p className="text-gray-600 text-lg">
            Asisten pintar untuk manajemen obat Anda
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.totalJadwal}
              </div>
              <div className="text-sm text-gray-600">Total Obat</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {stats.jadwalKritis}
              </div>
              <div className="text-sm text-gray-600">Perlu Perhatian</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.controlHariIni}
              </div>
              <div className="text-sm text-gray-600">Kontrol Hari Ini</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.totalControl}
              </div>
              <div className="text-sm text-gray-600">Total Kontrol</div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              className={`${card.color} ${card.hoverColor} text-white p-6 rounded-xl shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{card.icon}</div>
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-white text-opacity-90 text-sm mb-3">
                {card.description}
              </p>
              <div className="text-xs text-white text-opacity-75 font-medium">
                {card.stats}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/jadwal")}
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              <div className="text-2xl mr-4">💊</div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">
                  Tambah Obat Baru
                </div>
                <div className="text-sm text-gray-600">
                  Buat jadwal obat baru
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/control")}
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
            >
              <div className="text-2xl mr-4">🏥</div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">
                  Jadwalkan Kontrol
                </div>
                <div className="text-sm text-gray-600">
                  Buat janji dengan dokter
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MainPage;
