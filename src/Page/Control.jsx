import React, { useState } from "react";
import Layout from "../components/Utility/Layout";
import BoxControl from "../components/BoxControl";
import AddButton from "../components/Utility/AddButton";
import Modal from "../components/Utility/Modal";
import InputControlJadwal from "../components/InputControlJadwal";

const Control = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [filter, setFilter] = useState("all");

  // Sample data for control schedules
  const [controlSchedules, setControlSchedules] = useState([
    {
      id: 1,
      tanggal: "2025-08-01",
      dokter: "Dr. Andi Wijaya, Sp.PD",
      waktu: "09:00",
      nama_pasien: "Fulan CS",
    },
    {
      id: 2,
      tanggal: "2025-08-02",
      dokter: "Dr. Sari Indah, Sp.JP",
      waktu: "14:30",
      nama_pasien: "Ahmad Wijaya",
    },
    {
      id: 3,
      tanggal: "2025-07-28",
      dokter: "Dr. Budi Santoso, Sp.OG",
      waktu: "10:15",
      nama_pasien: "Siti Nurhaliza",
    },
    {
      id: 4,
      tanggal: "2025-07-29",
      dokter: "Dr. Maya Sari, Sp.A",
      waktu: "16:00",
      nama_pasien: "Budi Santoso",
    },
  ]);

  // Handle modal open/close
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) {
      setEditingData(null); // Reset editing data when closing
    }
  };

  // Handle adding new control schedule
  const handleAddSchedule = (newSchedule) => {
    const scheduleWithId = {
      ...newSchedule,
      id: Date.now(), // Simple ID generation
    };
    setControlSchedules((prev) => [...prev, scheduleWithId]);
    setIsModalOpen(false);
    console.log("New control schedule:", scheduleWithId);
  };

  // Handle editing schedule
  const handleEditSchedule = (schedule) => {
    setEditingData(schedule);
    setIsModalOpen(true);
  };

  // Handle updating schedule
  const handleUpdateSchedule = (updatedSchedule) => {
    setControlSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === editingData.id
          ? { ...updatedSchedule, id: editingData.id }
          : schedule
      )
    );
    setIsModalOpen(false);
    setEditingData(null);
    console.log("Updated control schedule:", updatedSchedule);
  };

  // Handle deleting schedule
  const handleDeleteSchedule = (schedule) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus jadwal kontrol dengan ${schedule.dokter} pada ${schedule.tanggal}?`
      )
    ) {
      setControlSchedules((prev) =>
        prev.filter((item) => item.id !== schedule.id)
      );
      console.log("Deleted control schedule:", schedule);
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
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSchedules.length === 0 && (
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
              Tidak ada jadwal kontrol
            </h3>
            <p className="text-gray-500">
              Belum ada jadwal kontrol yang sesuai dengan filter yang dipilih.
            </p>
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
