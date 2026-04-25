const express = require("express");
const { body, validationResult } = require("express-validator");
const { getOne, getAll, runQuery } = require("../db/database");
const { authenticate } = require("../middleware/auth");
const { auditLog } = require("../utils/audit");
const { sendSuccess, sendError, genId, genReceiptNo } = require("../utils/response");

const router = express.Router();

const POLICY_CONFIG = {
  rates: { "Individual": 2100, "Family": 4200, "Corporate Group": 1850 },
  limits: {
    "Individual":      { annual: 250000, outpatient: 40000, inpatient: 200000, maternity: 0,      dental: 10000, optical: 8000,  lastExpense: 30000 },
    "Family":          { annual: 500000, outpatient: 75000, inpatient: 400000, maternity: 80000,  dental: 15000, optical: 10000, lastExpense: 50000 },
    "Corporate Group": { annual: 2000000,outpatient:300000, inpatient:1500000, maternity: 200000, dental: 50000, optical: 30000, lastExpense:100000 },
  },
};

// ─── POST /api/members — Enroll a new member ──────────────────────────────────
router.post(
  "/",
  authenticate,
  [
    body("member").notEmpty().withMessage("Member name is required"),
    body("coverType").isIn(["Individual", "Family", "Corporate Group"]),
    body("phone").optional(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 400);

    const { member, branch, coverType, phone, email, dependants, idNumber } = req.body;
    const db = getDb();

    const branchId = req.user.role === "Branch Committee" ? req.user.branch : (branch || req.user.branch);
    const branchData = getOne("SELECT * FROM branches WHERE id = ?", [branchId]);
    if (!branchData) return sendError(res, "Branch not found.", 404);

    const limits = POLICY_CONFIG.limits[coverType];
    const premium = POLICY_CONFIG.rates[coverType];
    const memberId = `FS-${branchId}-${String((branchData.members || 0) + 1).padStart(4, "0")}`;
    const policyId = genId("POL");
    const premiumId = genId("PRM");
    const now = new Date().toISOString();
    const startDate = now.split("T")[0];
    const expiryDate = new Date(new Date(startDate).setFullYear(new Date(startDate).getFullYear() + 1)).toISOString().split("T")[0];
    const dueDate = new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0];

    // Create policy
    runQuery(`
      INSERT INTO policies (id, member_id, member, branch_id, cover_type, annual_limit, outpatient_limit, inpatient_limit, maternity_limit, dental_limit, optical_limit, last_expense_limit, premium, start_date, expiry_date, status, phone, email, dependants)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?)
    `, [policyId, memberId, member, branchId, coverType, limits.annual, limits.outpatient, limits.inpatient, limits.maternity, limits.dental, limits.optical, limits.lastExpense, premium, startDate, expiryDate, phone || "", email || "", dependants || 0]);

    // Create initial premium record
    runQuery(`
      INSERT INTO premiums (id, member_id, member, policy_id, branch_id, due, paid, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'Pending')
    `, [premiumId, memberId, member, policyId, branchId, premium, dueDate]);

    // Update branch stats
    runQuery("UPDATE branches SET members = members + 1, active = active + 1, updated_at = ? WHERE id = ?", [now, branchId]);

    const policy = getOne("SELECT * FROM policies WHERE id = ?", [policyId]);
    const premiumRecord = getOne("SELECT * FROM premiums WHERE id = ?", [premiumId]);

    auditLog({ user: req.user, action: `Member enrolled: ${memberId} — ${member} | ${coverType} | Branch: ${branchData.name}`, module: "Members", type: "member", metadata: { branchName: branchData.name }, req });

    sendSuccess(res, { memberId, policy, premium: premiumRecord }, 201, {
      message: `${member} enrolled successfully. Member ID: ${memberId}`,
    });
  }
);

// ─── GET /api/members — Get all members (from policies) ──────────────────────
router.get("/", authenticate, (req, res) => {
  const branchFilter = req.user.role === "Branch Committee" ? req.user.branch : req.query.branch;
  let sql = `
    SELECT p.id as policy_id, p.member_id, p.member, p.branch_id, b.name as branch_name,
           p.cover_type, p.premium, p.status, p.phone, p.email, p.dependants, p.created_at
    FROM policies p
    LEFT JOIN branches b ON p.branch_id = b.id
    WHERE 1=1
  `;
  const params = [];
  if (branchFilter) { sql += " AND p.branch_id = ?"; params.push(branchFilter); }
  if (req.query.search) { sql += " AND (p.member LIKE ? OR p.member_id LIKE ?)"; params.push(`%${req.query.search}%`, `%${req.query.search}%`); }
  sql += " ORDER BY p.created_at DESC";

  const members = getAll(sql, params);
  sendSuccess(res, members);
});

module.exports = router;
