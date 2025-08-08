import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../hooks/useAuth";
import { supabase } from "../../supabaseClient";
import { toast } from "react-toastify";
import { logo } from "../../assets";
import { defaultAvatar } from "./defaultAvatar";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useContext(AuthContext);
  console.log("Profile Component - User data:", user);

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    no_hp: "",
    img_profile: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        no_hp: user.no_hp || "",
        img_profile: null,
      });
      setPreviewImage(user.img_profile || null);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB!");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Format file harus JPG, JPEG, PN");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        img_profile: file,
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, "");

    // Check if it's a valid Indonesian phone number
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return false;
    }

    // Check if it starts with valid Indonesian prefixes
    const validPrefixes = ["08", "628", "+628"];
    const startsWithValid = validPrefixes.some((prefix) => {
      if (prefix.startsWith("+")) {
        return phone.startsWith(prefix);
      } else {
        return cleanPhone.startsWith(prefix.replace("+", ""));
      }
    });

    return startsWithValid;
  };

  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, "");

    // Normalize to Indonesian format starting with +62
    if (cleanPhone.startsWith("08")) {
      return "+62" + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith("628")) {
      return "+" + cleanPhone;
    } else if (cleanPhone.startsWith("+62")) {
      return cleanPhone;
    }

    return cleanPhone;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      if (!formData.username.trim()) {
        toast.error("Username harus diisi!");
        return;
      }

      if (formData.username.trim().length < 3) {
        toast.error("Username minimal 3 karakter!");
        return;
      }

      if (formData.no_hp && !validatePhoneNumber(formData.no_hp)) {
        toast.error("Format nomor WhatsApp tidak valid!");
        return;
      }

      let profileImageUrl = user?.img_profile || null; // Keep existing image by default

      // Upload new image if selected
      if (formData.img_profile) {
        setImageUploading(true);
        try {
          const fileExt = formData.img_profile.name.split(".").pop();
          const filePath = `profile_${user.id}_${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("profile-images")
            .upload(filePath, formData.img_profile, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("profile-images")
            .getPublicUrl(filePath);

          profileImageUrl = publicUrlData.publicUrl;
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Gagal mengupload foto profil: " + uploadError.message);
          return;
        } finally {
          setImageUploading(false);
        }
      }

      // Update profile data
      const updateData = {
        username: formData.username.trim(),
        img_profile: profileImageUrl,
      };

      // Add phone number if provided
      if (formData.no_hp) {
        updateData.no_hp = formatPhoneNumber(formData.no_hp);
      }

      const { error: updateError } = await supabase
        .from("profile")
        .update(updateData)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast.success("Profile berhasil diperbarui!");

      // Refresh user data dari database
      if (refreshUser) {
        await refreshUser();
      }

      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error.message || "Gagal memperbarui profile");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      img_profile: null,
    }));
    setPreviewImage(user?.img_profile || null); // Reset to original image

    // Clear file input
    const fileInput = document.getElementById("img_profile");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Logo" className="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Profile
                </h1>
                <p className="text-gray-600">Kelola informasi profil Anda</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={previewImage || defaultAvatar}
                  alt="Profile Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                />
                {imageUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <label
                  htmlFor="img_profile"
                  className="cursor-pointer bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                >
                  {formData.img_profile ? "Ganti Foto" : "Upload Foto"}
                </label>
                <input
                  id="img_profile"
                  name="img_profile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading || imageUploading}
                />
                {(formData.img_profile ||
                  previewImage !== (user?.img_profile || null)) && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    disabled={loading || imageUploading}
                  >
                    Reset Foto
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2 text-center">
                Format: JPG, JPEG, PNG, GIF. Maksimal 5MB.
              </p>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Masukkan username Anda"
                disabled={loading}
                minLength={3}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="no_hp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nomor WhatsApp
              </label>
              <input
                id="no_hp"
                name="no_hp"
                type="tel"
                value={formData.no_hp}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="08xxxxxxxxxx atau +6281xxxxxxxx"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 08xxxxxxxxxx, +628xxxxxxxxx, atau 628xxxxxxxxx
              </p>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={user?.email || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Email tidak dapat diubah
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="submit"
                disabled={loading || imageUploading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Menyimpan...
                  </div>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                disabled={loading || imageUploading}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
