import { useState } from "react";

const InputControlJadwal = ({ onSubmit, initialData }) => {
  // Form state based on the JSON structure provided
  const [formData, setFormData] = useState({
    tanggal: initialData?.tanggal || "",
    dokter: initialData?.dokter || "",
    waktu: initialData?.waktu || "",
    nama_pasien: initialData?.nama_pasien || "",
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.tanggal.trim()) {
      newErrors.tanggal = "Tanggal harus diisi";
    }

    if (!formData.dokter.trim()) {
      newErrors.dokter = "Dokter harus dipilih";
    }

    if (!formData.waktu.trim()) {
      newErrors.waktu = "Waktu harus diisi";
    }

    if (!formData.nama_pasien.trim()) {
      newErrors.nama_pasien = "Nama pasien harus diisi";
    }

    // Validate date is not in the past
    if (formData.tanggal) {
      const selectedDate = new Date(formData.tanggal);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.tanggal = "Tanggal tidak boleh di masa lalu";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compact Input Component with colorful styling
  const CompactInput = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    error,
    placeholder,
    required = false,
    icon = "📝",
  }) => (
    <div className="mb-4">
      <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
        <span className="mr-2">{icon}</span>
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
            error
              ? "border-red-400 focus:border-red-500 bg-red-50"
              : "border-gray-300 focus:border-blue-400 hover:border-gray-400 bg-white"
          }`}
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
  );

  return (
    <div className="bg-white rounded-xl w-full max-w-md mx-auto max-h-[85vh] flex flex-col shadow-lg border border-gray-300">
      {/* Header */}
      <div className="p-4 bg-blue-500 text-white rounded-t-xl flex-shrink-0">
        <h2 className="text-lg font-bold text-center flex items-center justify-center">
          <span className="mr-2">🏥</span>
          {initialData ? "Edit" : "Tambah"} Jadwal Kontrol
        </h2>
        <p className="text-blue-100 text-center mt-1 text-sm">
          Lengkapi informasi jadwal kontrol dengan dokter
        </p>
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <CompactInput
              label="Nama Pasien"
              name="nama_pasien"
              value={formData.nama_pasien}
              onChange={handleInputChange}
              placeholder="Masukkan nama pasien"
              error={errors.nama_pasien}
              required
              icon="👤"
            />

            <CompactInput
              label="Nama Dokter"
              name="dokter"
              value={formData.dokter}
              onChange={handleInputChange}
              placeholder="Masukkan nama dokter (contoh: Dr. Andi, Sp.PD)"
              error={errors.dokter}
              required
              icon="👨‍⚕️"
            />

            <CompactInput
              label="Tanggal Kontrol"
              name="tanggal"
              type="date"
              value={formData.tanggal}
              onChange={handleInputChange}
              error={errors.tanggal}
              required
              icon="📅"
            />

            <CompactInput
              label="Waktu"
              name="waktu"
              type="time"
              value={formData.waktu}
              onChange={handleInputChange}
              error={errors.waktu}
              required
              icon="⏰"
            />

            {/* Summary with colorful design */}
            {formData.nama_pasien &&
              formData.dokter &&
              formData.tanggal &&
              formData.waktu && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mt-4 shadow-sm">
                  <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center">
                    <span className="mr-2">📋</span>
                    Ringkasan Jadwal Kontrol
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="w-20 text-green-600 font-medium">
                        👤 Pasien:
                      </span>
                      <span className="text-green-800 font-semibold">
                        {formData.nama_pasien}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-20 text-gray-600 font-medium">
                        👨‍⚕️ Dokter:
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {formData.dokter}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-20 text-gray-600 font-medium">
                        📅 Tanggal:
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {new Date(formData.tanggal).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-20 text-gray-600 font-medium">
                        ⏰ Waktu:
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {formData.waktu} WIB
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 rounded-b-xl border-t border-gray-200 flex-shrink-0">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full px-4 py-3 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <span className="mr-2">💾</span>
              Simpan Jadwal Kontrol
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputControlJadwal;
