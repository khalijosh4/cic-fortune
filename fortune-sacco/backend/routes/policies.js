const express = require("express");
const { body, query, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const { getAll, getOne, runQuery } = require("../db/database");
const { authenticate, authorize, branchGuard } = require("../middleware/auth");
const { auditLog } = require("../utils/audit");
const { sendSuccess, sendError, genId } = require("../utils/response");

const router = express.Router();

// Policy rates & limits
const POLICY_CONFIG = {
  rates: { "Individual": 2100, "Family": 4200, "Corporate Group": 1850 },
  limits: {
    "Individual":      { annual: 250000, outpatient: 40000, inpatient: 200000, maternity: 0,      dental: 10000, optical: 8000,  lastExpense: 30000 },
    "Family":          { annual: 500000, outpatient: 75000, inpatient: 400000, maternity: 80000,  dental: 15000, optical: 10000, lastExpense: 50000 },
    "Corporate Group": { annual: 2000000,outpatient:300000, inpatient:1500000, maternity: 200000, dental: 50000, optical: 30000, lastExpense:100000 },
  },
};

// ─── GET /api/policies ────────────────────────────────────────────────────────
router.get("/", authenticate, branchGuard, (req, res) => {
  const { status, search, branch, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  let sql = `
    SELECT p.*, b.name as branch_name
    FROM policies p
    LEFT JOIN branches b ON p.branch_id = b.id
    WHERE 1=1
  `;
  const params = [];

  if (req.branchFilter) { sql += " AND p.branch_id = ?"; params.push(req.branchFilter); }
  else if (branch) { sql += " AND p.branch_id = ?"; params.push(branch); }
  if (status) { sql += " AND p.status = ?"; params.push(status); }
  if (search) { sql += " AND (p.member LIKE ? OR p.id LIKE ? OR p.member_id LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  const countSql = `SELECT COUNT(*) as count FROM (${sql})`;
  const totalResult = getOne(countSql, params);
  const total = totalResult ? totalResult.count : 0;
  
  sql += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  const policies = getAll(sql, params);

  sendSuccess(res, policies, 200, { total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// ─── GET /api/policies/stats ──────────────────────────────────────────────────
router.get("/stats", authenticate, (req, res) => {
  const db = getDb();
  const branchFilter = req.user.role === "Branch Committee" ? req.user.branch : null;
  const where = branchFilter ? "WHERE branch_id = ?" : "";
  const params = branchFilter ? [branchFilter] : [];

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END) as expired,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'Suspended' THEN 1 ELSE 0 END) as suspended,
      SUM(premium) as total_premium,
      SUM(utilised) as total_utilised
    FROM policies ${where}
  `).get(...params);

  sendSuccess(res, stats);
});

// ─── GET /api/policies/expiring ───────────────────────────────────────────────
router.get("/expiring", authenticate, (req, res) => {
  const db = getDb();
  const days = parseInt(req.query.days) || 30;
  const cutoff = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
  const branchFilter = req.user.role === "Branch Committee" ? req.user.branch : null;

  let sql = "SELECT * FROM policies WHERE status = 'Active' AND expiry_date <= ?";
  const params = [cutoff];
  if (branchFilter) { sql += " AND branch_id = ?"; params.push(branchFilter); }
  sql += " ORDER BY expiry_date ASC";

  const policies = db.prepare(sql).all(...params);
  sendSuccess(res, policies, 200, { count: policies.length, cutoffDate: cutoff });
});

// ─── GET /api/policies/:id ────────────────────────────────────────────────────
router.get("/:id", authenticate, (req, res) => {
  const db = getDb();
  const policy = db.prepare(`
    SELECT p.*, b.name as branch_name, b.manager as branch_manager
    FROM policies p
    LEFT JOIN branches b ON p.branch_id = b.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!policy) return sendError(res, "Policy not found.", 404);
  if (req.user.role === "Branch Committee" && policy.branch_id !== req.user.branch) {
    return sendError(res, "Access denied to this branch's data.", 403);
  }

  // Include claims for this policy
  const claims = db.prepare("SELECT * FROM claims WHERE policy_id = ? ORDER BY created_at DESC LIMIT 10").all(req.params.id);
  const premiums = db.prepare("SELECT * FROM premiums WHERE policy_id = ? ORDER BY created_at DESC LIMIT 12").all(req.params.id);

  sendSuccess(res, { ...policy, claims, premiums });
});

// ─── POST /api/policies ───────────────────────────────────────────────────────
router.post(
  "/",
  authenticate,
  [
    body("member").notEmpty().withMessage("Member name is required"),
    body("branch").notEmpty().withMessage("Branch is required"),
    body("coverType").isIn(["Individual", "Family", "Corporate Group"]).withMessage("Invalid cover type"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 400);

    const db = getDb();
    const { member, branch, coverType, phone, email, dependants, memberId, startDate } = req.body;

    // Branch committee can only create for their branch
    const branchId = req.user.role === "Branch Committee" ? req.user.branch : branch;

    const branchData = db.prepare("SELECT * FROM branches WHERE id = ?").get(branchId);
    if (!branchData) return sendError(res, "Branch not found.", 404);

    const config = POLICY_CONFIG;
    const limits = config.limits[coverType];
    const premium = config.rates[coverType];
    const policyId = genId("POL");
    const mId = memberId || `FS-${branchId}-${String((branchData.members || 0) + 1).padStart(4, "0")}`;
    const start = startDate || new Date().toISOString().split("T")[0];
    const expiry = new Date(new Date(start).setFullYear(new Date(start).getFullYear() + 1)).toISOString().split("T")[0];

    db.prepare(`
      INSERT INTO policies (id, member_id, member, branch_id, cover_type, annual_limit, outpatient_limit, inpatient_limit, maternity_limit, dental_limit, optical_limit, last_expense_limit, premium, start_date, expiry_date, status, phone, email, dependants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?)
    `).run(policyId, mId, member, branchId, coverType, limits.annual, limits.outpatient, limits.inpatient, limits.maternity, limits.dental, limits.optical, limits.lastExpense, premium, start, expiry, phone || "", email || "", dependants || 0);

    // Update branch member count
    db.prepare("UPDATE branches SET members = members + 1, active = active + 1, updated_at = ? WHERE id = ?")
      .run(new Date().toISOString(), branchId);

    const policy = db.prepare("SELECT * FROM policies WHERE id = ?").get(policyId);

    auditLog({ user: req.user, action: `Policy created: ${policyId} — ${member} (${coverType}) at ${branchData.name}`, module: "Policies", type: "policy", metadata: { branchName: branchData.name }, req });

    sendSuccess(res, policy, 201, { message: `Policy ${policyId} created successfully.` });
  }
);

// ─── PATCH /api/policies/:id/renew ───────────────────────────────────────────
router.patch("/:id/renew", authenticate, authorize("System Admin", "HR/CEO", "Claims Officer"), (req, res) => {
  const db = getDb();
  const policy = db.prepare("SELECT * FROM policies WHERE id = ?").get(req.params.id);
  if (!policy) return sendError(res, "Policy not found.", 404);

  const newStart = new Date().toISOString().split("T")[0];
  const newExpiry = new Date(new Date(newStart).setFullYear(new Date(newStart).getFullYear() + 1)).toISOString().split("T")[0];

  db.prepare(`
    UPDATE policies SET status = 'Active', start_date = ?, expiry_date = ?,
    utilised = 0, outpatient_used = 0, inpatient_used = 0, maternity_used = 0,
    dental_used = 0, optical_used = 0, updated_at = ?
    WHERE id = ?
  `).run(newStart, newExpiry, new Date().toISOString(), req.params.id);

  const updated = db.prepare("SELECT * FROM policies WHERE id = ?").get(req.params.id);

  auditLog({ user: req.user, action: `Policy renewed: ${req.params.id} — ${policy.member} | New expiry: ${newExpiry}`, module: "Policies", type: "policy", req });

  sendSuccess(res, updated, 200, { message: `Policy renewed until ${newExpiry}.` });
});

// ─── PATCH /api/policies/:id ─────────────────────────────────────────────────
router.patch("/:id", authenticate, authorize("System Admin", "HR/CEO"), (req, res) => {
  const db = getDb();
  const policy = db.prepare("SELECT * FROM policies WHERE id = ?").get(req.params.id);
  if (!policy) return sendError(res, "Policy not found.", 404);

  const { status, phone, email, dependants } = req.body;
  const updates = {};
  if (status) updates.status = status;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email;
  if (dependants !== undefined) updates.dependants = dependants;

  if (Object.keys(updates).length === 0) return sendError(res, "No valid fields to update.", 400);
  updates.updated_at = new Date().toISOString();

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(", ");
  db.prepare(`UPDATE policies SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), req.params.id);

  auditLog({ user: req.user, action: `Policy updated: ${req.params.id} — ${policy.member}`, module: "Policies", type: "policy", req });
  sendSuccess(res, db.prepare("SELECT * FROM policies WHERE id = ?").get(req.params.id));
});

module.exports = router;
