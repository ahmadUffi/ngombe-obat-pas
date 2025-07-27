import { useState } from "react";

const InputJadwalObat = ({ onSubmit, initialData }) => {
  // Form state
  const [formData, setFormData] = useState({
    nama_pasien: initialData?.nama_pasien || "",
    nama_obat: initialData?.nama_obat || "",
    dosis_obat: initialData?.dosis_obat || 1,
    slot_obat: initialData?.slot_obat || "A",
    kategori: initialData?.kategori || "sesudah makan",
    jumlah_obat: initialData?.jumlah_obat || 20,
    catatan: initialData?.catatan || "",
    jadwalMinum: initialData?.jam_awal
      ? initialData.jam_awal.map((awal, i) => ({
          id: Date.now() + i,
          jam_awal: awal,
          jam_berakhir: initialData.jam_berakhir[i] || awal,
        }))
      : [{ id: Date.now(), jam_awal: "08:00", jam_berakhir: "08:30" }],
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step state for mobile-friendly multi-step form
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle jadwal input changes
  const handleJadwalChange = (index, field, value) => {
    const updatedJadwal = [...formData.jadwalMinum];
    updatedJadwal[index] = {
      ...updatedJadwal[index],
      [field]: value,
    };

    // Auto-set end time 30 minutes after start time
    if (field === "jam_awal" && !updatedJadwal[index].userSetEndTime) {
      const [hours, minutes] = value.split(":").map(Number);
      let endHours = hours;
      let endMinutes = minutes + 30;

      if (endMinutes >= 60) {
        endHours = (endHours + 1) % 24;
        endMinutes = endMinutes - 60;
      }

      updatedJadwal[index].jam_berakhir = `${String(endHours).padStart(
        2,
        "0"
      )}:${String(endMinutes).padStart(2, "0")}`;
    }

    if (field === "jam_berakhir") {
      updatedJadwal[index].userSetEndTime = true;
    }

    setFormData((prev) => ({
      ...prev,
      jadwalMinum: updatedJadwal,
    }));
  };

  // Add new jadwal
  const handleAddJadwal = () => {
    if (formData.jadwalMinum.length >= 4) {
      setErrors((prev) => ({
        ...prev,
        jadwalMinum: "Maksimal 4 jadwal minum obat",
      }));
      return;
    }

    const newJadwal = {
      id: Date.now(),
      jam_awal: "08:00",
      jam_berakhir: "08:30",
    };

    setFormData((prev) => ({
      ...prev,
      jadwalMinum: [...prev.jadwalMinum, newJadwal],
    }));
  };

  // Remove jadwal
  const handleRemoveJadwal = (index) => {
    if (formData.jadwalMinum.length <= 1) {
      setErrors((prev) => ({
        ...prev,
        jadwalMinum: "Minimal harus ada 1 jadwal minum obat",
      }));
      return;
    }

    const updatedJadwal = formData.jadwalMinum.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      jadwalMinum: updatedJadwal,
    }));
  };

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.nama_pasien.trim()) {
        newErrors.nama_pasien = "Nama pasien harus diisi";
      }
      if (!formData.nama_obat.trim()) {
        newErrors.nama_obat = "Nama obat harus diisi";
      }
      if (formData.dosis_obat < 1) {
        newErrors.dosis_obat = "Dosis harus minimal 1";
      }
    } else if (step === 2) {
      if (formData.jadwalMinum.length === 0) {
        newErrors.jadwalMinum = "Harus ada minimal 1 jadwal minum";
      }
      formData.jadwalMinum.forEach((jadwal, index) => {
        if (!jadwal.jam_awal) {
          newErrors[`jadwal_${index}_awal`] = "Jam mulai harus diisi";
        }
        if (!jadwal.jam_berakhir) {
          newErrors[`jadwal_${index}_berakhir`] = "Jam selesai harus diisi";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        jam_awal: formData.jadwalMinum.map((jadwal) => jadwal.jam_awal),
        jam_berakhir: formData.jadwalMinum.map((jadwal) => jadwal.jam_berakhir),
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compact Input Component
  const CompactInput = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    error,
    placeholder,
    required = false,
    min,
    max,
  }) => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  // Compact Select Component
  const CompactSelect = ({
    label,
    name,
    value,
    onChange,
    options,
    error,
    required = false,
  }) => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  // Step Progress Indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-4 px-4">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-8 h-0.5 mx-2 ${
                step < currentStep ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Step titles
  const getStepTitle = (step) => {
    switch (step) {
      case 1:
        return "Informasi Dasar";
      case 2:
        return "Jadwal Minum";
      case 3:
        return "Detail Tambahan";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white rounded-lg w-full max-w-md mx-auto max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800 text-center">
          {initialData ? "Edit" : "Tambah"} Jadwal Obat
        </h2>
        <StepIndicator />
        <p className="text-sm text-gray-600 text-center">
          {getStepTitle(currentStep)}
        </p>
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-1">
              <CompactInput
                label="Nama Pasien"
                name="nama_pasien"
                value={formData.nama_pasien}
                onChange={handleInputChange}
                placeholder="Masukkan nama pasien"
                error={errors.nama_pasien}
                required
              />

              <CompactInput
                label="Nama Obat"
                name="nama_obat"
                value={formData.nama_obat}
                onChange={handleInputChange}
                placeholder="Masukkan nama obat"
                error={errors.nama_obat}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  label="Dosis"
                  name="dosis_obat"
                  type="number"
                  value={formData.dosis_obat}
                  onChange={handleInputChange}
                  error={errors.dosis_obat}
                  min="1"
                  required
                />

                <CompactSelect
                  label="Slot Obat"
                  name="slot_obat"
                  value={formData.slot_obat}
                  onChange={handleInputChange}
                  options={[
                    { value: "A", label: "Slot A" },
                    { value: "B", label: "Slot B" },
                    { value: "C", label: "Slot C" },
                    { value: "D", label: "Slot D" },
                    { value: "E", label: "Slot E" },
                    { value: "F", label: "Slot F" },
                  ]}
                  error={errors.slot_obat}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  label="Kategori"
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleInputChange}
                  options={[
                    { value: "sebelum makan", label: "Sebelum Makan" },
                    { value: "sesudah makan", label: "Sesudah Makan" },
                    { value: "bersamaan makan", label: "Bersamaan Makan" },
                  ]}
                  error={errors.kategori}
                />

                <CompactInput
                  label="Jumlah Obat"
                  name="jumlah_obat"
                  type="number"
                  value={formData.jumlah_obat}
                  onChange={handleInputChange}
                  error={errors.jumlah_obat}
                  min="1"
                />
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">
                  Jadwal Minum Obat
                </h3>
                <button
                  type="button"
                  onClick={handleAddJadwal}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={formData.jadwalMinum.length >= 4}
                >
                  + Tambah
                </button>
              </div>

              {errors.jadwalMinum && (
                <p className="text-red-500 text-xs">{errors.jadwalMinum}</p>
              )}

              <div className="space-y-3">
                {formData.jadwalMinum.map((jadwal, index) => (
                  <div
                    key={jadwal.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Jadwal {index + 1}
                      </span>
                      {formData.jadwalMinum.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveJadwal(index)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Jam Mulai
                        </label>
                        <input
                          type="time"
                          value={jadwal.jam_awal}
                          onChange={(e) =>
                            handleJadwalChange(
                              index,
                              "jam_awal",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {errors[`jadwal_${index}_awal`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`jadwal_${index}_awal`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Jam Selesai
                        </label>
                        <input
                          type="time"
                          value={jadwal.jam_berakhir}
                          onChange={(e) =>
                            handleJadwalChange(
                              index,
                              "jam_berakhir",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {errors[`jadwal_${index}_berakhir`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`jadwal_${index}_berakhir`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Additional Details */}
          {currentStep === 3 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan (Opsional)
                </label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleInputChange}
                  placeholder="Tambahkan catatan khusus untuk obat ini..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Ringkasan Jadwal
                </h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>
                    <strong>Pasien:</strong> {formData.nama_pasien}
                  </p>
                  <p>
                    <strong>Obat:</strong> {formData.nama_obat}
                  </p>
                  <p>
                    <strong>Dosis:</strong> {formData.dosis_obat} tablet/kapsul
                  </p>
                  <p>
                    <strong>Kategori:</strong> {formData.kategori}
                  </p>
                  <p>
                    <strong>Jadwal:</strong>
                  </p>
                  <ul className="ml-3">
                    {formData.jadwalMinum.map((jadwal, index) => (
                      <li key={index}>
                        {jadwal.jam_awal} - {jadwal.jam_berakhir}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Footer Navigation - Fixed */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex justify-between gap-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sebelumnya
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              Selanjutnya
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputJadwalObat;
