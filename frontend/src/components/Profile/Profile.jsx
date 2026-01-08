import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../hooks/useAuth";
import { apiService } from "../../api/apiservice";
import { toast } from "react-toastify";
import { defaultAvatar } from "./defaultAvatar";

const Profile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    no_hp: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        no_hp: user.no_hp || "",
        image: null,
      });
      setImagePreview(null);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB");
      e.target.value = "";
      return;
    }
    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleBack = () => {
    try {
      const canGoBack =
        (window.history?.state?.idx ?? 0) > 0 || window.history.length > 1;
      if (canGoBack) navigate(-1);
      else navigate("/dashboard", { replace: true });
    } catch {
      navigate("/dashboard", { replace: true });
    }
  };

  const startEdit = () => {
    setFormData({
      username: user?.username || "",
      no_hp: user?.no_hp || "",
      image: null,
    });
    setImagePreview(null);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setFormData({
      username: user?.username || "",
      no_hp: user?.no_hp || "",
      image: null,
    });
    setImagePreview(null);
    setEditMode(false);
  };

  const validatePhoneNumber = (phone) => {
    if (!phone) return true;
    const cleanPhone = phone.replace(/[\s-]/g, "");
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    return phoneRegex.test(cleanPhone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.username.trim()) {
        toast.error("Username harus diisi!");
        setLoading(false);
        return;
      }
      if (formData.username.trim().length < 3) {
        toast.error("Username minimal 3 karakter!");
        setLoading(false);
        return;
      }
      if (formData.no_hp && !validatePhoneNumber(formData.no_hp)) {
        toast.error("Format nomor HP tidak valid!");
        setLoading(false);
        return;
      }

      const updateData = {
        username: formData.username.trim(),
        no_hp: formData.no_hp || null,
        image: formData.image || null,
      };
      const response = await apiService.updateProfile(updateData);
      if (response.success) {
        toast.success("Profile berhasil diperbarui!");
        setTimeout(async () => {
          if (refreshUser) await refreshUser();
          setEditMode(false);
        }, 500);
      } else {
        throw new Error(response.message || "Gagal memperbarui profile");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Gagal memperbarui profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header with subtle gradient */}
          <div className="relative">
            <div className="h-24 bg-gradient-to-r from-orange-500 to-orange-600" />
            <div className="px-6 -mt-10 pb-2 text-center">
              <div className="inline-block p-1 bg-white rounded-full shadow-sm ring-1 ring-gray-200">
                <img
                  src={imagePreview || user?.img_profile || defaultAvatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                />
              </div>
              <div className="mt-3">
                <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                  {editMode ? "Edit Profil" : "Profil"}
                </h2>
                <p className="text-sm text-gray-500">{user?.email || ""}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 pt-4">
            {!editMode ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  {/* Username */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Username</div>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 flex items-center gap-3 min-w-0 overflow-hidden">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <span className="truncate max-w-full">
                        {user?.username || "-"}
                      </span>
                    </div>
                  </div>
                  {/* Email */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Email</div>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 flex items-center gap-3 min-w-0 overflow-hidden">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </span>
                      <span className="truncate max-w-full">
                        {user?.email || "-"}
                      </span>
                    </div>
                  </div>
                  {/* Nomor HP */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Nomor HP (WhatsApp)
                    </div>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 flex items-center gap-3 min-w-0 overflow-hidden">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </span>
                      <span className="truncate max-w-full">
                        {user?.no_hp || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={startEdit}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M17.414 2.586a2 2 0 010 2.828l-9.9 9.9a1 1 0 01-.464.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.464l9.9-9.9a2 2 0 012.828 0z" />
                    </svg>
                    Edit Profil
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  {/* Image upload */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Foto Profil (maks 5MB)
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-700 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                        disabled={loading}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      .jpg, .png, .webp. Maks 5MB.
                    </p>
                  </div>

                  {/* Username */}
                  <div>
                    <label
                      htmlFor="username"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                        minLength={3}
                        autoFocus
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Minimal 3 karakter
                    </p>
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={user?.email || ""}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
                        disabled
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Email tidak dapat diubah
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="no_hp"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Nomor HP (WhatsApp)
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        id="no_hp"
                        name="no_hp"
                        value={formData.no_hp}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Format: 08xxxxxxxxxx (diawali 08, minimal 10 digit)
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Mengubah nomor HP akan memperbarui pengingat WhatsApp
                      Anda.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                    disabled={loading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="mr-0.5">Simpan</span>
                      </>
                    )}
                    <span className="ml-0.5">Perubahan</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
