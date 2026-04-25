const { runQuery } = require("../db/database");
const { v4: uuidv4 } = require("uuid");

const auditLog = ({ user, action, module: mod, type = "general", status = "Success", metadata = {}, req }) => {
  try {
    const ip = req ? (req.ip || req.headers["x-forwarded-for"] || "unknown") : "Internal";
    const branchName = req?.user?.branchName || metadata?.branchName || "—";

    runQuery(`
      INSERT INTO audit_logs (id, timestamp, user_email, user_role, branch_name, action, module, ip_address, status, type, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      new Date().toISOString(),
      user?.email || "system",
      user?.role || "System",
      branchName,
      action,
      mod || "System",
      ip,
      status,
      type,
      JSON.stringify(metadata)
    ]);
  } catch (err) {
    console.error("[Audit] Failed to log:", err.message);
  }
};

module.exports = { auditLog };
