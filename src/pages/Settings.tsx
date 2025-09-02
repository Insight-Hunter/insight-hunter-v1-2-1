export default function Settings() {
  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>Settings</h2>
      <div className="grid">
        <div>
          <label className="label">Demo Mode</label>
          <div style={{ opacity: 0.8 }}>
            This build uses demo data from /api/demo/*
          </div>
        </div>
      </div>
    </div>
  );
}
