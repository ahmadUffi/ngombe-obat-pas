import React from "react";

const BoxControl = ({ data, onEdit, onDelete, onMarkDone }) => {
  // Format tanggal ke bahasa Indonesia
  const formatTanggal = (tanggal) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format waktu
  const formatWaktu = (waktu) => {
    return waktu;
  };

  // Cek apakah jadwal sudah lewat
  const isExpired = () => {
    const scheduleDateTime = new Date(`${data.tanggal}T${data.waktu}`);
    const now = new Date();
    return scheduleDateTime < now;
  };

  // Cek apakah jadwal hari ini
  const isToday = () => {
    const scheduleDate = new Date(data.tanggal);
    const today = new Date();
    return scheduleDate.toDateString() === today.toDateString();
  };

  // Cek apakah jadwal besok
  const isTomorrow = () => {
    const scheduleDate = new Date(data.tanggal);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return scheduleDate.toDateString() === tomorrow.toDateString();
  };

  const getStatusBadge = () => {
    if (data.isDone || isExpired()) {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full border border-gray-300 shadow-sm">
          ✓ Selesai
        </span>
      );
    } else if (isToday()) {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium bg-gradient-to-r from-red-100 to-pink-100 text-red-800 rounded-full border border-red-300 shadow-sm animate-pulse">
          🔥 Hari Ini
        </span>
      );
    } else if (isTomorrow()) {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 rounded-full border border-orange-300 shadow-sm">
          ⏰ Besok
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full border border-blue-300 shadow-sm">
          📅 Mendatang
        </span>
      );
    }
  };

  // Get doctor specialty color
  const getDoctorColor = () => {
    const doctorName = (data.dokter || "").toLowerCase();
    if (doctorName.includes("sp.pd") || doctorName.includes("internal")) {
      return "text-blue-700 bg-blue-50";
    } else if (doctorName.includes("sp.jp") || doctorName.includes("cardio")) {
      return "text-red-700 bg-red-50";
    } else if (doctorName.includes("sp.og") || doctorName.includes("obg")) {
      return "text-pink-700 bg-pink-50";
    } else if (
      doctorName.includes("sp.a") ||
      doctorName.includes("pediatric")
    ) {
      return "text-green-700 bg-green-50";
    } else {
      return "text-gray-700 bg-gray-50";
    }
  };

  const getCardBorderColor = () => {
    if (isExpired()) {
      return "border-gray-300 shadow-gray-100";
    } else if (isToday()) {
      return "border-red-300 shadow-red-100";
    } else if (isTomorrow()) {
      return "border-orange-300 shadow-orange-100";
    } else {
      return "border-blue-300 shadow-blue-100";
    }
  };

  return (
    <div className="p-2">
      <div
        className={`w-[280px] md:w-[320px] lg:w-[340px] bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg group ${getCardBorderColor()} ${
          isExpired() ? "opacity-75" : ""
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 rounded-t-xl ${
            isExpired()
              ? "bg-gradient-to-r from-gray-50 to-gray-100"
              : isToday()
              ? "bg-gradient-to-r from-red-50 to-pink-50"
              : isTomorrow()
              ? "bg-gradient-to-r from-orange-50 to-yellow-50"
              : "bg-gradient-to-r from-blue-50 to-purple-50"
          } border-b border-gray-200 relative`}
        >
          {/* Status Badge */}
          <div className="absolute top-3 right-3">{getStatusBadge()}</div>

          <div className="flex items-center justify-between mb-2 pr-20">
            <h3 className="text-lg font-bold text-gray-800 truncate flex items-center">
              <span className="mr-2">👤</span>
              {data.nama_pasien}
            </h3>
          </div>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDoctorColor()} shadow-sm`}
          >
            <span className="mr-1">👨‍⚕️</span>
            {data.dokter}
          </div>
        </div>

        {/* Content with improved styling */}
        <div className="p-4">
          <div className="space-y-3">
            {/* Tanggal */}
            <div className="flex items-center bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border border-indigo-200 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
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
              <div>
                <p className="text-xs text-indigo-600 font-medium">
                  Tanggal Kontrol
                </p>
                <p className="text-sm font-bold text-indigo-800">
                  {formatTanggal(data.tanggal)}
                </p>
              </div>
            </div>

            {/* Waktu */}
            <div className="flex items-center bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-lg border border-emerald-200 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-medium">Waktu</p>
                <p className="text-sm font-bold text-emerald-800">
                  {formatWaktu(data.waktu)} WIB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex justify-between gap-2">
          <button
            onClick={() => onEdit && onEdit(data)}
            className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1"
          >
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>

          {!data.isDone && onMarkDone && (
            <button
              onClick={() => onMarkDone(data)}
              className="flex-1 px-4 py-2 text-sm font-medium text-green-700 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1"
            >
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Selesai
            </button>
          )}

          <button
            onClick={() => onDelete && onDelete(data)}
            className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1"
          >
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoxControl;
