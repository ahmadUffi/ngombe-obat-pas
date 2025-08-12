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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-orange-500 text-white">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <p className="text-sm opacity-80">Update informasi profile Anda</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              {/* User info preview */}
              <div className="mb-6 flex items-center space-x-4">
                <img
                  src={user?.img_profile || defaultAvatar}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                />
                <div>
                  <p className="font-medium text-gray-800">
                    {user?.username || "User"}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email || ""}</p>
                </div>
              </div>

              {/* Editable username */}
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                  minLength={3}
                  autoFocus
                />
                <p className="mt-2 text-sm text-gray-500">Minimal 3 karakter</p>
              </div>

              {/* Read-only email */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ""}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                  disabled
                />
                <p className="mt-2 text-sm text-gray-500">
                  Email tidak dapat diubah
                </p>
              </div>

              {/* Editable phone number */}
              <div className="mb-4">
                <label
                  htmlFor="no_hp"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Nomor HP (WhatsApp)
                </label>
                <input
                  type="tel"
                  id="no_hp"
                  name="no_hp"
                  value={formData.no_hp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="08xxxxxxxxxx"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Format: 08xxxxxxxxxx (diawali 08, minimal 10 digit)
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md transition-colors"
                disabled={loading}
              >
                Kembali
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors flex items-center"
                disabled={loading}
              >
                {loading && (
                  <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
