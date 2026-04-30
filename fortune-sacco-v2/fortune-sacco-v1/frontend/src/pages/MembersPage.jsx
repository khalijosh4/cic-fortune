import { useState, useEffect } from "react";
import { membersAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { StatCard, Badge, Btn, SearchBar, Field, Input, Select, AlertBox, Spinner, S } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";

const BRANCHES = ["NBI","MSA","KSM","NKR","ELD","THK","NYR","MRU","KTL","KRC","EMB","MCK","KKM","GRS","MLD","NNK","BGM","KSI","NVS","MRG"];
const BRANCH_NAMES = { NBI:"Nairobi HQ",MSA:"Mombasa",KSM:"Kisumu",NKR:"Nakuru",ELD:"Eldoret",THK:"Thika",NYR:"Nyeri",MRU:"Meru",KTL:"Kitale",KRC:"Kericho",EMB:"Embu",MCK:"Machakos",KKM:"Kakamega",GRS:"Garissa",MLD:"Malindi",NNK:"Nanyuki",BGM:"Bungoma",KSI:"Kisii",NVS:"Naivasha",MRG:"Muranga" };
const RATES = { "Individual":2100, "Family":4200, "Corporate Group":1850 };

export default function MembersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ member:"", branch:user.branch, coverType:"Individual", phone:"", email:"", dependants:0, idNumber:"" });
  const ff = v => setForm(f=>({...f,...v}));

  const load = async () => {
    try {
      const r = await membersAPI.getAll({ search });
      setMembers(r.data.data||[]);
    } catch { toast.error("Error","Could not load members."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [search]);

  const handleEnroll = async () => {
    if (!form.member.trim()) return toast.warning("Required","Member name is required.");
    setSubmitting(true);
    try {
      const r = await membersAPI.enroll(form);
      toast.success("Member Enrolled", `${form.member} enrolled. ID: ${r.data.data.memberId}`);
      setShowModal(false); setForm({ member:"", branch:user.branch, coverType:"Individual", phone:"", email:"", dependants:0, idNumber:"" }); load();
    } catch (e) { toast.error("Enrollment Failed", e.response?.data?.error||"Failed to enroll member."); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Spinner label="Loading members..." />;

  const myBranchCount = members.filter(m=>m.branch_id===user.branch).length;

  return (
    <div style={S.pageWrap}>
      <div style={S.pageHeader}><h2 style={S.pageTitle}>Member Management</h2><p style={S.pageSubtitle}>Enroll and manage SACCO members in health insurance</p></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:22 }}>
        <StatCard label="Total Enrolled"  value={members.length.toLocaleString()} icon="users"  color="#3b82f6" bg="#dbeafe" />
        <StatCard label="Active Policies" value={members.filter(m=>m.status==="Active").length} icon="checkCircle" color="#10b981" bg="#d1fae5" />
        <StatCard label={`My Branch (${user.branch})`} value={myBranchCount} icon="building" color="#f59e0b" bg="#fef3c7" />
      </div>
      <div style={S.card}>
        <div style={S.cardHeader}>
          <h3 style={S.cardTitle}>Enrolled Members</h3>
          <div style={{ display:"flex", gap:10 }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search members..." />
            <Btn onClick={()=>setShowModal(true)}><Icon name="plus" size={14}/>Enroll Member</Btn>
          </div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr>{["Member ID","Name","Branch","Cover Type","Premium/mo","Policy","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {members.map(m=>(
              <tr key={m.policy_id} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <td style={{ ...S.td, fontFamily:"monospace", fontSize:11 }}>{m.member_id}</td>
                <td style={{ ...S.td, fontWeight:600 }}>{m.member}</td>
                <td style={S.td}>{BRANCH_NAMES[m.branch_id]||m.branch_id}</td>
                <td style={S.td}><Badge label={m.cover_type}/></td>
                <td style={S.td}>KES {m.premium?.toLocaleString()}</td>
                <td style={{ ...S.td, fontFamily:"monospace", fontSize:11 }}>{m.policy_id}</td>
                <td style={S.td}><Badge label={m.status}/></td>
              </tr>
            ))}
            {members.length===0 && <tr><td colSpan={7} style={{ padding:32, textAlign:"center", color:"#94a3b8" }}>No members found</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={()=>setShowModal(false)} title="Enroll New Member"
        footer={<><Btn variant="outline" onClick={()=>setShowModal(false)}>Cancel</Btn><Btn onClick={handleEnroll} disabled={submitting}>{submitting?"Enrolling...":"Enroll Member"}</Btn></>}>
        <div style={S.grid2Form}>
          <Field label="Full Name / Company" span><Input value={form.member} onChange={v=>ff({member:v})} placeholder="Full legal name" /></Field>
          <Field label="National ID / Reg No."><Input value={form.idNumber} onChange={v=>ff({idNumber:v})} placeholder="12345678" /></Field>
          <Field label="Branch">
            <Select value={form.branch} onChange={v=>ff({branch:v})} disabled={user.role==="Branch Committee"}
              options={BRANCHES.map(b=>({value:b,label:BRANCH_NAMES[b]}))} />
          </Field>
          <Field label="Cover Type">
            <Select value={form.coverType} onChange={v=>ff({coverType:v})} options={["Individual","Family","Corporate Group"]} />
          </Field>
          <Field label="Phone"><Input value={form.phone} onChange={v=>ff({phone:v})} placeholder="07XX XXX XXX" /></Field>
          <Field label="Email"><Input value={form.email} onChange={v=>ff({email:v})} type="email" placeholder="member@email.com" /></Field>
          <Field label="Dependants"><Input value={form.dependants} onChange={v=>ff({dependants:Number(v)})} type="number" min="0" /></Field>
        </div>
        <AlertBox type="info">Enrollment creates a policy and a pending premium record. Monthly premium: <strong>KES {RATES[form.coverType]?.toLocaleString()}</strong></AlertBox>
      </Modal>
    </div>
  );
}
