import { useState, useEffect, useMemo, useCallback } from "react";
import CompactInput from "./CompactInput";
import CompactSelect from "./CompactSelect";
import StepIndicator from "../UI/StepIndicator";
import AllSlotsFullWarning from "../Common/AllSlotsFullWarning";
import { toast } from "react-toastify";

const InputJadwalObat = ({ onSubmit, initialData, existingJadwal = [] }) => {
  // Form state - editing is now disabled
  const [formData, setFormData] = useState({
    nama_pasien: "",
    nama_obat: "",
    dosis_obat: 1,
    slot_obat: "A",
    kategori: "sesudah makan",
    jumlah_obat: 20,
    catatan: "",
    jadwalMinum: [{ id: Date.now(), jam_awal: "08:00", jam_berakhir: "08:30" }],
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step state for mobile-friendly multi-step form
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Get used slots from existing jadwal (excluding current item if editing) - Memoized
  const usedSlots = useMemo(() => {
    return existingJadwal
      .filter((jadwal) => !initialData || jadwal.id !== initialData.id) // Exclude current item if editing
      .reduce((acc, jadwal) => {
        acc[jadwal.slot_obat] = {
          nama_obat: jadwal.nama_obat,
          nama_pasien: jadwal.nama_pasien,
        };
        return acc;
      }, {});
  }, [existingJadwal, initialData]);

  // Check if all slots are full (for new items) - Memoized
  const allSlotsFull = useMemo(() => {
    return !initialData && Object.keys(usedSlots).length >= 8;
  }, [initialData, usedSlots]);

  // Auto-select first available slot if current slot is used - Optimized
  useEffect(() => {
    if (usedSlots[formData.slot_obat] && !initialData) {
      const availableSlots = ["A", "B", "C", "D", "E", "F", "G", "H"];
      const firstAvailable = availableSlots.find((slot) => !usedSlots[slot]);

      if (firstAvailable) {
        setFormData((prev) => ({
          ...prev,
          slot_obat: firstAvailable,
        }));
      }
    }
  }, [JSON.stringify(usedSlots), formData.slot_obat, initialData]);

  // Handle input changes - Memoized
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Handle jadwal input changes
  const handleJadwalChange = (index, field, value) => {
    const updatedJadwal = [...formData.jadwalMinum];
    updatedJadwal[index] = {
      ...updatedJadwal[index],
      [field]: value,
    };

    // Auto-set end time 30 minutes after start time and validate 3-hour limit
    if (field === "jam_awal") {
      if (!updatedJadwal[index].userSetEndTime) {
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
      } else {
        // If user has set end time, validate against new start time
        const endTime = updatedJadwal[index].jam_berakhir;
        if (endTime) {
          const [startHours, startMinutes] = value.split(":").map(Number);
          const [endHours, endMinutes] = endTime.split(":").map(Number);

          const startTotalMinutes = startHours * 60 + startMinutes;
          let endTotalMinutes = endHours * 60 + endMinutes;

          // Handle next day scenario
          if (endTotalMinutes < startTotalMinutes) {
            endTotalMinutes += 24 * 60;
          }

          const durationMinutes = endTotalMinutes - startTotalMinutes;
          const maxDurationMinutes = 3 * 60;

          if (durationMinutes > maxDurationMinutes) {
            const maxEndMinutes = startTotalMinutes + maxDurationMinutes;
            const correctedHours = Math.floor(maxEndMinutes / 60) % 24;
            const correctedMinutes = maxEndMinutes % 60;

            updatedJadwal[index].jam_berakhir = `${String(
              correctedHours
            ).padStart(2, "0")}:${String(correctedMinutes).padStart(2, "0")}`;

            setErrors((prev) => ({
              ...prev,
              [`jadwal_${index}_duration`]:
                "Durasi disesuaikan ke maksimal 3 jam dari jam mulai baru.",
            }));
          }
        }
      }
    }

    // Validate 3-hour maximum duration when end time is set
    if (field === "jam_berakhir") {
      updatedJadwal[index].userSetEndTime = true;

      const startTime = updatedJadwal[index].jam_awal;
      if (startTime && value) {
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const [endHours, endMinutes] = value.split(":").map(Number);

        const startTotalMinutes = startHours * 60 + startMinutes;
        let endTotalMinutes = endHours * 60 + endMinutes;

        // Handle next day scenario
        if (endTotalMinutes < startTotalMinutes) {
          endTotalMinutes += 24 * 60; // Add 24 hours in minutes
        }

        const durationMinutes = endTotalMinutes - startTotalMinutes;
        const maxDurationMinutes = 3 * 60; // 3 hours in minutes

        if (durationMinutes > maxDurationMinutes) {
          // Auto-correct to maximum 3 hours
          const maxEndMinutes = startTotalMinutes + maxDurationMinutes;
          const correctedHours = Math.floor(maxEndMinutes / 60) % 24;
          const correctedMinutes = maxEndMinutes % 60;

          updatedJadwal[index].jam_berakhir = `${String(
            correctedHours
          ).padStart(2, "0")}:${String(correctedMinutes).padStart(2, "0")}`;

          // Show warning
          setErrors((prev) => ({
            ...prev,
            [`jadwal_${index}_duration`]:
              "Durasi minum obat maksimal 3 jam. Waktu selesai telah disesuaikan.",
          }));
        } else {
          // Clear duration error if valid
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`jadwal_${index}_duration`];
            return newErrors;
          });
        }
      }
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

      // Validate slot obat availability
      if (usedSlots[formData.slot_obat]) {
        const conflictMedicine = usedSlots[formData.slot_obat];
        newErrors.slot_obat = `Slot ${formData.slot_obat} sudah digunakan oleh obat "${conflictMedicine.nama_obat}" untuk pasien "${conflictMedicine.nama_pasien}"`;
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

        // Validate 3-hour maximum duration
        if (jadwal.jam_awal && jadwal.jam_berakhir) {
          const [startHours, startMinutes] = jadwal.jam_awal
            .split(":")
            .map(Number);
          const [endHours, endMinutes] = jadwal.jam_berakhir
            .split(":")
            .map(Number);

          const startTotalMinutes = startHours * 60 + startMinutes;
          let endTotalMinutes = endHours * 60 + endMinutes;

          // Handle next day scenario
          if (endTotalMinutes < startTotalMinutes) {
            endTotalMinutes += 24 * 60; // Add 24 hours in minutes
          }

          const durationMinutes = endTotalMinutes - startTotalMinutes;
          const maxDurationMinutes = 3 * 60; // 3 hours in minutes

          if (durationMinutes > maxDurationMinutes) {
            newErrors[`jadwal_${index}_duration`] =
              "Durasi minum obat maksimal 3 jam";
          }

          if (durationMinutes <= 0) {
            newErrors[`jadwal_${index}_sequence`] =
              "Jam selesai harus setelah jam mulai";
          }
        }
      });
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Mohon perbaiki data yang tidak valid");
    }
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
      toast.success("Jadwal obat berhasil disimpan!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Gagal menyimpan jadwal obat. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step titles - Memoized
  const getStepTitle = useCallback((step) => {
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
  }, []);

  return (
    <div className="bg-white rounded-lg w-full max-w-md mx-auto max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800 text-center">
          {initialData ? "Edit" : "Tambah"} Jadwal Obat
        </h2>
        <StepIndicator currentStep={currentStep} />

        <p className="text-sm text-gray-600 text-center mt-2">
          {getStepTitle(currentStep)}
        </p>
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* All Slots Full Warning */}
        {allSlotsFull && <AllSlotsFullWarning />}

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
                    {
                      value: "A",
                      label: "Slot A",
                      disabled: !!usedSlots["A"],
                    },
                    {
                      value: "B",
                      label: "Slot B",
                      disabled: !!usedSlots["B"],
                    },
                    {
                      value: "C",
                      label: "Slot C",
                      disabled: !!usedSlots["C"],
                    },
                    {
                      value: "D",
                      label: "Slot D",
                      disabled: !!usedSlots["D"],
                    },
                    {
                      value: "E",
                      label: "Slot E",
                      disabled: !!usedSlots["E"],
                    },
                    {
                      value: "F",
                      label: "Slot F",
                      disabled: !!usedSlots["F"],
                    },
                    {
                      value: "G",
                      label: "Slot G",
                      disabled: !!usedSlots["G"],
                    },
                    {
                      value: "H",
                      label: "Slot H",
                      disabled: !!usedSlots["H"],
                    },
                  ]}
                  error={errors.slot_obat}
                />

                {/* Slot Status Indicator */}
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-xs text-blue-700">
                  💡 <strong>Tips:</strong> Durasi minum obat maksimal 3 jam.
                  Jam selesai akan otomatis disesuaikan jika melebihi batas ini.
                </p>
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

                    {/* Duration and sequence error messages */}
                    {errors[`jadwal_${index}_duration`] && (
                      <p className="text-orange-500 text-xs mt-1 bg-orange-50 p-2 rounded border border-orange-200">
                        ⚠️ {errors[`jadwal_${index}_duration`]}
                      </p>
                    )}
                    {errors[`jadwal_${index}_sequence`] && (
                      <p className="text-red-500 text-xs mt-1 bg-red-50 p-2 rounded border border-red-200">
                        ❌ {errors[`jadwal_${index}_sequence`]}
                      </p>
                    )}
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
