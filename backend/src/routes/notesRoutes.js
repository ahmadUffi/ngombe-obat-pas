import express from "express";
import { notesController } from "../controllers/notesController.js";
import { verifySupabaseUser } from "../middleware/verifySupabaseJWT.js";

const router = express.Router();

// Apply JWT middleware to all routes
router.use(verifySupabaseUser);

// Routes for notes CRUD operations

/**
 * @route   GET /api/notes
 * @desc    Get all notes for authenticated user
 * @query   ?category={kontrol|pengingat|lainnya|obat|dokter} (optional)
 * @access  Private
 */
router.get("/", notesController.getAllNotes);

/**
 * @route   GET /api/notes/search
 * @desc    Search notes by message content
 * @query   ?q={search_query} (required)
 * @access  Private
 */
router.get("/search", notesController.searchNotes);

/**
 * @route   GET /api/notes/stats
 * @desc    Get notes statistics by category
 * @access  Private
 */
router.get("/stats", notesController.getNotesStats);

/**
 * @route   GET /api/notes/:noteId
 * @desc    Get a specific note by ID
 * @access  Private
 */
router.get("/:noteId", notesController.getNoteById);

/**
 * @route   POST /api/notes
 * @desc    Create a new note
 * @body    {
 *           category: string (required) - kontrol|pengingat|lainnya|obat|dokter
 *           message: string (required) - max 1000 characters
 *         }
 * @access  Private
 */
router.post("/", notesController.createNote);

/**
 * @route   PUT /api/notes/:noteId
 * @desc    Update an existing note
 * @body    {
 *           category: string (optional) - kontrol|pengingat|lainnya|obat|dokter
 *           message: string (optional) - max 1000 characters
 *         }
 * @access  Private
 */
router.put("/:noteId", notesController.updateNote);

/**
 * @route   DELETE /api/notes/:noteId
 * @desc    Delete a note
 * @access  Private
 */
router.delete("/:noteId", notesController.deleteNote);

export default router;
