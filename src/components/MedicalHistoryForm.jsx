import { useState, useRef } from "react";

// ── Config ────────────────────────────────────────────────────────────────────
const NETLIFY_FN = "/.netlify/functions/send-medical-history";

// ── Medical conditions ────────────────────────────────────────────────────────
const CONDITIONS_1 = [
  { id: "rheumaticFever",  label: "Rheumatic fever",                                              group: "Heart & Circulation" },
  { id: "heartDisease",    label: "Heart disease, defect or murmur" },
  { id: "angina",          label: "Angina or chest pains" },
  { id: "heartAttack",     label: "Heart attack" },
  { id: "pacemaker",       label: "Pacemaker or defibrillator" },
  { id: "highBP",          label: "High blood pressure (hypertension)" },
  { id: "stroke",          label: "Stroke or TIA (mini-stroke)" },
  { id: "bloodDisorders",  label: "Blood disorders or anaemia",                                   group: "Blood" },
  { id: "bleedingProbs",   label: "Bleeding problems or haemophilia" },
  { id: "bloodThinners",   label: "Blood thinning medication (warfarin, apixaban, rivaroxaban, aspirin)" },
  { id: "asthma",          label: "Asthma",                                                       group: "Respiratory" },
  { id: "copd",            label: "Bronchitis or COPD" },
  { id: "epilepsy",        label: "Epilepsy or seizures",                                         group: "Neurological" },
  { id: "fainting",        label: "Fainting or blackouts" },
];

const CONDITIONS_2 = [
  { id: "diabetes",         label: "Diabetes (Type 1 or 2)",                                       group: "Endocrine" },
  { id: "thyroid",          label: "Thyroid problems" },
  { id: "arthritis",        label: "Arthritis or joint problems",                                  group: "Musculoskeletal" },
  { id: "osteoporosis",     label: "Osteoporosis (brittle bones)" },
  { id: "bisphosphonates",  label: "Bisphosphonate medication (alendronic acid, Fosamax, Zometa etc.)" },
  { id: "jointReplacement", label: "Joint replacement (hip, knee or other)" },
  { id: "cancer",           label: "Cancer (current or previous)",                                 group: "Cancer & Infections" },
  { id: "radiotherapy",     label: "Radiotherapy — especially to head or neck" },
  { id: "chemotherapy",     label: "Chemotherapy" },
  { id: "hepatitis",        label: "Hepatitis B or C" },
  { id: "hiv",              label: "HIV or AIDS" },
  { id: "kidneyLiver",      label: "Kidney or liver disease",                                      group: "Other" },
  { id: "acidReflux",       label: "Acid reflux or GORD" },
  { id: "mentalHealth",     label: "Mental health conditions (anxiety, depression, eating disorders)" },
  { id: "hospital",         label: "Hospital admission in the last 5 years" },
  { id: "otherConditions",  label: "Any other serious medical condition not listed above" },
];

const STEP_LABELS = [
  "Personal Details",
  "Medical Conditions",
  "Medical Conditions",
  "Medications & Allergies",
  "Dental History",
  "Additional Information",
  "Declaration",
];

const mkC = () => ({ value: "", details: "" });

function initConditions() {
  const obj = {};
  [...CONDITIONS_1, ...CONDITIONS_2,
    { id: "problemsWithLA" }, { id: "healingProblems" },
  ].forEach(c => { obj[c.id] = mkC(); });
  return obj;
}

// ── Signature pad ─────────────────────────────────────────────────────────────
function SignaturePad({ onChange }) {
  const canvasRef = useRef();
  const drawing = useRef(false);
  const [hasSig, setHasSig] = useState(false);

  const pos = (e, c) => {
    const r = c.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return { x: (s.clientX - r.left) * (c.width / r.width), y: (s.clientY - r.top) * (c.height / r.height) };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    const c = canvasRef.current, ctx = c.getContext("2d");
    ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); const p = pos(e, c); ctx.moveTo(p.x, p.y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const c = canvasRef.current, ctx = c.getContext("2d");
    const p = pos(e, c); ctx.lineTo(p.x, p.y); ctx.stroke();
    setHasSig(true); onChange(c.toDataURL("image/png"));
  };

  const stop = (e) => { e.preventDefault(); drawing.current = false; };

  const clear = () => {
    const c = canvasRef.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    setHasSig(false); onChange(null);
  };

  return (
    <div>
      <div style={{ position: "relative" }}>
        <canvas ref={canvasRef} width={600} height={140}
          style={{ width: "100%", border: "1px solid #ddd8d2", borderRadius: "3px", backgroundColor: "#fdfcfb", touchAction: "none", cursor: "crosshair", display: "block" }}
          onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={start} onTouchMove={draw} onTouchEnd={stop} />
        {!hasSig && (
          <p style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "#c5bdb5", fontSize: "0.82rem", pointerEvents: "none", margin: 0, whiteSpace: "nowrap" }}>
            Sign here using your mouse or finger
          </p>
        )}
      </div>
      <button onClick={clear} style={{ background: "none", border: "none", color: "#9a8c7e", fontSize: "0.78rem", cursor: "pointer", padding: "0.4rem 0", marginTop: "0.25rem" }}>
        Clear signature
      </button>
    </div>
  );
}

