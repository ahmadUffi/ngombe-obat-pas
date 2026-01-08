// Simple admin gate based on env allow-lists.
// Usage: set ADMIN_EMAILS (comma-separated) and/or ADMIN_USER_IDS (comma-separated) in .env
// Requires verifySupabaseUser to run before this to populate req.user

export const requireAdmin = (req, res, next) => {
  const emailsEnv = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const idsEnv = (process.env.ADMIN_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);

  const { user } = req || {};
  const isAllowedByEmail = user?.email && emailsEnv.includes(user.email);
  const isAllowedById = user?.id && idsEnv.includes(user.id);

  if (isAllowedByEmail || isAllowedById) return next();

  return res.status(403).json({ success: false, message: "Forbidden: admin only" });
};
