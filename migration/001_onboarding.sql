CREATE TABLE IF NOT EXISTS steps (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body_html TEXT NOT NULL,     -- keep as trusted HTML; or store markdown and render
  cta_label TEXT NOT NULL,
  next_slug TEXT,              -- null when last
  requires TEXT DEFAULT '[]',  -- JSON array of slugs required
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO steps (slug, title, body_html, cta_label, next_slug) VALUES
('signin', 'Sign in', '<p>Use Email, Google, or Wallet Connect.</p>', 'Continue', 'connect-data'),
('connect-data', 'Connect data', '<p>Sync banks, wallet, and your accounting platform.</p>', 'Continue', 'business-setup'),
('business-setup', 'Business setup', '<p>Business name, industry, currency. Optional logo/color.</p>', 'Continue', 'settings-setup'),
('settings-setup', 'Settings', '<p>Invoice alerts, risk scoring, AI assistant, security.</p>', 'Continue', 'dashboard-preview'),
('dashboard-preview', 'Dashboard preview', '<p>Cash Flow, Invoice Risk, Wallet Sync.</p>', 'Explore analytics', 'analytics-trends'),
('analytics-trends', 'Analytics & trends', '<p>“Your invoice risk increased 12% last month”.</p>', 'Next', 'profiles'),
('profiles', 'Vendor & client profiles', '<p>Add/import contacts; tag by risk and history.</p>', 'Next', 'reports'),
('reports', 'Reports', '<p>Monthly summary, audit log, invoice aging. Export PDF/CSV.</p>', 'Next', 'forecasting'),
('forecasting', 'Forecasting & planning', '<p>Interactive cash flow projections and scenarios.</p>', 'Next', 'alerts'),
('alerts', 'Alerts', '<p>Real-time notifications; filter by urgency.</p>', 'Next', 'assistant'),
('assistant', 'AI CFO Assistant', '<p>Ask: “What’s my burn rate?” or “Flag risky invoices”.</p>', 'Finish', NULL);
