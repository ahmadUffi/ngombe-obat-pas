import BoxJadwal from "../components/Cards/BoxJadwal";
import AddButton from "../components/UI/AddButton";
import Modal from "../components/UI/Modal";
import ConfirmModal from "../components/UI/ConfirmModal";
import InputJadwalObat from "../components/Forms/InputJadwalObat";
import Layout from "../components/Layout/Layout";
import { useState, useEffect } from "react";
import { useJadwal } from "../hooks/useApi";
import { toast } from "react-toastify";

const Jadwal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditQuantityOpen, setIsEditQuantityOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState("all");
  const [jadwalData, setJadwalData] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  // State untuk modal konfirmasi
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger",
  });

  // Using the custom hook for jadwal operations
  const {
    getAllJadwal,
    createJadwal,
    updateStock,
    deleteJadwal,
    loading,
    error,
    setError,
  } = useJadwal();

  // Load jadwal data on component mount
  useEffect(() => {
    loadJadwalData();
  }, []);

  const loadJadwalData = async () => {
    try {
      const data = await getAllJadwal();
      console.log("Jadwal API Response:", data); // Debug log

      // Ensure data is an array
      const dataArray = Array.isArray(data) ? data : [];

      // Transform API data to match frontend format with safe defaults
      const transformedData = dataArray.map((item) => ({
        ...item,
        id: item.id || Math.random().toString(36).substr(2, 9), // Ensure ID exists
        nama_obat: item.nama_obat || "Obat tidak diketahui",
        nama_pasien: item.nama_pasien || "Pasien tidak diketahui",
        dosis_obat: item.dosis_obat || "0",
        jumlah_obat:
          typeof item.jumlah_obat === "number" ? item.jumlah_obat : 0,
        jam_awal: Array.isArray(item.jam_awal)
          ? item.jam_awal
          : [item.jam_awal || "08:00"],
        jam_berakhir: Array.isArray(item.jam_berakhir)
          ? item.jam_berakhir
          : [item.jam_berakhir || "08:30"],
        catatan: item.catatan || "",
        kategori: item.kategori || "sebelum makan",
        slot_obat: item.slot_obat || 1,
      }));
      setJadwalData(transformedData);
    } catch (err) {
      console.error("Error loading jadwal:", err);
      // Set empty array on error instead of dummy data
      setJadwalData([]);
      setError("Gagal memuat data jadwal. Silakan coba lagi.");
    }
  };

  const filteredData = jadwalData.filter((item) => {
    if (filter === "all") return true;
    if (filter === "habis") return item.jumlah_obat === 0;
    if (filter === "sedikit")
      return item.jumlah_obat < 6 && item.jumlah_obat > 0;
    if (filter === "aman") return item.jumlah_obat >= 6;
    return true;
  });

  const cliCkHandler = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setEditingItem(null); // Reset editing item when closing
    }
    console.log(isOpen);
  };

  const handleEditQuantity = (item) => {
    setEditingItem(item);
    setIsEditQuantityOpen(true);
  };

  const handleCloseEditQuantity = () => {
    setIsEditQuantityOpen(false);
    setEditingItem(null);
  };

  // Handle creating new jadwal
  const handleCreateJadwal = async (jadwalData) => {
    // Show loading toast
    const loadingToastId = toast.loading("Menyimpan jadwal...");
    setIsCreating(true);

    try {
      console.log("Frontend jadwal data:", jadwalData);

      // Transform frontend data to API format - backend expects arrays for time fields
      const apiData = {
        nama_pasien: jadwalData.nama_pasien || "",
        nama_obat: jadwalData.nama_obat || "",
        dosis_obat: (jadwalData.dosis_obat || "").toString(),
        jumlah_obat: parseInt(jadwalData.jumlah_obat) || 0,
        jam_awal: Array.isArray(jadwalData.jam_awal)
          ? jadwalData.jam_awal
          : [jadwalData.jam_awal || "08:00"],
        jam_berakhir: Array.isArray(jadwalData.jam_berakhir)
          ? jadwalData.jam_berakhir
          : [jadwalData.jam_berakhir || "08:30"],
        catatan: jadwalData.catatan || "",
        kategori: jadwalData.kategori || "sesudah makan",
        slot_obat: (jadwalData.slot_obat || "A").toString(),
      };

      console.log("Data being sent to API:", apiData);
      await createJadwal(apiData);
      setIsOpen(false);
      loadJadwalData(); // Reload data

      // Update toast to success
      toast.update(loadingToastId, {
        render: "Jadwal berhasil dibuat!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Error creating jadwal:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Gagal membuat jadwal";

      // Update toast to error
      toast.update(loadingToastId, {
        render: "Gagal membuat jadwal: " + errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle updating stock
  const handleUpdateStock = async (id_obat, newStock) => {
    // Show loading toast
    const loadingToastId = toast.loading("Mengupdate stok obat...");

    try {
      await updateStock(id_obat, newStock);
      loadJadwalData(); // Reload data
      setIsEditQuantityOpen(false);
      setEditingItem(null);

      // Update toast to success
      toast.update(loadingToastId, {
        render: "Stok obat berhasil diupdate!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Error updating stock:", err);

      // Update toast to error
      toast.update(loadingToastId, {
        render: "Gagal mengupdate stok: " + err.message,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  // Handle deleting jadwal
  const handleDeleteJadwal = async (jadwal_id) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Jadwal",
      message:
        "Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan.",
      type: "danger",
      onConfirm: async () => {
        // Show loading toast
        const loadingToastId = toast.loading("Menghapus jadwal...");

        try {
          await deleteJadwal(jadwal_id);
          loadJadwalData(); // Reload data

          // Update toast to success
          toast.update(loadingToastId, {
            render: "Jadwal berhasil dihapus!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        } catch (err) {
          console.error("Error deleting jadwal:", err);

          // Update toast to error
          toast.update(loadingToastId, {
            render: "Gagal menghapus jadwal: " + err.message,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
  };

  // Note: Edit functionality has been removed as requested

  // Always use create jadwal handler since editing is removed
  const handleJadwalSubmit = handleCreateJadwal;

  return (
    <Layout className="relative">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4 space-y-8">
        {/* Loading state */}
        {loading && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/50">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
                <span className="text-gray-700 font-semibold text-lg">
                  Loading...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-200 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-pink-50/50 rounded-3xl"></div>
            <div className="relative flex items-center">
              <span className="text-red-500 mr-3 text-xl">⚠️</span>
              <span className="flex-1 text-red-700 font-semibold">{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-4 text-red-700 hover:text-red-900 p-2 rounded-xl hover:bg-red-100 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Header with Enhanced Design */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-6 shadow-2xl">
              <span className="text-3xl">💊</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Jadwal Minum Obat
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Kelola jadwal obat Anda dengan mudah dan teratur
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden group hover:transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {jadwalData.length}
              </div>
              <div className="text-sm text-gray-600 font-semibold">
                Total Obat
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden group hover:transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-pink-50/50 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {jadwalData.filter((item) => item.jumlah_obat === 0).length}
              </div>
              <div className="text-sm text-gray-600 font-semibold">Habis</div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden group hover:transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400/10 to-amber-400/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                {
                  jadwalData.filter(
                    (item) => item.jumlah_obat < 6 && item.jumlah_obat > 0
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600 font-semibold">
                Hampir Habis
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden group hover:transform hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {jadwalData.filter((item) => item.jumlah_obat >= 6).length}
              </div>
              <div className="text-sm text-gray-600 font-medium">Stok Aman</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Filter Obat
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === "all"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
              }`}
            >
              🔍 SEMUA ({jadwalData.length})
            </button>
            <button
              onClick={() => setFilter("sedikit")}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === "sedikit"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
              }`}
            >
              ⚠️ HAMPIR HABIS (
              {
                jadwalData.filter(
                  (item) => item.jumlah_obat < 6 && item.jumlah_obat > 0
                ).length
              }
              )
            </button>
            <button
              onClick={() => setFilter("habis")}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === "habis"
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
              }`}
            >
              ❌ HABIS (
              {jadwalData.filter((item) => item.jumlah_obat === 0).length})
            </button>
            <button
              onClick={() => setFilter("aman")}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === "aman"
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
              }`}
            >
              ✅ AMAN (
              {jadwalData.filter((item) => item.jumlah_obat >= 6).length})
            </button>
          </div>
        </div>

        {/* Filter Result Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-blue-800">
              <span className="font-medium">
                Menampilkan {filteredData.length}
              </span>{" "}
              dari {jadwalData.length} jadwal obat
            </div>
            {filter !== "all" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium border border-blue-300">
                Filter Aktif:{" "}
                {filter === "sedikit"
                  ? "Hampir Habis"
                  : filter === "habis"
                  ? "Habis"
                  : filter === "aman"
                  ? "Stok Aman"
                  : filter}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex flex-wrap justify-start gap-6 mb-20">
        {filteredData.map((data, index) => (
          <div key={data.id || index} className="flex-shrink-0">
            <BoxJadwal
              data={data}
              onEditQuantity={handleEditQuantity}
              onDelete={() => handleDeleteJadwal(data.id)}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {jadwalData.length === 0
              ? "Belum Ada Jadwal Obat"
              : "Tidak ada jadwal yang sesuai filter"}
          </h3>
          <p className="text-gray-500 mb-4">
            {jadwalData.length === 0
              ? "Mulai dengan menambahkan jadwal obat pertama Anda."
              : "Coba ubah filter atau tambahkan jadwal obat baru."}
          </p>
          {jadwalData.length === 0 && (
            <button
              onClick={cliCkHandler}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              <span className="mr-2">➕</span>
              Tambah Jadwal Pertama
            </button>
          )}
        </div>
      )}
      <AddButton clickHandler={cliCkHandler} />

      {/* Add Medication Modal */}
      <Modal isOpen={isOpen} onClose={cliCkHandler}>
        <InputJadwalObat
          onSubmit={handleJadwalSubmit}
          initialData={editingItem}
          existingJadwal={jadwalData}
          isEdit={!!editingItem}
        />
      </Modal>

      {/* Edit Quantity Modal */}
      <Modal isOpen={isEditQuantityOpen} onClose={handleCloseEditQuantity}>
        <EditQuantityModal
          item={editingItem}
          onSubmit={(updatedQuantity) => {
            handleUpdateStock(editingItem.id, updatedQuantity);
          }}
        />
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </Layout>
  );
};

// Edit Quantity Modal Component
const EditQuantityModal = ({ item, onSubmit }) => {
  const [quantity, setQuantity] = useState(item?.jumlah_obat || 0);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (quantity < 1) {
      setError("Jumlah obat harus minimal 1");
      return;
    }

    if (quantity > 999) {
      setError("Jumlah obat maksimal 999");
      return;
    }

    onSubmit(parseInt(quantity));
  };

  if (!item) return null;

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl w-full max-w-md mx-auto flex flex-col shadow-2xl border border-blue-200">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-xl">
        <h2 className="text-lg font-bold text-center flex items-center justify-center">
          <span className="mr-2">💊</span>
          Edit Jumlah Obat
        </h2>
        <p className="text-blue-100 text-center mt-1 text-sm">
          Perbarui jumlah stok obat
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-gray-800 flex items-center">
            <span className="mr-2">💊</span>
            {item.nama_obat}
          </h3>
          <p className="text-sm text-gray-600 mt-1 flex items-center">
            <span className="mr-2">👤</span>
            {item.nama_pasien}
          </p>
          <p className="text-xs text-gray-500 mt-2 flex items-center">
            <span className="mr-2">📦</span>
            Jumlah saat ini:{" "}
            <span className="font-bold ml-1">{item.jumlah_obat}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
              <span className="mr-2">🔢</span>
              Jumlah Obat Baru <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setError("");
                }}
                min="1"
                max="999"
                className={`w-full px-4 py-3 text-lg text-center border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-gradient-to-r from-white to-gray-50 ${
                  error
                    ? "border-red-400 focus:border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-blue-400"
                }`}
                placeholder="Masukkan jumlah obat"
              />
              {error && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-red-500">⚠️</span>
                </div>
              )}
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-2 flex items-center">
                <span className="mr-1">❌</span>
                {error}
              </p>
            )}
          </div>

          {/* Quantity indicator */}
          <div className="mb-4">
            <div className="text-xs text-gray-600 mb-2">Status Stok:</div>
            <div
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                quantity <= 3
                  ? "bg-red-100 text-red-800"
                  : quantity <= 10
                  ? "bg-orange-100 text-orange-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {quantity <= 3
                ? "🚨 Kritis - Perlu Beli Segera"
                : quantity <= 10
                ? "⚠️ Sedikit - Hampir Habis"
                : "✅ Aman - Stok Cukup"}
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="flex items-center justify-center">
              <span className="mr-2">💾</span>
              Simpan Perubahan
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Jadwal;
