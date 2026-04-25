import { useState, useEffect } from "react";
import { claimsAPI, policiesAPI, hospitalsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { StatCard, Badge, Btn, SearchBar, Field, Input, Select, AlertBox, Spinner, S } from "../components/UI";
import Modal from "../components/Modal";
import Icon from "../components/Icon";

export default function ClaimsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [claims, setClaims]     = useState([]);
  const [stats, setStats]       = useState({});
  const [policies, setPolicies] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const [reviewing, setReviewing]   = useState(null);
  const [step, setStep]   = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ policy:"", hospital:"", category:"Outpatient", amount:"", diagnosis:"", docs:[] });
  const [reviewForm, setReviewForm] = useState({ decision:"Approved", approvedAmount:"", notes:"" });

  const canReview = ["System Admin","HR/CEO","Claims Officer"].includes(user?.role);
  const ff = v => setForm(f=>({...f,...v}));
  const rf = v => setReviewForm(f=>({...f,...v}));

  const load = async () => {
    try {
      const params = { search };
      if (filterStatus) params.status = filterStatus;
      const [cRes, sRes] = await Promise.all([claimsAPI.getAll(params), claimsAPI.getStats()]);
      setClaims(cRes.data.data || []);
      setStats(sRes.data.data || {});
    } catch { toast.error("Error","Could not load claims."); }
    finally { setLoading(false); }
  };

  const loadFormData = async () => {
    const [polRes, hospRes] = await Promise.all([policiesAPI.getAll({status:"Active",limit:100}), hospitalsAPI.getAll({status:"Active"})]);
    setPolicies(polRes.data.data || []);
    setHospitals(hospRes.data.data || []);
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const handleOpenSubmit = () => { loadFormData(); setShowSubmit(true); setStep(1); };

  const handleSubmitClaim = async () => {
    if (!form.policy || !form.hospital || !form.amount || !form.diagnosis) return toast.warning("Required","Fill all fields.");
    setSubmitting(true);
    try {
      await claimsAPI.submit(form);
      toast.success("Claim Submitted", `Claim submitted for review.`);
      setShowSubmit(false); setForm({policy:"",hospital:"",category:"Outpatient",amount:"",diagnosis:"",docs:[]}); setStep(1); load();
    } catch (e) { toast.error("Submission Failed", e.response?.data?.error || "Could not submit claim."); }
    finally { setSubmitting(false); }
  };

  const handleReview = async () => {
    if (!reviewing) return;
    setSubmitting(true);
    try {
      await claimsAPI.review(reviewing.id, reviewForm);
      toast.success("Review Complete", `Claim ${reviewForm.decision.toLowerCase()}.`);
      setReviewing(null); load();
    } catch (e) { toast.error("Error", e.response?.data?.error || "Review failed."); }
    finally { setSubmitting(false); }
  };

  const openReview = (c) => { setReviewing(c); setReviewForm({ decision:"Approved", approvedAmount:String(c.amount), notes:"" }); };

  if (loading) return <Spinner label="Loading claims..." />;

  return (
    <div style={S.pageWrap}>
      <div style={S.pageHeader}>
        <h2 style={S.pageTitle}>Claims Management</h2>
        <p style={S.pageSubtitle}>Submit, track and review insurance claims in real-time</p>
      </div>

      <div style={S.statsGrid}>
        <StatCard label="Total Claims"   value={stats.total||0}    icon="activity"   color="#3b82f6" bg="#dbeafe" />
        <StatCard label="Pending Review" value={stats.pending||0}  icon="clock"      color="#f59e0b" bg="#fef3c7" />
        <StatCard label="Approved"       value={stats.approved||0} icon="checkCircle" color="#10b981" bg="#d1fae5" />
        <StatCard label="Rejected"       value={stats.rejected||0} icon="xCircle"    color="#ef4444" bg="#fee2e2" />
      </div>

      <div style={S.card}>
        <div style={S.cardHeader}>
          <h3 style={S.cardTitle}>Claims Register</h3>
          <div style={{ display:"flex", gap:8 }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search claims..." />
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ padding:"7px 10px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:12, fontFamily:"DM Sans,sans-serif", cursor:"pointer" }}>
              <option value="">All Statuses</option>
              {["Pending","Approved","Partial","Rejected"].map(s=><option key={s}>{s}</option>)}
            </select>
            <Btn onClick={handleOpenSubmit}><Icon name="plus" size={14}/>New Claim</Btn>
          </div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr>{["Claim ID","Member","Hospital","Category","Amount","Approved","Date","Status",...(canReview?["Action"]:[])].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {claims.map(c=>(
              <tr key={c.id} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <td style={{ ...S.td, fontFamily:"monospace", fontSize:11 }}>{c.id}</td>
                <td style={S.td}><div style={{ fontWeight:600, fontSize:12 }}>{c.member?.split(" ").slice(0,2).join(" ")}</div><div style={{ fontSize:11, color:"#64748b" }}>{c.diagnosis}</div></td>
                <td style={{ ...S.td, fontSize:12 }}>{c.hospital}</td>
                <td style={S.td}><Badge label={c.category}/></td>
                <td style={S.td}>KES {c.amount?.toLocaleString()}</td>
                <td style={{ ...S.td, fontWeight:600, color: c.approved_amount ? "#10b981" : "#94a3b8" }}>{c.approved_amount ? `KES ${c.approved_amount.toLocaleString()}` : "—"}</td>
                <td style={{ ...S.td, fontSize:11 }}>{c.date}</td>
                <td style={S.td}><Badge label={c.status}/></td>
                {canReview && <td style={S.td}>{c.status==="Pending" && <Btn variant="outline" size="sm" onClick={()=>openReview(c)}>Review</Btn>}</td>}
              </tr>
            ))}
            {claims.length===0 && <tr><td colSpan={canReview?9:8} style={{ padding:32, textAlign:"center", color:"#94a3b8" }}>No claims found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Submit Claim Wizard */}
      <Modal open={showSubmit} onClose={()=>{setShowSubmit(false);setStep(1);}} title={`Submit Claim — Step ${step}/3`}
        footer={<>
          {step>1 && <Btn variant="outline" onClick={()=>setStep(s=>s-1)}>Back</Btn>}
          <Btn variant="outline" onClick={()=>{setShowSubmit(false);setStep(1);}}>Cancel</Btn>
          {step<3 ? <Btn onClick={()=>setStep(s=>s+1)} disabled={step===1&&(!form.policy||!form.hospital)}>Next <Icon name="arrowRight" size={13}/></Btn>
            : <Btn onClick={handleSubmitClaim} disabled={submitting||!form.amount||!form.diagnosis}>{submitting?"Submitting...":"Submit Claim"}</Btn>}
        </>}>

        {/* Step indicator */}
        <div style={{ display:"flex", gap:6, marginBottom:20 }}>
          {["Claim Info","Medical Details","Review & Submit"].map((s,i)=>(
            <div key={s} style={{ flex:1, textAlign:"center", padding:6, borderRadius:6, fontSize:11, fontWeight:600, background: step>i?(step===i+1?"#0a3d62":"#d1fae5"):"#f1f5f9", color: step>i?(step===i+1?"white":"#065f46"):"#64748b" }}>{s}</div>
          ))}
        </div>

        {step===1 && (
          <div style={S.grid2Form}>
            <Field label="Policy" span>
              <Select value={form.policy} onChange={v=>ff({policy:v})} options={[{value:"",label:"Select active policy..."}, ...policies.map(p=>({value:p.id,label:`${p.id} — ${p.member} (${p.cover_type})`}))]} />
            </Field>
            <Field label="Hospital" span>
              <Select value={form.hospital} onChange={v=>ff({hospital:v})} options={[{value:"",label:"Select hospital..."}, ...hospitals.map(h=>({value:h.name,label:`${h.name} — ${h.location}`}))]} />
            </Field>
            <Field label="Category">
              <Select value={form.category} onChange={v=>ff({category:v})} options={["Outpatient","Inpatient","Maternity","Dental","Optical"]} />
            </Field>
          </div>
        )}

        {step===2 && (
          <div style={S.grid2Form}>
            <Field label="Claim Amount (KES)"><Input value={form.amount} onChange={v=>ff({amount:v})} type="number" placeholder="0" /></Field>
            <Field label="Diagnosis / Description" span><Input value={form.diagnosis} onChange={v=>ff({diagnosis:v})} placeholder="Primary diagnosis or procedure" /></Field>
            <Field label="Supporting Documents" span>
              <div style={{ border:"2px dashed #e2e8f0", borderRadius:8, padding:20, textAlign:"center", cursor:"pointer", color:"#94a3b8" }} onClick={()=>ff({docs:[...form.docs,`Document_${form.docs.length+1}.pdf`]})}>
                <Icon name="upload" size={24} style={{ margin:"0 auto 8px", display:"block" }} />
                <div style={{ fontSize:13 }}>Click to add document</div>
                <div style={{ marginTop:8, display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
                  {form.docs.map((d,i)=><span key={i} style={{ background:"#dbeafe", color:"#1e40af", padding:"2px 8px", borderRadius:12, fontSize:11, fontWeight:600 }}>{d}</span>)}
                </div>
              </div>
            </Field>
          </div>
        )}

        {step===3 && (
          <div>
            <AlertBox type="info"><strong>Review your claim before submission</strong></AlertBox>
            {[["Policy",form.policy],["Hospital",form.hospital],["Category",form.category],["Amount",`KES ${Number(form.amount).toLocaleString()}`],["Diagnosis",form.diagnosis],["Documents",form.docs.join(", ")||"None"]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f1f5f9", fontSize:13 }}>
                <span style={{ color:"#64748b" }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Review Modal */}
      {reviewing && (
        <Modal open={!!reviewing} onClose={()=>setReviewing(null)} title={`Review Claim: ${reviewing.id}`}
          footer={<>
            <Btn variant="outline" onClick={()=>setReviewing(null)}>Cancel</Btn>
            <Btn variant={reviewForm.decision==="Approved"?"success":reviewForm.decision==="Partial"?"accent":"danger"} onClick={handleReview} disabled={submitting}>
              {submitting?"Processing...":reviewForm.decision==="Approved"?"Approve Claim":reviewForm.decision==="Partial"?"Partial Approval":"Reject Claim"}
            </Btn>
          </>}>
          <div style={{ background:"#f8fafc", borderRadius:8, padding:14, marginBottom:16 }}>
            {[["Member",reviewing.member],["Policy",reviewing.policy_id||reviewing.policy],["Hospital",reviewing.hospital],["Category",reviewing.category],["Diagnosis",reviewing.diagnosis],["Claimed Amount",`KES ${reviewing.amount?.toLocaleString()}`]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", fontSize:13, borderBottom:"1px solid #f1f5f9" }}>
                <span style={{ color:"#64748b" }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
          <Field label="Decision">
            <Select value={reviewForm.decision} onChange={v=>rf({decision:v})} options={["Approved","Partial","Rejected"]} />
          </Field>
          {(reviewForm.decision==="Approved"||reviewForm.decision==="Partial") && (
            <Field label="Approved Amount (KES)"><Input value={reviewForm.approvedAmount} onChange={v=>rf({approvedAmount:v})} type="number" /></Field>
          )}
          <Field label="Review Notes">
            <textarea value={reviewForm.notes} onChange={e=>rf({notes:e.target.value})} rows={3} placeholder="Add notes for this decision..." style={{ ...S.input, resize:"vertical" }} />
          </Field>
        </Modal>
      )}
    </div>
  );
}
