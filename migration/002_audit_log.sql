CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  action TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
await IH_DB.prepare(
  "INSERT INTO audit_log (user_id, action) VALUES (?, ?)"
).bind(user.id, "SIGNED_IN").run();
