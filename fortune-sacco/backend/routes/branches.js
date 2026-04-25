const express = require("express");
const { getAll, getOne } = require("../db/database");
const { authenticate, authorize } = require("../middleware/auth");
const { sendSuccess, sendError } = require("../utils/response");

const router = express.Router();

// GET /api/branches
router.get("/", authenticate, (req, res) => {
  const branches = getAll("SELECT * FROM branches ORDER BY members DESC");

  // Enrich with live stats from other tables
  const enriched = branches.map(b => {
    const policyStats = getOne(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as active_policies
      FROM policies WHERE branch_id = ?
    `, [b.id]);

    const claimStats = getOne(`
      SELECT COUNT(*) as claims_count,
        SUM(COALESCE(approved_amount,0)) as claims_value
      FROM claims WHERE branch_id = ?
    `, [b.id]);

    const premiumStats = getOne(`
      SELECT SUM(CASE WHEN status='Paid' THEN paid ELSE 0 END) as collected
      FROM premiums WHERE branch_id = ?
    `, [b.id]);

    const collected = premiumStats.collected || 0;
    const claimsValue = claimStats.claims_value || 0;
    const lossRatio = collected > 0 ? Math.round((claimsValue / (collected * 12)) * 100) : 75;

    return {
      ...b,
      active_policies: policyStats.active_policies || b.active,
      total_policies: policyStats.total || 0,
      claims_count: claimStats.claims_count || b.claims,
      claims_value: claimsValue,
      premiums_collected: collected,
      loss_ratio: Math.min(lossRatio, 99),
    };
  });

  sendSuccess(res, enriched);
});

// GET /api/branches/:id
router.get("/:id", authenticate, (req, res) => {
  const branch = getOne("SELECT * FROM branches WHERE id = ?", [req.params.id]);
  if (!branch) return sendError(res, "Branch not found.", 404);

  const policies = getAll("SELECT * FROM policies WHERE branch_id = ? ORDER BY created_at DESC LIMIT 10", [req.params.id]);
  const claims = getAll("SELECT * FROM claims WHERE branch_id = ? ORDER BY created_at DESC LIMIT 10", [req.params.id]);
  const premiums = getAll("SELECT * FROM premiums WHERE branch_id = ? ORDER BY created_at DESC LIMIT 10", [req.params.id]);

  sendSuccess(res, { ...branch, recentPolicies: policies, recentClaims: claims, recentPremiums: premiums });
});

module.exports = router;
