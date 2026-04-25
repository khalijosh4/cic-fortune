// ═══════════════════════════════════════════════════════════════════
// premiums.js
// ═══════════════════════════════════════════════════════════════════
const express = require("express");
const { getDb } = require("../db/database");
const { authenticate, authorize } = require("../middleware/auth");
const { auditLog } = require("../utils/audit");
const { sendSuccess, sendError, genReceiptNo } = require("../utils/response");

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  const db = getDb();
  const branchFilter = req.user.role === "Branch Committee" ? req.user.branch : req.query.branch;
  let sql = "SELECT p.*, b.name as branch_name FROM premiums p LEFT JOIN branches b ON p.branch_id = b.id WHERE 1=1";
  const params = [];
  if (branchFilter) { sql += " AND p.branch_id = ?"; params.push(branchFilter); }
  if (req.query.status) { sql += " AND p.status = ?"; params.push(req.query.status); }
  sql += " ORDER BY p.created_at DESC";
  sendSuccess(res, db.prepare(sql).all(...params));
});

router.get("/stats", authenticate, (req, res) => {
  const db = getDb();
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status='Paid' THEN 1 ELSE 0 END) as paid_count,
      SUM(CASE WHEN status='Missed' THEN 1 ELSE 0 END) as missed_count,
      SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) as pending_count,
      SUM(CASE WHEN status='Paid' THEN paid ELSE 0 END) as collected,
      SUM(CASE WHEN status!='Paid' THEN due ELSE 0 END) as outstanding
    FROM premiums
  `).get();
  sendSuccess(res, stats);
});

router.post("/:id/pay", authenticate, authorize("System Admin", "HR/CEO", "Claims Officer"), (req, res) => {
  const db = getDb();
  const premium = db.prepare("SELECT * FROM premiums WHERE id = ?").get(req.params.id);
  if (!premium) return sendError(res, "Premium record not found.", 404);
  if (premium.status === "Paid") return sendError(res, "Premium already paid.", 400);

  const receiptNo = genReceiptNo();
  const now = new Date().toISOString();
  db.prepare("UPDATE premiums SET status='Paid', paid=?, paid_date=?, method=?, receipt_no=?, updated_at=? WHERE id=?")
    .run(premium.due, now.split("T")[0], req.body.method || "SACCO Deduction", receiptNo, now, req.params.id);
  db.prepare("UPDATE policies SET status='Active', updated_at=? WHERE id=?").run(now, premium.policy_id);

  auditLog({ user: req.user, action: `Premium paid: ${req.params.id} — ${premium.member} | KES ${premium.due.toLocaleString()} | ${req.body.method || "SACCO Deduction"} | Receipt: ${receiptNo}`, module: "Premiums", type: "finance", req });
  sendSuccess(res, db.prepare("SELECT * FROM premiums WHERE id=?").get(req.params.id), 200, { receiptNo, message: "Payment processed successfully." });
});

router.post("/auto-deduct", authenticate, authorize("System Admin", "HR/CEO"), (req, res) => {
  const db = getDb();
  const pending = db.prepare("SELECT * FROM premiums WHERE status='Pending'").all();
  const now = new Date().toISOString();
  let processed = 0, failed = 0;

  const updateStmt = db.prepare("UPDATE premiums SET status='Paid', paid=?, paid_date=?, method=?, receipt_no=?, updated_at=? WHERE id=?");
  const updatePolicy = db.prepare("UPDATE policies SET status='Active', updated_at=? WHERE id=?");

  const runAll = db.transaction(() => {
    pending.forEach(p => {
      try {
        const receiptNo = genReceiptNo();
        updateStmt.run(p.due, now.split("T")[0], "SACCO Deduction", receiptNo, now, p.id);
        updatePolicy.run(now, p.policy_id);
        processed++;
      } catch { failed++; }
    });
  });
  runAll();

  auditLog({ user: req.user, action: `Auto-deduction run: ${processed}/${pending.length} processed | ${failed} failed`, module: "Premiums", type: "finance", req });
  sendSuccess(res, { processed, failed, total: pending.length }, 200, { message: `${processed} premiums processed successfully.` });
});

module.exports = router;
