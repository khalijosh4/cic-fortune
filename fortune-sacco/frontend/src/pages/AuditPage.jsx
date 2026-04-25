import { useState, useEffect } from "react";
import { auditAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Badge, Btn, SearchBar, Spinner, S } from "../components/UI";
import Icon from "../components/Icon";

export default function AuditPage() {
  const { toast } = useToast();
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await auditAPI.getAll({ type: filter !== "all" ? filter : undefined, search });
      setLogs(r.data.data||[]);
    } catch { toast.error("Error","Could not load audit logs."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter, search]);

  return (
    <div style={S.pageWrap}>
      <div style={S.pageHeader}><h2 style={S.pageTitle}>Audit Logs</h2><p style={S.pageSubtitle}>Real-time system activity, security events and compliance trail</p></div>
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        {["all","security","claims","policy","finance","member"].map(t=>(
          <Btn key={t} variant={filter===t?"primary":"outline"} size="sm" onClick={()=>setFilter(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</Btn>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search logs..." />
          <Btn variant="outline" size="sm" onClick={load}><Icon name="refresh" size={13}/>Refresh</Btn>
        </div>
      </div>
      <div style={S.card}>
        {loading ? <div style={{ padding:32, textAlign:"center", color:"#94a3b8" }}>Loading...</div> : (
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead><tr>{["Time","User","Role","Branch","Action","Module","IP","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {logs.map(l=>(
                <tr key={l.id} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                  <td style={{ ...S.td, fontFamily:"monospace", fontSize:11, whiteSpace:"nowrap" }}>{new Date(l.timestamp).toLocaleTimeString()}</td>
                  <td style={{ ...S.td, fontSize:12 }}>{l.user_email}</td>
                  <td style={{ ...S.td, fontSize:11 }}>{l.user_role}</td>
                  <td style={{ ...S.td, fontSize:12 }}>{l.branch_name||"—"}</td>
                  <td style={{ ...S.td, fontSize:12, maxWidth:300 }}>{l.action}</td>
                  <td style={S.td}>{l.module&&<Badge label={l.type||"general"}/>}</td>
                  <td style={{ ...S.td, fontFamily:"monospace", fontSize:11 }}>{l.ip_address}</td>
                  <td style={S.td}><Badge label={l.status}/></td>
                </tr>
              ))}
              {logs.length===0 && <tr><td colSpan={8} style={{ padding:32, textAlign:"center", color:"#94a3b8" }}>No audit logs found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
