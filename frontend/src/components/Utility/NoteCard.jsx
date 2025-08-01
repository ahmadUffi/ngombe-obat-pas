import React, { useState } from "react";
import { Edit3, Trash2, Calendar, User } from "lucide-react";

const NoteCard = ({ note, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = {
    kontrol: {
      label: "🏥 Kontrol",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    pengingat: {
      label: "⏰ Pengingat",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    jadwal: {
      label: "📅 Jadwal",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    efek_samping: {
      label: "⚠️ Efek Samping",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    perubahan_dosis: {
      label: "📊 Perubahan Dosis",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    pesan_dokter: {
      label: "👨‍⚕️ Pesan Dokter",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
    lainnya: {
      label: "📝 Lainnya",
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
  };

  const getCategoryInfo = (categoryValue) => {
    return categories[categoryValue] || categories.lainnya;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Hari ini";
    } else if (diffDays === 2) {
      return "Kemarin";
    } else if (diffDays <= 7) {
      return `${diffDays - 1} hari lalu`;
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(note);
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const categoryInfo = getCategoryInfo(note.category);

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border-2 ${
        categoryInfo.borderColor
      } p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden group ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Background Pattern */}
      <div
        className={`absolute inset-0 ${categoryInfo.bgColor} opacity-30 rounded-2xl`}
      ></div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>

      <div className="relative">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div
            className={`inline-flex items-center px-3 py-1 bg-gradient-to-r ${categoryInfo.color} text-white rounded-full text-sm font-medium shadow-lg`}
          >
            {categoryInfo.label}
          </div>
          <div className="flex items-center gap-2 transition-opacity">
            <button
              onClick={() => onEdit(note)}
              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
              disabled={isDeleting}
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Message */}
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed line-clamp-4">
            {note.message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(note.created_at)}</span>
            </div>
            {note.updated_at !== note.created_at && (
              <div className="flex items-center gap-1 text-blue-600">
                <Edit3 size={12} />
                <span className="text-xs">Diupdate</span>
              </div>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {isDeleting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">Menghapus...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
