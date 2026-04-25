import { useState, useEffect } from "react";
import { dashboardAPI, claimsAPI, policiesAPI } from "../services/api";
import { StatCard, ProgressBar, Badge, Btn, S, Spinner } from "../components/UI";
import Icon from "../components/Icon";

const BRANCHES_CHART = [
  { id:"NBI", name:"Nairobi", premiums:4820000 },
  { id:"MSA", name:"Mombasa", premiums:3150000 },
  { id:"KSM", name:"Kisumu",  premiums:2640000 },
  { id:"NKR", name:"Nakuru",  premiums:2100000 },
  { id:"ELD", name:"Eldoret", premiums:1680000 },
  { id:"THK", name:"Thika",   premiums:1320000 },
  { id:"NYR", name:"Nyeri",   premiums:1120000 },
  { id:"MRU", name:"Meru",    premiums:980000  },
];

export default function DashboardPage() {
  const [kpis, setKpis]       = useState(null);
  const [claims, setClaims]   = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [kpiRes, claimRes, polRes] = await Promise.all([
        dashboardAPI.kpis(),
        claimsAPI.getAll({ limit: 5 }),
        policiesAPI.getAll({ limit: 5, status: "Active" }),
      ]);
      setKpis(kpiRes.data.data);
      setClaims(claimRes.data.data || []);
      setPolicies(polRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (!kpis) return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Failed to load dashboard.</div>;

  const maxPremium = Math.max(...BRANCHES_CHART.map(b => b.premiums));

  return (
    <div style={S.pageWrap}>
      <div style={S.pageHeader}>
        <h2 style={S.pageTitle}>Dashboard Overview</h2>
        <p style={S.pageSubtitle}>Real-time insurance portfolio — {new Date().toLocaleDateString("en-KE", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
      </div>

      {/* KPI cards */}
      <div style={S.statsGrid}>
        <StatCard label="Total Members"    value={kpis.totalMembers.toLocaleString()} icon="users"    color="#3b82f6" bg="#dbeafe" change="+3.2%" />
        <StatCard label="Active Policies"  value={kpis.activePolicies.toLocaleString()} icon="fileText" color="#10b981" bg="#d1fae5" change="+1.8%" />
        <StatCard label="Monthly Premiums" value={`KES ${(kpis.monthlyPremiums/1000000).toFixed(1)}M`} icon="dollar"   color="#f59e0b" bg="#fef3c7" change="+6.1%" />
        <StatCard label="Pending Claims"   value={kpis.pendingClaims}                  icon="activity" color="#ef4444" bg="#fee2e2" change="-2.4%" neg />
      </div>

      {/* Charts row */}
      <div style={S.grid2}>
        {/* Bar chart */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <h3 style={S.cardTitle}>Premium Collection by Branch</h3>
            <span style={{ background: "#dbeafe", color: "#1e40af", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Top 8</span>
          </div>
          <div style={S.cardBody}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110 }}>
              {BRANCHES_CHART.map(b => (
                <div key={b.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: `${(b.premiums / maxPremium) * 100}px`, background: "linear-gradient(to top,#0a3d62,#1565a8)", borderRadius: "4px 4px 0 0", minHeight: 4, transition: "height 0.5s" }} />
                  <span style={{ fontSize: 9, color: "#94a3b8", whiteSpace: "nowrap" }}>{b.id}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
              Total: KES {(BRANCHES_CHART.reduce((s,b) => s + b.premiums, 0) / 1000000).toFixed(1)}M / month
            </div>
          </div>
        </div>

        {/* Loss ratio */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <h3 style={S.cardTitle}>Loss Ratio Monitor</h3>
            <Badge label={kpis.lossRatio < 80 ? "Healthy" : "At Risk"} />
          </div>
          <div style={S.cardBody}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 52, fontFamily: "Sora,sans-serif", fontWeight: 800, color: kpis.lossRatio < 80 ? "#10b981" : "#ef4444" }}>{kpis.lossRatio}%</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Loss Ratio — Target &lt;80%</div>
            </div>
            <ProgressBar value={kpis.lossRatio} max={100} color={kpis.lossRatio < 80 ? "#10b981" : "#ef4444"} height={12} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginTop: 4, marginBottom: 16 }}>
              <span>0%</span><span style={{ color: "#10b981", fontWeight: 600 }}>Target &lt;80%</span><span>100%</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["Claims Paid YTD", `KES ${(kpis.claimsPaid/1000000).toFixed(1)}M`], ["Approved Hospitals", kpis.approvedHospitals]].map(([l,v]) => (
                <div key={l} style={{ background: "#f8fafc", borderRadius: 8, padding: 10, textAlign: "center" }}>
                  <div style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: 16, color: "#1e293b" }}>{v}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables row */}
      <div style={S.grid2}>
        {/* Recent claims */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <h3 style={S.cardTitle}>Recent Claims</h3>
            <span style={{ background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{kpis.pendingClaims} Pending</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr>
              {["Claim ID","Member","Amount","Status"].map(h => <th key={h} style={{ background:"#f8fafc", padding:"10px 12px", textAlign:"left", fontSize:11, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:"1px solid #e2e8f0" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {claims.map(c => (
                <tr key={c.id}>
                  <td style={{ padding:"10px 12px", borderBottom:"1px solid #f1f5f9", fontFamily:"monospace", fontSize:11 }}>{c.id}</td>
                  <td style={{ padding:"10px 12px", borderBottom:"1px solid #f1f5f9" }}>{c.member?.split(" ").slice(0,2).join(" ")}</td>
                  <td style={{ padding:"10px 12px", borderBottom:"1px solid #f1f5f9" }}>KES {c.amount?.toLocaleString()}</td>
                  <td style={{ padding:"10px 12px", borderBottom:"1px solid #f1f5f9" }}><Badge label={c.status} /></td>
                </tr>
              ))}
              {claims.length === 0 && <tr><td colSpan={4} style={{ padding:24, textAlign:"center", color:"#94a3b8", fontSize:13 }}>No claims found</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Cover distribution */}
        <div style={S.card}>
          <div style={S.cardHeader}><h3 style={S.cardTitle}>Cover Distribution</h3></div>
          <div style={S.cardBody}>
            {[["Individual","48%",48,"#3b82f6"],["Family","35%",35,"#10b981"],["Corporate Group","17%",17,"#f59e0b"]].map(([label,pct,num,color]) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}>
                  <span style={{ fontWeight:600 }}>{label}</span><span style={{ color:"#64748b" }}>{pct}</span>
                </div>
                <ProgressBar value={num} max={100} color={color} height={8} />
              </div>
            ))}
            {kpis.expiringPolicies > 0 && (
              <div style={{ marginTop:16, padding:"10px 14px", background:"#fef3c7", border:"1px solid #fcd34d", borderRadius:8, display:"flex", alignItems:"center", gap:8 }}>
                <Icon name="alert" size={14} color="#92400e" />
                <span style={{ fontSize:12, color:"#92400e", fontWeight:600 }}>{kpis.expiringPolicies} policies expiring in 30 days</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
