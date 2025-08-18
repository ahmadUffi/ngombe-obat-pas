import React, { useState, useEffect } from "react";
import { apiService } from "../api/apiservice";
import { useAuth } from "../hooks/useAuth";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { parseISO, isValid } from "date-fns";
import Layout from "../components/Layout/Layout";

const History = () => {
  const { token } = useAuth();
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAllHistory(token);
        if (response.success) {
          setHistories(response.data || []);
        } else {
          setError("Failed to fetch histories");
        }
      } catch (err) {
        setError("Failed to load history data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchHistories();
    }
  }, [token]);

  // Refresh data function
  const refreshData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllHistory(token);
      if (response.success) {
        setHistories(response.data || []);
        setError(null);
      } else {
        setError("Failed to refresh histories");
      }
    } catch (err) {
      setError("Failed to refresh history data");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters, search, and sorting
  const processedHistories = histories
    .filter((history) => (filter === "all" ? true : history.status === filter))
    .filter((history) => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        (history.nama_obat &&
          history.nama_obat.toLowerCase().includes(searchLower)) ||
        (history.status && history.status.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      try {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      } catch (e) {
        return 0;
      }
    });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = parseISO(dateString);
      if (!isValid(date)) throw new Error("Invalid date");
      return format(date, "dd MMM yyyy, HH:mm", { locale: id });
    } catch (e) {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString || "N/A";
        return format(date, "dd MMM yyyy, HH:mm", { locale: id });
      } catch (err) {
        return dateString || "N/A";
      }
    }
  };

  // Get status badge color and text
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "jadwal baru dibuat":
        return {
          className: "bg-blue-100 text-blue-800 border border-blue-200",
          text: "Jadwal Baru Dibuat",
          icon: "📝",
        };
      case "diminum":
        return {
          className: "bg-green-100 text-green-800 border border-green-200",
          text: "Diminum",
          icon: "✓",
        };
      case "stock menipis":
        return {
          className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
          text: "Stok Menipis",
          icon: "⚠️",
        };
      case "stock habis":
        return {
          className: "bg-red-100 text-red-800 border border-red-200",
          text: "Stok Habis",
          icon: "❗",
        };
      case "obat tidak diminum":
        return {
          className:
            "bg-red-100 text-red-800 border border-red-200 font-medium",
          text: "Obat Tidak Diminum",
          icon: "✗",
        };
      case "mencoba membuka obat":
        return {
          className: "bg-purple-100 text-purple-800 border border-purple-200",
          text: "Mencoba Membuka Obat",
          icon: "🔍",
        };
      case "jadwal dihapus":
        return {
          className: "bg-gray-100 text-gray-800 border border-gray-300",
          text: "Jadwal Dihapus",
          icon: "🗑️",
        };
      case "stock ditambah":
        return {
          className: "bg-green-100 text-green-800 border border-green-200",
          text: "Stok Ditambah",
          icon: "➕",
        };
      case "stock dikurangi":
        return {
          className: "bg-orange-100 text-orange-800 border border-orange-200",
          text: "Stok Dikurangi",
          icon: "➖",
        };
      default:
        return {
          className: "bg-gray-100 text-gray-800",
          text: status || "Unknown",
          icon: "ℹ️",
        };
    }
  };

  return (
    <Layout>
      <main className="p-4 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Riwayat Aktivitas
          </h1>
          <p className="text-gray-600 text-lg">
            Pantau semua aktivitas obat dan jadwal kontrol Anda
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {histories.length}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Total Aktivitas
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {
                  histories.filter((h) => h.status?.toLowerCase() === "diminum")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Obat Diminum
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {
                  histories.filter((h) =>
                    h.status?.toLowerCase().includes("menipis")
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Stok Menipis
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {
                  histories.filter((h) =>
                    h.status?.toLowerCase().includes("habis")
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Stok Habis
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📊</div>
              <h2 className="text-xl font-bold text-gray-800">
                Filter & Pencarian
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-grow lg:flex-grow-0 lg:w-64">
                <input
                  type="text"
                  placeholder="Cari riwayat aktivitas..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Filter */}
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white min-w-48"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">🔍 Semua Status</option>
                <option value="jadwal baru dibuat">
                  📝 Jadwal Baru Dibuat
                </option>
                <option value="diminum">✅ Diminum</option>
                <option value="stock menipis">⚠️ Stok Menipis</option>
                <option value="stock habis">❌ Stok Habis</option>
                <option value="stock ditambah">➕ Stok Ditambah</option>
                <option value="stock dikurangi">➖ Stok Dikurangi</option>
                <option value="obat tidak diminum">
                  ❌ Obat Tidak Diminum
                </option>
                <option value="mencoba membuka obat">
                  🔍 Mencoba Membuka Obat
                </option>
                <option value="jadwal dihapus">🗑️ Jadwal Dihapus</option>
              </select>

              {/* Sort order */}
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">📅 Terbaru</option>
                <option value="oldest">📅 Terlama</option>
              </select>

              {/* Refresh button */}
              <button
                onClick={refreshData}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 whitespace-nowrap"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Memuat...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filter Result Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-gray-600">
                <span className="font-medium text-gray-800">
                  Menampilkan {processedHistories.length}
                </span>{" "}
                dari {histories.length} aktivitas
              </div>
              {(filter !== "all" || searchTerm) && (
                <div className="flex items-center gap-2">
                  {filter !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium border border-blue-300">
                      Filter: {getStatusBadge(filter).text}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 font-medium border border-purple-300">
                      Pencarian: "{searchTerm}"
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setFilter("all");
                      setSearchTerm("");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Data Display */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <span className="text-gray-700 font-medium text-lg">
                  Memuat riwayat...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Terjadi Kesalahan
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                onClick={refreshData}
              >
                🔄 Coba Lagi
              </button>
            </div>
          ) : processedHistories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {filter !== "all" || searchTerm
                  ? "Tidak Ada Data yang Sesuai"
                  : "Belum Ada Riwayat"}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter !== "all" || searchTerm
                  ? "Coba ubah filter atau kata kunci pencarian Anda"
                  : "Riwayat aktivitas akan muncul di sini setelah Anda mulai menggunakan aplikasi"}
              </p>
              {(filter !== "all" || searchTerm) && (
                <button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  onClick={() => {
                    setFilter("all");
                    setSearchTerm("");
                  }}
                >
                  🔄 Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="flex items-center mb-6">
                <div className="text-2xl mr-3">📜</div>
                <h2 className="text-xl font-bold text-gray-800">
                  Daftar Riwayat Aktivitas
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                        Nama Obat
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                        Dosis
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                        Sisa Obat
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                        Waktu Minum
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                        Waktu Tercatat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedHistories.map((history, index) => {
                      const statusBadge = getStatusBadge(history.status);
                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900">
                              {history.nama_obat || "N/A"}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {history.dosis_obat || "N/A"}
                          </td>
                          <td className="py-4 px-6">
                            {history.sisa_obat !== undefined ? (
                              <span
                                className={`font-medium ${
                                  history.sisa_obat <= 5
                                    ? "text-red-600"
                                    : history.sisa_obat <= 10
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }`}
                              >
                                {history.sisa_obat}
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium gap-1 ${statusBadge.className}`}
                            >
                              <span>{statusBadge.icon}</span>
                              <span>{statusBadge.text}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600 text-sm">
                            {formatDate(history.waktu_minum)}
                          </td>
                          <td className="py-4 px-6 text-gray-600 text-sm">
                            {formatDate(history.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default History;
