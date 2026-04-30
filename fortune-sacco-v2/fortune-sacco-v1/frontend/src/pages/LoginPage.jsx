import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Icon from "../components/Icon";

const DEMO_ROLES = [
  { role: "System Admin",     email: "admin@fortunesacco.co.ke",  password: "Admin@2024",  color: "#7c3aed" },
  { role: "HR/CEO",           email: "hr@fortunesacco.co.ke",     password: "HR@2024",     color: "#0a3d62" },
  { role: "Claims Officer",   email: "claims@fortunesacco.co.ke", password: "Claims@2024", color: "#059669" },
  { role: "Branch Committee", email: "branch@fortunesacco.co.ke", password: "Branch@2024", color: "#d97706" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [selected, setSelected] = useState(null);

  const handleSelect = r => { setSelected(r); setEmail(r.email); setPassword(r.password); setError(""); };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`, `Logged in as ${user.role}`);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a2540 0%,#0a3d62 50%,#0d5f8a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 20, overflow: "hidden", width: "100%", maxWidth: 900, boxShadow: "0 30px 60px rgba(0,0,0,0.3)", display: "grid", gridTemplateColumns: "1fr 1fr" }}>

        {/* Brand panel */}
        <div style={{ background: "linear-gradient(160deg,#0a2540 0%,#0a3d62 100%)", padding: 48, color: "white", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ width: 60, height: 60, background: "#f59e0b", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora,sans-serif", fontWeight: 800, fontSize: 26, color: "#0a2540", marginBottom: 24 }}>FS</div>
          <h1 style={{ fontFamily: "Sora,sans-serif", fontSize: 28, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>Fortune Sacco CIC Health Insurance</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Comprehensive insurance management — 20 branches, real-time data, full audit trail.
          </p>
          {["JWT Authentication & Role-Based Access", "SQLite Database — 9 tables, full CRUD", "20 Branches with live statistics", "Claims, Premiums & Policy workflows", "Real-time audit logging & notifications"].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
              <Icon name="checkCircle" size={14} color="#4ade80" />{f}
            </div>
          ))}
          <div style={{ marginTop: 24, padding: "10px 14px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, background: "#10b981", borderRadius: "50%" }} />
            <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>All systems operational — Node.js backend running</span>
          </div>
        </div>

        {/* Form panel */}
        <div style={{ padding: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 22, fontWeight: 700, color: "#0a3d62", marginBottom: 6 }}>Welcome Back</h2>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Select a demo role or enter credentials manually</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            {DEMO_ROLES.map(r => (
              <div key={r.role} onClick={() => handleSelect(r)} style={{ border: `2px solid ${selected?.role === r.role ? "#0a3d62" : "#e2e8f0"}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", background: selected?.role === r.role ? "#eff6ff" : "white", transition: "all 0.15s" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.role}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>{r.email}</div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
              <Icon name="xCircle" size={16} color="#ef4444" />
              <span style={{ fontSize: 13, color: "#991b1b" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.3px" }}>Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="email@fortunesacco.co.ke"
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "DM Sans,sans-serif", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.3px" }}>Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" required placeholder="••••••••"
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "DM Sans,sans-serif", outline: "none", boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", padding: 11, background: loading ? "#94a3b8" : "#0a3d62", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "DM Sans,sans-serif" }}>
              {loading ? "Authenticating..." : <><Icon name="arrowRight" size={15} /> Sign In to Dashboard</>}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "#94a3b8" }}>256-bit SSL • HIPAA Compliant • JWT Secured</p>
        </div>
      </div>
    </div>
  );
}
