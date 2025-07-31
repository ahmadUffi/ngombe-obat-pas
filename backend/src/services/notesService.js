import { supabase } from "../config/supabaseClient.js";

export const notesService = {
  // Get all notes for a user
  async getAllNotes(userId, profileId) {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }
  },

  // Get notes by category
  async getNotesByCategory(userId, profileId, category) {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .eq("profile_id", profileId)
        .eq("category", category)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to fetch notes by category: ${error.message}`);
    }
  },

  // Get a single note by ID
  async getNoteById(noteId, userId, profileId) {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("note_id", noteId)
        .eq("user_id", userId)
        .eq("profile_id", profileId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to fetch note: ${error.message}`);
    }
  },

  // Create a new note
  async createNote(noteData) {
    try {
      const { user_id, profile_id, category, message } = noteData;

      // Validate required fields
      if (!user_id || !profile_id || !category || !message) {
        throw new Error(
          "Missing required fields: user_id, profile_id, category, message"
        );
      }

      const { data, error } = await supabase
        .from("notes")
        .insert([
          {
            user_id,
            profile_id,
            category,
            message,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to create note: ${error.message}`);
    }
  },

  // Update a note
  async updateNote(noteId, userId, profileId, updateData) {
    try {
      const { category, message } = updateData;

      // Build update object with only provided fields
      const updateFields = {
        updated_at: new Date().toISOString(),
      };

      if (category !== undefined) updateFields.category = category;
      if (message !== undefined) updateFields.message = message;

      const { data, error } = await supabase
        .from("notes")
        .update(updateFields)
        .eq("note_id", noteId)
        .eq("user_id", userId)
        .eq("profile_id", profileId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Note not found or access denied");
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to update note: ${error.message}`);
    }
  },

  // Delete a note
  async deleteNote(noteId, userId, profileId) {
    try {
      const { data, error } = await supabase
        .from("notes")
        .delete()
        .eq("note_id", noteId)
        .eq("user_id", userId)
        .eq("profile_id", profileId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Note not found or access denied");
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to delete note: ${error.message}`);
    }
  },

  // Search notes by message content
  async searchNotes(userId, profileId, searchTerm) {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .eq("profile_id", profileId)
        .ilike("message", `%${searchTerm}%`)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to search notes: ${error.message}`);
    }
  },

  // Get notes count by category
  async getNotesCountByCategory(userId, profileId) {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("category")
        .eq("user_id", userId)
        .eq("profile_id", profileId);

      if (error) {
        throw error;
      }

      // Count notes by category
      const categoryCount = data.reduce((acc, note) => {
        acc[note.category] = (acc[note.category] || 0) + 1;
        return acc;
      }, {});

      return {
        total: data.length,
        by_category: categoryCount,
      };
    } catch (error) {
      throw new Error(`Failed to get notes count: ${error.message}`);
    }
  },
};
