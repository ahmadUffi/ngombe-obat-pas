import React, { useState, useEffect } from "react";
import { apiService } from "../api/apiservice";
import { useAuth } from "../hooks/useAuth";
import NavbarTop from "../components/Layout/NavbarTop";
import NavbarLeft from "../components/Layout/NavbarLeft";
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
        console.error("Error fetching histories:", err);
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
      console.error("Error refreshing histories:", err);
      setError("Failed to refresh history data");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters, search, and sorting
  const processedHistories = histories
    // First apply status filter
    .filter((history) => (filter === "all" ? true : history.status === filter))
    // Then apply search filter if there's a search term
    .filter((history) => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        (history.nama_obat &&
          history.nama_obat.toLowerCase().includes(searchLower)) ||
        (history.status && history.status.toLowerCase().includes(searchLower))
      );
    })
    // Then sort by date
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
        // Fallback to regular Date parsing
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
      <main className="flex-1 p-4 md:p-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Riwayat Aktivitas
            </h1>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-grow md:flex-grow-0">
                <input
                  type="text"
                  placeholder="Cari riwayat..."
                  className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
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
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>{" "}
                  <option value="jadwal baru dibuat">Jadwal Baru Dibuat</option>
                  <option value="diminum">Diminum</option>
                  <option value="stock menipis">Stok Menipis</option>
                  <option value="stock habis">Stok Habis</option>
                  <option value="stock ditambah">Stok Ditambah</option>
                  <option value="stock dikurangi">Stok Dikurangi</option>
                  <option value="obat tidak diminum">Obat Tidak Diminum</option>
                  <option value="mencoba membuka obat">
                    Mencoba Membuka Obat
                  </option>
                  <option value="jadwal dihapus">Jadwal Dihapus</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>

              {/* Sort order */}
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>

              {/* Refresh button */}
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-colors flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
                Refresh
              </button>
            </div>
          </div>

          {/* Status counts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {/* All */}
            <div
              className={`cursor-pointer border rounded-lg p-3 shadow-sm flex flex-col transition-all ${
                filter === "all"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setFilter("all")}
            >
              <span className="text-sm text-gray-500">Total</span>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{histories.length}</span>
                <span className="text-lg">📊</span>
              </div>
            </div>

            {/* Jadwal baru dibuat */}
            <div
              className={`cursor-pointer border rounded-lg p-3 shadow-sm flex flex-col transition-all ${
                filter === "jadwal baru dibuat"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setFilter("jadwal baru dibuat")}
            >
              <span className="text-sm text-gray-500">Baru</span>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-800">
                  {
                    histories.filter((h) => h.status === "jadwal baru dibuat")
                      .length
                  }
                </span>
                <span className="text-lg">📝</span>
              </div>
            </div>

            {/* Diminum */}
            <div
              className={`cursor-pointer border rounded-lg p-3 shadow-sm flex flex-col transition-all ${
                filter === "diminum"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setFilter("diminum")}
            >
              <span className="text-sm text-gray-500">Diminum</span>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-800">
                  {histories.filter((h) => h.status === "diminum").length}
                </span>
                <span className="text-lg">✓</span>
              </div>
            </div>

            {/* Tidak Diminum */}
            <div
              className={`cursor-pointer border rounded-lg p-3 shadow-sm flex flex-col transition-all ${
                filter === "obat tidak diminum"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setFilter("obat tidak diminum")}
            >
              <span className="text-sm text-gray-500">Tidak Diminum</span>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-red-800">
                  {
                    histories.filter((h) => h.status === "obat tidak diminum")
                      .length
                  }
                </span>
                <span className="text-lg">✗</span>
              </div>
            </div>

            {/* Mencoba */}
            <div
              className={`cursor-pointer border rounded-lg p-3 shadow-sm flex flex-col transition-all ${
                filter === "mencoba membuka obat"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setFilter("mencoba membuka obat")}
            >
              <span className="text-sm text-gray-500">Mencoba</span>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-purple-800">
                  {
                    histories.filter((h) => h.status === "mencoba membuka obat")
                      .length
                  }
                </span>
                <span className="text-lg">🔍</span>
              </div>
            </div>

            {/* Stock */}
            <div
              className={`cursor-pointer border rounded-lg p-3 shadow-sm flex flex-col transition-all ${
                filter === "stock habis" || filter === "stock menipis"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setFilter("stock menipis")}
            >
              <span className="text-sm text-gray-500">Stok Menipis</span>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-yellow-800">
                  {
                    histories.filter(
                      (h) =>
                        h.status === "stock menipis" ||
                        h.status === "stock habis"
                    ).length
                  }
                </span>
                <span className="text-lg">⚠️</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded"
              role="alert"
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>{error}</p>
              </div>
              <div className="mt-3">
                <button
                  className="px-4 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  onClick={refreshData}
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          ) : processedHistories.length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-600 mb-3">
                Tidak ada data riwayat yang tersedia
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Cobalah mengubah filter atau istilah pencarian
              </p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-colors"
                onClick={() => {
                  setFilter("all");
                  setSearchTerm("");
                  refreshData();
                }}
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto shadow rounded-lg">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Nama Obat</th>
                    <th className="py-3 px-6 text-left">Dosis</th>
                    <th className="py-3 px-6 text-left">Sisa Obat</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-left">Waktu Minum</th>
                    <th className="py-3 px-6 text-left">Waktu Tercatat</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {processedHistories.map((history, index) => {
                    const statusBadge = getStatusBadge(history.status);
                    return (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-6">
                          {history.nama_obat || "N/A"}
                        </td>
                        <td className="py-3 px-6">
                          {history.dosis_obat || "N/A"}
                        </td>
                        <td className="py-3 px-6">
                          {history.sisa_obat !== undefined ? (
                            <span
                              className={
                                history.sisa_obat <= 5
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {history.sisa_obat}
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${statusBadge.className}`}
                          >
                            <span>{statusBadge.icon}</span>
                            <span>{statusBadge.text}</span>
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          {formatDate(history.waktu_minum)}
                        </td>
                        <td className="py-3 px-6">
                          {formatDate(history.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination or Stats Footer */}
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <p>
              Menampilkan {processedHistories.length} dari {histories.length}{" "}
              riwayat
            </p>
            <p>
              {filter !== "all" ? (
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setFilter("all")}
                >
                  Lihat Semua Riwayat
                </button>
              ) : null}
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default History;
