import React, { useState, useEffect } from "react";
import Layout from "../components/Utility/Layout";
import BoxControl from "../components/BoxControl";
import AddButton from "../components/Utility/AddButton";
import Modal from "../components/Utility/Modal";
import InputControlJadwal from "../components/InputControlJadwal";
import { useControl } from "../hooks/useApi";

const Control = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [filter, setFilter] = useState("all");
  const [controlSchedules, setControlSchedules] = useState([]);

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

      if (!data || data.length === 0) {
        console.log("No control data found");
        setControlSchedules([]);
        return;
      }

      // Transform API data to match frontend format
      const transformedData = data.map((item) => ({
        id: item.id,
        tanggal: item.tanggal || "",
        dokter: item.dokter || "Dokter tidak diketahui",
        waktu: item.waktu || "09:00",
        nama_pasien: item.nama_pasien || "Pasien tidak diketahui",
        isDone: item.isDone || false,
        created_at: item.created_at || "",
      }));

      setControlSchedules(transformedData);
    } catch (err) {
      console.error("Error loading control data:", err);
      // Set empty array on error instead of dummy data
      setControlSchedules([]);
      setError("Gagal memuat data kontrol. Silakan coba lagi.");
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
        title: newSchedule.dokter || newSchedule.title,
        description: newSchedule.nama_pasien || newSchedule.description,
        scheduled_date: newSchedule.tanggal || newSchedule.scheduled_date,
        type: newSchedule.type || "medical_checkup",
      };

      await createControl(apiData);
      setIsModalOpen(false);
      loadControlData(); // Reload data
      alert("Jadwal kontrol berhasil dibuat!");
    } catch (err) {
      console.error("Error creating control:", err);
      alert("Gagal membuat jadwal kontrol: " + err.message);
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
        title: updatedSchedule.dokter || updatedSchedule.title,
        description: updatedSchedule.nama_pasien || updatedSchedule.description,
        scheduled_date:
          updatedSchedule.tanggal || updatedSchedule.scheduled_date,
        type: updatedSchedule.type || "medical_checkup",
      };

      await editControl(editingData.id, apiData);
      setIsModalOpen(false);
      setEditingData(null);
      loadControlData(); // Reload data
      alert("Jadwal kontrol berhasil diupdate!");
    } catch (err) {
      console.error("Error updating control:", err);
      alert("Gagal mengupdate jadwal kontrol: " + err.message);
    }
  };

  // Handle mark as done
  const handleDeleteSchedule = async (schedule) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menandai jadwal kontrol dengan ${schedule.dokter} pada ${schedule.tanggal} sebagai selesai?`
      )
    ) {
      try {
        console.log("Marking as done, ID:", schedule.id);
        const result = await markDone(schedule.id);
        console.log("Mark as done result:", result);
        loadControlData(); // Reload data
        alert("Jadwal kontrol berhasil ditandai selesai!");
      } catch (err) {
        console.error("Error marking done:", err);
        alert(
          "Gagal menandai selesai: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  // Handle permanently deleting schedule
  const handleRealDeleteSchedule = async (schedule) => {
    if (
      confirm(
        `Apakah Anda yakin ingin MENGHAPUS PERMANEN jadwal kontrol dengan ${schedule.dokter} pada ${schedule.tanggal}?`
      )
    ) {
      try {
        await deleteControl(schedule.id);
        loadControlData(); // Reload data
        alert("Jadwal kontrol berhasil dihapus!");
      } catch (err) {
        console.error("Error deleting control:", err);
        alert("Gagal menghapus jadwal kontrol: " + err.message);
      }
    }
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
      case "upcoming":
        return controlSchedules.filter(
          (schedule) => schedule.tanggal > todayStr
        );
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
      <div className="p-4">
        {/* Loading state */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <span className="text-gray-700 font-medium">Loading...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="flex-1">{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-2 text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Jadwal Kontrol</h1>
          </div>

          <p className="text-gray-600 mb-4">
            Kelola jadwal kontrol dengan dokter Anda
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Semua ({controlSchedules.length})
            </button>
            <button
              onClick={() => setFilter("today")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "today"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Hari Ini (
              {
                controlSchedules.filter(
                  (s) => s.tanggal === new Date().toISOString().split("T")[0]
                ).length
              }
              )
            </button>
            <button
              onClick={() => setFilter("tomorrow")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "tomorrow"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Besok (
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
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "upcoming"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Mendatang (
              {
                controlSchedules.filter(
                  (s) => s.tanggal > new Date().toISOString().split("T")[0]
                ).length
              }
              )
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">
                {controlSchedules.length}
              </div>
              <div className="text-sm text-gray-600">Total Jadwal</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-red-600">
                {
                  controlSchedules.filter(
                    (s) => s.tanggal === new Date().toISOString().split("T")[0]
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Hari Ini</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-orange-600">
                {
                  controlSchedules.filter((s) => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return s.tanggal === tomorrow.toISOString().split("T")[0];
                  }).length
                }
              </div>
              <div className="text-sm text-gray-600">Besok</div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-green-600">
                {
                  controlSchedules.filter(
                    (s) => s.tanggal > new Date().toISOString().split("T")[0]
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Mendatang</div>
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
                onDelete={handleDeleteSchedule}
                onRealDelete={handleRealDeleteSchedule}
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
      </div>
    </Layout>
  );
};

export default Control;
