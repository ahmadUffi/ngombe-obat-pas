import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import AddButton from "../components/UI/AddButton";
import NoteModal from "../components/Utility/NoteModal";
import NoteCard from "../components/Utility/NoteCard";
import LoadingSpinner from "../components/UI/LoadingSpinner";
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
    noteTitle: "",
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
      if (response.success) {
        setStats(response.data || {});
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
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
          loadNotes();
          loadStats();
        }
      } else {
        // Create new note
        const response = await apiService.createNote(noteData, token);
        if (response.success) {
          toast.success("Catatan berhasil dibuat!");
          loadNotes();
          loadStats();
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

  const handleDeleteNote = async (noteId) => {
    try {
      const token = apiService.getToken();
      if (!token) {
        toast.error("Silakan login terlebih dahulu");
        return;
      }

      const response = await apiService.deleteNote(noteId, token);
      if (response.success) {
        toast.success("Catatan berhasil dihapus!");
        loadNotes();
        loadStats();
        setDeleteConfirmation({
          isOpen: false,
          noteId: null,
          noteTitle: "",
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
      noteTitle:
        note.message.substring(0, 50) + (note.message.length > 50 ? "..." : ""),
    });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      noteId: null,
      noteTitle: "",
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

        {/* Stats Section */}
        {!isLoading && notes.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="text-purple-600" size={24} />
              <h3 className="text-lg font-bold text-gray-800">
                Statistik Catatan
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total || 0}
                </div>
                <div className="text-sm text-blue-700">Total Catatan</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  {stats.kontrol || 0}
                </div>
                <div className="text-sm text-green-700">Kontrol</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pengingat || 0}
                </div>
                <div className="text-sm text-yellow-700">Pengingat</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.pesan_dokter || 0}
                </div>
                <div className="text-sm text-purple-700">Pesan Dokter</div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        {!isLoading && notes.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6 mb-8">
            {/* Search Bar */}
            <div className="mb-6">
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

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryFilter(category.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border ${
                    selectedCategory === category.value
                      ? `bg-gradient-to-r ${category.color} border-gray-300 text-gray-800 scale-105`
                      : "bg-white hover:bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  {category.label}
                  {category.value !== "all" && stats[category.value] && (
                    <span className="ml-2 px-2 py-1 bg-white/80 rounded-full text-xs">
                      {stats[category.value]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

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

                    <div className="flex justify-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span>💡</span>
                        <span>Tips & Saran</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🔒</span>
                        <span>Data Aman</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📱</span>
                        <span>Mudah Diakses</span>
                      </span>
                    </div>
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
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Konfirmasi Hapus
                </h3>
                <p className="text-gray-600">
                  Apakah Anda yakin ingin menghapus catatan ini?
                </p>
              </div>

              {/* Note Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700 text-sm">
                  "{deleteConfirmation.noteTitle}"
                </p>
              </div>

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-red-700 text-sm">
                  <strong>Peringatan:</strong> Tindakan ini tidak dapat
                  dibatalkan. Catatan akan dihapus secara permanen.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDeleteNote(deleteConfirmation.noteId)}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Note;
