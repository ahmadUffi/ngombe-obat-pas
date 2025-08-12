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
  const [formData, setFormData] = useState({
    username: "",
    no_hp: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        no_hp: user.no_hp || "",
      });
    }
  }, [user]);

  // Show loading state if user is not yet loaded
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

  // Input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Validate Indonesian phone number
   */
  const validatePhoneNumber = (phone) => {
    if (!phone) return true; // Empty is valid (optional)

    // Remove spaces and dashes
    const cleanPhone = phone.replace(/[\s-]/g, "");

    // Indonesian phone number regex
    // Starts with +62, 62, or 0, followed by 8, then a digit 1-9, then 6-11 more digits
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    return phoneRegex.test(cleanPhone);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate username
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

      // Validate phone if provided
      if (formData.no_hp && !validatePhoneNumber(formData.no_hp)) {
        toast.error("Format nomor HP tidak valid!");
        setLoading(false);
        return;
      }

      // Prepare data to update
      const updateData = {
        username: formData.username.trim(),
        no_hp: formData.no_hp || null,
      };

      console.log("Updating profile:", updateData);
      console.log("User ID:", user.id);

      // Call API to update profile - userId diambil dari token
      const response = await apiService.updateProfile(updateData);

      if (response.success) {
        toast.success("Profile berhasil diperbarui!");

        // Refresh user data
        setTimeout(async () => {
          if (refreshUser) {
            await refreshUser();
            console.log("User data refreshed");
          }

          // Navigate back
          setTimeout(() => {
            navigate("/dashboard");
          }, 800);
        }, 500);
      } else {
        throw new Error(response.message || "Gagal memperbarui profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10">
      <div className="max-w-xl mx-auto">
        {/* Card Header */}
        <div className="bg-white rounded-t-2xl shadow-lg overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-orange-500 to-orange-600">
            <div className="absolute -bottom-12 left-6">
              <div className="p-1 bg-white rounded-full shadow-md">
                <img
                  src={user?.img_profile || defaultAvatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                />
              </div>
            </div>
            <div className="absolute bottom-4 right-6 text-right">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <p className="text-sm text-white/80">Update informasi akun</p>
            </div>
          </div>

          <div className="pt-16 px-6 pb-2">
            <div className="mb-1">
              <p className="font-semibold text-gray-900 text-lg">
                {user?.username || "User"}
              </p>
              <p className="text-sm text-gray-500">{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 pt-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Editable username */}
              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
                    required
                    minLength={3}
                    autoFocus
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
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
                </div>
                <p className="mt-2 text-sm text-gray-500">Minimal 3 karakter</p>
              </div>

              {/* Read-only email */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ""}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 shadow-sm"
                    disabled
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Email tidak dapat diubah
                </p>
              </div>

              {/* Editable phone number */}
              <div>
                <label
                  htmlFor="no_hp"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Nomor HP (WhatsApp)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="no_hp"
                    name="no_hp"
                    value={formData.no_hp}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
                    placeholder="08xxxxxxxxxx"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Format: 08xxxxxxxxxx (diawali 08, minimal 10 digit)
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors shadow-sm flex items-center"
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1.5"
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
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl transition-all shadow-md flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <div className="mr-2 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
