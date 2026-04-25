const jwt = require("jsonwebtoken");
const { getOne } = require("../db/database");

// ─── Verify JWT token ─────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Access denied. No token provided.",
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Verify user still exists and is active
    const user = getOne("SELECT * FROM users WHERE id = ? AND active = 1", [decoded.id]);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found or account deactivated.",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      branch: user.branch_id,
      name: user.name,
      avatar: user.avatar,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expired. Please login again." });
    }
    return res.status(401).json({ success: false, error: "Invalid token." });
  }
};

// ─── Role-based Authorization ─────────────────────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authenticated." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

// ─── Branch Access Guard ──────────────────────────────────────────────────────
// Branch Committee can only access their own branch data
const branchGuard = (req, res, next) => {
  if (req.user.role === "Branch Committee") {
    // Inject branch filter for branch committee users
    req.branchFilter = req.user.branch;
  }
  next();
};

module.exports = { authenticate, authorize, branchGuard };
