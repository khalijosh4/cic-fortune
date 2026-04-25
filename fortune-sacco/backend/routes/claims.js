const express = require("express");
const { body, validationResult } = require("express-validator");
const { getDb } = require("../db/database");
const { authenticate, authorize, branchGuard } = require("../middleware/auth");
const { auditLog } = require("../utils/audit");
const { sendSuccess, sendError, genId } = require("../utils/response");

const router = express.Router();

// ─── GET /api/claims ──────────────────────────────────────────────────────────
router.get("/", authenticate, branchGuard, (req, res) => {
  const db = getDb();
  const { status, search, branch, category, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  let sql = `SELECT c.*, b.name as branch_name FROM claims c LEFT JOIN branches b ON c.branch_id = b.id WHERE 1=1`;
  const params = [];

  if (req.branchFilter) { sql += " AND c.branch_id = ?"; params.push(req.branchFilter); }
  else if (branch) { sql += " AND c.branch_id = ?"; params.push(branch); }
  if (status) { sql += " AND c.status = ?"; params.push(status); }
  if (category) { sql += " AND c.category = ?"; params.push(category); }
  if (search) { sql += " AND (c.member LIKE ? OR c.id LIKE ? OR c.diagnosis LIKE ? OR c.hospital LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }

  const total = db.prepare(`SELECT COUNT(*) as count FROM (${sql})`).get(...params).count;
  sql += " ORDER BY c.created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  const claims = db.prepare(sql).all(...params).map(c => ({ ...c, docs: JSON.parse(c.docs || "[]") }));
  sendSuccess(res, claims, 200, { total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// ─── GET /api/claims/stats ────────────────────────────────────────────────────
router.get("/stats", authenticate, (req, res) => {
  const db = getDb();
  const branchFilter = req.user.role === "Branch Committee" ? req.user.branch : null;
  const where = branchFilter ? "WHERE branch_id = ?" : "";
  const params = branchFilter ? [branchFilter] : [];

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'Partial' THEN 1 ELSE 0 END) as partial,
      SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(COALESCE(approved_amount, 0)) as total_approved,
      SUM(amount) as total_claimed
    FROM claims ${where}
  `).get(...params);

  sendSuccess(res, stats);
});

// ─── GET /api/claims/:id ──────────────────────────────────────────────────────
router.get("/:id", authenticate, (req, res) => {
  const db = getDb();
  const claim = db.prepare(`
    SELECT c.*, b.name as branch_name, p.cover_type, p.annual_limit, p.utilised
    FROM claims c
    LEFT JOIN branches b ON c.branch_id = b.id
    LEFT JOIN policies p ON c.policy_id = p.id
    WHERE c.id = ?
  `).get(req.params.id);

  if (!claim) return sendError(res, "Claim not found.", 404);
  if (req.user.role === "Branch Committee" && claim.branch_id !== req.user.branch) {
    return sendError(res, "Access denied.", 403);
  }

  sendSuccess(res, { ...claim, docs: JSON.parse(claim.docs || "[]") });
});

// ─── POST /api/claims ─────────────────────────────────────────────────────────
router.post(
  "/",
  authenticate,
  [
    body("policy").notEmpty().withMessage("Policy ID is required"),
    body("hospital").notEmpty().withMessage("Hospital is required"),
    body("category").isIn(["Outpatient", "Inpatient", "Maternity", "Dental", "Optical"]),
    body("amount").isFloat({ min: 1 }).withMessage("Amount must be greater than 0"),
    body("diagnosis").notEmpty().withMessage("Diagnosis is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 400);

    const { policy: policyId, hospital, hospitalCode, category, amount, diagnosis, docs = [] } = req.body;
    const db = getDb();

    const policy = db.prepare("SELECT * FROM policies WHERE id = ?").get(policyId);
    if (!policy) return sendError(res, "Policy not found.", 404);
    if (policy.status !== "Active") return sendError(res, `Cannot submit claim — policy is ${policy.status}.`, 400);

    const remaining = policy.annual_limit - policy.utilised;
    if (Number(amount) > remaining) {
      return sendError(res, `Claim amount exceeds remaining policy limit. Remaining: KES ${remaining.toLocaleString()}.`, 400);
    }

    // Category-specific limit check
    const catLimitMap = { Outpatient: ["outpatient_limit", "outpatient_used"], Inpatient: ["inpatient_limit", "inpatient_used"], Maternity: ["maternity_limit", "maternity_used"], Dental: ["dental_limit", "dental_used"], Optical: ["optical_limit", "optical_used"] };
    const [limitField, usedField] = catLimitMap[category] || [];
    if (limitField && policy[limitField] > 0) {
      const catRemaining = policy[limitField] - (policy[usedField] || 0);
      if (Number(amount) > catRemaining) {
        return sendError(res, `Claim exceeds ${category} limit. Available: KES ${catRemaining.toLocaleString()}.`, 400);
      }
    }

    const claimId = genId("CLM");
    db.prepare(`
      INSERT INTO claims (id, member_id, member, policy_id, branch_id, hospital, hospital_code, category, amount, date, diagnosis, status, docs, claimant_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
    `).run(claimId, policy.member_id, policy.member, policyId, policy.branch_id, hospital, hospitalCode || "", category, Number(amount), new Date().toISOString().split("T")[0], diagnosis, JSON.stringify(docs), policy.phone || "");

    // Update branch claims count
    db.prepare("UPDATE branches SET claims = claims + 1, updated_at = ? WHERE id = ?").run(new Date().toISOString(), policy.branch_id);

    const claim = db.prepare("SELECT * FROM claims WHERE id = ?").get(claimId);

    auditLog({ user: req.user, action: `Claim submitted: ${claimId} — ${policy.member} | ${category} | KES ${Number(amount).toLocaleString()} | ${hospital}`, module: "Claims", type: "claims", req });

    sendSuccess(res, { ...claim, docs: JSON.parse(claim.docs || "[]") }, 201, { message: `Claim ${claimId} submitted for review.` });
  }
);

// ─── POST /api/claims/:id/review ──────────────────────────────────────────────
router.post(
  "/:id/review",
  authenticate,
  authorize("System Admin", "HR/CEO", "Claims Officer"),
  [
    body("decision").isIn(["Approved", "Partial", "Rejected"]).withMessage("Decision must be Approved, Partial, or Rejected"),
    body("notes").optional().isString(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 400);

    const { decision, approvedAmount, notes } = req.body;
    const db = getDb();

    const claim = db.prepare("SELECT * FROM claims WHERE id = ?").get(req.params.id);
    if (!claim) return sendError(res, "Claim not found.", 404);
    if (claim.status !== "Pending") return sendError(res, `Claim already ${claim.status.toLowerCase()}.`, 400);

    let approved = null;
    if (decision === "Approved") {
      approved = Number(approvedAmount) || claim.amount;
    } else if (decision === "Partial") {
      approved = Number(approvedAmount);
      if (!approved || approved <= 0) return sendError(res, "Approved amount required for partial approval.", 400);
      if (approved > claim.amount) return sendError(res, "Approved amount cannot exceed claimed amount.", 400);
    }

    db.prepare(`
      UPDATE claims SET status = ?, approved_amount = ?, review_notes = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(decision, approved, notes || "", req.user.name, new Date().toISOString(), new Date().toISOString(), req.params.id);

    // Update policy utilisation if approved
    if (approved) {
      const policy = db.prepare("SELECT * FROM policies WHERE id = ?").get(claim.policy_id);
      if (policy) {
        const catFieldMap = { Outpatient: "outpatient_used", Inpatient: "inpatient_used", Maternity: "maternity_used", Dental: "dental_used", Optical: "optical_used" };
        const field = catFieldMap[claim.category] || "outpatient_used";
        db.prepare(`UPDATE policies SET utilised = utilised + ?, ${field} = ${field} + ?, updated_at = ? WHERE id = ?`)
          .run(approved, approved, new Date().toISOString(), claim.policy_id);
      }
    }

    const updated = db.prepare("SELECT * FROM claims WHERE id = ?").get(req.params.id);
    auditLog({ user: req.user, action: `Claim ${decision}: ${req.params.id} — ${claim.member} | Approved: KES ${(approved || 0).toLocaleString()} | ${notes || ""}`, module: "Claims", type: "claims", req });

    sendSuccess(res, { ...updated, docs: JSON.parse(updated.docs || "[]") }, 200, { message: `Claim ${decision.toLowerCase()} successfully.` });
  }
);

module.exports = router;
