import React from "react";
import Layout from "../components/Layout/Layout";
import AddButton from "../components/UI/AddButton";
import { toast } from "react-toastify";

const Note = () => {
  const handleAddNote = () => {
    // Logic untuk menambah catatan baru
    toast.info("Fitur catatan akan segera hadir");
    console.log("Add new note");
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

        {/* Enhanced Saved Notes Section */}
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
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-200">
                  🔍 Semua
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-orange-200 text-orange-700">
                  ⚠️ Penting
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-green-200 text-green-700">
                  ⭐ Favorit
                </button>
              </div>
            </div>

            {/* Enhanced Empty State */}
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
                  <button className="bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-700 hover:via-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25 relative overflow-hidden group">
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
          </div>
        </div>

        {/* Add Button */}
        <AddButton clickHandler={handleAddNote} />
      </div>
    </Layout>
  );
};

export default Note;
