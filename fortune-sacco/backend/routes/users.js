const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const { getAll, getOne, runQuery } = require("../db/database");
const { authenticate, authorize } = require("../middleware/auth");
const { auditLog } = require("../utils/audit");
const { sendSuccess, sendError } = require("../utils/response");

const router = express.Router();

// GET /api/users
router.get("/", authenticate, authorize("System Admin"), (req, res) => {
  const users = getAll(`
    SELECT u.id, u.email, u.role, u.branch_id, u.name, u.avatar, u.active, u.last_login, u.failed_attempts, u.locked_until, u.created_at, b.name as branch_name
    FROM users u LEFT JOIN branches b ON u.branch_id = b.id
    ORDER BY u.created_at DESC
  `);
  sendSuccess(res, users);
});

// POST /api/users
router.post("/", authenticate, authorize("System Admin"),
  [body("email").isEmail(), body("password").isLength({ min: 8 }), body("role").isIn(["System Admin","HR/CEO","Claims Officer","Branch Committee"]), body("name").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 400);

    const { email, password, role, branch, name, avatar } = req.body;
    const db = getDb();
    const existing = getOne("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) return sendError(res, "Email already in use.", 409);

    const hashed = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const id = uuidv4();
    runQuery("INSERT INTO users (id, email, password, role, branch_id, name, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, email, hashed, role, branch || "NBI", name, avatar || name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)]);

    auditLog({ user: req.user, action: `User created: ${email} (${role})`, module: "Users", type: "security", req });
    const user = getOne("SELECT id, email, role, branch_id, name, avatar, active FROM users WHERE id = ?", [id]);
    sendSuccess(res, user, 201, { message: `User ${email} created.` });
  }
);

// PATCH /api/users/:id/toggle
router.patch("/:id/toggle", authenticate, authorize("System Admin"), (req, res) => {
  const user = getOne("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!user) return sendError(res, "User not found.", 404);
  if (user.id === req.user.id) return sendError(res, "Cannot deactivate your own account.", 400);
  const newActive = user.active ? 0 : 1;
  runQuery("UPDATE users SET active = ?, updated_at = ? WHERE id = ?", [newActive, new Date().toISOString(), req.params.id]);
  auditLog({ user: req.user, action: `User ${newActive ? "activated" : "deactivated"}: ${user.email}`, module: "Users", type: "security", req });
  sendSuccess(res, { active: !!newActive }, 200, { message: `User ${newActive ? "activated" : "deactivated"}.` });
});

// PATCH /api/users/:id/unlock
router.patch("/:id/unlock", authenticate, authorize("System Admin"), (req, res) => {
  runQuery("UPDATE users SET failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?", [new Date().toISOString(), req.params.id]);
  auditLog({ user: req.user, action: `Account unlocked: ${req.params.id}`, module: "Users", type: "security", req });
  sendSuccess(res, null, 200, { message: "Account unlocked." });
});

module.exports = router;
