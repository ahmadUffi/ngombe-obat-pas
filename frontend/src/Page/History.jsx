import React, { useState, useEffect } from "react";
import { apiService } from "../api/apiservice";
import { useAuth } from "../hooks/useAuth";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { parseISO, isValid } from "date-fns";
import ReactPaginate from "react-paginate";
import {
  Clock,
  CalendarDays,
  Filter,
  Search,
  RefreshCw,
  FileText,
  Package,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Layout from "../components/Layout/Layout";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { toast } from "react-toastify";

const History = () => {
  const { token } = useAuth();
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getAllHistory(token);

        // Handle different response formats
        if (response) {
          if (response.success && response.data) {
            // Format: { success: true, message: "...", data: [...] }
            const historyData = Array.isArray(response.data)
              ? response.data
              : [];
            setHistories(historyData);
          } else if (Array.isArray(response)) {
            // Format: [...]
            setHistories(response);
          } else if (response.data && Array.isArray(response.data)) {
            // Format without success flag but with data property
            setHistories(response.data);
          } else {
            setError("Format respons tidak sesuai");
            setHistories([]);
          }
        } else {
          toast.warning("Tidak ada data history yang ditemukan");
          setError("Tidak ada data yang diterima dari server");
          setHistories([]);
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load history data";
        toast.error("Gagal memuat data history. Silakan coba lagi.");
        setError(errorMessage);
        setHistories([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchHistories();
    }
  }, [token]);

  const filteredHistories = React.useMemo(() => {
    try {
      if (!Array.isArray(histories)) {
        return [];
      }

      if (histories.length === 0) {
        return [];
      }

      const filtered = histories.filter((history) => {
        if (!history) {
          return false;
        }

        // Safe property access
        const historyStatus = history.status || "";
        const historyNamaObat = history.nama_obat || "";
        const historyWaktuMinum = history.waktu_minum || "";
        const historyPasienName = history.pasien_name || "";
        const historyControlInfo = history.control_info || "";
        const historyDokter = history.dokter || "";

        const matchesFilter =
          filter === "all" ||
          historyStatus.toLowerCase() === filter.toLowerCase();

        const matchesSearch =
          !searchTerm ||
          historyNamaObat.toLowerCase().includes(searchTerm.toLowerCase()) ||
          historyWaktuMinum.toLowerCase().includes(searchTerm.toLowerCase()) ||
          historyStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
          historyPasienName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          historyControlInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          historyDokter.toLowerCase().includes(searchTerm.toLowerCase());

        console.log(historyNamaObat.toLowerCase());
        console.log(
          historyNamaObat.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return matchesFilter && matchesSearch;
      });

      return filtered;
    } catch (error) {
      return [];
    }
  }, [histories, filter, searchTerm]);

  const sortedHistories = React.useMemo(() => {
    try {
      if (!Array.isArray(filteredHistories)) {
        return [];
      }

      if (filteredHistories.length === 0) {
        return [];
      }

      const sorted = [...filteredHistories].sort((a, b) => {
        try {
          // Safe date parsing
          if (!a || !b) return 0;

          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);

          // Check if dates are valid
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) {
            return 0;
          } else if (isNaN(dateA.getTime())) {
            return 1; // Put invalid dates at the end
          } else if (isNaN(dateB.getTime())) {
            return -1; // Put invalid dates at the end
          }

          return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        } catch (error) {
          return 0;
        }
      });

      return sorted;
    } catch (error) {
      return [];
    }
  }, [filteredHistories, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedHistories.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHistories = sortedHistories.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, filter]);

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  // Fungsi untuk format tanggal yang user-friendly
  const formatDateUserFriendly = (dateString) => {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffTime / (1000 * 60));

      if (diffMinutes < 60) {
        return diffMinutes <= 1 ? "Baru saja" : `${diffMinutes} menit lalu`;
      } else if (diffHours < 24) {
        return `${diffHours} jam lalu`;
      } else if (diffDays < 7) {
        return `${diffDays} hari lalu`;
      } else {
        return date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: diffDays > 365 ? "numeric" : undefined,
        });
      }
    } catch (error) {
      return null;
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) {
        return "Tanggal tidak tersedia";
      }

      if (typeof dateString !== "string") {
        return "Format tanggal tidak valid";
      }

      const date = parseISO(dateString);

      if (!isValid(date)) {
        return "Format tanggal tidak valid";
      }

      return format(date, "dd MMMM yyyy, HH:mm", { locale: id });
    } catch (error) {
      return "Error format tanggal";
    }
  };

  // Format waktu minum untuk display yang lebih baik
  const formatWaktuMinum = (waktuMinum) => {
    if (!waktuMinum) return "Waktu tidak tersedia";

    // Jika waktu_minum adalah string yang berisi waktu gabungan seperti "08:0012:00"
    if (typeof waktuMinum === "string") {
      // Split berdasarkan pattern waktu (HH:MM)
      const timePattern = /(\d{1,2}:\d{2})/g;
      const times = waktuMinum.match(timePattern);

      if (times && times.length > 0) {
        return times.join(", ");
      }

      // Fallback jika tidak match pattern, coba split manual
      if (waktuMinum.length >= 10) {
        // Asumsi format seperti "08:0012:00" - split setiap 5 karakter
        const result = [];
        for (let i = 0; i < waktuMinum.length; i += 5) {
          const time = waktuMinum.substring(i, i + 5);
          if (time.includes(":") && time.length >= 4) {
            result.push(time);
          }
        }
        if (result.length > 0) {
          return result.join(", ");
        }
      }
    }

    // Jika waktu_minum adalah array
    if (Array.isArray(waktuMinum)) {
      return waktuMinum.join(", ");
    }

    return waktuMinum;
  };

  const getActionColor = (action) => {
    switch (action) {
      case "diambil":
        return "bg-gradient-to-r from-green-500 to-emerald-500";
      case "diminum":
        return "bg-gradient-to-r from-teal-500 to-cyan-500";
      case "terlewat":
        return "bg-gradient-to-r from-red-500 to-rose-500";
      case "obat tidak diminum":
        return "bg-gradient-to-r from-orange-500 to-red-500";
      case "dijadwalkan":
        return "bg-gradient-to-r from-blue-500 to-indigo-500";
      case "scheduled":
        return "bg-gradient-to-r from-purple-500 to-violet-500";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500";
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
      // Legacy status support
      case "diambil":
        return {
          className: "bg-green-100 text-green-800 border border-green-200",
          text: "Diambil",
          icon: "✓",
        };
      case "terlewat":
        return {
          className: "bg-red-100 text-red-800 border border-red-200",
          text: "Terlewat",
          icon: "⚠",
        };
      case "obat tidak diminum":
        return {
          className: "bg-orange-100 text-orange-800 border border-orange-200",
          text: "Obat Tidak Diminum",
          icon: "❌",
        };
      case "dijadwalkan":
        return {
          className: "bg-blue-100 text-blue-800 border border-blue-200",
          text: "Dijadwalkan",
          icon: "📅",
        };
      case "scheduled":
        return {
          className: "bg-purple-100 text-purple-800 border border-purple-200",
          text: "Scheduled",
          icon: "⏰",
        };
      default:
        return {
          className: "bg-gray-100 text-gray-800 border border-gray-300",
          text: status || "Unknown",
          icon: "ℹ️",
        };
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAllHistory(token);

      // Handle different response formats
      if (response) {
        if (response.success && response.data) {
          const historyData = Array.isArray(response.data) ? response.data : [];
          setHistories(historyData);
          setError(null);
        } else if (Array.isArray(response)) {
          setHistories(response);
          setError(null);
        } else if (response.data && Array.isArray(response.data)) {
          setHistories(response.data);
          setError(null);
        } else {
          setError("Format respons tidak sesuai saat refresh");
          setHistories([]);
        }
      } else {
        setError("Tidak ada data yang diterima dari server saat refresh");
        setHistories([]);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to refresh history data";
      toast.error("Gagal memperbarui data. Silakan coba lagi.");
      setError(errorMessage);
      setHistories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
              <LoadingSpinner />
              <p className="text-center text-gray-600 mt-4">
                Loading history data...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mb-4">
                  <span className="text-2xl text-white">⚠</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Error Loading Data
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={refreshData}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}

          {/* Filter and Search Section */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-3xl opacity-90"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl mr-4 shadow-lg">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Filter & Pencarian
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari obat, waktu, atau aksi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/70 border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-lg"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/70 border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-lg appearance-none cursor-pointer"
                  >
                    <option value="all">Semua Aktivitas</option>
                    <optgroup label="Aktivitas Jadwal">
                      <option value="jadwal baru dibuat">
                        Jadwal Baru Dibuat
                      </option>
                      <option value="diminum">Diminum</option>
                      <option value="obat tidak diminum">
                        Obat Tidak Diminum
                      </option>
                      <option value="mencoba membuka obat">
                        Mencoba Membuka Obat
                      </option>
                      <option value="jadwal dihapus">Jadwal Dihapus</option>
                      <option value="stock ditambah">Stok Ditambah</option>
                      <option value="stock dikurangi">Stok Dikurangi</option>
                    </optgroup>
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/70 border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-lg appearance-none cursor-pointer"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-3xl opacity-90"></div>
            <div className="relative z-10 p-8">
              <div className="flex items-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl mr-4 shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Daftar Riwayat ({sortedHistories.length})
                </h2>
                {sortedHistories.length > 0 && (
                  <div className="ml-auto text-sm text-gray-600">
                    Halaman {currentPage + 1} dari {totalPages} (
                    {startIndex + 1}-
                    {Math.min(endIndex, sortedHistories.length)} dari{" "}
                    {sortedHistories.length} data)
                  </div>
                )}
              </div>

              {sortedHistories.length === 0 ? (
                <div className="text-center py-12">
                  {histories.length === 0 ? (
                    <div className="max-w-md mx-auto">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-6">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">
                        Tidak ada riwayat
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Belum ada aktivitas obat yang tercatat. Mulai jadwalkan
                        obat Anda untuk melihat riwayat di sini.
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-6">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">
                        Tidak ada hasil yang ditemukan
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {searchTerm
                          ? `Tidak ada aktivitas yang cocok dengan pencarian "${searchTerm}"`
                          : `Tidak ada aktivitas dengan filter "${
                              filter === "all" ? "Semua" : filter
                            }"`}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            Hapus Pencarian
                          </button>
                        )}
                        {filter !== "all" && (
                          <button
                            onClick={() => setFilter("all")}
                            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            Reset Filter
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-100 to-indigo-100">
                        <th className="px-8 py-4 text-left text-sm font-semibold text-purple-800 border border-purple-200 rounded-tl-xl w-1/4">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-purple-800 border border-purple-200 w-1/6">
                          Nama Obat / Pasien
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-purple-800 border border-purple-200 w-1/6">
                          Waktu / Jadwal
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-purple-800 border border-purple-200 w-1/8">
                          Dosis / Dokter
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-purple-800 border border-purple-200 w-1/8">
                          Sisa Obat
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-purple-800 border border-purple-200 rounded-tr-xl w-1/6">
                          Tanggal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentHistories
                        .map((history, index) => {
                          // Additional safety check for each history item
                          if (!history) {
                            return null;
                          }

                          return (
                            <tr
                              key={history.id || `history-${index}`}
                              className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200"
                            >
                              <td className="lg:px-8 lg:py-4 px-3 py-2 border border-purple-200">
                                <div className="flex items-center space-x-3">
                                  <span
                                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
                                      getStatusBadge(history.status).className
                                    }`}
                                  >
                                    {getStatusBadge(history.status).icon}{" "}
                                    {getStatusBadge(history.status).text}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 border border-purple-200">
                                <span className="font-medium text-gray-800">
                                  {history.nama_obat ||
                                    history.pasien_name ||
                                    (history.control_info
                                      ? `Kontrol: ${history.control_info}`
                                      : null) ||
                                    "Informasi tidak tersedia"}
                                </span>
                              </td>
                              <td className="px-6 py-4 border border-purple-200">
                                <div className="flex items-center text-gray-600">
                                  <Clock className="w-4 h-4 mr-2 text-purple-500" />
                                  <span>
                                    {formatWaktuMinum(
                                      history.waktu_minum ||
                                        history.waktu_kontrol ||
                                        history.schedule_time ||
                                        "Waktu tidak tersedia"
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 border border-purple-200">
                                {history.dosis_obat || history.dokter ? (
                                  <div className="flex items-center text-gray-600">
                                    <Package className="w-4 h-4 mr-2 text-purple-500" />
                                    <span>
                                      {history.dosis_obat ||
                                        `Dr. ${history.dokter}` ||
                                        "Tidak ada"}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">
                                    Tidak ada
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 border border-purple-200">
                                {history.sisa_obat !== null &&
                                history.sisa_obat !== undefined ? (
                                  <div className="flex items-center text-gray-600">
                                    <Package className="w-4 h-4 mr-2 text-purple-500" />
                                    <span>{history.sisa_obat} pcs</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">
                                    Tidak ada
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 border border-purple-200">
                                <div className="flex items-center text-gray-600">
                                  <CalendarDays className="w-4 h-4 mr-2 text-purple-500" />
                                  <div className="flex flex-col">
                                    <span className="text-sm">
                                      {formatDate(history.created_at)}
                                    </span>
                                    {formatDateUserFriendly(
                                      history.created_at
                                    ) && (
                                      <span className="text-xs text-blue-600">
                                        {formatDateUserFriendly(
                                          history.created_at
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                        .filter(Boolean)}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {sortedHistories.length > itemsPerPage && (
                <div className="flex justify-center mt-8">
                  <ReactPaginate
                    previousLabel={
                      <div className="flex items-center px-3 py-2">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        <span>Sebelumnya</span>
                      </div>
                    }
                    nextLabel={
                      <div className="flex items-center px-3 py-2">
                        <span>Selanjutnya</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    }
                    breakLabel="..."
                    pageCount={totalPages}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageChange}
                    forcePage={currentPage}
                    containerClassName="flex items-center space-x-1 bg-white rounded-xl shadow-lg border border-purple-200 overflow-hidden"
                    pageClassName="border-r border-purple-200 last:border-r-0"
                    pageLinkClassName="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 font-medium"
                    previousClassName="border-r border-purple-200"
                    previousLinkClassName="text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 font-medium"
                    nextClassName="border-l border-purple-200"
                    nextLinkClassName="text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 font-medium"
                    breakClassName="border-r border-purple-200"
                    breakLinkClassName="block px-4 py-3 text-gray-400"
                    activeClassName="bg-gradient-to-r from-purple-500 to-indigo-500"
                    activeLinkClassName="text-white hover:text-white hover:bg-transparent"
                    disabledClassName="opacity-50 cursor-not-allowed"
                    disabledLinkClassName="hover:bg-transparent hover:text-gray-400"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default History;
