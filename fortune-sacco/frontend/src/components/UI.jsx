import Icon from "../components/Icon";

// ── Reusable styled primitives ────────────────────────────────────────────────

export const S = {
  // Layout
  pageWrap:   { fontFamily: "DM Sans, sans-serif" },
  pageHeader: { marginBottom: 20 },
  pageTitle:  { fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700, color: "#0a3d62", margin: 0 },
  pageSubtitle:{ color: "#64748b", fontSize: 13, marginTop: 2 },

  // Cards
  card:       { background: "white", borderRadius: 12, border: "1px solid #e2e8f0" },
  cardHeader: { padding: "16px 20px 12px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardTitle:  { fontFamily: "Sora, sans-serif", fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 },
  cardBody:   { padding: "16px 20px" },

  // Stat cards
  statsGrid:  { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 },
  statCard:   { background: "white", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" },
  statLabel:  { fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
  statValue:  { fontFamily: "Sora, sans-serif", fontSize: 24, fontWeight: 800, color: "#1e293b", margin: "6px 0 4px" },
  statChange: { fontSize: 11, fontWeight: 500, color: "#10b981" },

  // Grids
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },

  // Table
  table:    { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:       { background: "#f8fafc", padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e2e8f0" },
  td:       { padding: "11px 12px", borderBottom: "1px solid #f1f5f9", color: "#1e293b" },

  // Forms
  formGroup: { marginBottom: 16 },
  label:     { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.3px" },
  input:     { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "DM Sans, sans-serif", color: "#1e293b", outline: "none", boxSizing: "border-box", background: "white" },
  grid2Form: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3Form: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },

  // Misc
  searchBar: { display: "flex", alignItems: "center", gap: 8, background: "#f0f4f8", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", minWidth: 220 },
  progressBar: { height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" },
};

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_COLORS = {
  Active:   { bg: "#d1fae5", color: "#065f46" },
  Approved: { bg: "#d1fae5", color: "#065f46" },
  Paid:     { bg: "#d1fae5", color: "#065f46" },
  Inactive: { bg: "#fee2e2", color: "#991b1b" },
  Expired:  { bg: "#fee2e2", color: "#991b1b" },
  Rejected: { bg: "#fee2e2", color: "#991b1b" },
  Missed:   { bg: "#fee2e2", color: "#991b1b" },
  Pending:  { bg: "#fef3c7", color: "#92400e" },
  Partial:  { bg: "#ffedd5", color: "#9a3412" },
  Suspended:{ bg: "#f1f5f9", color: "#475569" },
  Individual:     { bg: "#f1f5f9", color: "#475569" },
  Family:         { bg: "#dbeafe", color: "#1e40af" },
  "Corporate Group": { bg: "#ede9fe", color: "#5b21b6" },
  Private:  { bg: "#f1f5f9", color: "#475569" },
  County:   { bg: "#d1fae5", color: "#065f46" },
  Teaching: { bg: "#dbeafe", color: "#1e40af" },
  Clinic:   { bg: "#fef3c7", color: "#92400e" },
  Specialist:{ bg: "#ede9fe", color: "#5b21b6" },
  Referral: { bg: "#ffedd5", color: "#9a3412" },
  Inpatient:  { bg: "#dbeafe", color: "#1e40af" },
  Outpatient: { bg: "#d1fae5", color: "#065f46" },
  Maternity:  { bg: "#ede9fe", color: "#5b21b6" },
  Dental:     { bg: "#fef3c7", color: "#92400e" },
  Optical:    { bg: "#f1f5f9", color: "#475569" },
  success: { bg: "#d1fae5", color: "#065f46" },
  failed:  { bg: "#fee2e2", color: "#991b1b" },
  security: { bg: "#fee2e2", color: "#991b1b" },
  claims:   { bg: "#dbeafe", color: "#1e40af" },
  policy:   { bg: "#d1fae5", color: "#065f46" },
  finance:  { bg: "#fef3c7", color: "#92400e" },
  member:   { bg: "#ede9fe", color: "#5b21b6" },
  general:  { bg: "#f1f5f9", color: "#475569" },
};

export const Badge = ({ label }) => {
  const c = BADGE_COLORS[label] || { bg: "#f1f5f9", color: "#475569" };
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color }}>{label}</span>;
};

// ── Button ────────────────────────────────────────────────────────────────────
const BTN_STYLES = {
  primary: { background: "#0a3d62", color: "white" },
  accent:  { background: "#f59e0b", color: "#0a2540" },
  danger:  { background: "#ef4444", color: "white" },
  success: { background: "#10b981", color: "white" },
  outline: { background: "white",   color: "#1e293b", border: "1px solid #e2e8f0" },
  ghost:   { background: "transparent", color: "#64748b" },
};

export const Btn = ({ variant = "primary", size = "md", onClick, disabled, children, style = {} }) => {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 8, fontSize: size === "sm" ? 12 : 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "none", fontFamily: "DM Sans, sans-serif", opacity: disabled ? 0.6 : 1, padding: size === "sm" ? "5px 10px" : "8px 16px", transition: "opacity 0.15s", ...BTN_STYLES[variant], ...style };
  return <button onClick={onClick} disabled={disabled} style={base}>{children}</button>;
};

// ── StatCard ──────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color, bg, change, neg }) => (
  <div style={S.statCard}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <span style={S.statLabel}>{label}</span>
      {icon && <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={18} color={color} /></div>}
    </div>
    <div style={S.statValue}>{value}</div>
    {change && <div style={{ ...S.statChange, color: neg ? "#ef4444" : "#10b981" }}>{neg ? "▼" : "▲"} {change}</div>}
  </div>
);

// ── Progress bar ──────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, max, color = "#3b82f6", height = 6 }) => {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  return (
    <div style={{ ...S.progressBar, height }}>
      <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "#ef4444" : color, borderRadius: 3, transition: "width 0.4s" }} />
    </div>
  );
};

