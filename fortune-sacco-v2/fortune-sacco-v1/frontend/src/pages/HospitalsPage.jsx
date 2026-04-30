import { useState, useEffect } from "react";
import { hospitalsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { StatCard, Badge, Btn, SearchBar, Field, Input, Select, ProgressBar, Spinner, S } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";

export default function HospitalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name:"", code:"", location:"", type:"Private", limit:"500000", contact:"", nhifAccredited:false });
  const canManage = ["System Admin","HR/CEO"].includes(user?.role);
  const ff = v => setForm(f=>({...f,...v}));

  const load = async () => {
    try { const r = await hospitalsAPI.getAll(); setHospitals(r.data.data||[]); }
    catch { toast.error("Error","Could not load hospitals."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = hospitals.filter(h => `${h.name}${h.location}${h.code}`.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    if (!form.name||!form.code||!form.location) return toast.warning("Required","Fill all required fields.");
    setSubmitting(true);
    try {
      await hospitalsAPI.add(form);
      toast.success("Hospital Added", `${form.name} added to network.`);
      setShowModal(false); setForm({ name:"", code:"", location:"", type:"Private", limit:"500000", contact:"", nhifAccredited:false }); load();
    } catch (e) { toast.error("Error", e.response?.data?.error||"Failed to add hospital."); }
    finally { setSubmitting(false); }
  };

  const handleToggle = async (id, name) => {
    try { await hospitalsAPI.toggle(id); toast.success("Updated", `${name} status toggled.`); load(); }
    catch (e) { toast.error("Error", e.response?.data?.error||"Failed to update status."); }
  };

  if (loading) return <Spinner label="Loading hospitals..." />;

  return (
    <div style={S.pageWrap}>
      <div style={S.pageHeader}><h2 style={S.pageTitle}>Hospital Network</h2><p style={S.pageSubtitle}>Manage CIC-approved healthcare providers across Kenya</p></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:22 }}>
        <StatCard label="Total Providers"  value={hospitals.length} icon="hospital" color="#3b82f6" bg="#dbeafe" />
        <StatCard label="Active"           value={hospitals.filter(h=>h.status==="Active").length} icon="checkCircle" color="#10b981" bg="#d1fae5" />
        <StatCard label="NHIF Accredited"  value={hospitals.filter(h=>h.nhif_accredited).length} icon="shield" color="#7c3aed" bg="#ede9fe" />
      </div>
      <div style={S.card}>
        <div style={S.cardHeader}>
          <h3 style={S.cardTitle}>Approved Hospital Network</h3>
          <div style={{ display:"flex", gap:10 }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search hospitals..." />
            {canManage && <Btn onClick={()=>setShowModal(true)}><Icon name="plus" size={14}/>Add Hospital</Btn>}
          </div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr>{["Code","Hospital","Location","Type","Claim Limit","Claims/mo","NHIF","Status",...(canManage?["Action"]:[])].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(h=>(
              <tr key={h.id} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <td style={{ ...S.td, fontFamily:"monospace", fontSize:11 }}>{h.code}</td>
                <td style={{ ...S.td, fontWeight:600 }}>{h.name}</td>
                <td style={S.td}>{h.location}</td>
                <td style={S.td}><Badge label={h.type}/></td>
                <td style={S.td}>KES {h.claim_limit?.toLocaleString()}</td>
                <td style={S.td}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ flex:1 }}><ProgressBar value={h.claims_month||0} max={100} color="#3b82f6" /></div>
                    <span style={{ fontSize:11, minWidth:20 }}>{h.claims_month||0}</span>
                  </div>
                </td>
                <td style={S.td}><Badge label={h.nhif_accredited?"Yes":"No"}/></td>
                <td style={S.td}><Badge label={h.status}/></td>
                {canManage && <td style={S.td}><Btn variant="outline" size="sm" onClick={()=>handleToggle(h.id,h.name)}>{h.status==="Active"?"Deactivate":"Activate"}</Btn></td>}
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={canManage?9:8} style={{ padding:32, textAlign:"center", color:"#94a3b8" }}>No hospitals found</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={()=>setShowModal(false)} title="Add Hospital to Network"
        footer={<><Btn variant="outline" onClick={()=>setShowModal(false)}>Cancel</Btn><Btn onClick={handleAdd} disabled={submitting}>{submitting?"Adding...":"Add Hospital"}</Btn></>}>
        <div style={S.grid2Form}>
          <Field label="Hospital Name" span><Input value={form.name} onChange={v=>ff({name:v})} placeholder="Full hospital name" /></Field>
          <Field label="CIC Code"><Input value={form.code} onChange={v=>ff({code:v})} placeholder="HOA-XXX" /></Field>
          <Field label="Location"><Input value={form.location} onChange={v=>ff({location:v})} placeholder="City/Town" /></Field>
          <Field label="Type"><Select value={form.type} onChange={v=>ff({type:v})} options={["Private","County","Teaching","Clinic","Specialist","Referral"]} /></Field>
          <Field label="Claim Limit (KES)"><Input value={form.limit} onChange={v=>ff({limit:v})} type="number" placeholder="500000" /></Field>
          <Field label="Contact"><Input value={form.contact} onChange={v=>ff({contact:v})} placeholder="Phone number" /></Field>
          <Field label="NHIF Accredited" span>
            <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, cursor:"pointer" }}>
              <input type="checkbox" checked={form.nhifAccredited} onChange={e=>ff({nhifAccredited:e.target.checked})} />
              NHIF Accredited
            </label>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
