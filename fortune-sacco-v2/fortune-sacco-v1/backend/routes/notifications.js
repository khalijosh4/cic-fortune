// notifications.js
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getAll, runQuery } = require("../db/database");
const { authenticate } = require("../middleware/auth");
const { sendSuccess } = require("../utils/response");

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  const notifs = getAll(`
    SELECT * FROM notifications
    WHERE user_id = ? OR is_broadcast = 1
    ORDER BY created_at DESC LIMIT 30
  `, [req.user.id]);
  const unread = notifs.filter(n => !n.is_read).length;
  sendSuccess(res, notifs, 200, { unread });
});

router.patch("/:id/read", authenticate, (req, res) => {
  runQuery("UPDATE notifications SET is_read = 1 WHERE id = ? AND (user_id = ? OR is_broadcast = 1)", [req.params.id, req.user.id]);
  sendSuccess(res, null, 200, { message: "Marked as read." });
});

router.patch("/read-all", authenticate, (req, res) => {
  runQuery("UPDATE notifications SET is_read = 1 WHERE user_id = ? OR is_broadcast = 1", [req.user.id]);
  sendSuccess(res, null, 200, { message: "All notifications marked as read." });
});

module.exports = router;
