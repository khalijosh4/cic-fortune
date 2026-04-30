const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const { getDb, getOne, runQuery } = require("../db/database");
const { authenticate } = require("../middleware/auth");
const { auditLog } = require("../utils/audit");
const { sendSuccess, sendError } = require("../utils/response");

const router = express.Router();

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;
    const db = getDb();

    // Find user
    const user = getOne(`
      SELECT u.*, b.name as branch_name 
      FROM users u
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE u.email = ?
    `, [email]);

    if (!user) {
      auditLog({ user: { email, role: "—" }, action: `Failed login — user not found: ${email}`, module: "Auth", type: "security", status: "Failed", req });
      return sendError(res, "Invalid email or password.", 401);
    }

    // Check account lock
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remaining = Math.ceil((new Date(user.locked_until) - Date.now()) / 60000);
      return sendError(res, `Account locked. Try again in ${remaining} minutes.`, 423);
    }

    // Check account active
    if (!user.active) {
      return sendError(res, "Account suspended. Contact administrator.", 403);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      const newAttempts = user.failed_attempts + 1;
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
      const lockoutMs = (parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 30) * 60000;

      if (newAttempts >= maxAttempts) {
        const lockedUntil = new Date(Date.now() + lockoutMs).toISOString();
        runQuery("UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?", [newAttempts, lockedUntil, user.id]);
        auditLog({ user: { email, role: "—" }, action: `Account locked after ${newAttempts} failed attempts: ${email}`, module: "Auth", type: "security", status: "Failed", req });
        return sendError(res, `Too many failed attempts. Account locked for ${process.env.LOCKOUT_DURATION_MINUTES || 30} minutes.`, 423);
      }

      runQuery("UPDATE users SET failed_attempts = ? WHERE id = ?", [newAttempts, user.id]);
      auditLog({ user: { email, role: "—" }, action: `Failed login attempt ${newAttempts}/${maxAttempts}: ${email}`, module: "Auth", type: "security", status: "Failed", req });
      return sendError(res, `Invalid password. ${maxAttempts - newAttempts} attempts remaining.`, 401);
    }

    // Reset failed attempts & update last login
    runQuery("UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login = ? WHERE id = ?", [new Date().toISOString(), user.id]);

    // Generate tokens
    const payload = { id: user.id, email: user.email, role: user.role, branch: user.branch_id, name: user.name, avatar: user.avatar };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "8h" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" });

    // Save session
    runQuery(`
      INSERT INTO sessions (id, user_id, token, ip_address, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `, [uuidv4(), user.id, token, req.ip, new Date(Date.now() + 8 * 3600000).toISOString()]);

    auditLog({ user: { email: user.email, role: user.role }, action: `Successful login: ${user.name} (${user.role})`, module: "Auth", type: "security", status: "Success", metadata: { branchName: user.branch_name }, req });

    sendSuccess(res, {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        branch: user.branch_id,
        branchName: user.branch_name,
        name: user.name,
        avatar: user.avatar,
        lastLogin: user.last_login,
      },
    }, 200, { message: `Welcome back, ${user.name}!` });
  }
);

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post("/logout", authenticate, (req, res) => {
  const token = req.headers.authorization?.substring(7);
  runQuery("DELETE FROM sessions WHERE user_id = ? OR token = ?", [req.user.id, token]);
  auditLog({ user: req.user, action: `Logout: ${req.user.name}`, module: "Auth", type: "security", req });
  sendSuccess(res, null, 200, { message: "Logged out successfully." });
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return sendError(res, "Refresh token required.", 400);

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = getOne("SELECT * FROM users WHERE id = ? AND active = 1", [decoded.id]);
    if (!user) return sendError(res, "User not found.", 401);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, branch: user.branch_id, name: user.name, avatar: user.avatar },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );
    sendSuccess(res, { token });
  } catch {
    sendError(res, "Invalid or expired refresh token.", 401);
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", authenticate, (req, res) => {
  const user = getOne(`
    SELECT u.id, u.email, u.role, u.branch_id, u.name, u.avatar, u.last_login, b.name as branch_name
    FROM users u LEFT JOIN branches b ON u.branch_id = b.id
    WHERE u.id = ?
  `, [req.user.id]);

  sendSuccess(res, user);
});

// ─── PATCH /api/auth/change-password ─────────────────────────────────────────
router.patch(
  "/change-password",
  authenticate,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 400);

    const { currentPassword, newPassword } = req.body;
    const user = getOne("SELECT * FROM users WHERE id = ?", [req.user.id]);

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return sendError(res, "Current password is incorrect.", 400);

    const hashed = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);
    runQuery("UPDATE users SET password = ?, updated_at = ? WHERE id = ?", [hashed, new Date().toISOString(), req.user.id]);

    auditLog({ user: req.user, action: `Password changed: ${req.user.email}`, module: "Auth", type: "security", req });
    sendSuccess(res, null, 200, { message: "Password changed successfully." });
  }
);

module.exports = router;
