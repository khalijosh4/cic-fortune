// hospitals.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const { getAll, getOne, runQuery } = require("../db/database");
const { authenticate, authorize } = require("../middleware/auth");
const { auditLog } = require("../utils/audit");
const { sendSuccess, sendError } = require("../utils/response");
const router = express.Router();

router.get("/", authenticate, (req, res) => {
  let sql = "SELECT * FROM hospitals WHERE 1=1";
  const params = [];
  if (req.query.status) { sql += " AND status = ?"; params.push(req.query.status); }
  if (req.query.type) { sql += " AND type = ?"; params.push(req.query.type); }
  if (req.query.location) { sql += " AND location LIKE ?"; params.push(`%${req.query.location}%`); }
  sql += " ORDER BY name ASC";
  sendSuccess(res, getAll(sql, params));
});

router.get("/:id", authenticate, (req, res) => {
  const h = getOne("SELECT * FROM hospitals WHERE id = ?", [req.params.id]);
  if (!h) return sendError(res, "Hospital not found.", 404);
  sendSuccess(res, h);
});

router.post("/", authenticate, authorize("System Admin", "HR/CEO"),
  [body("name").notEmpty(), body("code").notEmpty(), body("location").notEmpty(), body("type").isIn(["Private","County","Teaching","Clinic","Specialist","Referral"])],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg, 400);
    const id = uuidv4();
    runQuery("INSERT INTO hospitals (id, name, code, location, type, claim_limit, nhif_accredited, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, req.body.name, req.body.code, req.body.location, req.body.type, Number(req.body.limit) || 500000, req.body.nhifAccredited ? 1 : 0, req.body.contact || ""]);
    auditLog({ user: req.user, action: `Hospital added: ${req.body.name} — ${req.body.location} (${req.body.type})`, module: "Hospitals", type: "policy", req });
    sendSuccess(res, getOne("SELECT * FROM hospitals WHERE id = ?", [id]), 201, { message: `${req.body.name} added to network.` });
  }
);

router.patch("/:id/toggle", authenticate, authorize("System Admin", "HR/CEO"), (req, res) => {
  const h = getOne("SELECT * FROM hospitals WHERE id = ?", [req.params.id]);
  if (!h) return sendError(res, "Hospital not found.", 404);
  const newStatus = h.status === "Active" ? "Inactive" : "Active";
  runQuery("UPDATE hospitals SET status = ?, updated_at = ? WHERE id = ?", [newStatus, new Date().toISOString(), req.params.id]);
  auditLog({ user: req.user, action: `Hospital ${newStatus}: ${h.name}`, module: "Hospitals", type: "policy", req });
  sendSuccess(res, getOne("SELECT * FROM hospitals WHERE id = ?", [req.params.id]));
});

module.exports = router;
