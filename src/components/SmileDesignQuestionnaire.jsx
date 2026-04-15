import { useState, useRef } from "react";
import { jsPDF } from "jspdf";

// ── Config ────────────────────────────────────────────────────────────────────
const MAX_FILE_MB      = 8;
const COMPRESS_WIDTH   = 1200;
const COMPRESS_QUALITY = 0.75;

// ── Photo definitions ─────────────────────────────────────────────────────────
const PHOTO_SLOTS = [
  { id:"face_maa",       label:'Face-on · Say "maa"',         icon:"👄",
    instruction:'Face the camera straight on and say "maa". This shows your natural lip position and how your front teeth sit at rest.',
    helper:"Tip: just let the word form naturally — no need to hold the pose." },
  { id:"face_cheese",    label:'Face-on · Big smile',          icon:"😁",
    instruction:"Face the camera and give your biggest, cheesiest smile. Really go for it — the bigger the better.",
    helper:"Tip: we want to see your full smile, so don't hold back." },
  { id:"profile_relaxed",label:"Side profile · Lips together", icon:"🧍",
    instruction:"Turn fully to one side, look straight ahead to the horizon, and let your lips rest gently together. You may need someone else to take this one.",
    helper:"Tip: keep your eyes level and chin parallel to the floor." },
  { id:"profile_cheese", label:"Side profile · Big smile",     icon:"😄",
    instruction:"Stay in side profile with eyes to the horizon and give a full smile. You may need someone else to take this one.",
    helper:"Tip: keep your head level — avoid tilting your chin up or down." },
];

const STEP_LABELS = [
  "About Your Smile","Your Goals","Practical Details",
  "Initial Thoughts","Contact Preference","Smile Photos","Your Details",
];

// ── Data ──────────────────────────────────────────────────────────────────────
const CONCERNS = [
  { id:"colour",     label:"The colour or whiteness" },
  { id:"alignment",  label:"The alignment or straightness" },
  { id:"shape",      label:"The shape or size of teeth" },
  { id:"gaps",       label:"Gaps between teeth" },
  { id:"missing",    label:"Missing teeth" },
  { id:"confidence", label:"My overall confidence when smiling" },
];

const TREATMENTS = [
  "Teeth whitening","Invisalign / straightening","Composite bonding",
  "Veneers","Full smile makeover","Implants",
];

const BUDGETS = [
  { id:"low",     label:"Up to £1,000" },
  { id:"mid",     label:"£1,000 – £3,000" },
  { id:"high",    label:"£3,000 – £6,000" },
  { id:"premium", label:"£6,000+" },
  { id:"unsure",  label:"I'm not sure yet" },
];

const TIMELINES = [
  "Just exploring for now",
  "Within the next 3–6 months",
  "As soon as possible",
];

const CALL_TIMES = [
  "Morning (9am – 12pm)","Afternoon (12pm – 3pm)",
  "Late afternoon (3pm – 5pm)","Any time",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildRecommendation(concerns, budget) {
  const has = (id) => concerns.includes(id);
  const suggestions = [];
  if (has("missing"))   suggestions.push("dental implants");
  if (has("alignment")) suggestions.push("orthodontic treatment such as Invisalign");
  if (has("colour") && !has("shape") && !has("gaps")) suggestions.push("professional teeth whitening");
  if ((has("shape")||has("gaps")) && ["mid","unsure",""].includes(budget)) suggestions.push("composite bonding");
  if ((has("shape")||has("gaps")) && ["high","premium"].includes(budget)) suggestions.push("porcelain veneers");
  if (concerns.length >= 3 && ["high","premium"].includes(budget)) suggestions.push("a comprehensive smile makeover");
  if (!suggestions.length) suggestions.push("a smile consultation to explore the best path forward");
  const unique = [...new Set(suggestions)].slice(0,2);
  return unique.length === 1
    ? `Based on what you've shared, ${unique[0]} may be worth exploring as a starting point.`
    : `Based on what you've shared, ${unique[0]} and ${unique[1]} may be worth exploring.`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function compressImage(base64, maxWidth = COMPRESS_WIDTH, quality = COMPRESS_QUALITY) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = Math.round((h*maxWidth)/w); w = maxWidth; }
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = base64;
  });
}

