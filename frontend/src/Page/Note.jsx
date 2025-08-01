import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import AddButton from "../components/UI/AddButton";
import NoteModal from "../components/Utility/NoteModal";
import NoteCard from "../components/Utility/NoteCard";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ConfirmModal from "../components/UI/ConfirmModal";
import { apiService } from "../api/apiservice";
import { toast } from "react-toastify";
import { Search, Filter, BarChart3 } from "lucide-react";

const Note = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({});
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    noteId: null,
  });

  const categories = [
    { value: "all", label: "🔍 Semua", color: "from-gray-100 to-gray-200" },
    {
      value: "kontrol",
      label: "🏥 Kontrol",
      color: "from-blue-100 to-blue-200",
    },
    {
      value: "pengingat",
      label: "⏰ Pengingat",
      color: "from-yellow-100 to-orange-200",
    },
    {
      value: "jadwal",
      label: "📅 Jadwal",
      color: "from-green-100 to-emerald-200",
    },
    {
      value: "efek_samping",
      label: "⚠️ Efek Samping",
      color: "from-red-100 to-red-200",
    },
    {
      value: "perubahan_dosis",
      label: "📊 Perubahan Dosis",
      color: "from-purple-100 to-purple-200",
    },
    {
      value: "pesan_dokter",
      label: "👨‍⚕️ Pesan Dokter",
      color: "from-indigo-100 to-indigo-200",
    },
    {
      value: "lainnya",
      label: "📝 Lainnya",
      color: "from-gray-100 to-gray-200",
    },
  ];

  useEffect(() => {
    loadNotes();
    loadStats();
  }, []);

  useEffect(() => {
    filterNotes();
    // Recalculate stats when notes change
    if (notes.length > 0) {
      const calculatedStats = calculateStatsFromNotes(notes);
      setStats(calculatedStats);
    }
  }, [notes, selectedCategory, searchQuery]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const token = apiService.getToken();
      if (!token) {
        toast.error("Silakan login terlebih dahulu");
        return;
      }

      const response = await apiService.getAllNotes(null, token);
      if (response.success) {
        setNotes(response.data || []);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      toast.error("Gagal memuat catatan");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = apiService.getToken();
      if (!token) return;

      const response = await apiService.getNotesStats(token);
      if (response.success && response.data) {
        // Handle both backend format and client-side calculation
        let statsData = {};

        if (response.data.by_category) {
          // Backend returned structured format
          statsData = {
            total: response.data.total || 0,
            ...response.data.by_category,
          };
        } else {
          // Fallback: calculate from notes array
          statsData = calculateStatsFromNotes(notes);
        }

        setStats(statsData);
      } else {
        // Fallback: calculate from notes array
        setStats(calculateStatsFromNotes(notes));
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      // Fallback: calculate from notes array
      setStats(calculateStatsFromNotes(notes));
    }
  };

  const calculateStatsFromNotes = (notesArray) => {
    const stats = {
      total: notesArray.length,
      kontrol: 0,
      pengingat: 0,
      jadwal: 0,
      efek_samping: 0,
      perubahan_dosis: 0,
      pesan_dokter: 0,
      lainnya: 0,
    };

    notesArray.forEach((note) => {
      if (note.category && stats.hasOwnProperty(note.category)) {
        stats[note.category]++;
      }
    });

    return stats;
  };

  const filterNotes = () => {
    let filtered = notes;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((note) => note.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((note) =>
        note.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNotes(filtered);
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      const token = apiService.getToken();
      if (!token) {
        toast.error("Silakan login terlebih dahulu");
        return;
      }

      if (editingNote) {
        // Update existing note
        const response = await apiService.updateNote(
          editingNote.note_id,
          noteData,
          token
        );
        if (response.success) {
          toast.success("Catatan berhasil diupdate!");
          await loadNotes();
          // Stats will be recalculated automatically via useEffect
        }
      } else {
        // Create new note
        const response = await apiService.createNote(noteData, token);
        if (response.success) {
          toast.success("Catatan berhasil dibuat!");
          await loadNotes();
          // Stats will be recalculated automatically via useEffect
        }
      }
    } catch (error) {
      console.error("Error saving note:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal menyimpan catatan";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDeleteNote = async () => {
    try {
      const token = apiService.getToken();
      if (!token) {
        toast.error("Silakan login terlebih dahulu");
        return;
      }

      const response = await apiService.deleteNote(
        deleteConfirmation.noteId,
        token
      );
      if (response.success) {
        toast.success("Catatan berhasil dihapus!");
        await loadNotes();
        // Stats will be recalculated automatically via useEffect
        setDeleteConfirmation({
          isOpen: false,
          noteId: null,
        });
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus catatan";
      toast.error(errorMessage);
    }
  };

  const handleDeleteConfirmation = (note) => {
    setDeleteConfirmation({
      isOpen: true,
      noteId: note.note_id,
    });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      noteId: null,
    });
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      filterNotes();
      return;
    }

    try {
      const token = apiService.getToken();
      if (!token) {
        toast.error("Silakan login terlebih dahulu");
        return;
      }

      const response = await apiService.searchNotes(searchQuery, token);
      if (response.success) {
        setFilteredNotes(response.data || []);
      }
    } catch (error) {
      console.error("Error searching notes:", error);
      toast.error("Gagal melakukan pencarian");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4 space-y-8">
        {/* Header with Enhanced Design */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-6 shadow-2xl">
              <span className="text-3xl">📝</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Catatan Obat
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Catat informasi penting tentang obat dan treatment Anda dengan
              mudah dan terorganisir
            </p>
          </div>
        </div>
        {/* Combined Stats and Filter Section */}
        {!isLoading && notes.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6 mb-8">
            {/* Statistics Header */}
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="text-purple-600" size={24} />
              <h3 className="text-lg font-bold text-gray-800">
                Statistik & Filter Catatan
              </h3>
            </div>

            {/* Clickable Statistics Grid as Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <button
                onClick={() => handleCategoryFilter("all")}
                className={`text-center p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${
                  selectedCategory === "all"
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 scale-105"
                    : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300"
                }`}
              >
                <div className="text-xl font-bold text-blue-600">
                  {stats.total || 0}
                </div>
                <div className="text-xs text-blue-700">🔍 Total</div>
              </button>

              <button
                onClick={() => handleCategoryFilter("kontrol")}
                className={`text-center p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${
                  selectedCategory === "kontrol"
                    ? "bg-gradient-to-r from-green-50 to-green-100 border-green-300 scale-105"
                    : "bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:border-green-300"
                }`}
              >
                <div className="text-xl font-bold text-green-600">
                  {stats.kontrol || 0}
                </div>
                <div className="text-xs text-green-700">🏥 Kontrol</div>
              </button>

              <button
                onClick={() => handleCategoryFilter("pengingat")}
                className={`text-center p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${
                  selectedCategory === "pengingat"
                    ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 scale-105"
                    : "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 hover:border-yellow-300"
                }`}
              >
                <div className="text-xl font-bold text-yellow-600">
                  {stats.pengingat || 0}
                </div>
                <div className="text-xs text-yellow-700">⏰ Pengingat</div>
              </button>

              <button
                onClick={() => handleCategoryFilter("jadwal")}
                className={`text-center p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${
                  selectedCategory === "jadwal"
                    ? "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-300 scale-105"
                    : "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 hover:border-emerald-300"
                }`}
              >
                <div className="text-xl font-bold text-emerald-600">
                  {stats.jadwal || 0}
                </div>
                <div className="text-xs text-emerald-700">📅 Jadwal</div>
              </button>

              <button
                onClick={() => handleCategoryFilter("efek_samping")}
                className={`text-center p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${
                  selectedCategory === "efek_samping"
                    ? "bg-gradient-to-r from-red-50 to-red-100 border-red-300 scale-105"
                    : "bg-gradient-to-r from-red-50 to-red-100 border-red-200 hover:border-red-300"
                }`}
              >
                <div className="text-xl font-bold text-red-600">
                  {stats.efek_samping || 0}
                </div>
                <div className="text-xs text-red-700">⚠️ Efek Samping</div>
              </button>

              <button
                onClick={() => handleCategoryFilter("perubahan_dosis")}
                className={`text-center p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${
                  selectedCategory === "perubahan_dosis"
                    ? "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-300 scale-105"
                    : "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300"
                }`}
              >
                <div className="text-xl font-bold text-purple-600">
                  {stats.perubahan_dosis || 0}
                </div>
                <div className="text-xs text-purple-700">
                  📊 Perubahan Dosis
                </div>
              </button>

              <button
                onClick={() => handleCategoryFilter("pesan_dokter")}
                className={`text-center p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${
                  selectedCategory === "pesan_dokter"
                    ? "bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-300 scale-105"
                    : "bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 hover:border-indigo-300"
                }`}
              >
                <div className="text-xl font-bold text-indigo-600">
                  {stats.pesan_dokter || 0}
                </div>
                <div className="text-xs text-indigo-700">👨‍⚕️ Pesan Dokter</div>
              </button>

              <button
                onClick={() => handleCategoryFilter("lainnya")}
                className={`text-center p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${
                  selectedCategory === "lainnya"
                    ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 scale-105"
                    : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-xl font-bold text-gray-600">
                  {stats.lainnya || 0}
                </div>
                <div className="text-xs text-gray-700">📝 Lainnya</div>
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-0">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Cari catatan..."
                  className="w-full px-4 py-3 pl-12 pr-20 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-colors"
                />
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Cari
                </button>
              </div>
            </div>
          </div>
        )}{" "}
        {/* Notes Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-10 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-3xl"></div>
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full -translate-y-20 -translate-x-20"></div>

          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl mr-4 shadow-lg">
                  <span className="text-xl text-white">📚</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Catatan Tersimpan
                </h2>
                {filteredNotes.length > 0 && (
                  <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {filteredNotes.length} catatan
                  </span>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <LoadingSpinner />
              </div>
            ) : filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.note_id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteConfirmation}
                  />
                ))}
              </div>
            ) : notes.length === 0 ? (
              /* Enhanced Empty State */
              <div className="text-center py-16 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 rounded-3xl"></div>
                <div className="relative">
                  {/* Floating Icons */}
                  <div className="absolute -top-4 left-1/4 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center transform rotate-12 opacity-70 animate-bounce delay-75">
                    <span className="text-sm">📝</span>
                  </div>
                  <div className="absolute top-8 right-1/4 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center transform -rotate-12 opacity-70 animate-bounce delay-150">
                    <span className="text-xs">💊</span>
                  </div>
                  <div className="absolute -bottom-2 left-1/3 w-7 h-7 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center transform rotate-45 opacity-70 animate-bounce delay-300">
                    <span className="text-sm">⚡</span>
                  </div>

                  <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-6 shadow-2xl relative">
                      <span className="text-4xl">📖</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-ping opacity-20"></div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    Belum Ada Catatan
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                    Mulai dokumentasikan perjalanan kesehatan Anda. Buat catatan
                    pertama untuk menyimpan informasi penting tentang obat dan
                    treatment.
                  </p>

                  <div className="space-y-4">
                    <button
                      onClick={handleAddNote}
                      className="bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-700 hover:via-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative flex items-center gap-3">
                        <span>✨</span>
                        <span>Buat Catatan Pertama</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* No Results State */
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Tidak Ada Hasil
                </h3>
                <p className="text-gray-500 mb-6">
                  Tidak ditemukan catatan yang sesuai dengan pencarian atau
                  filter Anda.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Add Button */}
        <AddButton clickHandler={handleAddNote} />
        {/* Note Modal */}
        <NoteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveNote}
          note={editingNote}
          isEditing={!!editingNote}
        />
        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteConfirmation.isOpen}
          onClose={handleCancelDelete}
          onConfirm={handleDeleteNote}
          title="Hapus Catatan"
          message="Apakah Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Hapus"
          cancelText="Batal"
          type="danger"
        />
      </div>
    </Layout>
  );
};

export default Note;
