import { useState, useRef } from "react";

// ── Config ──────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID = "service_ne6r0iw";
const EMAILJS_TEMPLATE_ID = "template_o2z9exa";
const EMAILJS_PUBLIC_KEY  = "QklJJmLN8TvkMYNet";
const RECEPTION_EMAIL     = "reception@completedentistrysurrey.co.uk";

const MAX_FILE_MB   = 8;       // warn if raw file exceeds this
const COMPRESS_WIDTH = 1200;   // max pixel width after compression
const COMPRESS_QUALITY = 0.75; // JPEG quality (0–1)

// ── Photo definitions ────────────────────────────────────────────────────────
const PHOTO_SLOTS = [
  {
    id: "face_maa",
    label: 'Face-on · Say "maa"',
    instruction: 'Face the camera straight on and say "maa". This shows your natural lip position and how your front teeth sit at rest.',
    helper: "Tip: just let the word form naturally — no need to hold the pose.",
    icon: "👄",
  },
  {
    id: "face_cheese",
    label: 'Face-on · Big smile',
    instruction: "Face the camera and give your biggest, cheesiest smile. Really go for it — the bigger the better.",
    helper: "Tip: we want to see your full smile, so don't hold back.",
    icon: "😁",
  },
  {
    id: "profile_relaxed",
    label: "Side profile · Lips together",
    instruction: "Turn fully to one side, look straight ahead to the horizon, and let your lips rest gently together. You may need someone else to take this one.",
    helper: "Tip: keep your eyes level and chin parallel to the floor.",
    icon: "🧍",
  },
  {
    id: "profile_cheese",
    label: "Side profile · Big smile",
    instruction: "Stay in side profile with eyes to the horizon and give a full smile. You may need someone else to take this one.",
    helper: "Tip: keep your head level — avoid tilting your chin up or down.",
    icon: "😄",
  },
];

// ── Step labels ─────────────────────────────────────────────────────────────
const STEP_LABELS = [
  "About Your Smile",
  "Your Goals",
  "Practical Details",
  "Initial Thoughts",
  "Contact Preference",
  "Smile Photos",
  "Your Details",
];

// ── Data ─────────────────────────────────────────────────────────────────────
const CONCERNS = [
  { id: "colour",     label: "The colour or whiteness" },
  { id: "alignment",  label: "The alignment or straightness" },
  { id: "shape",      label: "The shape or size of teeth" },
  { id: "gaps",       label: "Gaps between teeth" },
  { id: "missing",    label: "Missing teeth" },
  { id: "confidence", label: "My overall confidence when smiling" },
];

const TREATMENTS = [
  "Teeth whitening",
  "Invisalign / straightening",
  "Composite bonding",
  "Veneers",
  "Full smile makeover",
  "Implants",
];

const BUDGETS = [
  { id: "low",     label: "Up to £1,000" },
  { id: "mid",     label: "£1,000 – £3,000" },
  { id: "high",    label: "£3,000 – £6,000" },
  { id: "premium", label: "£6,000+" },
  { id: "unsure",  label: "I'm not sure yet" },
];

const TIMELINES = [
  "Just exploring for now",
  "Within the next 3–6 months",
  "As soon as possible",
];

const CALL_TIMES = [
  "Morning (9am – 12pm)",
  "Afternoon (12pm – 3pm)",
  "Late afternoon (3pm – 5pm)",
  "Any time",
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function buildRecommendation(concerns, budget) {
  const has = (id) => concerns.includes(id);
  const suggestions = [];
  if (has("missing"))   suggestions.push("dental implants");
  if (has("alignment")) suggestions.push("orthodontic treatment such as Invisalign");
  if (has("colour") && !has("shape") && !has("gaps")) suggestions.push("professional teeth whitening");
  if ((has("shape") || has("gaps")) && ["mid","unsure",""].includes(budget)) suggestions.push("composite bonding");
  if ((has("shape") || has("gaps")) && ["high","premium"].includes(budget)) suggestions.push("porcelain veneers");
  if (concerns.length >= 3 && ["high","premium"].includes(budget)) suggestions.push("a comprehensive smile makeover");
  if (!suggestions.length) suggestions.push("a smile consultation to explore the best path forward");
  const unique = [...new Set(suggestions)].slice(0, 2);
  return unique.length === 1
    ? `Based on what you've shared, ${unique[0]} may be worth exploring as a starting point.`
    : `Based on what you've shared, ${unique[0]} and ${unique[1]} may be worth exploring.`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(base64, maxWidth = COMPRESS_WIDTH, quality = COMPRESS_QUALITY) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = base64;
  });
}

