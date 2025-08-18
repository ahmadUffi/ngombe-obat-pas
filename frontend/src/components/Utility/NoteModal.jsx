import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const NoteModal = ({
  isOpen,
  onClose,
  onSave,
  note = null,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    category: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    {
      value: "kontrol",
      label: "🏥 Kontrol",
      color: "from-blue-500 to-blue-600",
    },
    {
      value: "pengingat",
      label: "⏰ Pengingat",
      color: "from-yellow-500 to-orange-500",
    },
    {
      value: "jadwal",
      label: "📅 Jadwal",
      color: "from-green-500 to-emerald-500",
    },
    {
      value: "efek_samping",
      label: "⚠️ Efek Samping",
      color: "from-red-500 to-red-600",
    },
    {
      value: "perubahan_dosis",
      label: "📊 Perubahan Dosis",
      color: "from-purple-500 to-purple-600",
    },
    {
      value: "pesan_dokter",
      label: "👨‍⚕️ Pesan Dokter",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      value: "lainnya",
      label: "📝 Lainnya",
      color: "from-gray-500 to-gray-600",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      if (isEditing && note) {
        setFormData({
          category: note.category || "",
          message: note.message || "",
        });
      } else {
        setFormData({
          category: "",
          message: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, note]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = "Kategori harus dipilih";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Pesan tidak boleh kosong";
    } else if (formData.message.length > 1000) {
      newErrors.message = "Pesan tidak boleh lebih dari 1000 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const getCategoryDisplay = (categoryValue) => {
    const category = categories.find((cat) => cat.value === categoryValue);
    return (
      category || { label: categoryValue, color: "from-gray-500 to-gray-600" }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12"></div>
          <div className="relative flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {isEditing ? "✏️ Edit Catatan" : "✨ Catatan Baru"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 ">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📂 Kategori Catatan
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={`w-full px-4 py-3 pr-10 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none bg-white text-gray-700 font-medium ${
                  errors.category
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-purple-300 hover:border-gray-300"
                } ${formData.category ? "text-gray-800" : "text-gray-500"}`}
                disabled={isLoading}
              >
                <option value="" className="text-gray-500">
                  Pilih Kategori...
                </option>
                {categories.map((category) => (
                  <option
                    key={category.value}
                    value={category.value}
                    className="text-gray-800"
                  >
                    {category.label}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className={`w-5 h-5 transition-colors ${
                    formData.category ? "text-purple-500" : "text-gray-400"
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
              </div>
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                {errors.category}
              </p>
            )}
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💭 Pesan Catatan
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Tulis catatan Anda di sini..."
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors resize-none ${
                errors.message
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-purple-300"
              }`}
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.message ? (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.message}
                </p>
              ) : (
                <div className="text-sm text-gray-500">
                  💡 Catatan membantu Anda mengingat informasi penting
                </div>
              )}
              <div
                className={`text-sm ${
                  formData.message.length > 900
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {formData.message.length}/1000
              </div>
            </div>
          </div>

          {/* Selected Category Preview */}
          {formData.category && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div
                  className={`px-3 py-1 bg-gradient-to-r ${
                    getCategoryDisplay(formData.category).color
                  } text-white rounded-lg text-sm font-medium`}
                >
                  {getCategoryDisplay(formData.category).label}
                </div>
                <span className="text-sm text-gray-600">Kategori terpilih</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                isLoading || !formData.category || !formData.message.trim()
              }
              className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 relative overflow-hidden ${
                isLoading || !formData.category || !formData.message.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed transform-none"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              }`}
            >
              {isLoading && (
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              )}
              <span className="relative">
                {isLoading
                  ? "⏳ Menyimpan..."
                  : isEditing
                  ? "💾 Update Catatan"
                  : "✅ Simpan Catatan"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
