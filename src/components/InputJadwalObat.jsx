import { useState } from "react";

const InputJadwalObat = ({ onSubmit, initialData }) => {
  // Accordion state
  const [activeSections, setActiveSections] = useState({
    basic: true,       // Always open by default
    schedule: true,    // Always open by default
    additional: false  // Closed by default
  });
  
  // Toggle accordion section
  const toggleSection = (section) => {
    setActiveSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
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

  // Form validation
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

  // Handle jadwal input changes
  const handleJadwalChange = (index, field, value) => {
    const updatedJadwal = [...formData.jadwalMinum];
    updatedJadwal[index] = {
      ...updatedJadwal[index],
      [field]: value,
    };

    // Auto-set end time 30 minutes after start time if not manually set
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

    // If user manually changes end time, mark it
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

    const lastJadwal = formData.jadwalMinum[formData.jadwalMinum.length - 1];
    // Calculate a reasonable next time (4 hours after the last one)
    const [hours, minutes] = lastJadwal.jam_awal.split(":").map(Number);
    let nextHour = (hours + 4) % 24;

    setFormData((prev) => ({
      ...prev,
      jadwalMinum: [
        ...prev.jadwalMinum,
        {
          id: Date.now(),
          jam_awal: `${String(nextHour).padStart(2, "0")}:${String(
            minutes
          ).padStart(2, "0")}`,
          jam_berakhir: `${String(nextHour).padStart(2, "0")}:${String(
            minutes + 30 >= 60 ? minutes - 30 : minutes + 30
          ).padStart(2, "0")}`,
        },
      ],
    }));
  };

  // Remove jadwal
  const handleRemoveJadwal = (index) => {
    setFormData((prev) => ({
      ...prev,
      jadwalMinum: prev.jadwalMinum.filter((_, i) => i !== index),
    }));
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const newErrors = {};
    if (!formData.nama_pasien)
      newErrors.nama_pasien = "Nama pasien harus diisi";
    if (!formData.nama_obat) newErrors.nama_obat = "Nama obat harus diisi";
    if (formData.jadwalMinum.length === 0)
      newErrors.jadwalMinum = "Minimal 1 jadwal minum obat";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Format data for submission
    const submitData = {
      nama_pasien: formData.nama_pasien,
      nama_obat: formData.nama_obat,
      dosis_obat: Number(formData.dosis_obat),
      slot_obat: formData.slot_obat,
      kategori: formData.kategori,
      jumlah_obat: Number(formData.jumlah_obat),
      catatan: formData.catatan || "-",
      jam_awal: formData.jadwalMinum.map((j) => j.jam_awal),
      jam_berakhir: formData.jadwalMinum.map((j) => j.jam_berakhir),
    };

    // Submit form
    onSubmit?.(submitData);
    setIsSubmitting(false);
  };
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full p-2.5 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );

  // No duplicate state needed

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-md w-full overflow-hidden"
    >
      {/* Header - Fixed, always visible */}
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-bold text-gray-800">
          {initialData ? "Edit" : "Tambah"} Jadwal Obat
        </h2>
      </div>

      {/* Form Fields - Compact Layout */}
      <div className="px-4 py-2">
        {/* Basic Info Section - Always visible */}
        <div className="mb-3">
          <div 
            className="flex items-center justify-between cursor-pointer py-2"
            onClick={() => toggleSection('basic')}
          >
            <h3 className="font-medium text-gray-800">Informasi Dasar</h3>
            <svg 
              className={`w-5 h-5 transition-transform ${activeSections.basic ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {activeSections.basic && (
            <div className={`space-y-3 py-1 ${styles.fadeIn}`}
              {/* Compact layout for basic info */}
              <div className="grid grid-cols-1 gap-3">
                {/* Nama Obat - Required */}
                <div>
                  <label className="text-sm text-gray-600">
                    Nama Obat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_obat"
                    value={formData.nama_obat}
                    onChange={handleInputChange}
                    placeholder="Nama obat"
                    className={`w-full p-2 border ${errors.nama_obat ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm`}
                    required
                  />
                  {errors.nama_obat && <p className="text-xs text-red-500 mt-1">{errors.nama_obat}</p>}
                </div>
                
                {/* Nama Pasien - Required */}
                <div>
                  <label className="text-sm text-gray-600">
                    Nama Pasien <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_pasien"
                    value={formData.nama_pasien}
                    onChange={handleInputChange}
                    placeholder="Nama pasien"
                    className={`w-full p-2 border ${errors.nama_pasien ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm`}
                    required
                  />
                  {errors.nama_pasien && <p className="text-xs text-red-500 mt-1">{errors.nama_pasien}</p>}
                </div>

                {/* Dosis and Slot - Side by side */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm text-gray-600">Dosis</label>
                    <select
                      name="dosis_obat"
                      value={formData.dosis_obat}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1} Butir
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Slot</label>
                    <select
                      name="slot_obat"
                      value={formData.slot_obat}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      {["A", "B", "C", "D", "E", "F"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Schedule Section - Always visible */}
        <div className="mb-3">
          <div 
            className="flex items-center justify-between cursor-pointer py-2"
            onClick={() => toggleSection('schedule')}
          >
            <h3 className="font-medium text-gray-800">Jadwal Minum</h3>
            <svg 
              className={`w-5 h-5 transition-transform ${activeSections.schedule ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {activeSections.schedule && (
            <div className="space-y-3 py-1 animate-fadeIn">
              {/* Waktu Minum Buttons - Simplified */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Waktu <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, kategori: "sebelum makan" }))}
                    className={`flex-1 py-2 rounded-md text-sm transition-colors ${
                      formData.kategori === "sebelum makan"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Sebelum Makan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, kategori: "sesudah makan" }))}
                    className={`flex-1 py-2 rounded-md text-sm transition-colors ${
                      formData.kategori === "sesudah makan"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Sesudah Makan
                  </button>
                </div>
              </div>

              {/* Jadwal Minum - Compact Layout */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Jam Minum <span className="text-red-500">*</span></label>
                  {errors.jadwalMinum && <p className="text-xs text-red-500">{errors.jadwalMinum}</p>}
                </div>

                <div className="mt-1 space-y-2">
                  {formData.jadwalMinum.map((jadwal, i) => (
                    <div
                      key={jadwal.id}
                      className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200"
                    >
                      <div className="flex-1 grid grid-cols-5 gap-1 items-center">
                        <span className="col-span-1 text-xs font-medium text-gray-600">{i+1}.</span>
                        <input
                          type="time"
                          value={jadwal.jam_awal}
                          onChange={(e) => handleJadwalChange(i, "jam_awal", e.target.value)}
                          className="col-span-2 p-1 border border-gray-300 rounded text-sm"
                          required
                        />
                        <span className="text-center text-gray-400">-</span>
                        <input
                          type="time"
                          value={jadwal.jam_berakhir}
                          onChange={(e) => handleJadwalChange(i, "jam_berakhir", e.target.value)}
                          className="col-span-1 p-1 border border-gray-300 rounded text-sm"
                          required
                        />
                      </div>

                      {formData.jadwalMinum.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveJadwal(i)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}

                  {formData.jadwalMinum.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddJadwal}
                      className="w-full py-1.5 flex items-center justify-center text-xs text-blue-600 border border-dashed border-blue-300 rounded"
                    >
                      + Tambah Jadwal
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Section - Collapsible */}
        <div className="mb-3">
          <div 
            className="flex items-center justify-between cursor-pointer py-2"
            onClick={() => toggleSection('additional')}
          >
            <h3 className="font-medium text-gray-800">Detail Tambahan</h3>
            <svg 
              className={`w-5 h-5 transition-transform ${activeSections.additional ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {activeSections.additional && (
            <div className="space-y-3 py-1 animate-fadeIn">
              {/* Jumlah Obat */}
              <div>
                <label className="text-sm text-gray-600">Jumlah Obat</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="jumlah_obat"
                    value={formData.jumlah_obat}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="w-16 p-2 border border-gray-300 rounded-md text-sm text-center"
                  />
                  <span className="text-sm text-gray-600">butir</span>
                  <input 
                    type="range" 
                    name="jumlah_obat" 
                    min="1" 
                    max="60" 
                    value={formData.jumlah_obat} 
                    onChange={handleInputChange}
                    className="flex-1 h-1 rounded-lg appearance-none cursor-pointer bg-gray-200"
                  />
                </div>
              </div>
              
              {/* Catatan */}
              <div>
                <label className="text-sm text-gray-600">Catatan</label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleInputChange}
                  placeholder="Catatan opsional"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  rows={2}
                ></textarea>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer with Submit Button */}
      <div className="px-4 py-3 border-t bg-gray-50 sticky bottom-0">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2.5 rounded-md text-white font-medium text-sm transition-colors ${
            isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
        </button>
      </div>
    </form>
  );
};

export default InputJadwalObat;
