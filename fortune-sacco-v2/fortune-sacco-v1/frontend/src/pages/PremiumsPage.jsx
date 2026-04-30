// ═══════════════════════════════════════════════════════════════
// PremiumsPage.jsx
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { premiumsAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { StatCard, Badge, Btn, Spinner, S } from "../components/UI";
import Icon from "../components/Icon";

export function PremiumsPage() {
  const { toast } = useToast();
  const [premiums, setPremiums] = useState([]);
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [running, setRunning]   = useState(false);

  const load = async () => {
    try {
      const [pRes, sRes] = await Promise.all([premiumsAPI.getAll(), premiumsAPI.getStats()]);
      setPremiums(pRes.data.data||[]);
      setStats(sRes.data.data||{});
    } catch { toast.error("Error","Could not load premiums."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handlePay = async (id) => {
    try {
      const r = await premiumsAPI.pay(id, { method:"SACCO Deduction" });
      toast.success("Payment Processed", `Receipt: ${r.data.receiptNo}`);
      load();
    } catch (e) { toast.error("Error", e.response?.data?.error || "Payment failed."); }
  };

  const handleAutoDeduct = async () => {
    setRunning(true);
    try {
      const r = await premiumsAPI.autoDeduct();
      toast.success("Auto-Deduction Complete", `${r.data.data.processed}/${r.data.data.total} premiums processed.`);
      load();
    } catch { toast.error("Error","Auto-deduction failed."); }
    finally { setRunning(false); }
  };

  if (loading) return <Spinner label="Loading premiums..." />;

  return (
    <div style={S.pageWrap}>
      <div style={S.pageHeader}><h2 style={S.pageTitle}>Premium Management</h2><p style={S.pageSubtitle}>Track and process monthly premium payments</p></div>
      <div style={S.statsGrid}>
        <StatCard label="Collected"   value={`KES ${((stats.collected||0)/1000000).toFixed(2)}M`} icon="checkCircle" color="#10b981" bg="#d1fae5" />
        <StatCard label="Missed"      value={stats.missed_count||0} icon="xCircle" color="#ef4444" bg="#fee2e2" />
        <StatCard label="Pending"     value={stats.pending_count||0} icon="clock" color="#f59e0b" bg="#fef3c7" />
        <StatCard label="Outstanding" value={`KES ${((stats.outstanding||0)).toLocaleString()}`} icon="dollar" color="#7c3aed" bg="#ede9fe" />
      </div>
      <div style={S.card}>
        <div style={S.cardHeader}>
          <h3 style={S.cardTitle}>Premium Records</h3>
          <Btn variant="accent" onClick={handleAutoDeduct} disabled={running}><Icon name="zap" size={13}/>{running?"Processing...":"Run Auto-Deduction"}</Btn>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr>{["Member","Policy","Branch","Due","Paid","Due Date","Status","Receipt","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {premiums.map(p=>(
              <tr key={p.id} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <td style={{ ...S.td, fontWeight:600, fontSize:12 }}>{p.member}</td>
                <td style={{ ...S.td, fontFamily:"monospace", fontSize:11 }}>{p.policy_id}</td>
                <td style={S.td}>{p.branch_id}</td>
                <td style={S.td}>KES {p.due?.toLocaleString()}</td>
                <td style={{ ...S.td, fontWeight:600, color: p.paid>0?"#10b981":"#94a3b8" }}>KES {(p.paid||0).toLocaleString()}</td>
                <td style={{ ...S.td, fontSize:11 }}>{p.due_date}</td>
                <td style={S.td}><Badge label={p.status}/></td>
                <td style={{ ...S.td, fontFamily:"monospace", fontSize:11 }}>{p.receipt_no||"—"}</td>
                <td style={S.td}>{p.status!=="Paid" && <Btn variant="success" size="sm" onClick={()=>handlePay(p.id)}>Process</Btn>}</td>
              </tr>
            ))}
            {premiums.length===0 && <tr><td colSpan={9} style={{ padding:32, textAlign:"center", color:"#94a3b8" }}>No premium records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PremiumsPage;