// ── Search bar ────────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <div style={S.searchBar}>
    <Icon name="search" size={14} color="#94a3b8" />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ border: "none", background: "transparent", fontSize: 13, color: "#1e293b", outline: "none", width: "100%", fontFamily: "DM Sans, sans-serif" }} />
  </div>
);

// ── Form field ────────────────────────────────────────────────────────────────
export const Field = ({ label, children, span }) => (
  <div style={{ ...S.formGroup, gridColumn: span ? "1/-1" : undefined }}>
    <label style={S.label}>{label}</label>
    {children}
  </div>
);

export const Input = ({ value, onChange, type = "text", placeholder, required, min, disabled }) => (
  <input value={value} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder} required={required} min={min} disabled={disabled}
    style={{ ...S.input, opacity: disabled ? 0.6 : 1 }} />
);

export const Select = ({ value, onChange, options, disabled }) => (
  <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
    style={{ ...S.input, appearance: "none", cursor: "pointer" }}>
    {options.map(o => typeof o === "string" ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ── Table wrapper ─────────────────────────────────────────────────────────────
export const Table = ({ headers, children, empty }) => (
  <table style={S.table}>
    <thead><tr>{headers.map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
    <tbody>
      {children}
      {empty && <tr><td colSpan={headers.length} style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>{empty}</td></tr>}
    </tbody>
  </table>
);

// ── Alert box ─────────────────────────────────────────────────────────────────
const ALERT_COLORS = { success: ["#d1fae5","#6ee7b7","#065f46"], error: ["#fee2e2","#fca5a5","#991b1b"], warning: ["#fef3c7","#fcd34d","#92400e"], info: ["#dbeafe","#93c5fd","#1e40af"] };
export const AlertBox = ({ type = "info", children }) => {
  const [bg, border, color] = ALERT_COLORS[type];
  return <div style={{ padding: "12px 16px", borderRadius: 8, background: bg, border: `1px solid ${border}`, color, fontSize: 13, marginBottom: 12 }}>{children}</div>;
};

// ── Loading spinner ───────────────────────────────────────────────────────────
export const Spinner = ({ label = "Loading..." }) => (
  <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
    <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTop: "3px solid #0a3d62", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
    <p style={{ fontSize: 13, margin: 0 }}>{label}</p>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ── Info row (key-value) ──────────────────────────────────────────────────────
export const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
    <span style={{ color: "#64748b" }}>{label}</span>
    <span style={{ fontWeight: 600 }}>{value ?? "—"}</span>
  </div>
);