function approxSizeMB(base64) {
  return ((base64.length*0.75)/1024/1024).toFixed(1);
}

// ── PDF builder ───────────────────────────────────────────────────────────────
function buildSmilePDF(formData, concerns, awareness, knownTreatments, budget, timeline, contactPref, recommendation, notes) {
  const doc = new jsPDF({ unit:"mm", format:"a4" });
  const W = 210, M = 16;
  let y = 0;

  // Header
  doc.setFillColor(61,56,48);
  doc.rect(0,0,W,36,"F");
  doc.setTextColor(255,255,255);
  doc.setFontSize(15); doc.setFont("helvetica","bold");
  doc.text("Smile Design Questionnaire", M, 14);
  doc.setFontSize(8.5); doc.setFont("helvetica","normal");
  doc.text("Complete Dentistry Surrey  |  reception@completedentistrysurrey.co.uk", M, 22);
  doc.text("Date: " + new Date().toLocaleDateString("en-GB"), M, 29);
  y = 44;

  const line = () => { doc.setDrawColor(220,212,205); doc.line(M,y,W-M,y); y += 6; };

  // Patient details
  doc.setTextColor(61,56,48); doc.setFontSize(10.5); doc.setFont("helvetica","bold");
  doc.text("Patient Details", M, y); y += 6;
  doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(44,44,44);
  doc.text("Name:    " + formData.name,              M, y); y += 5;
  doc.text("Email:   " + (formData.email || "Not provided"), M, y); y += 5;
  doc.text("Phone:   " + (formData.phone || "Not provided"), M, y); y += 5;
  doc.text("Contact: " + (contactPref==="callback" ? "Callback requested" : "Email"), M, y); y += 5;
  if (formData.callTime) { doc.text("Best time to call: " + formData.callTime, M, y); y += 5; }
  y += 3; line();

  // Responses
  const sections = [
    { title:"Smile Concerns",
      text: concerns.map(id => CONCERNS.find(c => c.id===id)?.label).filter(Boolean).join(", ") || "None specified" },
    { title:"Treatment Awareness",
      text: awareness + (knownTreatments.length ? ` — ${knownTreatments.join(", ")}` : "") },
    { title:"Budget",
      text: BUDGETS.find(b => b.id===budget)?.label || budget },
    { title:"Timeline", text: timeline },
    { title:"Indicative Starting Point (shown to patient)",
      text: recommendation },
    { title:"Additional Notes",
      text: notes || "None provided" },
  ];

  sections.forEach(section => {
    if (y > 255) { doc.addPage(); y = 20; }
    doc.setFontSize(9.5); doc.setFont("helvetica","bold"); doc.setTextColor(61,56,48);
    doc.text(section.title, M, y); y += 5.5;
    doc.setFont("helvetica","normal"); doc.setTextColor(44,44,44);
    const lines = doc.splitTextToSize(section.text, W-M*2);
    doc.text(lines, M, y); y += lines.length*5 + 7;
  });

  // Footer
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(160,155,150);
    doc.text("Complete Dentistry Surrey  |  Smile Design Questionnaire  |  Page "+i+" of "+pages, M, 291);
  }

  return doc;
}

