import BoxJadwal from "../components/BoxJadwal";
import AddButton from "../components/Utility/AddButton";
import Modal from "../components/Utility/Modal";
import InputJadwalObat from "../components/InputJadwalObat";
import Layout from "../components/Utility/Layout";
import { useState } from "react";

const Jadwal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("flex"); // "flex" atau "grid"

  const cliCkHandler = () => {
    setIsOpen(!isOpen);
    console.log(isOpen);
  };

  // Sample data dengan format baru
  const jadwalData = [
    {
      nama_obat: "Amoxicillin 500mg",
      nama_pasien: "Ahmad Uffi",
      dosis_obat: 1,
      jumlah_obat: 12,
      jam_awal: ["10:00", "12:00", "18:00"],
      jam_berakhir: ["11:00", "12:30", "18:30"],
      catatan:
        "Antibiotik untuk infeksi saluran pernapasan. Harus diminum sampai habis meskipun gejala sudah membaik. Jangan lupa minum air putih yang banyak.",
      kategori: "sebelum makan",
      slot_obat: "A",
    },
    {
      nama_obat: "Paracetamol 500mg",
      nama_pasien: "Siti Nurhaliza",
      dosis_obat: 1,
      jumlah_obat: 8,
      jam_awal: ["08:00", "14:00", "20:00"],
      jam_berakhir: ["08:30", "14:30", "20:30"],
      catatan:
        "Obat penurun demam dan pereda nyeri. Diminum saat demam atau nyeri saja.",
      kategori: "sesudah makan",
      slot_obat: "B",
    },
    {
      nama_obat: "Vitamin D3",
      nama_pasien: "Budi Santoso",
      dosis_obat: 2,
      jumlah_obat: 30,
      jam_awal: ["07:00", "19:00"],
      jam_berakhir: ["07:30", "19:30"],
      catatan:
        "Suplemen untuk kesehatan tulang dan sistem imun. Diminum rutin setiap hari untuk hasil optimal.",
      kategori: "sesudah makan",
      slot_obat: "C",
    },
    {
      nama_obat: "Omeprazole 20mg",
      nama_pasien: "Maria Sari",
      dosis_obat: 1,
      jumlah_obat: 14,
      jam_awal: ["06:30", "12:00"],
      jam_berakhir: ["07:00", "12:30"],
      catatan:
        "Obat maag untuk mengurangi produksi asam lambung. Diminum 30 menit sebelum makan pagi.",
      kategori: "sebelum makan",
      slot_obat: "D",
    },
    {
      nama_obat: "Metformin 500mg",
      nama_pasien: "Andi Wijaya",
      dosis_obat: 1,
      jumlah_obat: 60,
      jam_awal: ["07:00", "19:00"],
      jam_berakhir: ["07:30", "19:30"],
      catatan:
        "Obat diabetes untuk mengontrol gula darah. Penting untuk dikonsumsi bersamaan dengan diet sehat dan olahraga teratur.",
      kategori: "sesudah makan",
      slot_obat: "E",
    },
    {
      nama_obat: "Bodrek",
      nama_pasien: "fulan",
      dosis_obat: 1,
      jumlah_obat: 10,
      jam_awal: ["01:00", "10:00", "12:00"],
      jam_berakhir: ["02:00", "11:00", "13:00"],
      catatan: "Setelah makan",
      kategori: "sesudah makan",
      slot_obat: "D",
    },
    {
      nama_obat: "Cetirizine 10mg",
      nama_pasien: "Lisa Permata",
      dosis_obat: 1,
      jumlah_obat: 2,
      jam_awal: ["21:00"],
      jam_berakhir: ["21:30"],
      catatan:
        "Antihistamin untuk alergi. Dapat menyebabkan kantuk, sebaiknya diminum malam hari.",
      kategori: "sebelum makan",
      slot_obat: "F",
    },
  ];

  const filteredData = jadwalData.filter((item) => {
    if (filter === "all") return true;
    if (filter === "critical") return item.jumlah_obat <= 3;
    if (filter === "low") return item.jumlah_obat <= 10 && item.jumlah_obat > 3;
    if (filter === "active") return item.jumlah_obat > 10;
    return true;
  });

  return (
    <Layout className="relative">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-800">
            Jadwal Minum Obat
          </h1>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("flex")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === "flex"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
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
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          Kelola jadwal obat Anda dengan mudah. Klik card untuk melihat detail
          lengkap.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Semua ({jadwalData.length})
          </button>
          <button
            onClick={() => setFilter("critical")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "critical"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Kritis ({jadwalData.filter((item) => item.jumlah_obat <= 3).length})
          </button>
          <button
            onClick={() => setFilter("low")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "low"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Sedikit (
            {
              jadwalData.filter(
                (item) => item.jumlah_obat <= 10 && item.jumlah_obat > 3
              ).length
            }
            )
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "active"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Aman ({jadwalData.filter((item) => item.jumlah_obat > 10).length})
          </button>
        </div>

        {/* Filter Result Info */}
        <div className="mb-4 text-sm text-gray-600">
          Menampilkan{" "}
          <span className="font-medium text-gray-800">
            {filteredData.length}
          </span>{" "}
          dari {jadwalData.length} jadwal obat
          {filter !== "all" && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Filter:{" "}
              {filter === "critical"
                ? "Kritis"
                : filter === "low"
                ? "Sedikit"
                : "Aman"}
            </span>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">
              {jadwalData.length}
            </div>
            <div className="text-sm text-gray-600">Total Obat</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">
              {jadwalData.filter((item) => item.jumlah_obat <= 3).length}
            </div>
            <div className="text-sm text-gray-600">Perlu Beli</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">
              {
                jadwalData.filter(
                  (item) => item.jumlah_obat <= 10 && item.jumlah_obat > 3
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Hampir Habis</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">
              {jadwalData.filter((item) => item.jumlah_obat > 10).length}
            </div>
            <div className="text-sm text-gray-600">Stok Aman</div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div
        className={
          viewMode === "flex"
            ? "flex flex-wrap justify-start gap-6 mb-20"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-20"
        }
      >
        {filteredData.map((data, index) => (
          <div
            key={index}
            className={viewMode === "flex" ? "flex-shrink-0 " : ""}
          >
            <BoxJadwal data={data} />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
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
            Tidak ada jadwal obat
          </h3>
          <p className="text-gray-500">
            Belum ada jadwal obat yang sesuai dengan filter yang dipilih.
          </p>
        </div>
      )}
      <AddButton clickHandler={cliCkHandler} />
      <Modal isOpen={isOpen} onClose={cliCkHandler}>
        <InputJadwalObat
          onSubmit={(newJadwal) => {
            console.log("New jadwal:", newJadwal);
            // Here you would typically save the jadwal to your backend
            // For now we'll just close the modal
            setIsOpen(false);
          }}
        />
      </Modal>
    </Layout>
  );
};

export default Jadwal;
