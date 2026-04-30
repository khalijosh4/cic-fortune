const express = require("express");
const { getDb } = require("../db/database");
const { authenticate } = require("../middleware/auth");
const { sendSuccess } = require("../utils/response");

const router = express.Router();

// GET /api/dashboard/kpis
router.get("/kpis", authenticate, (req, res) => {
  const db = getDb();
  const branchFilter = req.user.role === "Branch Committee" ? req.user.branch : null;
  const bWhere = branchFilter ? "WHERE branch_id = ?" : "";
  const bP = branchFilter ? [branchFilter] : [];

  const branchRow = db.prepare(`SELECT SUM(members) as total_members, SUM(active) as active_members FROM branches ${branchFilter ? "WHERE id = ?" : ""}`).get(...bP);

  const policyStats = db.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as active FROM policies ${bWhere}`).get(...bP);

  const premStats = db.prepare(`SELECT SUM(CASE WHEN status='Paid' THEN paid ELSE 0 END) as collected FROM premiums ${bWhere}`).get(...bP);

  const claimStats = db.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) as pending, SUM(COALESCE(approved_amount,0)) as paid_ytd FROM claims ${bWhere}`).get(...bP);

  const hospitalCount = db.prepare("SELECT COUNT(*) as count FROM hospitals WHERE status='Active'").get();

  const expiringCount = db.prepare(`SELECT COUNT(*) as count FROM policies WHERE status='Active' AND expiry_date <= date('now','+30 days') ${branchFilter ? "AND branch_id = ?" : ""}`).get(...bP);

  const collected = premStats.collected || 0;
  const claimsPaid = claimStats.paid_ytd || 0;
  const lossRatio = collected > 0 ? Math.round((claimsPaid / (collected * 12)) * 100) : 77;

  sendSuccess(res, {
    totalMembers: branchRow.total_members || 0,
    activeMembers: branchRow.active_members || 0,
    activePolicies: policyStats.active || 0,
    totalPolicies: policyStats.total || 0,
    monthlyPremiums: collected,
    pendingClaims: claimStats.pending || 0,
    totalClaims: claimStats.total || 0,
    claimsPaid,
    lossRatio: Math.min(lossRatio, 99),
    approvedHospitals: hospitalCount.count || 0,
    expiringPolicies: expiringCount.count || 0,
  });
});

// GET /api/dashboard/branch-chart
router.get("/branch-chart", authenticate, (req, res) => {
  const db = getDb();
  const branches = db.prepare("SELECT id, name, premiums, claims FROM branches ORDER BY premiums DESC LIMIT 8").all();
  sendSuccess(res, branches);
});

// GET /api/dashboard/recent-activity
router.get("/recent-activity", authenticate, (req, res) => {
  const db = getDb();
  const branchFilter = req.user.role === "Branch Committee" ? req.user.branch : null;

  const recentClaims = db.prepare(`SELECT id, member, amount, status, date, category FROM claims ${branchFilter ? "WHERE branch_id = ?" : ""} ORDER BY created_at DESC LIMIT 5`).all(...(branchFilter ? [branchFilter] : []));
  const recentPolicies = db.prepare(`SELECT id, member, cover_type, status, created_at FROM policies ${branchFilter ? "WHERE branch_id = ?" : ""} ORDER BY created_at DESC LIMIT 5`).all(...(branchFilter ? [branchFilter] : []));

  sendSuccess(res, { recentClaims, recentPolicies });
});

module.exports = router;
