import { useState, useEffect } from "react";
import { policiesAPI, branchesAPI, hospitalsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { StatCard, Badge, Btn, SearchBar, Table, Field, Input, Select, ProgressBar, InfoRow, AlertBox, Spinner, S } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";

const BRANCHES = ["NBI","MSA","KSM","NKR","ELD","THK","NYR","MRU","KTL","KRC","EMB","MCK","KKM","GRS","MLD","NNK","BGM","KSI","NVS","MRG"];
const BRANCH_NAMES = { NBI:"Nairobi HQ",MSA:"Mombasa",KSM:"Kisumu",NKR:"Nakuru",ELD:"Eldoret",THK:"Thika",NYR:"Nyeri",MRU:"Meru",KTL:"Kitale",KRC:"Kericho",EMB:"Embu",MCK:"Machakos",KKM:"Kakamega",GRS:"Garissa",MLD:"Malindi",NNK:"Nanyuki",BGM:"Bungoma",KSI:"Kisii",NVS:"Naivasha",MRG:"Muranga" };
const COVER_RATES  = { "Individual":2100, "Family":4200, "Corporate Group":1850 };
const COVER_LIMITS = { "Individual":{annual:250000,outpatient:40000,inpatient:200000}, "Family":{annual:500000,outpatient:75000,inpatient:400000}, "Corporate Group":{annual:2000000,outpatient:300000,inpatient:1500000} };

export default function PoliciesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [policies, setPolicies]   = useState([]);
  const [stats, setStats]         = useState({});
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ member:"", branch: user.branch, coverType:"Individual", phone:"", email:"", dependants:0 });

  const load = async () => {
    try {
      const [polRes, statRes] = await Promise.all([policiesAPI.getAll({ search }), policiesAPI.getStats()]);
      setPolicies(polRes.data.data || []);
      setStats(statRes.data.data || {});
    } catch { toast.error("Load failed", "Could not fetch policies."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const ff = v => setForm(f => ({ ...f, ...v }));

  const handleCreate = async () => {
    if (!form.member.trim()) return toast.warning("Required", "Member name is required.");
    setSubmitting(true);
    try {
      await policiesAPI.create(form);
      toast.success("Policy Created", `Policy created for ${form.member}`);
      setShowCreate(false); setForm({ member:"", branch:user.branch, coverType:"Individual", phone:"", email:"", dependants:0 }); load();
    } catch (e) { toast.error("Error", e.response?.data?.error || "Failed to create policy."); }
    finally { setSubmitting(false); }
  };

  const handleRenew = async (id) => {
    try {
      await policiesAPI.renew(id);
      toast.success("Policy Renewed", "Policy renewed for another year."); load();
    } catch (e) { toast.error("Error", e.response?.data?.error || "Failed to renew."); }
  };

  const viewPolicy = async (p) => {
    try {
      const r = await policiesAPI.getById(p.id);
      setViewing(r.data.data);
    } catch { setViewing(p); }
  };

  if (loading) return <Spinner label="Loading policies..." />;

  return (
    <div style={S.pageWrap}>
      <div style={S.pageHeader}>
        <h2 style={S.pageTitle}>Health Policies</h2>
        <p style={S.pageSubtitle}>Manage member insurance policies and coverage limits</p>
      </div>

      <div style={S.statsGrid}>
        <StatCard label="Total Policies" value={stats.total || 0}   icon="fileText"   color="#3b82f6" bg="#dbeafe" />
        <StatCard label="Active"         value={stats.active || 0}  icon="checkCircle" color="#10b981" bg="#d1fae5" />
        <StatCard label="Expired"        value={stats.expired || 0} icon="xCircle"    color="#ef4444" bg="#fee2e2" />
        <StatCard label="Pending"        value={stats.pending || 0} icon="clock"      color="#f59e0b" bg="#fef3c7" />
      </div>

      <div style={S.card}>
        <div style={S.cardHeader}>
          <h3 style={S.cardTitle}>All Policies</h3>
          <div style={{ display:"flex", gap:10 }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search policies..." />
            <Btn onClick={() => setShowCreate(true)}><Icon name="plus" size={14}/>New Policy</Btn>
          </div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr>{["Policy ID","Member","Branch","Cover Type","Premium/mo","Expiry","Utilised","Status","Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {policies.map(p => (
              <tr key={p.id} style={{ cursor:"pointer" }} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <td style={S.td} onClick={() => viewPolicy(p)}><span style={{ fontFamily:"monospace", fontSize:11 }}>{p.id}</span></td>
                <td style={S.td} onClick={() => viewPolicy(p)}>
                  <div style={{ fontWeight:600 }}>{p.member}</div>
                  <div style={{ fontSize:11, color:"#64748b" }}>{p.member_id}</div>
                </td>
                <td style={S.td}>{BRANCH_NAMES[p.branch_id] || p.branch_id}</td>
                <td style={S.td}><Badge label={p.cover_type} /></td>
                <td style={S.td}>KES {p.premium?.toLocaleString()}</td>
                <td style={{ ...S.td, fontSize:12 }}>{p.expiry_date}</td>
                <td style={S.td}>
                  <div style={{ fontSize:12, marginBottom:4 }}>KES {(p.utilised||0).toLocaleString()} / {p.annual_limit?.toLocaleString()}</div>
                  <ProgressBar value={p.utilised||0} max={p.annual_limit||1} color="#3b82f6" />
                </td>
                <td style={S.td}><Badge label={p.status} /></td>
                <td style={S.td} onClick={e=>e.stopPropagation()}>
                  {p.status === "Expired" ? <Btn variant="outline" size="sm" onClick={() => handleRenew(p.id)}>Renew</Btn>
                    : <Btn variant="ghost" size="sm" onClick={() => viewPolicy(p)}><Icon name="eye" size={13}/></Btn>}
                </td>
              </tr>
            ))}
            {policies.length === 0 && <tr><td colSpan={9} style={{ padding:32, textAlign:"center", color:"#94a3b8" }}>No policies found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Policy"
        footer={<><Btn variant="outline" onClick={() => setShowCreate(false)}>Cancel</Btn><Btn onClick={handleCreate} disabled={submitting}>{submitting ? "Creating..." : "Create Policy"}</Btn></>}>
        <div style={S.grid2Form}>
          <Field label="Member Name / Company" span><Input value={form.member} onChange={v=>ff({member:v})} placeholder="Full legal name" /></Field>
          <Field label="Branch">
            <Select value={form.branch} onChange={v=>ff({branch:v})} disabled={user.role==="Branch Committee"}
              options={BRANCHES.map(b => ({ value:b, label:BRANCH_NAMES[b] }))} />
          </Field>
          <Field label="Cover Type">
            <Select value={form.coverType} onChange={v=>ff({coverType:v})} options={["Individual","Family","Corporate Group"]} />
          </Field>
          <Field label="Phone"><Input value={form.phone} onChange={v=>ff({phone:v})} placeholder="07XX XXX XXX" /></Field>
          <Field label="Email"><Input value={form.email} onChange={v=>ff({email:v})} type="email" placeholder="member@email.com" /></Field>
          <Field label="Dependants"><Input value={form.dependants} onChange={v=>ff({dependants:Number(v)})} type="number" min="0" /></Field>
        </div>
        <AlertBox type="info">
          <strong>Auto-calculated:</strong> Monthly premium: KES {COVER_RATES[form.coverType]?.toLocaleString()} &nbsp;|&nbsp; Annual limit: KES {COVER_LIMITS[form.coverType]?.annual?.toLocaleString()} &nbsp;|&nbsp; Start today, expires 1 year
        </AlertBox>
      </Modal>

      {/* View / Detail Modal */}
      {viewing && (
        <Modal open={!!viewing} onClose={() => setViewing(null)} title={`${viewing.id} — ${viewing.member}`} size="lg"
          footer={<>
            {viewing.status==="Expired" && <Btn variant="accent" onClick={()=>{handleRenew(viewing.id);setViewing(null);}}>Renew Policy</Btn>}
            <Btn variant="outline" onClick={()=>setViewing(null)}>Close</Btn>
          </>}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
            {[["Status",<Badge label={viewing.status}/>],["Cover Type",viewing.cover_type],["Branch",BRANCH_NAMES[viewing.branch_id]||viewing.branch_id],["Phone",viewing.phone||"—"],["Email",viewing.email||"—"],["Dependants",viewing.dependants??0]].map(([l,v])=>(
              <div key={l} style={{ background:"#f8fafc", borderRadius:8, padding:12 }}>
                <div style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", marginBottom:4 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:600 }}>{v}</div>
              </div>
            ))}
          </div>
          <h4 style={{ fontFamily:"Sora,sans-serif", fontSize:14, fontWeight:700, marginBottom:12, color:"#1e293b" }}>Coverage Utilisation</h4>
          {[["Outpatient",viewing.outpatient_used||0,viewing.outpatient_limit,"#3b82f6"],["Inpatient",viewing.inpatient_used||0,viewing.inpatient_limit,"#10b981"],["Maternity",viewing.maternity_used||0,viewing.maternity_limit,"#f59e0b"],["Dental",viewing.dental_used||0,viewing.dental_limit,"#8b5cf6"],["Optical",viewing.optical_used||0,viewing.optical_limit,"#ec4899"]].filter(([,, lim])=>lim>0).map(([label,used,limit,color])=>(
            <div key={label} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                <span style={{ fontWeight:600 }}>{label}</span>
                <span style={{ color:"#64748b" }}>KES {used.toLocaleString()} / {limit.toLocaleString()} ({Math.round((used/limit)*100)}%)</span>
              </div>
              <ProgressBar value={used} max={limit} color={color} height={8} />
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}
