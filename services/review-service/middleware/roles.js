// Step 5: Role-based access control middleware — placeholder
module.exports = function (...allowedRoles) {
  return (req, res, next) => {
    // Make sure auth middleware ran first
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};