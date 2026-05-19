import { AppError } from "./error.middleware.js";

/**
 * Role-based authorization. Use after `protect`.
 * @param  {...string} roles - Allowed roles (e.g. "admin", "agent")
 */
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission for this action",
      });
    }

    next();
  };

export default authorize;