// ── Yes/No field ──────────────────────────────────────────────────────────────
function YesNo({ label, value, onChange }) {
  return (
    <div style={{ borderBottom: "1px solid #f0ece8", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.85rem", color: "#3a3530", lineHeight: 1.45, flex: 1 }}>{label}</span>
        <div style={{ display: "flex", gap: "0.3rem", flexShrink: 0 }}>
          {["Yes", "No"].map(opt => (
            <button key={opt} onClick={() => onChange({ value: opt.toLowerCase(), details: opt === "No" ? "" : value.details })}
              style={{ padding: "0.28rem 0.7rem", border: "1px solid #ddd8d2", borderRadius: "3px", fontSize: "0.8rem", cursor: "pointer",
                backgroundColor: value.value === opt.toLowerCase() ? (opt === "Yes" ? "#b94040" : "#2c5f5d") : "#faf9f7",
                color: value.value === opt.toLowerCase() ? "#fff" : "#3a3530",
                fontWeight: value.value === opt.toLowerCase() ? 600 : 400 }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
      {value.value === "yes" && (
        <input style={{ marginTop: "0.4rem", width: "100%", padding: "0.4rem 0.7rem", border: "1px solid #e8ddd0", borderRadius: "3px", fontSize: "0.82rem", boxSizing: "border-box", backgroundColor: "#fdf9f4", fontFamily: "Georgia, serif" }}
          placeholder="Please give details..." value={value.details}
          onChange={e => onChange({ value: "yes", details: e.target.value })} />
      )}
    </div>
  );
}

function GroupHeading({ label }) {
  return <p style={{ fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#2c5f5d", fontWeight: 600, margin: "1rem 0 0.3rem", paddingTop: "0.75rem", borderTop: "1px solid #e8e4df" }}>{label}</p>;
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: "0.9rem", ...style }}>
      <label style={{ display: "block", fontSize: "0.8rem", color: "#5a5550", marginBottom: "0.35rem" }}>{label}</label>
      {children}
    </div>
  );
}

function OptionBtn({ children, active, onClick, style: extra }) {
  return (
    <button onClick={onClick} style={{ padding: "0.75rem 1rem", border: "1px solid", borderColor: active ? "#2c5f5d" : "#ddd8d2", borderRadius: "3px", backgroundColor: active ? "#2c5f5d" : "#faf9f7", color: active ? "#fff" : "#3a3530", fontSize: "0.88rem", cursor: "pointer", textAlign: "left", ...extra }}>
      {children}
    </button>
  );
}

function renderConditions(list, data, setCond) {
  const items = [];
  let lastGroup = null;
  list.forEach(c => {
    if (c.group && c.group !== lastGroup) { items.push(<GroupHeading key={`g-${c.group}`} label={c.group} />); lastGroup = c.group; }
    items.push(<YesNo key={c.id} label={c.label} value={data.conditions[c.id]} onChange={v => setCond(c.id, v)} />);
  });
  return <div style={{ marginTop: "0.5rem" }}>{items}</div>;
}

// ── PDF ───────────────────────────────────────────────────────────────────────
async function buildPDF(d) {
  await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const W = 210, H = 297, M = 18, CW = W - M * 2;
  let y = M, page = 1;
  const DARK = [61,56,48], GOLD = [201,186,155], TEAL = [44,95,93], MID = [100,95,90];

  const hdr = () => {
    doc.setFillColor(...DARK); doc.rect(0,0,W,16,"F");
    doc.setTextColor(...GOLD); doc.setFontSize(10); doc.setFont("helvetica","bold");
    doc.text("COMPLETE DENTISTRY SURREY", M, 10.5);
    doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.text("CONFIDENTIAL MEDICAL HISTORY", W-M, 10.5, { align:"right" });
    doc.setTextColor(0); y = 24;
  };

  const ftr = () => {
    doc.setFontSize(7); doc.setTextColor(...MID);
    doc.text(`Completed electronically via Practify · ${new Date().toLocaleDateString("en-GB")} · Page ${page}`, W/2, H-6, { align:"center" });
    doc.setTextColor(0);
  };

  const chk = (n=10) => { if (y+n > H-18) { ftr(); doc.addPage(); page++; hdr(); } };

  const sec = (t) => {
    chk(14); doc.setFillColor(...TEAL); doc.rect(M,y,CW,7,"F");
    doc.setTextColor(255); doc.setFontSize(8); doc.setFont("helvetica","bold");
    doc.text(t, M+3, y+4.8); doc.setTextColor(0); doc.setFont("helvetica","normal"); y += 10;
  };

  const row = (lbl, val) => {
    if (!val) return; chk(8);
    doc.setFontSize(8); doc.setTextColor(...MID); doc.setFont("helvetica","bold");
    doc.text(lbl+":", M, y);
    doc.setFont("helvetica","normal"); doc.setTextColor(0);
    const lines = doc.splitTextToSize(String(val), CW-50);
    doc.text(lines, M+50, y); y += Math.max(lines.length*5,5)+2;
  };

  const yn = (lbl, cond) => {
    chk(cond.value==="yes"?14:7);
    const ll = doc.splitTextToSize(lbl, CW-18);
    doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(...MID);
    doc.text(ll, M+2, y);
    const ans = cond.value==="yes"?"YES":cond.value==="no"?"No":"—";
    doc.setFont("helvetica","bold");
    doc.setTextColor(cond.value==="yes"?180:110, cond.value==="yes"?30:110, cond.value==="yes"?30:105);
    doc.text(ans, W-M, y, { align:"right" });
    doc.setTextColor(0); doc.setFont("helvetica","normal"); y += ll.length*5+1;
    if (cond.value==="yes" && cond.details) {
      chk(8); doc.setFontSize(7); doc.setTextColor(...TEAL);
      const dl = doc.splitTextToSize("Details: "+cond.details, CW-10);
      doc.text(dl, M+6, y); doc.setTextColor(0); y += dl.length*4.5+2;
    }
  };

  const grpHdr = (lbl) => {
    chk(10); doc.setFontSize(7); doc.setTextColor(...TEAL); doc.setFont("helvetica","bold");
    doc.text(lbl.toUpperCase(), M+2, y); doc.setFont("helvetica","normal"); doc.setTextColor(0); y+=5;
  };

  hdr();

  // Title block
  doc.setFontSize(18); doc.setFont("helvetica","bold"); doc.setTextColor(...DARK);
  doc.text("Medical History Form", M, y); y+=7;
  doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(...MID);
  doc.text(`${d.patientType==="new"?"New patient":"Returning patient"} · ${new Date().toLocaleDateString("en-GB")}`, M, y); y+=8;

  // Personal details
  sec("Patient Details");
  row("Full name",   [d.title,d.firstName,d.lastName].filter(Boolean).join(" "));
  row("Date of birth", d.dob);
  row("Address",     [d.address,d.postcode].filter(Boolean).join(", "));
  row("Phone",       d.phone);
  row("Email",       d.email);
  row("GP",          d.gpName);
  row("GP surgery",  d.gpSurgery); y+=3;

  // Conditions 1
  sec("Medical Conditions — Heart, Blood, Respiratory & Neurological");
  let lastG = null;
  for (const c of CONDITIONS_1) {
    if (c.group && c.group!==lastG) { grpHdr(c.group); lastG=c.group; }
    yn(c.label, d.conditions[c.id]);
  }
  y+=3;

  // Conditions 2
  sec("Medical Conditions — Endocrine, Musculoskeletal, Cancer & Other");
  lastG=null;
  for (const c of CONDITIONS_2) {
    if (c.group && c.group!==lastG) { grpHdr(c.group); lastG=c.group; }
    yn(c.label, d.conditions[c.id]);
  }
  y+=3;

  // Medications
  sec("Medications & Allergies");
  row("Current medications", d.currentMedications||"None reported");
  const allergies = [
    d.allergyPenicillin && "Penicillin / antibiotics",
    d.allergyAspirin && "Aspirin / NSAIDs",
    d.allergyLatex && "Latex",
    d.allergyLA && "Local anaesthetic",
    d.allergyOther,
  ].filter(Boolean).join(", ") || "None reported";
  row("Known allergies", allergies); y+=3;

  // Dental history
  sec("Dental History");
  row("Last dental visit",    d.lastDentalVisit||"Not stated");
  row("Previous dentist",     d.previousDentist||"Not stated");
  row("Dental anxiety level", d.dentalAnxiety||"Not stated");
  yn("Problems with local anaesthetic",                     d.conditions.problemsWithLA);
  yn("Problems with healing after dental treatment",        d.conditions.healingProblems);
  if (d.dentalConcerns) row("Other concerns", d.dentalConcerns);
  y+=3;

  // Women's health
  if (d.showWomensHealth==="yes") {
    sec("Women's Health");
    row("Pregnant / possibly pregnant", d.pregnant||"Not stated");
    row("Breastfeeding",                d.breastfeeding||"Not stated");
    row("Contraceptive pill",           d.contraceptivePill||"Not stated");
    row("HRT",                          d.hrt||"Not stated"); y+=3;
  }

  // Lifestyle
  sec("Lifestyle");
  const smokeTxt = d.smoking==="never"?"Never smoked"
    : d.smoking==="ex"?`Ex-smoker${d.smokingAmount?` — ${d.smokingAmount}`:""}`
    : d.smoking==="current"?`Current smoker${d.smokingAmount?` — ${d.smokingAmount}`:""}`
    : "Not stated";
  row("Smoking", smokeTxt);
  row("Alcohol",  d.alcohol==="none"?"None":d.alcoholUnits?`${d.alcoholUnits} units/week`:d.alcohol||"Not stated"); y+=3;

  // Declaration
  chk(70); sec("Declaration & Signature");
  doc.setFontSize(8); doc.setTextColor(...DARK);
  const decl = "I confirm that the information I have provided in this form is accurate and complete to the best of my knowledge. I understand that it is my responsibility to inform the practice of any changes to my medical history at each appointment. I consent to this information being stored securely by Complete Dentistry Surrey and used by the dental team to provide safe and appropriate care, in accordance with GDPR and the practice's privacy policy.";
  const dl = doc.splitTextToSize(decl, CW);
  doc.text(dl, M, y); y+=dl.length*5+8;
  row("Patient name", `${d.firstName} ${d.lastName}`);
  row("Date", new Date().toLocaleDateString("en-GB")); y+=4;

  if (d.signature) {
    doc.setFontSize(7.5); doc.setTextColor(...MID); doc.text("Patient signature:", M, y); y+=3;
    doc.addImage(d.signature, "PNG", M, y, 80, 30); y+=34;
  }

  ftr();
  return doc;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MedicalHistoryForm() {
  const [step,      setStep]      = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [sending,   setSending]   = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error,     setError]     = useState("");

  const [d, setD] = useState({
    patientType: "", title: "", firstName: "", lastName: "", dob: "",
    address: "", postcode: "", phone: "", email: "", gpName: "", gpSurgery: "",
    conditions: initConditions(),
    currentMedications: "",
    allergyPenicillin: false, allergyAspirin: false, allergyLatex: false, allergyLA: false, allergyOther: "",
    lastDentalVisit: "", previousDentist: "", dentalAnxiety: "", dentalConcerns: "",
    showWomensHealth: null, pregnant: "", breastfeeding: "", contraceptivePill: "", hrt: "",
    smoking: "", smokingAmount: "", alcohol: "", alcoholUnits: "",
    declarationAgreed: false, signature: null,
  });

  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  const setCond = (k, v) => setD(p => ({ ...p, conditions: { ...p.conditions, [k]: v } }));

  const allAnswered = (list) => list.every(c => d.conditions[c.id].value !== "");

  const canProceed = () => {
    switch (step) {
      case 0: return d.patientType && d.firstName && d.lastName && d.dob && d.phone && d.email;
      case 1: return allAnswered(CONDITIONS_1);
      case 2: return allAnswered(CONDITIONS_2);
      case 3: return true;
      case 4: return d.conditions.problemsWithLA.value && d.conditions.healingProblems.value && d.dentalAnxiety;
      case 5: return d.showWomensHealth !== null && d.smoking && d.alcohol;
      case 6: return d.declarationAgreed && d.signature;
      default: return true;
    }
  };

  const submit = async () => {
    setSending(true); setError(""); setStatusMsg("Generating your form…");
    try {
      const doc = await buildPDF(d);
      setStatusMsg("Sending securely to the practice…");
      const pdfBase64 = doc.output("datauristring").split(",")[1];
      const res = await fetch(NETLIFY_FN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64, patientName: `${d.firstName} ${d.lastName}`, patientDob: d.dob }),
      });
      if (!res.ok) throw new Error("Send failed");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please call us on 01883 622222 — we're sorry for the inconvenience.");
    } finally {
      setSending(false); setStatusMsg("");
    }
  };

  const progress = ((step + 1) / (STEP_LABELS.length + 1)) * 100;

  if (submitted) {
    return (
      <div style={s.wrapper}><div style={s.card}>
        <div style={s.successMark}>✦</div>
        <h2 style={s.successTitle}>Thank you, {d.firstName}.</h2>
        <p style={s.successText}>
          Your medical history form has been received securely. A member of our team will
          review it before your appointment. Please let reception know at the start of each
          future visit if anything has changed since you completed this form.
        </p>
        <p style={s.successSub}>— The Complete Dentistry team</p>
      </div></div>
    );
  }

  const inp = s.input;

  return (
    <div style={s.wrapper}><div style={s.card}>

      {/* Header */}
      <div style={s.header}>
        <p style={s.eyebrow}>Complete Dentistry Surrey · Confidential</p>
        <h1 style={s.title}>Medical History Form</h1>
        <p style={s.subtitle}>
          Please complete this form carefully and honestly — it helps us treat you safely.
          All information is held in strict confidence in accordance with GDPR.
        </p>
      </div>

      {/* Progress */}
      <div style={s.progressWrap}>
        <div style={s.progressTrack}><div style={{ ...s.progressFill, width: `${progress}%` }} /></div>
        <p style={s.progressLabel}>Step {step+1} of {STEP_LABELS.length} — {STEP_LABELS[step]}</p>
      </div>

      {/* ── Step 0: Personal details ── */}
      {step === 0 && (
        <div style={s.section}>
          <h2 style={s.question}>About you</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginBottom:"1rem" }}>
            {["New patient","Returning patient"].map(opt => (
              <OptionBtn key={opt} active={d.patientType===(opt==="New patient"?"new":"returning")} onClick={() => set("patientType", opt==="New patient"?"new":"returning")}>{opt}</OptionBtn>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 1rem" }}>
            <Field label="Title">
              <select style={inp} value={d.title} onChange={e=>set("title",e.target.value)}>
                <option value="">—</option>
                {["Mr","Mrs","Miss","Ms","Dr","Prof","Mx"].map(t=><option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Date of birth *">
              <input style={inp} type="date" value={d.dob} onChange={e=>set("dob",e.target.value)} />
            </Field>
            <Field label="First name *">
              <input style={inp} value={d.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="First name" />
            </Field>
            <Field label="Last name *">
              <input style={inp} value={d.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="Last name" />
            </Field>
          </div>
          <Field label="Address">
            <input style={inp} value={d.address} onChange={e=>set("address",e.target.value)} placeholder="Street address" />
          </Field>
          <Field label="Postcode">
            <input style={{...inp, maxWidth:"140px"}} value={d.postcode} onChange={e=>set("postcode",e.target.value)} placeholder="CR6 9NW" />
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 1rem" }}>
            <Field label="Phone *">
              <input style={inp} type="tel" value={d.phone} onChange={e=>set("phone",e.target.value)} placeholder="Phone number" />
            </Field>
            <Field label="Email *">
              <input style={inp} type="email" value={d.email} onChange={e=>set("email",e.target.value)} placeholder="your@email.com" />
            </Field>
          </div>
          <h2 style={{...s.question, marginTop:"1.5rem"}}>Your GP</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 1rem" }}>
            <Field label="GP name">
              <input style={inp} value={d.gpName} onChange={e=>set("gpName",e.target.value)} placeholder="Dr Smith" />
            </Field>
            <Field label="GP surgery">
              <input style={inp} value={d.gpSurgery} onChange={e=>set("gpSurgery",e.target.value)} placeholder="Surgery name" />
            </Field>
          </div>
        </div>
      )}

      {/* ── Step 1: Conditions Part 1 ── */}
      {step === 1 && (
        <div style={s.section}>
          <h2 style={s.question}>Medical conditions</h2>
          <p style={s.hint}>Please answer every question. If you are unsure, answer Yes and add details.</p>
          <div style={s.infoBox}>
            <p style={s.infoText}>⚕️ These questions help us provide safe treatment. It is always better to over-report than to miss something important.</p>
          </div>
          {renderConditions(CONDITIONS_1, d, setCond)}
        </div>
      )}

      {/* ── Step 2: Conditions Part 2 ── */}
      {step === 2 && (
        <div style={s.section}>
          <h2 style={s.question}>Medical conditions (continued)</h2>
          <p style={s.hint}>Please answer every question.</p>
          {renderConditions(CONDITIONS_2, d, setCond)}
        </div>
      )}

      {/* ── Step 3: Medications & Allergies ── */}
      {step === 3 && (
        <div style={s.section}>
          <h2 style={s.question}>Current medications</h2>
          <p style={s.hint}>Include all prescription and over-the-counter medicines, supplements and herbal remedies.</p>
          <textarea style={{...inp, minHeight:"110px", resize:"vertical"}}
            value={d.currentMedications} onChange={e=>set("currentMedications",e.target.value)}
            placeholder="List all medications here, or write 'None'" />
          <h2 style={{...s.question, marginTop:"1.5rem"}}>Known allergies</h2>
          <p style={s.hint}>Tick all that apply.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", marginBottom:"0.75rem" }}>
            {[
              {id:"allergyPenicillin", label:"Penicillin or other antibiotics"},
              {id:"allergyAspirin",    label:"Aspirin or anti-inflammatory drugs (NSAIDs)"},
              {id:"allergyLatex",      label:"Latex or rubber"},
              {id:"allergyLA",         label:"Local anaesthetic"},
            ].map(({id,label})=>(
              <label key={id} style={{ display:"flex", alignItems:"center", gap:"0.6rem", fontSize:"0.88rem", cursor:"pointer", color:"#3a3530" }}>
                <input type="checkbox" checked={d[id]} onChange={e=>set(id,e.target.checked)} style={{ width:"16px", height:"16px", flexShrink:0 }} />
                {label}
              </label>
            ))}
          </div>
          <Field label="Any other allergies">
            <input style={inp} value={d.allergyOther} onChange={e=>set("allergyOther",e.target.value)} placeholder="Please specify..." />
          </Field>
        </div>
      )}

      {/* ── Step 4: Dental History ── */}
      {step === 4 && (
        <div style={s.section}>
          <h2 style={s.question}>Your dental history</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 1rem" }}>
            <Field label="Last dental visit (approx.)">
              <input style={inp} value={d.lastDentalVisit} onChange={e=>set("lastDentalVisit",e.target.value)} placeholder="e.g. Jan 2024" />
            </Field>
            <Field label="Previous dentist">
              <input style={inp} value={d.previousDentist} onChange={e=>set("previousDentist",e.target.value)} placeholder="Practice name" />
            </Field>
          </div>
          <h2 style={{...s.question, marginTop:"1.5rem"}}>Dental anxiety</h2>
          <p style={s.hint}>How would you describe your feelings about dental treatment?</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
            {[
              "None — I am relaxed about dental visits",
              "Mild — occasionally nervous",
              "Moderate — anxious but manageable",
              "Severe — I avoid the dentist because of anxiety",
            ].map(opt=>(
              <OptionBtn key={opt} active={d.dentalAnxiety===opt} onClick={()=>set("dentalAnxiety",opt)}>{opt}</OptionBtn>
            ))}
          </div>
          <div style={{ marginTop:"1.5rem" }}>
            <YesNo label="Have you ever had problems with local anaesthetic (injections not working, adverse reactions etc.)?"
              value={d.conditions.problemsWithLA} onChange={v=>setCond("problemsWithLA",v)} />
            <YesNo label="Have you ever had difficulty healing after dental treatment?"
              value={d.conditions.healingProblems} onChange={v=>setCond("healingProblems",v)} />
          </div>
          <Field label="Any other dental concerns or things we should know?" style={{ marginTop:"1rem" }}>
            <textarea style={{...inp, minHeight:"80px", resize:"vertical"}} value={d.dentalConcerns}
              onChange={e=>set("dentalConcerns",e.target.value)}
              placeholder="Optional — past bad experiences, phobias, anything you'd like us to be aware of..." />
          </Field>
        </div>
      )}

      {/* ── Step 5: Additional ── */}
      {step === 5 && (
        <div style={s.section}>
          <h2 style={s.question}>{"Women's health"}</h2>
          <p style={s.hint}>The following questions are relevant to female patients.</p>
          <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1rem" }}>
            {["Yes, this applies to me","No, skip this section"].map(opt=>(
              <OptionBtn key={opt} active={d.showWomensHealth===(opt.startsWith("Yes")?"yes":"no")}
                onClick={()=>set("showWomensHealth",opt.startsWith("Yes")?"yes":"no")} style={{ flex:1 }}>
                {opt}
              </OptionBtn>
            ))}
          </div>
          {d.showWomensHealth==="yes" && (
            <div>
              {[
                {k:"pregnant",         q:"Are you pregnant or could you be pregnant?", opts:["Yes","No","Possibly"]},
                {k:"breastfeeding",    q:"Are you breastfeeding?",                     opts:["Yes","No"]},
                {k:"contraceptivePill",q:"Are you taking the contraceptive pill?",      opts:["Yes","No"]},
                {k:"hrt",              q:"Are you taking HRT?",                         opts:["Yes","No"]},
              ].map(({k,q,opts})=>(
                <div key={k} style={{ marginBottom:"1rem" }}>
                  <p style={{ fontSize:"0.88rem", color:"#3a3530", margin:"0 0 0.4rem" }}>{q}</p>
                  <div style={{ display:"flex", gap:"0.4rem" }}>
                    {opts.map(o=>(
                      <OptionBtn key={o} active={d[k]===o} onClick={()=>set(k,o)} style={{ padding:"0.4rem 0.9rem" }}>{o}</OptionBtn>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 style={{...s.question, marginTop:"2rem"}}>Lifestyle</h2>
          <p style={{ fontSize:"0.88rem", color:"#3a3530", margin:"0 0 0.4rem" }}>Do you smoke?</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem", marginBottom:"0.75rem" }}>
            {[{v:"never",l:"No, never smoked"},{v:"ex",l:"Ex-smoker"},{v:"current",l:"Current smoker"}].map(({v,l})=>(
              <OptionBtn key={v} active={d.smoking===v} onClick={()=>set("smoking",v)}>{l}</OptionBtn>
            ))}
          </div>
          {(d.smoking==="current"||d.smoking==="ex") && (
            <Field label={d.smoking==="current"?"How many per day?":"When did you stop / how much did you smoke?"}>
              <input style={{...inp, maxWidth:"220px"}} value={d.smokingAmount} onChange={e=>set("smokingAmount",e.target.value)} />
            </Field>
          )}
          <p style={{ fontSize:"0.88rem", color:"#3a3530", margin:"1rem 0 0.4rem" }}>How much alcohol do you drink?</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem", marginBottom:"0.75rem" }}>
            {[
              {v:"none",    l:"None"},
              {v:"low",     l:"Low — up to 14 units per week"},
              {v:"moderate",l:"Moderate — 14 to 21 units per week"},
              {v:"high",    l:"High — more than 21 units per week"},
            ].map(({v,l})=>(
              <OptionBtn key={v} active={d.alcohol===v} onClick={()=>set("alcohol",v)}>{l}</OptionBtn>
            ))}
          </div>
          {d.alcohol && d.alcohol!=="none" && (
            <Field label="Approximate units per week">
              <input style={{...inp, maxWidth:"150px"}} value={d.alcoholUnits} onChange={e=>set("alcoholUnits",e.target.value)} placeholder="e.g. 10" />
            </Field>
          )}
        </div>
      )}

      {/* ── Step 6: Declaration ── */}
      {step === 6 && (
        <div style={s.section}>
          <h2 style={s.question}>Declaration</h2>
          <div style={{ backgroundColor:"#fdf9f4", border:"1px solid #e8ddd0", borderRadius:"4px", padding:"1.2rem 1.5rem", marginBottom:"1rem" }}>
            <p style={{ fontSize:"0.85rem", color:"#5a5550", lineHeight:1.75, margin:0 }}>
              I confirm that the information I have provided in this form is accurate and complete to the best of my knowledge.
              I understand that it is my responsibility to inform the practice of any changes to my medical history at each appointment.
              I consent to this information being stored securely by Complete Dentistry Surrey and used by the dental team to provide
              safe and appropriate care, in accordance with GDPR and the practice's privacy policy.
            </p>
          </div>
          <label style={{ display:"flex", alignItems:"flex-start", gap:"0.75rem", cursor:"pointer", marginBottom:"1.5rem" }}>
            <input type="checkbox" checked={d.declarationAgreed} onChange={e=>set("declarationAgreed",e.target.checked)}
              style={{ width:"18px", height:"18px", marginTop:"2px", flexShrink:0 }} />
            <span style={{ fontSize:"0.88rem", color:"#3a3530", lineHeight:1.5 }}>
              I have read and agree to the above declaration.
            </span>
          </label>
          <h2 style={s.question}>Signature</h2>
          <p style={s.hint}>Please sign below using your mouse or finger.</p>
          <SignaturePad onChange={sig=>set("signature",sig)} />
          {error     && <p style={{ color:"#c0392b", fontSize:"0.85rem", marginTop:"0.75rem" }}>{error}</p>}
          {statusMsg && <p style={{ color:"#2c5f5d", fontSize:"0.85rem", marginTop:"0.75rem", fontStyle:"italic" }}>{statusMsg}</p>}
        </div>
      )}

      {/* Navigation */}
      <div style={s.nav}>
        {step > 0 && <button onClick={()=>setStep(step-1)} style={s.backBtn}>← Back</button>}
        <div style={{ flex:1 }} />
        {step < STEP_LABELS.length-1
          ? <button onClick={()=>setStep(step+1)} disabled={!canProceed()}
              style={{...s.nextBtn, ...(!canProceed()?s.nextBtnDisabled:{})}}>Continue →</button>
          : <button onClick={submit} disabled={!canProceed()||sending}
              style={{...s.nextBtn, ...(!canProceed()||sending?s.nextBtnDisabled:{})}}>
              {sending?"Please wait…":"Submit Form →"}
            </button>
        }
      </div>
    </div></div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  wrapper:         { minHeight:"100vh", backgroundColor:"#f7f5f2", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"2rem 1rem", fontFamily:"Georgia, serif" },
  card:            { backgroundColor:"#fff", borderRadius:"4px", boxShadow:"0 2px 24px rgba(0,0,0,0.07)", padding:"2.5rem", maxWidth:"660px", width:"100%" },
  header:          { marginBottom:"2rem", borderBottom:"1px solid #e8e4df", paddingBottom:"1.5rem" },
  eyebrow:         { fontSize:"0.72rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#9a8c7e", margin:"0 0 0.5rem" },
  title:           { fontSize:"1.6rem", fontWeight:"normal", color:"#1a1a1a", margin:"0 0 0.75rem", lineHeight:1.2 },
  subtitle:        { fontSize:"0.88rem", color:"#5a5550", lineHeight:1.6, margin:0 },
  progressWrap:    { marginBottom:"2rem" },
  progressTrack:   { height:"3px", backgroundColor:"#ede9e4", borderRadius:"2px", overflow:"hidden", marginBottom:"0.5rem" },
  progressFill:    { height:"100%", backgroundColor:"#2c5f5d", borderRadius:"2px", transition:"width 0.4s ease" },
  progressLabel:   { fontSize:"0.75rem", color:"#9a8c7e", margin:0, letterSpacing:"0.04em" },
  section:         { marginBottom:"1.5rem" },
  question:        { fontSize:"1.1rem", fontWeight:"normal", color:"#1a1a1a", margin:"0 0 0.4rem", lineHeight:1.4 },
  hint:            { fontSize:"0.82rem", color:"#9a8c7e", margin:"0 0 0.75rem" },
  infoBox:         { backgroundColor:"#fdf9f4", border:"1px solid #e8ddd0", borderRadius:"3px", padding:"0.9rem 1rem", marginBottom:"0.75rem" },
  infoText:        { fontSize:"0.84rem", color:"#5a5550", lineHeight:1.65, margin:0 },
  input:           { width:"100%", padding:"0.65rem 0.85rem", border:"1px solid #ddd8d2", borderRadius:"3px", fontSize:"0.9rem", color:"#1a1a1a", backgroundColor:"#faf9f7", boxSizing:"border-box", fontFamily:"Georgia, serif", outline:"none" },
  nav:             { display:"flex", alignItems:"center", marginTop:"2rem", paddingTop:"1.5rem", borderTop:"1px solid #e8e4df" },
  backBtn:         { background:"none", border:"none", color:"#9a8c7e", fontSize:"0.88rem", cursor:"pointer", padding:0 },
  nextBtn:         { backgroundColor:"#2c5f5d", color:"#fff", border:"none", borderRadius:"3px", padding:"0.75rem 1.75rem", fontSize:"0.92rem", cursor:"pointer", letterSpacing:"0.02em" },
  nextBtnDisabled: { backgroundColor:"#c5bdb5", cursor:"not-allowed" },
  successMark:     { fontSize:"2rem", color:"#2c5f5d", marginBottom:"1rem" },
  successTitle:    { fontSize:"1.5rem", fontWeight:"normal", color:"#1a1a1a", marginBottom:"0.75rem" },
  successText:     { fontSize:"0.95rem", color:"#5a5550", lineHeight:1.7, marginBottom:"1.5rem" },
  successSub:      { fontSize:"0.85rem", color:"#9a8c7e", fontStyle:"italic" },
};
