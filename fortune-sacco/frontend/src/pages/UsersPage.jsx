import { useState, useEffect } from "react";
import { usersAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Badge, Btn, Field, Input, Select, AlertBox, Spinner, S } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";

const BRANCHES = ["NBI","MSA","KSM","NKR","ELD","THK","NYR","MRU","KTL","KRC","EMB","MCK","KKM","GRS","MLD","NNK","BGM","KSI","NVS","MRG"];
const BRANCH_NAMES = { NBI:"Nairobi HQ",MSA:"Mombasa",KSM:"Kisumu",NKR:"Nakuru",ELD:"Eldoret",THK:"Thika",NYR:"Nyeri",MRU:"Meru",KTL:"Kitale",KRC:"Kericho",EMB:"Embu",MCK:"Machakos",KKM:"Kakamega",GRS:"Garissa",MLD:"Malindi",NNK:"Nanyuki",BGM:"Bungoma",KSI:"Kisii",NVS:"Naivasha",MRG:"Muranga" };

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"Branch Committee", branch:"NBI" });
  const ff = v => setForm(f=>({...f,...v}));

  const load = async () => {
    try { const r = await usersAPI.getAll(); setUsers(r.data.data||[]); }
    catch { toast.error("Error","Could not load users."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name||!form.email||!form.password) return toast.warning("Required","Fill all fields.");
    setSubmitting(true);
    try {
      await usersAPI.create(form);
      toast.success("User Created", `${form.email} created as ${form.role}`);
      setShowModal(false); setForm({ name:"",email:"",password:"",role:"Branch Committee",branch:"NBI" }); load();
    } catch (e) { toast.error("Error", e.response?.data?.error||"Failed to create user."); }
    finally { setSubmitting(false); }
  };

  const handleToggle = async (u) => {
    try {
      await usersAPI.toggle(u.id);
      toast.success("Updated", `${u.email} ${u.active?"deactivated":"activated"}.`);
      load();
    } catch (e) { toast.error("Error", e.response?.data?.error||"Failed."); }
  };

  const handleUnlock = async (u) => {
    try { await usersAPI.unlock(u.id); toast.success("Unlocked", `${u.email} account unlocked.`); load(); }
    catch { toast.error("Error","Could not unlock."); }
  };

  if (loading) return <Spinner label="Loading users..." />;

  return (
    <div style={S.pageWrap}>
      <div style={S.pageHeader}><h2 style={S.pageTitle}>User Management</h2><p style={S.pageSubtitle}>Manage system users, roles and access permissions</p></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        {[["Total Users",users.length],["Active",users.filter(u=>u.active).length],["Inactive",users.filter(u=>!u.active).length],["Admins",users.filter(u=>u.role==="System Admin").length]].map(([l,v])=>(
          <div key={l} style={S.statCard}><div style={S.statLabel}>{l}</div><div style={S.statValue}>{v}</div></div>
        ))}
      </div>
      <div style={S.card}>
        <div style={S.cardHeader}>
          <h3 style={S.cardTitle}>System Users</h3>
          <Btn onClick={()=>setShowModal(true)}><Icon name="plus" size={14}/>Add User</Btn>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr>{["Name","Email","Role","Branch","Last Login","Status","Failed","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <td style={S.td}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:30, height:30, background:"#f59e0b", color:"#0a2540", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{u.avatar||u.name?.slice(0,2)}</div>
                    <span style={{ fontWeight:600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ ...S.td, fontSize:12 }}>{u.email}</td>
                <td style={S.td}><Badge label={u.role}/></td>
                <td style={S.td}>{BRANCH_NAMES[u.branch_id]||u.branch_id}</td>
                <td style={{ ...S.td, fontSize:11 }}>{u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never"}</td>
                <td style={S.td}><Badge label={u.active?"Active":"Inactive"}/></td>
                <td style={{ ...S.td, color: u.failed_attempts>2?"#ef4444":"#1e293b", fontWeight: u.failed_attempts>2?700:400 }}>{u.failed_attempts||0}</td>
                <td style={S.td}>
                  <div style={{ display:"flex", gap:6 }}>
                    <Btn variant="outline" size="sm" onClick={()=>handleToggle(u)}>{u.active?"Deactivate":"Activate"}</Btn>
                    {u.failed_attempts>0 && <Btn variant="ghost" size="sm" onClick={()=>handleUnlock(u)}>Unlock</Btn>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={()=>setShowModal(false)} title="Create New User"
        footer={<><Btn variant="outline" onClick={()=>setShowModal(false)}>Cancel</Btn><Btn onClick={handleCreate} disabled={submitting}>{submitting?"Creating...":"Create User"}</Btn></>}>
        <div style={S.grid2Form}>
          <Field label="Full Name" span><Input value={form.name} onChange={v=>ff({name:v})} placeholder="Full name" /></Field>
          <Field label="Email"><Input value={form.email} onChange={v=>ff({email:v})} type="email" placeholder="user@fortunesacco.co.ke" /></Field>
          <Field label="Password"><Input value={form.password} onChange={v=>ff({password:v})} type="password" placeholder="Min 8 characters" /></Field>
          <Field label="Role">
            <Select value={form.role} onChange={v=>ff({role:v})} options={["System Admin","HR/CEO","Claims Officer","Branch Committee"]} />
          </Field>
          <Field label="Branch">
            <Select value={form.branch} onChange={v=>ff({branch:v})} options={BRANCHES.map(b=>({value:b,label:BRANCH_NAMES[b]}))} />
          </Field>
        </div>
        <AlertBox type="warning">Passwords must be at least 8 characters. Users will be required to change their password on first login.</AlertBox>
      </Modal>
    </div>
  );
}
