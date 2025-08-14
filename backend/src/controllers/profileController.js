import { supabase } from "../config/supabaseClient.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { recreateAllWaRemindersForUser } from "../services/jadwalService.js";
import { recreateActiveControlSchedulesForUser } from "../services/controlService.js";

/**
 * Update user's profile (username and phone)
 */
export const updateProfile = asyncHandler(async (req, res) => {
  console.log("updateProfile called with request:", req.body);

  const { username, no_hp } = req.body;
  const userId = req.user.id; // Mengambil userId dari req.user yang disediakan oleh middleware verifySupabaseUser  // Validate username
  if (!username || !username.trim()) {
    return res.status(400).json({
      success: false,
      message: "Username harus diisi",
    });
  }

  if (username.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "Username minimal 3 karakter",
    });
  }

  // Validate phone number if provided
  if (no_hp && !validatePhoneNumber(no_hp)) {
    return res.status(400).json({
      success: false,
      message: "Format nomor HP tidak valid",
    });
  }

  try {
    // Get current profile to check if phone number is changing
    const { data: currentProfile, error: profileError } = await supabase
      .from("profile")
      .select("no_hp")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching current profile:", profileError);
      throw new Error("Failed to fetch current profile");
    }

    // Prepare update data
    const updateData = {
      username: username.trim(),
    };

    // Format and add phone if provided
    let formattedPhone = null;
    if (no_hp) {
      formattedPhone = formatPhoneNumber(no_hp);
      updateData.no_hp = formattedPhone;
    }

    // Get current profile first to detect phone changes
    const { data: current, error: currentErr } = await supabase
      .from("profile")
      .select("id, user_id, no_hp")
      .eq("user_id", userId)
      .single();

    if (currentErr || !current) {
      return res
        .status(404)
        .json({ success: false, message: "Profile tidak ditemukan" });
    }

    const oldPhone = current.no_hp || null;

    // Update the profile
    const { data, error } = await supabase
      .from("profile")
      .update(updateData)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);

      if (error.message.includes("duplicate")) {
        return res.status(409).json({
          success: false,
          message: "Username sudah digunakan",
        });
      }

      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Profile tidak ditemukan",
      });
    }

    // Check if phone number was changed and needs to be updated in Wablas schedules
    if (
      formattedPhone &&
      currentProfile &&
      formattedPhone !== currentProfile.no_hp
    ) {
      // Update all Wablas schedules and reminders for this user with the new phone number
      // We do this asynchronously so we don't block the response

      // Update control appointment schedules
      updateUserWablasSchedules(userId, formattedPhone)
        .then(() => {
          console.log(
            `Successfully updated control schedules for user ${userId}`
          );
        })
        .catch((error) => {
          console.error(
            `Failed to update control schedules for user ${userId}:`,
            error
          );
        });

      // Update medication reminders
      updateUserMedicationReminders(userId, formattedPhone)
        .then(() => {
          console.log(
            `Successfully updated medication reminders for user ${userId}`
          );
        })
        .catch((error) => {
          console.error(
            `Failed to update medication reminders for user ${userId}:`,
            error
          );
        });
    }

    // If phone changed, recreate all Wablas reminders
    let recreateSummary = null;
    const phoneChanged = !!updateData.no_hp && updateData.no_hp !== oldPhone;
    if (phoneChanged) {
      try {
        // 1) Recreate jadwal reminders (delete all then create new)
        const jadwalResult = await recreateAllWaRemindersForUser(
          userId,
          updateData.no_hp
        );

        // 2) Recreate kontrol schedules for ACTIVE controls only
        const kontrolResult = await recreateActiveControlSchedulesForUser(
          userId,
          updateData.no_hp
        );

        recreateSummary = { jadwal: jadwalResult, kontrol: kontrolResult };
      } catch (recreateErr) {
        console.error(
          "Gagal recreate Wablas reminders setelah update no_hp:",
          recreateErr
        );
        // Continue; don't fail the profile update response
      }
    }

    // Return success
    return res.status(200).json({
      success: true,
      message: "Profile berhasil diperbarui",
      data: {
        id: data.id,
        user_id: data.user_id,
        username: data.username,
        no_hp: data.no_hp,
        updated_at: data.updated_at,
        recreate_summary: recreateSummary,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui profile",
    });
  }
});

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid, false if invalid
 */
function validatePhoneNumber(phone) {
  if (!phone) return false;

  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, "");

  // Match Indonesian phone number format
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Format phone number to standard +62 format
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phone) {
  if (!phone) return null;

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
}
