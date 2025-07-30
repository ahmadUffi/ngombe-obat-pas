import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import BoxControl from "../components/Cards/BoxControl";
import AddButton from "../components/UI/AddButton";
import Modal from "../components/UI/Modal";
import ConfirmModal from "../components/UI/ConfirmModal";
import InputControlJadwal from "../components/Forms/InputControlJadwal";
import { useControl } from "../hooks/useApi";
import { toast } from "react-toastify";

const Control = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [filter, setFilter] = useState("all");
  const [controlSchedules, setControlSchedules] = useState([]);

  // State untuk modal konfirmasi
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger",
  });

  // Using the custom hook for control operations
  const {
    getAllControl,
    createControl,
    editControl,
    markDone,
    deleteControl,
    loading,
    error,
    setError,
  } = useControl();

  // Load control data on component mount
  useEffect(() => {
    loadControlData();
  }, []);

  const loadControlData = async () => {
    try {
      const data = await getAllControl();
      console.log("API Response:", data); // Debug log

      // Ensure data is an array
      const dataArray = Array.isArray(data) ? data : [];

      // Transform API data to match frontend format
      const transformedData = dataArray.map((item) => ({
        id: item.id,
        tanggal: item.tanggal || "",
        dokter: item.dokter || "Dokter tidak diketahui",
        waktu: item.waktu || "09:00",
        nama_pasien: item.nama_pasien || "Pasien tidak diketahui",
        isDone: item.isDone || false,
        created_at: item.created_at || "",
        updated_at: item.updated_at || "",
      }));
      setControlSchedules(transformedData);
    } catch (err) {
      console.error("Error loading control data:", err);
      // Set empty array on error instead of dummy data
      setControlSchedules([]);
      toast.error("Gagal memuat data kontrol. Silakan coba lagi.");
    }
  };

  // Handle modal open/close
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) {
      setEditingData(null); // Reset editing data when closing
    }
  };

  // Handle adding new control schedule
  const handleAddSchedule = async (newSchedule) => {
    try {
      // Transform frontend data to API format
      const apiData = {
        tanggal: newSchedule.tanggal,
        dokter: newSchedule.dokter,
        waktu: newSchedule.waktu,
        nama_pasien: newSchedule.nama_pasien,
      };

      await createControl(apiData);
      setIsModalOpen(false);
      loadControlData(); // Reload data
      toast.success("Jadwal kontrol berhasil dibuat!");
    } catch (err) {
      console.error("Error creating control:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Gagal membuat jadwal kontrol";
      toast.error(errorMessage);
    }
  };

  // Handle editing schedule
  const handleEditSchedule = (schedule) => {
    setEditingData(schedule);
    setIsModalOpen(true);
  };

  // Handle updating schedule
  const handleUpdateSchedule = async (updatedSchedule) => {
    try {
      const apiData = {
        tanggal: updatedSchedule.tanggal,
        dokter: updatedSchedule.dokter,
        waktu: updatedSchedule.waktu,
        nama_pasien: updatedSchedule.nama_pasien,
      };

      await editControl(editingData.id, apiData);
      setIsModalOpen(false);
      setEditingData(null);
      loadControlData(); // Reload data
      toast.success("Jadwal kontrol berhasil diperbarui!");
    } catch (err) {
      console.error("Error updating control:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Gagal mengupdate jadwal kontrol";
      toast.error(errorMessage);
    }
  };

  // Handle marking schedule as done
  const handleMarkDone = async (schedule) => {
    setConfirmModal({
      isOpen: true,
      title: "Tandai Selesai",
      message: `Apakah Anda yakin ingin menandai jadwal kontrol dengan ${schedule.dokter} pada ${schedule.tanggal} sebagai selesai?`,
      type: "warning",
      onConfirm: async () => {
        try {
          await markDone(schedule.id);
          loadControlData(); // Reload data
          toast.success(
            `Jadwal kontrol dengan ${schedule.dokter} pada ${schedule.tanggal} berhasil ditandai selesai!`
          );
        } catch (err) {
          console.error("Error marking done:", err);
          const errorMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Gagal menandai selesai";
          toast.error(errorMessage);
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
  };

  // Handle permanently deleting schedule
  const handleDelete = async (schedule) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Jadwal",
      message: `Apakah Anda yakin ingin menghapus permanen jadwal kontrol dengan ${schedule.dokter} pada ${schedule.tanggal}? Tindakan ini tidak dapat dibatalkan.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteControl(schedule.id);
          loadControlData(); // Reload data
          toast.success(
            `Jadwal kontrol dengan ${schedule.dokter} pada ${schedule.tanggal} berhasil dihapus!`
          );
        } catch (err) {
          console.error("Error deleting control:", err);
          const errorMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Gagal menghapus jadwal kontrol";
          toast.error(errorMessage);
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
  };

  // Filter schedules
  const getFilteredSchedules = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    switch (filter) {
      case "today":
        return controlSchedules.filter(
          (schedule) => schedule.tanggal === todayStr
        );
      case "tomorrow":
        return controlSchedules.filter(
          (schedule) => schedule.tanggal === tomorrowStr
        );
      case "completed":
        return controlSchedules.filter((schedule) => schedule.isDone === true);
      case "past":
        return controlSchedules.filter(
          (schedule) => schedule.tanggal < todayStr
        );
      default:
        return controlSchedules;
    }
  };

  const filteredSchedules = getFilteredSchedules();

  return (
    <Layout>
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
              <span className="text-3xl">🏥</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Jadwal Kontrol Dokter
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Kelola jadwal kontrol dengan dokter Anda secara teratur
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
                {controlSchedules.length}
              </div>
              <div className="text-sm text-gray-600 font-semibold">
                Total Jadwal
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden group hover:transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-pink-50/50 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {
                  controlSchedules.filter(
                    (s) => s.tanggal === new Date().toISOString().split("T")[0]
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600 font-semibold">
                Hari Ini
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden group hover:transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400/10 to-amber-400/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                {
                  controlSchedules.filter((s) => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return s.tanggal === tomorrow.toISOString().split("T")[0];
                  }).length
                }
              </div>
              <div className="text-sm text-gray-600 font-semibold">Besok</div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden group hover:transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {controlSchedules.filter((s) => s.isDone === true).length}
              </div>
              <div className="text-sm text-gray-600 font-semibold">Selesai</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 rounded-3xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-indigo-400/10 rounded-full translate-y-12 translate-x-12"></div>

          <div className="relative">
            <div className="flex items-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl mr-4 shadow-lg">
                <span className="text-xl text-white">🔍</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Filter Jadwal
              </h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  filter === "all"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xl hover:shadow-purple-500/25"
                    : "bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90 border border-gray-200"
                }`}
              >
                🔍 Semua ({controlSchedules.length})
              </button>
              <button
                onClick={() => setFilter("today")}
                className={`px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  filter === "today"
                    ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-2xl hover:shadow-red-500/25"
                    : "bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90 border border-gray-200"
                }`}
              >
                📅 Hari Ini (
                {
                  controlSchedules.filter(
                    (s) => s.tanggal === new Date().toISOString().split("T")[0]
                  ).length
                }
                )
              </button>
              <button
                onClick={() => setFilter("tomorrow")}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === "tomorrow"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                }`}
              >
                ⏰ Besok (
                {
                  controlSchedules.filter((s) => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return s.tanggal === tomorrow.toISOString().split("T")[0];
                  }).length
                }
                )
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === "completed"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                }`}
              >
                ✅ Selesai (
                {controlSchedules.filter((s) => s.isDone === true).length})
              </button>
            </div>
          </div>

          {/* Filter Result Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-blue-800">
                <span className="font-medium">
                  Menampilkan {filteredSchedules.length}
                </span>{" "}
                dari {controlSchedules.length} jadwal kontrol
              </div>
              {filter !== "all" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium border border-blue-300">
                  Filter Aktif:{" "}
                  {filter === "today"
                    ? "Hari Ini"
                    : filter === "tomorrow"
                    ? "Besok"
                    : filter === "completed"
                    ? "Selesai"
                    : filter === "past"
                    ? "Masa Lalu"
                    : filter}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cards Container */}
        <div className="flex flex-wrap justify-start gap-6 mb-20">
          {filteredSchedules.map((schedule) => (
            <div key={schedule.id} className="flex-shrink-0">
              <BoxControl
                data={schedule}
                onEdit={handleEditSchedule}
                onDelete={handleDelete}
                onMarkDone={handleMarkDone}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSchedules.length === 0 && !loading && (
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {controlSchedules.length === 0
                ? "Belum Ada Jadwal Kontrol"
                : "Tidak ada jadwal yang sesuai filter"}
            </h3>
            <p className="text-gray-500 mb-4">
              {controlSchedules.length === 0
                ? "Mulai dengan menambahkan jadwal kontrol pertama Anda."
                : "Coba ubah filter atau tambahkan jadwal kontrol baru."}
            </p>
            {controlSchedules.length === 0 && (
              <button
                onClick={handleModalToggle}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <span className="mr-2">➕</span>
                Tambah Kontrol Pertama
              </button>
            )}
          </div>
        )}

        {/* Add Button */}
        <AddButton clickHandler={handleModalToggle} />

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={handleModalToggle}>
          <InputControlJadwal
            initialData={editingData}
            onSubmit={editingData ? handleUpdateSchedule : handleAddSchedule}
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
      </div>
    </Layout>
  );
};

export default Control;
