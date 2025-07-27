import React, { useState } from "react";

const BoxJadwal = ({ data, onEditQuantity, onDelete, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Menggunakan format data baru dengan safe defaults
  const {
    nama_obat: namaObat = "Obat tidak diketahui",
    nama_pasien: namaPasien = "Pasien tidak diketahui",
    dosis_obat: dosisObat = "0",
    jumlah_obat: jumlahObat = 0,
    jam_awal: jamAwal = [],
    jam_berakhir: jamBerakhir = [],
    catatan = "",
    kategori = "sebelum makan",
    slot_obat: slotObat = 1,
  } = data || {};

  // Konversi kategori ke format yang digunakan sebelumnya
  const waktuMinum =
    kategori === "sebelum makan" ? "Sebelum Makan" : "Sesudah Makan";

  // Gabungkan jam awal dan berakhir untuk ditampilkan
  const jadwalLengkap = jamAwal.map((awal, index) => ({
    awal: awal,
    berakhir: jamBerakhir[index] || awal,
  }));

  // Status indicator based on stock level
  const getStatusInfo = () => {
    if (jumlahObat <= 3) {
      return { color: "bg-red-500", text: "Kritis", textColor: "text-red-600" };
    } else if (jumlahObat <= 10) {
      return {
        color: "bg-orange-500",
        text: "Sedikit",
        textColor: "text-orange-600",
      };
    } else {
      return {
        color: "bg-green-500",
        text: "Aman",
        textColor: "text-green-600",
      };
    }
  };

  // Fungsi untuk mengecek apakah jadwal sedang aktif
  const getCurrentStatus = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    for (let i = 0; i < jadwalLengkap.length; i++) {
      const jadwal = jadwalLengkap[i];
      if (currentTime >= jadwal.awal && currentTime <= jadwal.berakhir) {
        return { isActive: true, activeIndex: i };
      }
    }
    return { isActive: false, activeIndex: -1 };
  };

  const currentStatus = getCurrentStatus();

  // Fungsi untuk mencari jadwal berikutnya
  const getNextSchedule = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    for (let i = 0; i < jadwalLengkap.length; i++) {
      const jadwal = jadwalLengkap[i];
      if (currentTime < jadwal.awal) {
        return { next: jadwal.awal, index: i };
      }
    }

    // Jika tidak ada jadwal hari ini, return jadwal pertama besok
    return { next: jadwalLengkap[0]?.awal, index: 0, tomorrow: true };
  };

  const nextSchedule = getNextSchedule();
  const statusInfo = getStatusInfo();

  const styles = {
    title: "text-gray-600 text-xs font-medium",
    value: "text-gray-800 text-sm font-medium",
    compactBox:
      "bg-gray-50 px-2.5 py-1 rounded-md text-xs border border-gray-100 shadow-sm",
    makanBtn:
      kategori === "sebelum makan"
        ? "bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm border border-orange-400 hover:bg-orange-600 transition-colors"
        : "bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm border border-green-400 hover:bg-green-600 transition-colors",
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="p-2">
      <div className="w-[280px] md:w-[320px] lg:w-[340px] bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group max-h-[600px] flex flex-col">
        {/* Header - Always Visible */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 relative flex-shrink-0">
          {/* Status Badge */}
          <div className="absolute top-2 right-2 flex gap-1 items-start ">
            {" "}
            {currentStatus.isActive && (
              <div className="bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-medium animate-pulse shadow-sm border border-green-400 shadow-green-500/20">
                AKTIF
              </div>
            )}
            <div
              className={`${
                statusInfo.color
              } text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm border ${
                statusInfo.color === "bg-red-500"
                  ? "border-red-400 shadow-red-500/20"
                  : statusInfo.color === "bg-orange-500"
                  ? "border-orange-400 shadow-orange-500/20"
                  : "border-green-400 shadow-green-500/20"
              }`}
            >
              {statusInfo.text}
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pr-16">
            {" "}
            <h2 className="text-lg font-bold text-gray-800 line-clamp-2 hover:text-blue-700 transition-colors flex-1">
              {namaObat}
            </h2>{" "}
            <button
              onClick={toggleExpanded}
              className="ml-2 p-1.5 rounded-full hover:bg-white/80 hover:shadow-sm active:bg-white/90 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label={isExpanded ? "Tutup detail" : "Lihat detail"}
            >
              <svg
                className={`w-5 h-5 text-gray-600 transform transition-transform duration-300 ${
                  isExpanded ? "rotate-180 text-blue-600" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Compact Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={styles.title}>Pasien:</span>
              <span className={styles.value}>{namaPasien}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className={styles.title}>Dosis:</span>
              <span className={styles.value}>{dosisObat} butir</span>
            </div>

            <div className="flex items-center justify-between">
              <span className={styles.title}>Slot:</span>
              <span className={styles.compactBox}>Slot {slotObat}</span>
            </div>

            {/* Jam Minum - Compact */}
            <div className="flex items-center justify-between">
              <span className={styles.title}>Waktu:</span>
              <div className="flex flex-wrap gap-1">
                {jamAwal.slice(0, 2).map((jam, idx) => (
                  <span key={idx} className={styles.compactBox}>
                    {jam}
                  </span>
                ))}
                {jamAwal.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{jamAwal.length - 2} lagi
                  </span>
                )}
              </div>
            </div>

            {/* Next Schedule Info */}
            {nextSchedule.next && !currentStatus.isActive && (
              <div className="flex items-center justify-between">
                <span className={styles.title}>Berikutnya:</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {nextSchedule.next} {nextSchedule.tomorrow ? "(besok)" : ""}
                  </span>
                </div>
              </div>
            )}

            {/* Status Makan */}
            {waktuMinum && (
              <div className="flex justify-center mt-2">
                <span className={styles.makanBtn}>{waktuMinum}</span>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        <div
          className={`transition-all duration-300 ease-in-out flex-1 flex flex-col ${
            isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="p-4 space-y-4 bg-gray-50 overflow-y-auto flex-1">
            {/* Semua Jam Minum */}
            <div>
              <p className={`${styles.title} mb-2`}>Semua Jadwal Minum</p>
              <div className="grid grid-cols-1 gap-2">
                {jadwalLengkap.map((jadwal, idx) => {
                  const isCurrentlyActive =
                    currentStatus.isActive && currentStatus.activeIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`bg-white p-3 rounded-lg shadow-sm border-l-4 ${
                        isCurrentlyActive
                          ? "border-green-500 bg-green-50"
                          : "border-blue-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`text-sm font-bold ${
                              isCurrentlyActive
                                ? "text-green-800"
                                : "text-gray-800"
                            }`}
                          >
                            {jadwal.awal}
                          </div>
                          <span className="text-xs text-gray-500">→</span>
                          <div
                            className={`text-sm font-medium ${
                              isCurrentlyActive
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          >
                            {jadwal.berakhir}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCurrentlyActive && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/40"></div>
                              <span className="text-xs text-green-700 font-bold">
                                AKTIF
                              </span>
                            </div>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isCurrentlyActive
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            Jadwal {idx + 1}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Durasi: {jadwal.awal} - {jadwal.berakhir}
                        {isCurrentlyActive && (
                          <span className="ml-2 text-green-600 font-medium">
                            • Waktunya minum obat!
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sisa Obat */}
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className={styles.title}>Sisa Obat</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 ${statusInfo.color} rounded-full`}
                  ></div>
                  <span className={`text-lg font-bold ${statusInfo.textColor}`}>
                    {jumlahObat} butir
                  </span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${statusInfo.color} transition-all duration-300`}
                  style={{
                    width: `${Math.min((jumlahObat / 30) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {statusInfo.text} -{" "}
                {Math.min((jumlahObat / 30) * 100, 100).toFixed(0)}% dari
                kapasitas maksimal
              </div>
            </div>

            {/* Catatan - Accordion Style */}
            {catatan && catatan !== "-" && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-3">
                  <p className={`${styles.title} mb-2 flex items-center gap-2`}>
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
                    Catatan Tambahan
                  </p>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {catatan}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Aksi Cepat</div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => onEditQuantity && onEditQuantity(data)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-1.5 px-1 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <svg
                    className="w-3 h-3"
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
                  Stok
                </button>
                <button
                  onClick={() => onEdit && onEdit(data)}
                  className="bg-green-100 hover:bg-green-200 text-green-700 py-1.5 px-1 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => onDelete && onDelete(data)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 py-1.5 px-1 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <svg
                    className="w-3 h-3"
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
        </div>
      </div>
    </div>
  );
};

export default BoxJadwal;
