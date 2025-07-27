import BoxJadwal from "../components/BoxJadwal";
import AddButton from "../components/Utility/AddButton";
import Modal from "../components/Utility/Modal";
import InputJadwalObat from "../components/InputJadwalObat";
import Layout from "../components/Utility/Layout";
import { useState } from "react";

const Jadwal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditQuantityOpen, setIsEditQuantityOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState("all");

  const cliCkHandler = () => {
    setIsOpen(!isOpen);
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

  // Sample data dengan format baru - converted to state
  const [jadwalData, setJadwalData] = useState([
    {
      id: 1,
      nama_obat: "Amoxicillin 500mg",
      nama_pasien: "Ahmad Uffi",
      dosis_obat: 1,
      jumlah_obat: 12,
      jam_awal: ["10:00", "13:00", "18:00"],
      jam_berakhir: ["11:00", "13:30", "18:30"],
      catatan:
        "Antibiotik untuk infeksi saluran pernapasan. Harus diminum sampai habis meskipun gejala sudah membaik. Jangan lupa minum air putih yang banyak.",
      kategori: "sebelum makan",
      slot_obat: "A",
    },
    {
      id: 2,
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
      id: 3,
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
      id: 4,
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
      id: 5,
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
      id: 6,
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
      id: 7,
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
    {
      id: 8,
      nama_obat: "Ibuprofen 400mg",
      nama_pasien: "Rudi Hartono",
      dosis_obat: 1,
      jumlah_obat: 0,
      jam_awal: ["08:00", "20:00"],
      jam_berakhir: ["08:30", "20:30"],
      catatan: "Obat anti inflamasi. Stok habis, perlu beli lagi.",
      kategori: "sesudah makan",
      slot_obat: "G",
    },
    {
      id: 9,
      nama_obat: "Lansoprazole 30mg",
      nama_pasien: "Dewi Sartika",
      dosis_obat: 1,
      jumlah_obat: 0,
      jam_awal: ["06:00"],
      jam_berakhir: ["06:30"],
      catatan: "Obat lambung. Habis, segera restock.",
      kategori: "sebelum makan",
      slot_obat: "H",
    },
  ]);

  const filteredData = jadwalData.filter((item) => {
    if (filter === "all") return true;
    if (filter === "habis") return item.jumlah_obat === 0;
    if (filter === "sedikit")
      return item.jumlah_obat <= 10 && item.jumlah_obat > 0;
    if (filter === "aman") return item.jumlah_obat > 10;
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
            SEMUA ({jadwalData.length})
          </button>
          <button
            onClick={() => setFilter("sedikit")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "sedikit"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            SEDIKIT (
            {
              jadwalData.filter(
                (item) => item.jumlah_obat <= 10 && item.jumlah_obat > 0
              ).length
            }
            )
          </button>
          <button
            onClick={() => setFilter("habis")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "habis"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            HABIS ({jadwalData.filter((item) => item.jumlah_obat === 0).length})
          </button>
          <button
            onClick={() => setFilter("aman")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === "aman"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            AMAN ({jadwalData.filter((item) => item.jumlah_obat > 10).length})
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
      <div className="flex flex-wrap justify-start gap-6 mb-20">
        {filteredData.map((data, index) => (
          <div key={data.id || index} className="flex-shrink-0">
            <BoxJadwal data={data} onEditQuantity={handleEditQuantity} />
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

      {/* Add Medication Modal */}
      <Modal isOpen={isOpen} onClose={cliCkHandler}>
        <InputJadwalObat
          onSubmit={(newJadwal) => {
            const jadwalWithId = {
              ...newJadwal,
              id: Date.now(), // Simple ID generation
            };
            setJadwalData((prev) => [...prev, jadwalWithId]);
            console.log("New jadwal:", jadwalWithId);
            setIsOpen(false);
          }}
        />
      </Modal>

      {/* Edit Quantity Modal */}
      <Modal isOpen={isEditQuantityOpen} onClose={handleCloseEditQuantity}>
        <EditQuantityModal
          item={editingItem}
          onSubmit={(updatedQuantity) => {
            setJadwalData((prev) =>
              prev.map((item) =>
                item.id === editingItem.id
                  ? { ...item, jumlah_obat: updatedQuantity }
                  : item
              )
            );
            handleCloseEditQuantity();
          }}
        />
      </Modal>
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
