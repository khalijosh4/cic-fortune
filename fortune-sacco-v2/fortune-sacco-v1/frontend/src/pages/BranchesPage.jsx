// ═══════════════════════════════════════════════════════════════
// BranchesPage.jsx
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { branchesAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { StatCard, ProgressBar, Spinner, S } from "../components/UI";

export function BranchesPage() {
  const { toast } = useToast();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    branchesAPI.getAll()
      .then(r => setBranches(r.data.data||[]))
      .catch(() => toast.error("Error","Could not load branches."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading branches..." />;

  const totals = branches.reduce((s,b) => ({ members:s.members+b.members, premiums:s.premiums+b.premiums, claims:s.claims_count||s.claims+(b.claims_count||b.claims) }), { members:0, premiums:0, claims:0 });

  return (
    <div style={S.pageWrap}>
      <div style={S.pageHeader}><h2 style={S.pageTitle}>Branch Overview</h2><p style={S.pageSubtitle}>Performance across all 20 Fortune Sacco branches</p></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:22 }}>
        <StatCard label="Total Members"     value={branches.reduce((s,b)=>s+b.members,0).toLocaleString()} icon="users"    color="#3b82f6" bg="#dbeafe" />
        <StatCard label="Total Premiums/mo" value={`KES ${(branches.reduce((s,b)=>s+b.premiums,0)/1000000).toFixed(1)}M`} icon="dollar" color="#f59e0b" bg="#fef3c7" />
        <StatCard label="Total Branches"    value={branches.length} icon="building" color="#10b981" bg="#d1fae5" />
      </div>
      <div style={S.card}>
        <div style={S.cardHeader}><h3 style={S.cardTitle}>All Branches</h3><span style={{ background:"#dbeafe",color:"#1e40af",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600 }}>20 Branches</span></div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr>{["#","Branch","County","Manager","Members","Active Policies","Monthly Premiums","Claims","Loss Ratio"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {branches.map((b,i) => (
              <tr key={b.id} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <td style={{ ...S.td, color:"#64748b" }}>{i+1}</td>
                <td style={S.td}><div style={{ fontWeight:700 }}>{b.name}</div><div style={{ fontSize:10, color:"#64748b", fontFamily:"monospace" }}>{b.id}</div></td>
                <td style={S.td}>{b.county}</td>
                <td style={{ ...S.td, fontSize:12 }}>{b.manager}</td>
                <td style={S.td}>{b.members.toLocaleString()}</td>
                <td style={S.td}>{(b.active_policies||b.active||0).toLocaleString()}</td>
                <td style={S.td}>KES {(b.premiums/1000).toFixed(0)}K</td>
                <td style={S.td}>{b.claims_count||b.claims||0}</td>
                <td style={S.td}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:60 }}><ProgressBar value={b.loss_ratio||75} max={100} color={(b.loss_ratio||75)<80?"#10b981":"#ef4444"} /></div>
                    <span style={{ fontSize:11 }}>{b.loss_ratio||75}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BranchesPage;
