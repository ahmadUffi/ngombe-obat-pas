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
    if (schedule.isDone) {
      toast.error("Kontrol yang sudah selesai tidak dapat diedit");
      return;
    }
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
    if (schedule.isDone) {
      toast.error("Kontrol yang sudah selesai tidak dapat dihapus");
      return;
    }

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

  // Filter and sort schedules
  const getFilteredSchedules = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    let filtered = [];

    switch (filter) {
      case "today":
        filtered = controlSchedules.filter(
          (schedule) => schedule.tanggal === todayStr
        );
        break;
      case "tomorrow":
        filtered = controlSchedules.filter(
          (schedule) => schedule.tanggal === tomorrowStr
        );
        break;
      case "completed":
        filtered = controlSchedules.filter(
          (schedule) => schedule.isDone === true
        );
        break;
      case "past":
        filtered = controlSchedules.filter(
          (schedule) => schedule.tanggal < todayStr
        );
        break;
      default:
        filtered = controlSchedules;
        break;
    }

    // Sort the filtered schedules: today -> tomorrow -> upcoming -> completed
    return filtered.sort((a, b) => {
      // If one is completed and the other is not, completed goes last
      if (a.isDone && !b.isDone) return 1;
      if (!a.isDone && b.isDone) return -1;

      // If both are completed, sort by date (most recent first)
      if (a.isDone && b.isDone) {
        const dateA = new Date(a.tanggal);
        const dateB = new Date(b.tanggal);
        return dateB - dateA;
      }

      // For active schedules, sort by priority: today -> tomorrow -> future
      const dateA = new Date(a.tanggal);
      const dateB = new Date(b.tanggal);

      const isAToday = a.tanggal === todayStr;
      const isBToday = b.tanggal === todayStr;
      const isATomorrow = a.tanggal === tomorrowStr;
      const isBTomorrow = b.tanggal === tomorrowStr;

      // Today's appointments come first
      if (isAToday && !isBToday) return -1;
      if (!isAToday && isBToday) return 1;

      // If both are today, sort by time
      if (isAToday && isBToday) {
        return a.waktu.localeCompare(b.waktu);
      }

      // Tomorrow's appointments come second
      if (isATomorrow && !isBTomorrow && !isBToday) return -1;
      if (!isATomorrow && isBTomorrow && !isAToday) return 1;

      // If both are tomorrow, sort by time
      if (isATomorrow && isBTomorrow) {
        return a.waktu.localeCompare(b.waktu);
      }

      // For future dates, sort chronologically (earliest first)
      return dateA - dateB;
    });
  };

  // Group schedules by priority for better organization
  const getGroupedSchedules = () => {
    if (filter !== "all") {
      return [{ title: null, schedules: filteredSchedules }];
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const groups = [];

    // Today's appointments
    const todaySchedules = filteredSchedules
      .filter((schedule) => schedule.tanggal === todayStr && !schedule.isDone)
      .sort((a, b) => a.waktu.localeCompare(b.waktu)); // Sort by time

    if (todaySchedules.length > 0) {
      groups.push({
        title: "Hari Ini",
        icon: "🔴",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        schedules: todaySchedules,
      });
    }

    // Tomorrow's appointments
    const tomorrowSchedules = filteredSchedules
      .filter(
        (schedule) => schedule.tanggal === tomorrowStr && !schedule.isDone
      )
      .sort((a, b) => a.waktu.localeCompare(b.waktu)); // Sort by time

    if (tomorrowSchedules.length > 0) {
      groups.push({
        title: "Besok",
        icon: "🟡",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        schedules: tomorrowSchedules,
      });
    }

    // Upcoming appointments (future dates)
    const upcomingSchedules = filteredSchedules
      .filter((schedule) => schedule.tanggal > tomorrowStr && !schedule.isDone)
      .sort((a, b) => {
        // First sort by date, then by time
        const dateCompare = new Date(a.tanggal) - new Date(b.tanggal);
        if (dateCompare !== 0) return dateCompare;
        return a.waktu.localeCompare(b.waktu);
      });

    if (upcomingSchedules.length > 0) {
      groups.push({
        title: "Mendatang",
        icon: "🔵",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        schedules: upcomingSchedules,
      });
    }

    // Completed appointments
    const completedSchedules = filteredSchedules
      .filter((schedule) => schedule.isDone)
      .sort((a, b) => {
        // Sort completed by date (most recent first)
        const dateCompare = new Date(b.tanggal) - new Date(a.tanggal);
        if (dateCompare !== 0) return dateCompare;
        return b.waktu.localeCompare(a.waktu);
      });

    if (completedSchedules.length > 0) {
      groups.push({
        title: "Selesai",
        icon: "✅",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        schedules: completedSchedules,
      });
    }

    return groups;
  };

  const filteredSchedules = getFilteredSchedules();
  const groupedSchedules = getGroupedSchedules();

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

        {/* Statistics Cards as Interactive Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 rounded-3xl"></div>
          <div className="relative">
            <div className="flex items-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl mr-4 shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Filter & Statistik Kontrol
                </h2>
                <p className="text-gray-600 mt-1">
                  Klik kartu untuk memfilter jadwal
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Total Jadwal */}
              <button
                onClick={() => setFilter("all")}
                className={`relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group ${
                  filter === "all"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-2xl scale-105"
                    : "bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-700 hover:from-blue-100 hover:to-indigo-100 shadow-lg"
                }`}
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform"></div>
                <div className="relative text-center">
                  <div className="text-2xl mb-2">🔍</div>
                  <div
                    className={`text-2xl font-bold mb-1 ${
                      filter === "all" ? "text-white" : "text-blue-600"
                    }`}
                  >
                    {controlSchedules.length}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      filter === "all" ? "text-blue-100" : "text-gray-600"
                    }`}
                  >
                    Total Jadwal
                  </div>
                </div>
              </button>

              {/* Hari Ini */}
              <button
                onClick={() => setFilter("today")}
                className={`relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group ${
                  filter === "today"
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-2xl scale-105"
                    : "bg-gradient-to-br from-red-50 to-pink-50 text-gray-700 hover:from-red-100 hover:to-pink-100 shadow-lg"
                }`}
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform"></div>
                <div className="relative text-center">
                  <div className="text-2xl mb-2">📅</div>
                  <div
                    className={`text-2xl font-bold mb-1 ${
                      filter === "today" ? "text-white" : "text-red-600"
                    }`}
                  >
                    {
                      controlSchedules.filter(
                        (s) =>
                          s.tanggal === new Date().toISOString().split("T")[0]
                      ).length
                    }
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      filter === "today" ? "text-red-100" : "text-gray-600"
                    }`}
                  >
                    Hari Ini
                  </div>
                </div>
              </button>

              {/* Besok */}
              <button
                onClick={() => setFilter("tomorrow")}
                className={`relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group ${
                  filter === "tomorrow"
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-2xl scale-105"
                    : "bg-gradient-to-br from-orange-50 to-yellow-50 text-gray-700 hover:from-orange-100 hover:to-yellow-100 shadow-lg"
                }`}
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform"></div>
                <div className="relative text-center">
                  <div className="text-2xl mb-2">⏰</div>
                  <div
                    className={`text-2xl font-bold mb-1 ${
                      filter === "tomorrow" ? "text-white" : "text-orange-600"
                    }`}
                  >
                    {
                      controlSchedules.filter((s) => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return (
                          s.tanggal === tomorrow.toISOString().split("T")[0]
                        );
                      }).length
                    }
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      filter === "tomorrow"
                        ? "text-orange-100"
                        : "text-gray-600"
                    }`}
                  >
                    Besok
                  </div>
                </div>
              </button>

              {/* Selesai */}
              <button
                onClick={() => setFilter("completed")}
                className={`relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group ${
                  filter === "completed"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl scale-105"
                    : "bg-gradient-to-br from-green-50 to-emerald-50 text-gray-700 hover:from-green-100 hover:to-emerald-100 shadow-lg"
                }`}
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform"></div>
                <div className="relative text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <div
                    className={`text-2xl font-bold mb-1 ${
                      filter === "completed" ? "text-white" : "text-green-600"
                    }`}
                  >
                    {controlSchedules.filter((s) => s.isDone === true).length}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      filter === "completed"
                        ? "text-green-100"
                        : "text-gray-600"
                    }`}
                  >
                    Selesai
                  </div>
                </div>
              </button>
            </div>
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

        {/* Cards Container */}
        <div className="space-y-8 mb-20">
          {groupedSchedules.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Section Header */}
              {group.title && (
                <div
                  className={`${group.bgColor} ${group.borderColor} border rounded-xl p-4 mb-4`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{group.icon}</span>
                    <div>
                      <h3 className={`text-lg font-bold ${group.color}`}>
                        {group.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {group.schedules.length} jadwal kontrol
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Cards */}
              <div className="flex flex-wrap justify-start gap-6">
                {group.schedules.map((schedule) => (
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
