import React, { useState } from "react";
import { usePhoneValidation } from "../../utils/phoneValidation";
import { useToast } from "../../hooks/useToast";
import { apiservice } from "../../api/apiservice";

const WhatsAppMessageForm = ({
  onSuccess,
  onCancel,
  title = "Kirim Pesan WhatsApp",
}) => {
  const [formData, setFormData] = useState({
    phone: "",
    message: "",
    type: "text",
  });
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const {
    validateAndShowError,
    handleApiError,
    formatPhoneDisplay,
    getPhoneProvider,
  } = usePhoneValidation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    setFormData((prev) => ({
      ...prev,
      phone: phone,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi client-side terlebih dahulu
    if (!validateAndShowError(formData.phone, showToast)) {
      return;
    }

    if (!formData.message.trim()) {
      showToast({
        type: "error",
        message: "Pesan wajib diisi",
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      // Gunakan endpoint production dengan auth
      const response = await apiservice.post("/message/send", {
        phone: formData.phone,
        message: formData.message,
        type: formData.type,
      });

      if (response.data.success) {
        showToast({
          type: "success",
          message: "Pesan WhatsApp berhasil dikirim!",
          duration: 3000,
        });

        // Reset form
        setFormData({
          phone: "",
          message: "",
          type: "text",
        });

        // Call success callback
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        showToast({
          type: "error",
          message: response.data.message || "Gagal mengirim pesan",
          duration: 5000,
        });
      }
    } catch (error) {
      handleApiError(error, showToast);
    } finally {
      setLoading(false);
    }
  };

  const displayPhone = formData.phone ? formatPhoneDisplay(formData.phone) : "";
  const provider = formData.phone ? getPhoneProvider(formData.phone) : "";

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone Number Input */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nomor WhatsApp
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="Contoh: +62812345678901 atau 081234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          {/* Phone Preview */}
          {displayPhone && (
            <div className="mt-1 text-xs text-gray-500">
              Format: {displayPhone}
              {provider !== "Unknown" && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {provider}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Message Type */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tipe Pesan
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="document">Document</option>
          </select>
        </div>

        {/* Message Content */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Isi Pesan
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Ketik pesan WhatsApp Anda di sini..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={loading}
          />
          <div className="mt-1 text-xs text-gray-500">
            {formData.message.length} karakter
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            disabled={loading || !formData.phone || !formData.message}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              loading || !formData.phone || !formData.message
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Mengirim...
              </div>
            ) : (
              "Kirim Pesan"
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>Format Nomor yang Diterima:</strong>
          <br />
          • +62812345678901 (internasional)
          <br />
          • 081234567890 (lokal)
          <br />
          • 812345678901 (tanpa 0)
          <br />
          <br />
          <strong>Provider yang Didukung:</strong>
          <br />
          Telkomsel, Indosat, XL, Axis, Three, Smartfren
        </p>
      </div>
    </div>
  );
};

export default WhatsAppMessageForm;
