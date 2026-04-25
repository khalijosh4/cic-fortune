const express = require("express");
const { getDb } = require("../db/database");
const { authenticate, authorize } = require("../middleware/auth");
const { sendSuccess } = require("../utils/response");

const router = express.Router();

// GET /api/audit
router.get("/", authenticate, authorize("System Admin", "HR/CEO"), (req, res) => {
  const db = getDb();
  const { type, role, status, search, page = 1, limit = 100 } = req.query;
  const offset = (page - 1) * limit;

  let sql = "SELECT * FROM audit_logs WHERE 1=1";
  const params = [];

  if (type && type !== "all")   { sql += " AND type = ?"; params.push(type); }
  if (role)   { sql += " AND user_role = ?"; params.push(role); }
  if (status) { sql += " AND status = ?"; params.push(status); }
  if (search) { sql += " AND (action LIKE ? OR user_email LIKE ? OR branch_name LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  const total = db.prepare(`SELECT COUNT(*) as count FROM audit_logs WHERE 1=1 ${type && type !== "all" ? "AND type = ?" : ""}`).get(...(type && type !== "all" ? [type] : [])).count;

  sql += " ORDER BY timestamp DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  const logs = db.prepare(sql).all(...params).map(l => ({
    ...l,
    metadata: JSON.parse(l.metadata || "{}"),
  }));

  sendSuccess(res, logs, 200, { total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

module.exports = router;
