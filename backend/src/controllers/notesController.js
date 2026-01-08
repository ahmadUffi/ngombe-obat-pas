import { notesService } from "../services/notesService.js";
import { supabase } from "../config/supabaseClient.js";

export const notesController = {
  // Get all notes for authenticated user
  async getAllNotes(req, res) {
    try {
      const user_id = req.user.id;

      // Get profile_id from user_id
      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("id")
        .eq("user_id", user_id)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
          error_type: "not_found",
        });
      }

      const profile_id = profile.id;
      const { category } = req.query;

      let notes;

      if (category) {
        notes = await notesService.getNotesByCategory(
          user_id,
          profile_id,
          category
        );
      } else {
        notes = await notesService.getAllNotes(user_id, profile_id);
      }

      return res.status(200).json({
        success: true,
        message: "Notes retrieved successfully",
        data: notes,
        count: notes.length,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve notes",
        error: error.message,
        error_type: "server_error",
      });
    }
  },

  // Get a single note by ID
  async getNoteById(req, res) {
    try {
      const user_id = req.user.id;
      const { noteId } = req.params;

      if (!noteId) {
        return res.status(400).json({
          success: false,
          message: "Note ID is required",
          error_type: "validation_error",
        });
      }

      // Get profile_id from user_id
      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("id")
        .eq("user_id", user_id)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
          error_type: "not_found",
        });
      }

      const profile_id = profile.id;
      const note = await notesService.getNoteById(noteId, user_id, profile_id);

      return res.status(200).json({
        success: true,
        message: "Note retrieved successfully",
        data: note,
      });
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
          error_type: "not_found",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve note",
        error: error.message,
        error_type: "server_error",
      });
    }
  },

  // Create a new note
  async createNote(req, res) {
    try {
      const user_id = req.user.id;
      const { category, message } = req.body;

      // Validate input
      if (!category || !message) {
        return res.status(400).json({
          success: false,
          message: "Category and message are required",
          error_type: "validation_error",
        });
      }

      // Validate category
      const validCategories = [
        "kontrol",
        "pengingat",
        "jadwal",
        "efek_samping",
        "perubahan_dosis",
        "pesan_dokter",
        "lainnya",
      ];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category. Allowed: kontrol, pengingat, jadwal, efek_samping, perubahan_dosis, pesan_dokter, lainnya",
          error_type: "validation_error",
        });
      }

      // Validate message length
      if (message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Message cannot be empty",
          error_type: "validation_error",
        });
      }

      if (message.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Message cannot exceed 1000 characters",
          error_type: "validation_error",
        });
      }

      // Get profile_id from user_id
      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("id")
        .eq("user_id", user_id)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
          error_type: "not_found",
        });
      }

      const profile_id = profile.id;

      const noteData = {
        user_id,
        profile_id,
        category: category.toLowerCase(),
        message: message.trim(),
      };

      const newNote = await notesService.createNote(noteData);

      return res.status(201).json({
        success: true,
        message: "Note created successfully",
        data: newNote,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create note",
        error: error.message,
        error_type: "server_error",
      });
    }
  },

  // Update an existing note
  async updateNote(req, res) {
    try {
      const user_id = req.user.id;
      const { noteId } = req.params;
      const { category, message } = req.body;

      if (!noteId) {
        return res.status(400).json({
          success: false,
          message: "Note ID is required",
          error_type: "validation_error",
        });
      }

      // Validate at least one field is provided
      if (!category && !message) {
        return res.status(400).json({
          success: false,
          message: "At least one field (category or message) must be provided",
          error_type: "validation_error",
        });
      }

      const updateData = {};

      // Validate category if provided
      if (category !== undefined) {
        const validCategories = [
          "kontrol",
          "pengingat",
          "jadwal",
          "efek_samping",
          "perubahan_dosis",
          "pesan_dokter",
          "lainnya",
        ];
        if (!validCategories.includes(category)) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid category. Allowed: kontrol, pengingat, jadwal, efek_samping, perubahan_dosis, pesan_dokter, lainnya",
            error_type: "validation_error",
          });
        }
        updateData.category = category.toLowerCase();
      }

      // Validate message if provided
      if (message !== undefined) {
        if (message.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: "Message cannot be empty",
            error_type: "validation_error",
          });
        }

        if (message.length > 1000) {
          return res.status(400).json({
            success: false,
            message: "Message cannot exceed 1000 characters",
            error_type: "validation_error",
          });
        }
        updateData.message = message.trim();
      }

      // Get profile_id from user_id
      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("id")
        .eq("user_id", user_id)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
          error_type: "not_found",
        });
      }

      const profile_id = profile.id;

      const updatedNote = await notesService.updateNote(
        noteId,
        user_id,
        profile_id,
        updateData
      );

      return res.status(200).json({
        success: true,
        message: "Note updated successfully",
        data: updatedNote,
      });
    } catch (error) {
      if (
        error.message.includes("not found") ||
        error.message.includes("access denied")
      ) {
        return res.status(404).json({
          success: false,
          message: "Note not found or access denied",
          error_type: "not_found",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update note",
        error: error.message,
        error_type: "server_error",
      });
    }
  },

  // Delete a note
  async deleteNote(req, res) {
    try {
      const user_id = req.user.id;
      const { noteId } = req.params;

      if (!noteId) {
        return res.status(400).json({
          success: false,
          message: "Note ID is required",
          error_type: "validation_error",
        });
      }

      // Get profile_id from user_id
      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("id")
        .eq("user_id", user_id)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
          error_type: "not_found",
        });
      }

      const profile_id = profile.id;
      const deletedNote = await notesService.deleteNote(
        noteId,
        user_id,
        profile_id
      );

      return res.status(200).json({
        success: true,
        message: "Note deleted successfully",
        data: deletedNote,
      });
    } catch (error) {
      if (
        error.message.includes("not found") ||
        error.message.includes("access denied")
      ) {
        return res.status(404).json({
          success: false,
          message: "Note not found or access denied",
          error_type: "not_found",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to delete note",
        error: error.message,
        error_type: "server_error",
      });
    }
  },

  // Search notes
  async searchNotes(req, res) {
    try {
      const user_id = req.user.id;
      const { q } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
          error_type: "validation_error",
        });
      }

      // Get profile_id from user_id
      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("id")
        .eq("user_id", user_id)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
          error_type: "not_found",
        });
      }

      const profile_id = profile.id;
      const notes = await notesService.searchNotes(
        user_id,
        profile_id,
        q.trim()
      );

      return res.status(200).json({
        success: true,
        message: "Search completed successfully",
        data: notes,
        count: notes.length,
        query: q.trim(),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to search notes",
        error: error.message,
        error_type: "server_error",
      });
    }
  },

  // Get notes statistics
  async getNotesStats(req, res) {
    try {
      const user_id = req.user.id;

      // Get profile_id from user_id
      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("id")
        .eq("user_id", user_id)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
          error_type: "not_found",
        });
      }

      const profile_id = profile.id;
      const stats = await notesService.getNotesCountByCategory(
        user_id,
        profile_id
      );

      return res.status(200).json({
        success: true,
        message: "Notes statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve notes statistics",
        error: error.message,
        error_type: "server_error",
      });
    }
  },
};