// ── Photo slot component ──────────────────────────────────────────────────────
function PhotoSlot({ slot, value, onChange }) {
  const inputRef = useRef();
  const [sizeWarning, setSizeWarning] = useState("");
  const [processing,  setProcessing]  = useState(false);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setSizeWarning("");
    const rawMB = file.size/1024/1024;
    if (rawMB > MAX_FILE_MB) setSizeWarning(`This photo is ${rawMB.toFixed(1)}MB — we'll compress it automatically.`);
    setProcessing(true);
    const raw        = await fileToBase64(file);
    const compressed = await compressImage(raw);
    setProcessing(false);
    onChange(compressed);
  };

  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };

  return (
    <div style={ps.wrap}>
      <div style={ps.header}>
        <span style={ps.icon}>{slot.icon}</span>
        <div>
          <p style={ps.label}>{slot.label}</p>
          <p style={ps.instruction}>{slot.instruction}</p>
          <p style={ps.helper}>{slot.helper}</p>
        </div>
      </div>
      {sizeWarning && <p style={ps.sizeWarn}>{sizeWarning}</p>}
      {value ? (
        <div style={ps.previewWrap}>
          <img src={value} alt={slot.label} style={ps.preview} />
          <div style={ps.previewMeta}>
            <span style={ps.previewSize}>~{approxSizeMB(value)}MB after compression</span>
            <button onClick={() => { onChange(null); setSizeWarning(""); }} style={ps.removeBtn}>✕ Remove</button>
          </div>
        </div>
      ) : (
        <div style={ps.dropZone} onClick={() => inputRef.current.click()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
          {processing
            ? <p style={ps.dropText}>Compressing…</p>
            : <>
                <p style={ps.dropIconEl}>📷</p>
                <p style={ps.dropText}>Tap to choose a photo</p>
                <p style={ps.dropSub}>or drag and drop · max {MAX_FILE_MB}MB</p>
              </>}
          <input ref={inputRef} type="file" accept="image/*" capture="environment"
            style={{ display:"none" }} onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SmileDesignQuestionnaire() {
  const [step,      setStep]      = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [sending,   setSending]   = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error,     setError]     = useState("");

  const [concerns,        setConcerns]        = useState([]);
  const [awareness,       setAwareness]       = useState("");
  const [knownTreatments, setKnownTreatments] = useState([]);
  const [budget,          setBudget]          = useState("");
  const [timeline,        setTimeline]        = useState("");
  const [contactPref,     setContactPref]     = useState("");
  const [includePhotos,   setIncludePhotos]   = useState(null);
  const [photos, setPhotos] = useState({ face_maa:null, face_cheese:null, profile_relaxed:null, profile_cheese:null });
  const [form, setForm] = useState({ name:"", email:"", phone:"", callTime:"", notes:"" });

  const toggleItem = (list, setList, item) =>
    setList((p) => p.includes(item) ? p.filter((i) => i!==item) : [...p, item]);

  const recommendation    = buildRecommendation(concerns, budget);
  const allPhotosUploaded = Object.values(photos).every(Boolean);
  const photosReady       = includePhotos===false || (includePhotos===true && allPhotosUploaded);

  const canProceed = () => {
    switch (step) {
      case 0: return concerns.length > 0;
      case 1: return awareness !== "";
      case 2: return budget !== "" && timeline !== "";
      case 3: return true;
      case 4: return contactPref !== "";
      case 5: return photosReady;
      case 6:
        if (!form.name || !form.email) return false;
        if (contactPref==="callback" && !form.phone) return false;
        return true;
      default: return true;
    }
  };

  // ── Send to Vercel serverless function ──
  const sendToVercel = async () => {
    setSending(true);
    setError("");
    setStatusMsg("Preparing your details…");

    try {
      // Build plain-text answer summary for email
      const answerSummary = [
        `Smile concerns: ${concerns.map(id => CONCERNS.find(c => c.id===id)?.label).filter(Boolean).join(", ")}`,
        `Treatment awareness: ${awareness}${knownTreatments.length ? ` — ${knownTreatments.join(", ")}` : ""}`,
        `Budget: ${BUDGETS.find(b => b.id===budget)?.label || budget}`,
        `Timeline: ${timeline}`,
        `Contact preference: ${contactPref==="callback" ? "Callback" : "Email"}`,
        form.callTime ? `Best time to call: ${form.callTime}` : null,
        `Additional notes: ${form.notes || "None"}`,
      ].filter(Boolean).join("\n");

      // Build photo HTML for email body (inline base64)
      let photoHtml = "";
      if (includePhotos && allPhotosUploaded) {
        setStatusMsg("Processing photos…");
        photoHtml = PHOTO_SLOTS.map(slot =>
          `<p style="margin:0 0 16px;">` +
          `<strong style="font-size:12px;color:#7a7060;display:block;margin-bottom:6px;">${slot.label}</strong>` +
          `<img src="${photos[slot.id]}" style="max-width:380px;border-radius:4px;display:block;" /></p>`
        ).join("");
      }

      // Generate PDF (text only — photos are in the email body)
      setStatusMsg("Generating PDF…");
      const doc = buildSmilePDF(
        { name:form.name, email:form.email, phone:form.phone, callTime:form.callTime },
        concerns, awareness, knownTreatments, budget, timeline, contactPref, recommendation, form.notes
      );
      const pdfBase64 = doc.output("datauristring").split(",")[1];

      setStatusMsg("Sending…");

      const resp = await fetch("/api/send-form", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType:      "smile",
          name:          form.name,
          email:         form.email,
          phone:         form.phone,
          contactPref,
          callTime:      form.callTime,
          budget:        BUDGETS.find(b => b.id===budget)?.label || budget,
          timeline,
          answerSummary,
          recommendation,
          notes:         form.notes,
          photoHtml,
          pdfBase64,
          dateSubmitted: new Date().toLocaleDateString("en-GB"),
        }),
      });

      const json = await resp.json();
      if (!json.success) throw new Error(json.error || "Unknown error");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong sending your details. Please call us on 01883 622222 — we're sorry for the inconvenience.");
    } finally {
      setSending(false);
      setStatusMsg("");
    }
  };

  const progress = ((step+1)/(STEP_LABELS.length+1))*100;

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={s.wrapper}><div style={s.card}>
        <div style={s.successMark}>✦</div>
        <h2 style={s.successTitle}>Thank you, {form.name}.</h2>
        <p style={s.successText}>
          {contactPref==="callback"
            ? "A member of our team will be in touch to arrange a convenient time to chat through your smile goals."
            : "We'll drop you an email shortly. We look forward to talking through what's possible for your smile."}
        </p>
        {form.email && (
          <p style={{ ...s.successText, fontSize:"0.85rem", opacity:0.75 }}>
            A confirmation has been sent to {form.email}.
          </p>
        )}
        <p style={s.successSub}>— The Complete Dentistry team</p>
      </div></div>
    );
  }

  return (
    <div style={s.wrapper}><div style={s.card}>

      {/* Header */}
      <div style={s.header}>
        <p style={s.eyebrow}>Complete Dentistry Surrey</p>
        <h1 style={s.title}>Smile Design Questionnaire</h1>
        <p style={s.subtitle}>
          Tell us a little about your smile and what you'd like to achieve.
          We'll be in touch to talk through your options — no pressure, just a conversation.
        </p>
      </div>

      {/* Progress */}
      <div style={s.progressWrap}>
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width:`${progress}%` }} />
        </div>
        <p style={s.progressLabel}>Step {step+1} of {STEP_LABELS.length} — {STEP_LABELS[step]}</p>
      </div>

      {/* Step 0 — Concerns */}
      {step===0 && (
        <div style={s.section}>
          <h2 style={s.question}>What do you love least about your smile right now?</h2>
          <p style={s.hint}>Select all that apply.</p>
          <div style={s.grid}>
            {CONCERNS.map(({ id, label }) => (
              <button key={id} onClick={() => toggleItem(concerns, setConcerns, id)}
                style={{ ...s.chip, ...(concerns.includes(id)?s.chipActive:{}) }}>{label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1 — Awareness */}
      {step===1 && (
        <div style={s.section}>
          <h2 style={s.question}>Have you looked into any treatments already?</h2>
          <div style={s.stack}>
            {["Yes, I have some in mind","No, I'm not sure where to start"].map((opt) => (
              <button key={opt}
                onClick={() => { setAwareness(opt); if (!opt.startsWith("Yes")) setKnownTreatments([]); }}
                style={{ ...s.optionBtn, ...(awareness===opt?s.optionBtnActive:{}) }}>{opt}</button>
            ))}
          </div>
          {awareness==="Yes, I have some in mind" && (
            <>
              <h2 style={{ ...s.question, marginTop:"1.5rem", fontSize:"1rem" }}>Which treatments are you considering?</h2>
              <div style={s.grid}>
                {TREATMENTS.map((t) => (
                  <button key={t} onClick={() => toggleItem(knownTreatments, setKnownTreatments, t)}
                    style={{ ...s.chip, ...(knownTreatments.includes(t)?s.chipActive:{}) }}>{t}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2 — Practical */}
      {step===2 && (
        <div style={s.section}>
          <h2 style={s.question}>Roughly what budget are you working with?</h2>
          <p style={s.hint}>This helps us tailor our conversation to what's realistic for you.</p>
          <div style={s.stack}>
            {BUDGETS.map(({ id, label }) => (
              <button key={id} onClick={() => setBudget(id)}
                style={{ ...s.optionBtn, ...(budget===id?s.optionBtnActive:{}) }}>{label}</button>
            ))}
          </div>
          <h2 style={{ ...s.question, marginTop:"2rem" }}>How soon are you thinking?</h2>
          <div style={s.stack}>
            {TIMELINES.map((t) => (
              <button key={t} onClick={() => setTimeline(t)}
                style={{ ...s.optionBtn, ...(timeline===t?s.optionBtnActive:{}) }}>{t}</button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Recommendation */}
      {step===3 && (
        <div style={s.section}>
          <div style={s.recBox}>
            <p style={s.recEyebrow}>Based on your answers</p>
            <p style={s.recText}>{recommendation}</p>
          </div>
          <div style={s.caveatBox}>
            <p style={s.caveatTitle}>Please bear in mind</p>
            <p style={s.caveatText}>
              Every smile is different, and dentistry is rarely straightforward.
              The above is simply a starting point for conversation — not a clinical recommendation.
              A thorough examination, including a review of your dental and medical history, is always
              required before any treatment can be advised. We'll make sure you fully understand your
              options and have time to ask any questions before any decisions are made.
            </p>
          </div>
        </div>
      )}

      {/* Step 4 — Contact preference */}
      {step===4 && (
        <div style={s.section}>
          <h2 style={s.question}>How would you prefer us to get back to you?</h2>
          <div style={s.stack}>
            {[
              { id:"callback", label:"Call me back",  desc:"We'll phone you at a time that suits" },
              { id:"email",    label:"Email me",      desc:"We'll drop you a friendly message to get started" },
            ].map(({ id, label, desc }) => (
              <button key={id} onClick={() => setContactPref(id)}
                style={{ ...s.optionBtn, ...(contactPref===id?s.optionBtnActive:{}) }}>
                <span style={{ fontWeight:600 }}>{label}</span>
                <span style={{ fontSize:"0.8rem", opacity:0.7, display:"block", marginTop:"2px" }}>{desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5 — Photos */}
      {step===5 && (
        <div style={s.section}>
          <h2 style={s.question}>Would you like to include some photos?</h2>
          <p style={s.hint}>
            Completely optional — but a few photos can help us spot things like jaw alignment,
            wear patterns, or proportional concerns before your consultation.
          </p>
          <div style={s.infoBox}>
            <p style={s.infoText}>
              📱 <strong>Phone photos are absolutely fine.</strong> They don't need to be perfect —
              they're just to give us a general idea. Max {MAX_FILE_MB}MB per photo (compressed automatically).
            </p>
          </div>
          <div style={{ ...s.stack, marginTop:"1rem" }}>
            <button onClick={() => setIncludePhotos(true)}
              style={{ ...s.optionBtn, ...(includePhotos===true?s.optionBtnActive:{}) }}>
              <span style={{ fontWeight:600 }}>Yes, I'll add some photos</span>
              <span style={{ fontSize:"0.8rem", opacity:0.7, display:"block", marginTop:"2px" }}>We'll guide you through exactly what to take</span>
            </button>
            <button onClick={() => { setIncludePhotos(false); setPhotos({ face_maa:null, face_cheese:null, profile_relaxed:null, profile_cheese:null }); }}
              style={{ ...s.optionBtn, ...(includePhotos===false?s.optionBtnActive:{}) }}>
              <span style={{ fontWeight:600 }}>No thanks, skip this step</span>
              <span style={{ fontSize:"0.8rem", opacity:0.7, display:"block", marginTop:"2px" }}>You can always bring photos along to your consultation instead</span>
            </button>
          </div>
          {includePhotos===true && (
            <div style={{ marginTop:"1.5rem" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                {PHOTO_SLOTS.map((slot) => (
                  <PhotoSlot key={slot.id} slot={slot} value={photos[slot.id]}
                    onChange={(val) => setPhotos((p) => ({ ...p, [slot.id]:val }))} />
                ))}
              </div>
              {!allPhotosUploaded && (
                <p style={{ fontSize:"0.8rem", color:"#9a8c7e", marginTop:"0.75rem" }}>
                  All 4 photos needed to continue. Can't get them right now?{" "}
                  <button onClick={() => setIncludePhotos(false)}
                    style={{ background:"none", border:"none", color:"#2c5f5d", cursor:"pointer", fontSize:"0.8rem", padding:0, textDecoration:"underline" }}>
                    Skip this step.
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 6 — Contact details */}
      {step===6 && (
        <div style={s.section}>
          <h2 style={s.question}>Almost there — just your details.</h2>
          <div style={s.formGroup}>
            <label style={s.label}>Full name *</label>
            <input style={s.input} value={form.name} placeholder="Your name"
              onChange={(e) => setForm({ ...form, name:e.target.value })} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Email address *</label>
            <input style={s.input} type="email" value={form.email} placeholder="your@email.com"
              onChange={(e) => setForm({ ...form, email:e.target.value })} />
          </div>
          {contactPref==="callback" && (
            <>
              <div style={s.formGroup}>
                <label style={s.label}>Phone number *</label>
                <input style={s.input} type="tel" value={form.phone} placeholder="Your phone number"
                  onChange={(e) => setForm({ ...form, phone:e.target.value })} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Best time to call</label>
                <div style={s.stack}>
                  {CALL_TIMES.map((t) => (
                    <button key={t} onClick={() => setForm({ ...form, callTime:t })}
                      style={{ ...s.optionBtn, padding:"0.6rem 1rem", ...(form.callTime===t?s.optionBtnActive:{}) }}>{t}</button>
                  ))}
                </div>
              </div>
            </>
          )}
          <div style={s.formGroup}>
            <label style={s.label}>Anything else you'd like us to know? <span style={{ opacity:0.45 }}>(optional)</span></label>
            <textarea style={{ ...s.input, minHeight:"90px", resize:"vertical" }}
              value={form.notes}
              placeholder="Any concerns, past dental history, or anything you'd like us to be aware of…"
              onChange={(e) => setForm({ ...form, notes:e.target.value })} />
          </div>
          {error     && <p style={s.error}>{error}</p>}
          {statusMsg && <p style={s.status}>{statusMsg}</p>}
        </div>
      )}

      {/* Nav */}
      <div style={s.nav}>
        {step > 0 && (
          <button onClick={() => setStep(step-1)} style={s.backBtn}>← Back</button>
        )}
        <div style={{ flex:1 }} />
        {step < STEP_LABELS.length-1 ? (
          <button onClick={() => setStep(step+1)} disabled={!canProceed()}
            style={{ ...s.nextBtn, ...(!canProceed()?s.nextBtnDisabled:{}) }}>
            Continue →
          </button>
        ) : (
          <button onClick={sendToVercel} disabled={!canProceed()||sending}
            style={{ ...s.nextBtn, ...(!canProceed()||sending?s.nextBtnDisabled:{}) }}>
            {sending ? statusMsg||"Sending…" : "Submit →"}
          </button>
        )}
      </div>

    </div></div>
  );
}

// ── Photo slot styles ─────────────────────────────────────────────────────────
const ps = {
  wrap:        { border:"1px solid #e8e4df", borderRadius:"4px", padding:"1rem", backgroundColor:"#faf9f7" },
  header:      { display:"flex", gap:"0.75rem", marginBottom:"0.75rem", alignItems:"flex-start" },
  icon:        { fontSize:"1.4rem", lineHeight:1, flexShrink:0, marginTop:"2px" },
  label:       { fontWeight:600, fontSize:"0.88rem", color:"#1a1a1a", margin:"0 0 0.25rem" },
  instruction: { fontSize:"0.82rem", color:"#5a5550", lineHeight:1.5, margin:"0 0 0.2rem" },
  helper:      { fontSize:"0.75rem", color:"#9a8c7e", fontStyle:"italic", margin:0 },
  sizeWarn:    { fontSize:"0.78rem", color:"#b07d2a", marginBottom:"0.4rem" },
  dropZone:    { border:"2px dashed #ddd8d2", borderRadius:"3px", padding:"1.2rem", textAlign:"center", cursor:"pointer", backgroundColor:"#ffffff" },
  dropIconEl:  { fontSize:"1.5rem", margin:"0 0 0.3rem" },
  dropText:    { fontSize:"0.85rem", color:"#3a3530", margin:"0 0 0.2rem", fontWeight:600 },
  dropSub:     { fontSize:"0.75rem", color:"#9a8c7e", margin:0 },
  previewWrap: {},
  preview:     { width:"100%", maxHeight:"200px", objectFit:"cover", borderRadius:"3px", display:"block" },
  previewMeta: { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"0.35rem" },
  previewSize: { fontSize:"0.72rem", color:"#9a8c7e" },
  removeBtn:   { background:"none", border:"none", color:"#c0392b", fontSize:"0.78rem", cursor:"pointer", padding:0 },
};

// ── Main styles ───────────────────────────────────────────────────────────────
const s = {
  wrapper:         { minHeight:"100vh", backgroundColor:"#f7f5f2", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"2rem 1rem", fontFamily:"'Georgia', serif" },
  card:            { backgroundColor:"#ffffff", borderRadius:"4px", boxShadow:"0 2px 24px rgba(0,0,0,0.07)", padding:"2.5rem", maxWidth:"620px", width:"100%" },
  header:          { marginBottom:"2rem", borderBottom:"1px solid #e8e4df", paddingBottom:"1.5rem" },
  eyebrow:         { fontSize:"0.72rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#9a8c7e", margin:"0 0 0.5rem" },
  title:           { fontSize:"1.6rem", fontWeight:"normal", color:"#1a1a1a", margin:"0 0 0.75rem", lineHeight:1.2 },
  subtitle:        { fontSize:"0.92rem", color:"#5a5550", lineHeight:1.6, margin:0 },
  progressWrap:    { marginBottom:"2rem" },
  progressTrack:   { height:"3px", backgroundColor:"#ede9e4", borderRadius:"2px", overflow:"hidden", marginBottom:"0.5rem" },
  progressFill:    { height:"100%", backgroundColor:"#2c5f5d", borderRadius:"2px", transition:"width 0.4s ease" },
  progressLabel:   { fontSize:"0.75rem", color:"#9a8c7e", margin:0, letterSpacing:"0.04em" },
  section:         { marginBottom:"1.5rem" },
  question:        { fontSize:"1.1rem", fontWeight:"normal", color:"#1a1a1a", margin:"0 0 0.4rem", lineHeight:1.4 },
  hint:            { fontSize:"0.82rem", color:"#9a8c7e", margin:"0 0 0.75rem" },
  infoBox:         { backgroundColor:"#fdf9f4", border:"1px solid #e8ddd0", borderRadius:"3px", padding:"0.9rem 1rem" },
  infoText:        { fontSize:"0.84rem", color:"#5a5550", lineHeight:1.65, margin:0 },
  grid:            { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginTop:"0.75rem" },
  chip:            { padding:"0.65rem 0.9rem", border:"1px solid #ddd8d2", borderRadius:"3px", backgroundColor:"#faf9f7", color:"#3a3530", fontSize:"0.85rem", cursor:"pointer", textAlign:"left", lineHeight:1.3, transition:"all 0.15s ease" },
  chipActive:      { backgroundColor:"#2c5f5d", borderColor:"#2c5f5d", color:"#ffffff" },
  stack:           { display:"flex", flexDirection:"column", gap:"0.5rem", marginTop:"0.75rem" },
  optionBtn:       { padding:"0.85rem 1rem", border:"1px solid #ddd8d2", borderRadius:"3px", backgroundColor:"#faf9f7", color:"#3a3530", fontSize:"0.9rem", cursor:"pointer", textAlign:"left", transition:"all 0.15s ease" },
  optionBtnActive: { backgroundColor:"#2c5f5d", borderColor:"#2c5f5d", color:"#ffffff" },
  recBox:          { backgroundColor:"#f0f5f5", border:"1px solid #c8dbd9", borderRadius:"4px", padding:"1.4rem 1.5rem", marginBottom:"1rem" },
  recEyebrow:      { fontSize:"0.72rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"#2c5f5d", margin:"0 0 0.5rem" },
  recText:         { fontSize:"1.05rem", color:"#1a1a1a", lineHeight:1.6, margin:0, fontStyle:"italic" },
  caveatBox:       { backgroundColor:"#fdf9f4", border:"1px solid #e8ddd0", borderRadius:"4px", padding:"1.2rem 1.5rem" },
  caveatTitle:     { fontSize:"0.78rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"#9a8c7e", margin:"0 0 0.5rem" },
  caveatText:      { fontSize:"0.85rem", color:"#5a5550", lineHeight:1.75, margin:0 },
  formGroup:       { marginBottom:"1.2rem" },
  label:           { display:"block", fontSize:"0.82rem", color:"#5a5550", marginBottom:"0.4rem", letterSpacing:"0.02em" },
  input:           { width:"100%", padding:"0.7rem 0.9rem", border:"1px solid #ddd8d2", borderRadius:"3px", fontSize:"0.92rem", color:"#1a1a1a", backgroundColor:"#faf9f7", boxSizing:"border-box", fontFamily:"inherit", outline:"none" },
  nav:             { display:"flex", alignItems:"center", marginTop:"2rem", paddingTop:"1.5rem", borderTop:"1px solid #e8e4df" },
  backBtn:         { background:"none", border:"none", color:"#9a8c7e", fontSize:"0.88rem", cursor:"pointer", padding:0 },
  nextBtn:         { backgroundColor:"#2c5f5d", color:"#ffffff", border:"none", borderRadius:"3px", padding:"0.75rem 1.75rem", fontSize:"0.92rem", cursor:"pointer", letterSpacing:"0.02em", transition:"background 0.2s ease" },
  nextBtnDisabled: { backgroundColor:"#c5bdb5", cursor:"not-allowed" },
  error:           { color:"#c0392b", fontSize:"0.85rem", marginTop:"0.5rem" },
  status:          { color:"#2c5f5d", fontSize:"0.85rem", marginTop:"0.5rem", fontStyle:"italic" },
  successMark:     { fontSize:"2rem", color:"#2c5f5d", marginBottom:"1rem" },
  successTitle:    { fontSize:"1.5rem", fontWeight:"normal", color:"#1a1a1a", marginBottom:"0.75rem" },
  successText:     { fontSize:"0.95rem", color:"#5a5550", lineHeight:1.7, marginBottom:"1rem" },
  successSub:      { fontSize:"0.85rem", color:"#9a8c7e", fontStyle:"italic" },
};