function approxSizeMB(base64) {
  return ((base64.length * 0.75) / 1024 / 1024).toFixed(1);
}

// ── Photo slot ───────────────────────────────────────────────────────────────
function PhotoSlot({ slot, value, onChange }) {
  const inputRef = useRef();
  const [sizeWarning, setSizeWarning] = useState("");
  const [processing, setProcessing]  = useState(false);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setSizeWarning("");
    const rawMB = file.size / 1024 / 1024;
    if (rawMB > MAX_FILE_MB) {
      setSizeWarning(`This photo is ${rawMB.toFixed(1)}MB — we'll compress it automatically.`);
    }
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
            <button onClick={() => { onChange(null); setSizeWarning(""); }} style={ps.removeBtn}>
              ✕ Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          style={ps.dropZone}
          onClick={() => inputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {processing
            ? <p style={ps.dropText}>Compressing…</p>
            : <>
                <p style={ps.dropIconEl}>📷</p>
                <p style={ps.dropText}>Tap to choose a photo</p>
                <p style={ps.dropSub}>or drag and drop · max {MAX_FILE_MB}MB</p>
              </>
          }
          <input ref={inputRef} type="file" accept="image/*" capture="environment"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SmileDesignQuestionnaire() {
  const [step,         setStep]         = useState(0);
  const [submitted,    setSubmitted]    = useState(false);
  const [sending,      setSending]      = useState(false);
  const [statusMsg,    setStatusMsg]    = useState("");
  const [error,        setError]        = useState("");

  const [concerns,        setConcerns]        = useState([]);
  const [awareness,       setAwareness]       = useState("");
  const [knownTreatments, setKnownTreatments] = useState([]);
  const [budget,          setBudget]          = useState("");
  const [timeline,        setTimeline]        = useState("");
  const [contactPref,     setContactPref]     = useState("");
  const [includePhotos,   setIncludePhotos]   = useState(null);
  const [photos, setPhotos] = useState({
    face_maa: null, face_cheese: null, profile_relaxed: null, profile_cheese: null,
  });
  const [form, setForm] = useState({
    name: "", email: "", phone: "", callTime: "", notes: "",
  });

  const toggleItem = (list, setList, item) =>
    setList((p) => p.includes(item) ? p.filter((i) => i !== item) : [...p, item]);

  const recommendation = buildRecommendation(concerns, budget);
  const allPhotosUploaded = Object.values(photos).every(Boolean);
  const photosReady = includePhotos === false || (includePhotos === true && allPhotosUploaded);

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
        if (contactPref === "callback" && !form.phone) return false;
        return true;
      default: return true;
    }
  };

  const sendEmail = async () => {
    setSending(true);
    setError("");
    setStatusMsg("Preparing your details…");

    // Build photo HTML section
    let photoHtml = "";
    if (includePhotos && allPhotosUploaded) {
      setStatusMsg("Attaching photos…");
      photoHtml = PHOTO_SLOTS.map((slot) =>
        `<p><strong>${slot.label}</strong><br/>` +
        `<img src="${photos[slot.id]}" style="max-width:380px;border-radius:4px;" /></p>`
      ).join("");
    }

    const textSection = `
<h2 style="color:#2c5f5d;font-family:Georgia,serif;">Smile Design Response</h2>
<table style="font-family:Georgia,serif;font-size:14px;color:#333;width:100%;max-width:600px;">
<tr><td style="padding:4px 0"><strong>Patient:</strong></td><td>${form.name}</td></tr>
<tr><td style="padding:4px 0"><strong>Email:</strong></td><td>${form.email}</td></tr>
<tr><td style="padding:4px 0"><strong>Phone:</strong></td><td>${form.phone || "Not provided"}</td></tr>
<tr><td style="padding:4px 0"><strong>Best time to call:</strong></td><td>${form.callTime || "N/A"}</td></tr>
<tr><td style="padding:4px 0"><strong>Contact preference:</strong></td><td>${contactPref === "callback" ? "Callback" : "Email"}</td></tr>
</table>

<h3 style="font-family:Georgia,serif;color:#2c5f5d;">Smile Concerns</h3>
<p style="font-family:Georgia,serif;">${concerns.map((id) => CONCERNS.find((c) => c.id === id)?.label).join(", ")}</p>

<h3 style="font-family:Georgia,serif;color:#2c5f5d;">Treatment Awareness</h3>
<p style="font-family:Georgia,serif;">${awareness}${knownTreatments.length ? ` — ${knownTreatments.join(", ")}` : ""}</p>

<h3 style="font-family:Georgia,serif;color:#2c5f5d;">Indicative Suggestion (shown to patient)</h3>
<p style="font-family:Georgia,serif;font-style:italic;">${recommendation}</p>

<h3 style="font-family:Georgia,serif;color:#2c5f5d;">Practical</h3>
<p style="font-family:Georgia,serif;">
  <strong>Budget:</strong> ${BUDGETS.find((b) => b.id === budget)?.label || budget}<br/>
  <strong>Timeline:</strong> ${timeline}
</p>

<h3 style="font-family:Georgia,serif;color:#2c5f5d;">Additional Notes</h3>
<p style="font-family:Georgia,serif;">${form.notes || "None provided"}</p>

${photoHtml ? `<h3 style="font-family:Georgia,serif;color:#2c5f5d;">Photos</h3>${photoHtml}` : "<p style='font-family:Georgia,serif;'><strong>Photos:</strong> None provided</p>"}
    `.trim();

    setStatusMsg("Sending…");

    try {
      const { default: emailjs } = await import("https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm");
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email:  RECEPTION_EMAIL,
          subject:   "Smile Design Response",
          message:   textSection,
          from_name: form.name,
          reply_to:  form.email,
        },
        EMAILJS_PUBLIC_KEY
      );
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong sending your details. Please call us directly — we're sorry for the inconvenience.");
    } finally {
      setSending(false);
      setStatusMsg("");
    }
  };

  const progress = ((step + 1) / (STEP_LABELS.length + 1)) * 100;

  // ── Success screen ──
  if (submitted) {
    return (
      <div style={s.wrapper}><div style={s.card}>
        <div style={s.successMark}>✦</div>
        <h2 style={s.successTitle}>Thank you, {form.name}.</h2>
        <p style={s.successText}>
          {contactPref === "callback"
            ? "A member of our team will be in touch to arrange a convenient time to chat through your smile goals."
            : "We'll drop you an email shortly. We look forward to talking through what's possible for your smile."}
        </p>
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
          <div style={{ ...s.progressFill, width: `${progress}%` }} />
        </div>
        <p style={s.progressLabel}>Step {step + 1} of {STEP_LABELS.length} — {STEP_LABELS[step]}</p>
      </div>

      {/* Step 0 — Concerns */}
      {step === 0 && (
        <div style={s.section}>
          <h2 style={s.question}>What do you love least about your smile right now?</h2>
          <p style={s.hint}>Select all that apply.</p>
          <div style={s.grid}>
            {CONCERNS.map(({ id, label }) => (
              <button key={id} onClick={() => toggleItem(concerns, setConcerns, id)}
                style={{ ...s.chip, ...(concerns.includes(id) ? s.chipActive : {}) }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1 — Awareness */}
      {step === 1 && (
        <div style={s.section}>
          <h2 style={s.question}>Have you looked into any treatments already?</h2>
          <div style={s.stack}>
            {["Yes, I have some in mind", "No, I'm not sure where to start"].map((opt) => (
              <button key={opt}
                onClick={() => { setAwareness(opt); if (!opt.startsWith("Yes")) setKnownTreatments([]); }}
                style={{ ...s.optionBtn, ...(awareness === opt ? s.optionBtnActive : {}) }}>
                {opt}
              </button>
            ))}
          </div>
          {awareness === "Yes, I have some in mind" && (
            <>
              <h2 style={{ ...s.question, marginTop: "1.5rem", fontSize: "1rem" }}>
                Which treatments are you considering?
              </h2>
              <div style={s.grid}>
                {TREATMENTS.map((t) => (
                  <button key={t} onClick={() => toggleItem(knownTreatments, setKnownTreatments, t)}
                    style={{ ...s.chip, ...(knownTreatments.includes(t) ? s.chipActive : {}) }}>
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2 — Practical */}
      {step === 2 && (
        <div style={s.section}>
          <h2 style={s.question}>Roughly what budget are you working with?</h2>
          <p style={s.hint}>This helps us tailor our conversation to what's realistic for you.</p>
          <div style={s.stack}>
            {BUDGETS.map(({ id, label }) => (
              <button key={id} onClick={() => setBudget(id)}
                style={{ ...s.optionBtn, ...(budget === id ? s.optionBtnActive : {}) }}>
                {label}
              </button>
            ))}
          </div>
          <h2 style={{ ...s.question, marginTop: "2rem" }}>How soon are you thinking?</h2>
          <div style={s.stack}>
            {TIMELINES.map((t) => (
              <button key={t} onClick={() => setTimeline(t)}
                style={{ ...s.optionBtn, ...(timeline === t ? s.optionBtnActive : {}) }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Recommendation */}
      {step === 3 && (
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
      {step === 4 && (
        <div style={s.section}>
          <h2 style={s.question}>How would you prefer us to get back to you?</h2>
          <div style={s.stack}>
            {[
              { id: "callback", label: "Call me back",  desc: "We'll phone you at a time that suits" },
              { id: "email",    label: "Email me",      desc: "We'll drop you a friendly message to get started" },
            ].map(({ id, label, desc }) => (
              <button key={id} onClick={() => setContactPref(id)}
                style={{ ...s.optionBtn, ...(contactPref === id ? s.optionBtnActive : {}) }}>
                <span style={{ fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: "0.8rem", opacity: 0.7, display: "block", marginTop: "2px" }}>{desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5 — Photos */}
      {step === 5 && (
        <div style={s.section}>
          <h2 style={s.question}>Would you like to include some photos?</h2>
          <p style={s.hint}>
            Completely optional — but a few photos can help us spot things like jaw alignment,
            wear patterns, or proportional concerns before your consultation, making our time
            together much more productive.
          </p>
          <div style={s.infoBox}>
            <p style={s.infoText}>
              📱 <strong>Phone photos are absolutely fine.</strong> They don't need to be
              perfect or professionally taken — they're just to give us a general idea.
              We'll take proper clinical photos and scans when you come in.
              Max {MAX_FILE_MB}MB per photo (we'll compress automatically).
            </p>
          </div>

          <div style={{ ...s.stack, marginTop: "1rem" }}>
            <button onClick={() => setIncludePhotos(true)}
              style={{ ...s.optionBtn, ...(includePhotos === true ? s.optionBtnActive : {}) }}>
              <span style={{ fontWeight: 600 }}>Yes, I'll add some photos</span>
              <span style={{ fontSize: "0.8rem", opacity: 0.7, display: "block", marginTop: "2px" }}>
                We'll guide you through exactly what to take
              </span>
            </button>
            <button
              onClick={() => { setIncludePhotos(false); setPhotos({ face_maa: null, face_cheese: null, profile_relaxed: null, profile_cheese: null }); }}
              style={{ ...s.optionBtn, ...(includePhotos === false ? s.optionBtnActive : {}) }}>
              <span style={{ fontWeight: 600 }}>No thanks, skip this step</span>
              <span style={{ fontSize: "0.8rem", opacity: 0.7, display: "block", marginTop: "2px" }}>
                You can always bring photos along to your consultation instead
              </span>
            </button>
          </div>

          {includePhotos === true && (
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {PHOTO_SLOTS.map((slot) => (
                  <PhotoSlot key={slot.id} slot={slot} value={photos[slot.id]}
                    onChange={(val) => setPhotos((p) => ({ ...p, [slot.id]: val }))} />
                ))}
              </div>
              {!allPhotosUploaded && (
                <p style={{ fontSize: "0.8rem", color: "#9a8c7e", marginTop: "0.75rem" }}>
                  All 4 photos needed to continue. Can't get them right now?{" "}
                  <button onClick={() => setIncludePhotos(false)}
                    style={{ background: "none", border: "none", color: "#2c5f5d", cursor: "pointer", fontSize: "0.8rem", padding: 0, textDecoration: "underline" }}>
                    Skip this step.
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 6 — Contact details */}
      {step === 6 && (
        <div style={s.section}>
          <h2 style={s.question}>Almost there — just your details.</h2>
          <div style={s.formGroup}>
            <label style={s.label}>Full name *</label>
            <input style={s.input} value={form.name} placeholder="Your name"
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Email address *</label>
            <input style={s.input} type="email" value={form.email} placeholder="your@email.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          {contactPref === "callback" && (
            <>
              <div style={s.formGroup}>
                <label style={s.label}>Phone number *</label>
                <input style={s.input} type="tel" value={form.phone} placeholder="Your phone number"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Best time to call</label>
                <div style={s.stack}>
                  {CALL_TIMES.map((t) => (
                    <button key={t} onClick={() => setForm({ ...form, callTime: t })}
                      style={{ ...s.optionBtn, padding: "0.6rem 1rem", ...(form.callTime === t ? s.optionBtnActive : {}) }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <div style={s.formGroup}>
            <label style={s.label}>
              Anything else you'd like us to know?{" "}
              <span style={{ opacity: 0.45 }}>(optional)</span>
            </label>
            <textarea style={{ ...s.input, minHeight: "90px", resize: "vertical" }}
              value={form.notes}
              placeholder="Any concerns, past dental history, or anything you'd like us to be aware of…"
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {error     && <p style={s.error}>{error}</p>}
          {statusMsg && <p style={s.status}>{statusMsg}</p>}
        </div>
      )}

      {/* Nav */}
      <div style={s.nav}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={s.backBtn}>← Back</button>
        )}
        <div style={{ flex: 1 }} />
        {step < STEP_LABELS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
            style={{ ...s.nextBtn, ...(!canProceed() ? s.nextBtnDisabled : {}) }}>
            Continue →
          </button>
        ) : (
          <button onClick={sendEmail} disabled={!canProceed() || sending}
            style={{ ...s.nextBtn, ...(!canProceed() || sending ? s.nextBtnDisabled : {}) }}>
            {sending ? "Sending…" : "Submit →"}
          </button>
        )}
      </div>

    </div></div>
  );
}

// ── Photo slot styles ────────────────────────────────────────────────────────
const ps = {
  wrap:        { border: "1px solid #e8e4df", borderRadius: "4px", padding: "1rem", backgroundColor: "#faf9f7" },
  header:      { display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "flex-start" },
  icon:        { fontSize: "1.4rem", lineHeight: 1, flexShrink: 0, marginTop: "2px" },
  label:       { fontWeight: 600, fontSize: "0.88rem", color: "#1a1a1a", margin: "0 0 0.25rem" },
  instruction: { fontSize: "0.82rem", color: "#5a5550", lineHeight: 1.5, margin: "0 0 0.2rem" },
  helper:      { fontSize: "0.75rem", color: "#9a8c7e", fontStyle: "italic", margin: 0 },
  sizeWarn:    { fontSize: "0.78rem", color: "#b07d2a", marginBottom: "0.4rem" },
  dropZone:    { border: "2px dashed #ddd8d2", borderRadius: "3px", padding: "1.2rem", textAlign: "center", cursor: "pointer", backgroundColor: "#ffffff" },
  dropIconEl:  { fontSize: "1.5rem", margin: "0 0 0.3rem" },
  dropText:    { fontSize: "0.85rem", color: "#3a3530", margin: "0 0 0.2rem", fontWeight: 600 },
  dropSub:     { fontSize: "0.75rem", color: "#9a8c7e", margin: 0 },
  previewWrap: {},
  preview:     { width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "3px", display: "block" },
  previewMeta: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.35rem" },
  previewSize: { fontSize: "0.72rem", color: "#9a8c7e" },
  removeBtn:   { background: "none", border: "none", color: "#c0392b", fontSize: "0.78rem", cursor: "pointer", padding: 0 },
};

// ── Main styles ──────────────────────────────────────────────────────────────
const s = {
  wrapper:         { minHeight: "100vh", backgroundColor: "#f7f5f2", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem 1rem", fontFamily: "'Georgia', serif" },
  card:            { backgroundColor: "#ffffff", borderRadius: "4px", boxShadow: "0 2px 24px rgba(0,0,0,0.07)", padding: "2.5rem", maxWidth: "620px", width: "100%" },
  header:          { marginBottom: "2rem", borderBottom: "1px solid #e8e4df", paddingBottom: "1.5rem" },
  eyebrow:         { fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9a8c7e", margin: "0 0 0.5rem" },
  title:           { fontSize: "1.6rem", fontWeight: "normal", color: "#1a1a1a", margin: "0 0 0.75rem", lineHeight: 1.2 },
  subtitle:        { fontSize: "0.92rem", color: "#5a5550", lineHeight: 1.6, margin: 0 },
  progressWrap:    { marginBottom: "2rem" },
  progressTrack:   { height: "3px", backgroundColor: "#ede9e4", borderRadius: "2px", overflow: "hidden", marginBottom: "0.5rem" },
  progressFill:    { height: "100%", backgroundColor: "#2c5f5d", borderRadius: "2px", transition: "width 0.4s ease" },
  progressLabel:   { fontSize: "0.75rem", color: "#9a8c7e", margin: 0, letterSpacing: "0.04em" },
  section:         { marginBottom: "1.5rem" },
  question:        { fontSize: "1.1rem", fontWeight: "normal", color: "#1a1a1a", margin: "0 0 0.4rem", lineHeight: 1.4 },
  hint:            { fontSize: "0.82rem", color: "#9a8c7e", margin: "0 0 0.75rem" },
  infoBox:         { backgroundColor: "#fdf9f4", border: "1px solid #e8ddd0", borderRadius: "3px", padding: "0.9rem 1rem" },
  infoText:        { fontSize: "0.84rem", color: "#5a5550", lineHeight: 1.65, margin: 0 },
  grid:            { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.75rem" },
  chip:            { padding: "0.65rem 0.9rem", border: "1px solid #ddd8d2", borderRadius: "3px", backgroundColor: "#faf9f7", color: "#3a3530", fontSize: "0.85rem", cursor: "pointer", textAlign: "left", lineHeight: 1.3, transition: "all 0.15s ease" },
  chipActive:      { backgroundColor: "#2c5f5d", borderColor: "#2c5f5d", color: "#ffffff" },
  stack:           { display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" },
  optionBtn:       { padding: "0.85rem 1rem", border: "1px solid #ddd8d2", borderRadius: "3px", backgroundColor: "#faf9f7", color: "#3a3530", fontSize: "0.9rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s ease" },
  optionBtnActive: { backgroundColor: "#2c5f5d", borderColor: "#2c5f5d", color: "#ffffff" },
  recBox:          { backgroundColor: "#f0f5f5", border: "1px solid #c8dbd9", borderRadius: "4px", padding: "1.4rem 1.5rem", marginBottom: "1rem" },
  recEyebrow:      { fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2c5f5d", margin: "0 0 0.5rem" },
  recText:         { fontSize: "1.05rem", color: "#1a1a1a", lineHeight: 1.6, margin: 0, fontStyle: "italic" },
  caveatBox:       { backgroundColor: "#fdf9f4", border: "1px solid #e8ddd0", borderRadius: "4px", padding: "1.2rem 1.5rem" },
  caveatTitle:     { fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9a8c7e", margin: "0 0 0.5rem" },
  caveatText:      { fontSize: "0.85rem", color: "#5a5550", lineHeight: 1.75, margin: 0 },
  formGroup:       { marginBottom: "1.2rem" },
  label:           { display: "block", fontSize: "0.82rem", color: "#5a5550", marginBottom: "0.4rem", letterSpacing: "0.02em" },
  input:           { width: "100%", padding: "0.7rem 0.9rem", border: "1px solid #ddd8d2", borderRadius: "3px", fontSize: "0.92rem", color: "#1a1a1a", backgroundColor: "#faf9f7", boxSizing: "border-box", fontFamily: "inherit", outline: "none" },
  nav:             { display: "flex", alignItems: "center", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e8e4df" },
  backBtn:         { background: "none", border: "none", color: "#9a8c7e", fontSize: "0.88rem", cursor: "pointer", padding: 0 },
  nextBtn:         { backgroundColor: "#2c5f5d", color: "#ffffff", border: "none", borderRadius: "3px", padding: "0.75rem 1.75rem", fontSize: "0.92rem", cursor: "pointer", letterSpacing: "0.02em", transition: "background 0.2s ease" },
  nextBtnDisabled: { backgroundColor: "#c5bdb5", cursor: "not-allowed" },
  error:           { color: "#c0392b", fontSize: "0.85rem", marginTop: "0.5rem" },
  status:          { color: "#2c5f5d", fontSize: "0.85rem", marginTop: "0.5rem", fontStyle: "italic" },
  successMark:     { fontSize: "2rem", color: "#2c5f5d", marginBottom: "1rem" },
  successTitle:    { fontSize: "1.5rem", fontWeight: "normal", color: "#1a1a1a", marginBottom: "0.75rem" },
  successText:     { fontSize: "0.95rem", color: "#5a5550", lineHeight: 1.7, marginBottom: "1.5rem" },
  successSub:      { fontSize: "0.85rem", color: "#9a8c7e", fontStyle: "italic" },
};
