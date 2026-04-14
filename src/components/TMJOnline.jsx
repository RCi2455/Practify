import { useState } from "react";


var primary  = "#3D3830";
var brand    = "#C9BA9B";
var bgPage   = "#5A5A59";
var white    = "#FFFFFF";
var border   = "#E2DAD0";
var textColor = "#2C2C2C";
var muted    = "#7A7060";

var font  = "DM Sans, sans-serif";
var serif = "Cormorant Garamond, Georgia, serif";

var QUESTIONS = [
  {
    id: 1, text: "Where do you experience pain or discomfort?",
    hint: "Select all that apply", type: "multi", maxScore: 2,
    options: [
      { label: "In front of the ear or jaw joint area", value: "joint",   score: 1 },
      { label: "Face or cheek muscles",                 value: "muscles", score: 1 },
      { label: "Inside the ear",                        value: "ear",     score: 0 },
      { label: "Temple or side of head",                value: "temple",  score: 1 },
      { label: "No pain – I only notice sounds",        value: "none",    score: 0 },
    ],
  },
  {
    id: 2, text: "How long have you been experiencing jaw symptoms?",
    type: "single",
    options: [
      { label: "Less than 1 month",                          value: "lt1m",       score: 1 },
      { label: "1 to 6 months",                              value: "1to6m",      score: 2 },
      { label: "6 to 12 months",                             value: "6to12m",     score: 3 },
      { label: "Over 1 year",                                value: "gt1y",       score: 4 },
      { label: "I only notice sounds, no other symptoms",    value: "sounds_only",score: 0 },
    ],
  },
  {
    id: 3, text: "On average, how would you rate your jaw pain?",
    hint: "0 = No pain at all, 10 = Worst imaginable", type: "slider",
  },
  {
    id: 4, text: "Do you hear any sounds from your jaw?",
    type: "single",
    options: [
      { label: "No sounds",                          value: "none",     score: 0 },
      { label: "Clicking or popping – consistent",   value: "click_c",  score: 1 },
      { label: "Clicking or popping – comes and goes",value: "click_v", score: 2 },
      { label: "Grating or crunching sound",         value: "crepitus", score: 4 },
    ],
  },
  {
    id: 5, text: "Has your jaw ever felt stuck or locked – difficult to open or close?",
    type: "single",
    options: [
      { label: "Never",                                          value: "never",   score: 0 },
      { label: "Occasionally – resolves quickly on its own",     value: "occ",     score: 2 },
      { label: "Frequently",                                     value: "freq",    score: 3 },
      { label: "Currently experiencing this",                    value: "current", score: 5 },
    ],
  },
  {
    id: 6, text: "How wide can you open your mouth?",
    hint: "Try placing fingers vertically between your front teeth as a guide",
    type: "single",
    options: [
      { label: "Normal – 3 fingers fit comfortably",    value: "normal",   score: 0 },
      { label: "Slightly reduced – 2 to 3 fingers",     value: "slight",   score: 1 },
      { label: "Moderately reduced – about 2 fingers",  value: "moderate", score: 2 },
      { label: "Very limited – 1 finger or less",       value: "severe",   score: 3 },
    ],
  },
  {
    id: 7, text: "Do you experience headaches that seem related to your jaw or face?",
    type: "single",
    options: [
      { label: "Never",        value: "never", score: 0 },
      { label: "Occasionally", value: "occ",   score: 1 },
      { label: "Frequently",   value: "freq",  score: 2 },
    ],
  },
  {
    id: 8, text: "Do you grind or clench your teeth?",
    type: "single",
    options: [
      { label: "No",                         value: "no",   score: 0 },
      { label: "Sometimes – mainly at night",value: "some", score: 1 },
      { label: "Yes, regularly",             value: "yes",  score: 2 },
    ],
  },
  {
    id: 9, text: "Does jaw discomfort affect your ability to eat?",
    type: "single",
    options: [
      { label: "Not at all",                           value: "no",   score: 0 },
      { label: "Mild difficulty with hard foods",      value: "mild", score: 1 },
      { label: "Significant difficulty – soft diet only", value: "sig", score: 2 },
    ],
  },
  {
    id: 10, text: "Have you ever had an injury to your jaw or face?",
    type: "single",
    options: [
      { label: "No",  value: "no",  score: 0 },
      { label: "Yes", value: "yes", score: 1 },
    ],
  },
  {
    id: 11, text: "Do you experience jaw pain when your mouth is at rest?",
    type: "single",
    options: [
      { label: "No – only when moving or eating", value: "no",  score: 0 },
      { label: "Occasionally",                    value: "occ", score: 1 },
      { label: "Yes, most of the time",           value: "yes", score: 2 },
    ],
  },
  {
    id: 12, text: "If you previously had jaw clicking – has the clicking stopped but your symptoms worsened?",
    type: "single",
    options: [
      { label: "I never had clicking / not applicable",             value: "na",    score: 0 },
      { label: "Clicking is still present",                         value: "still", score: 0 },
      { label: "Yes – clicking stopped but pain or stiffness increased", value: "yes", score: 3 },
    ],
  },
];

function calcScore(answers) {
  return QUESTIONS.reduce(function(total, q, idx) {
    var ans = answers[idx];
    if (ans === undefined || ans === null) return total;
    if (q.type === "slider") {
      if (ans === 0) return total;
      if (ans <= 3) return total + 1;
      if (ans <= 6) return total + 2;
      return total + 3;
    }
    if (q.type === "multi") {
      var s = (ans || []).reduce(function(a, v) {
        var opt = q.options.find(function(o) { return o.value === v; });
        return a + (opt ? opt.score : 0);
      }, 0);
      return total + Math.min(s, q.maxScore || 99);
    }
    var opt = q.options && q.options.find(function(o) { return o.value === ans; });
    return total + (opt ? opt.score : 0);
  }, 0);
}

function getStage(score) {
  if (score <= 4)  return 1;
  if (score <= 10) return 2;
  if (score <= 17) return 3;
  if (score <= 22) return 4;
  return 5;
}

// Patient-facing content only — no Wilkes references
var GUIDANCE = {
  1: {
    title: "Your jaw symptoms appear mild",
    summary: "Many people experience occasional jaw discomfort, often related to muscle tension or minor joint movement. With some simple self-care, most people see a significant improvement.",
    advice: [
      "Eat softer foods and avoid very hard or chewy items for a while",
      "Avoid wide jaw movements – take small bites and be careful when yawning",
      "Apply a warm compress to the jaw area for 10–15 minutes to ease muscle tension",
      "Try to keep your teeth slightly apart when at rest and be mindful of clenching",
    ],
    urgency: "If your symptoms persist or worsen, we'd be happy to see you for a thorough jaw assessment.",
    severity: "Mild",
  },
  2: {
    title: "Your jaw symptoms are worth having assessed",
    summary: "Your answers suggest some jaw discomfort that would benefit from professional attention. While not urgent, a jaw assessment will help us understand what's happening and discuss your options.",
    advice: [
      "Stick to a soft diet and avoid hard or very chewy foods",
      "Take small bites and be cautious when yawning to avoid wide jaw movement",
      "Apply warm compresses to the jaw area to ease muscle tension",
      "Try to notice any clenching or grinding habits, particularly at night",
    ],
    urgency: "We'd recommend booking a jaw assessment at the practice – it's a straightforward appointment and lets us properly evaluate your symptoms.",
    severity: "Mild–Moderate",
  },
  3: {
    title: "Your jaw would benefit from a professional assessment",
    summary: "Based on your answers, your jaw symptoms would benefit from being examined by a clinician. This will help us understand what's happening and ensure you receive the right support.",
    advice: [
      "Follow a soft diet to reduce strain on the jaw joint",
      "Avoid any activities or foods that aggravate your symptoms",
      "Apply warmth to the jaw area for comfort as needed",
    ],
    urgency: "Please do book a jaw assessment with us – the sooner we see you, the sooner we can help you feel more comfortable.",
    severity: "Moderate",
  },
  4: {
    title: "Your jaw symptoms need professional attention",
    summary: "Your answers suggest significant jaw symptoms and we'd like to see you at the practice so we can properly assess what's happening and ensure you have the right support.",
    advice: [
      "Follow a very soft diet to minimise strain on the jaw",
      "Avoid movements that significantly worsen your symptoms",
      "Apply warmth for comfort as needed",
    ],
    urgency: "Please contact the practice soon to arrange a jaw assessment – our team will make sure you are seen promptly.",
    severity: "Moderate–Significant",
  },
  5: {
    title: "Please contact us to arrange an assessment",
    summary: "Your answers suggest you are experiencing significant jaw symptoms that we'd like to assess as soon as possible. Our team is here to help and will ensure you are seen promptly.",
    advice: [
      "Stick to a very soft diet – avoid anything that causes pain",
      "Avoid unnecessary jaw movement where possible",
      "Contact the practice as soon as you can",
    ],
    urgency: "Please contact the practice as soon as possible to arrange a jaw assessment. We want to ensure you receive the right care without delay.",
    severity: "Significant",
  },
};

// ── Styles ────────────────────────────────────────────────────────
var cardStyle = {
  background: white, borderRadius: 16, padding: "32px 36px",
  border: "1px solid " + border, maxWidth: 580, width: "100%",
  boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
};
var btnP = {
  background: primary, color: white, border: "none", borderRadius: 10,
  padding: "13px 26px", fontSize: 14, fontFamily: font, fontWeight: 500, cursor: "pointer",
};
var btnS = {
  background: "transparent", color: primary,
  border: "1.5px solid rgba(61,56,48,0.22)", borderRadius: 10,
  padding: "11px 22px", fontSize: 13, fontFamily: font, cursor: "pointer",
};
var labelStyle = {
  fontSize: 12, fontWeight: 500, color: primary, display: "block", marginBottom: 6,
};
var inputStyle = {
  width: "100%", padding: "11px 14px", border: "1.5px solid " + border,
  borderRadius: 10, fontSize: 14, fontFamily: font, boxSizing: "border-box",
  outline: "none", color: textColor, background: white,
};

function OptionCard(props) {
  var sel = props.selected;
  return (
    <div
      onClick={props.onClick}
      style={{
        border: "1.5px solid " + (sel ? primary : border),
        background: sel ? "rgba(61,56,48,0.06)" : white,
        borderRadius: 10, padding: "12px 16px", cursor: "pointer",
        fontSize: 14, color: sel ? primary : textColor,
        fontWeight: sel ? 500 : 400,
        display: "flex", alignItems: "center", gap: 12, userSelect: "none",
      }}
    >
      <div style={{
        width: 18, height: 18, flexShrink: 0,
        borderRadius: props.type === "radio" ? "50%" : 4,
        border: "1.5px solid " + (sel ? primary : border),
        background: sel ? primary : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {sel && props.type === "radio" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: white }} />}
        {sel && props.type !== "radio" && <span style={{ color: white, fontSize: 10, fontWeight: 500 }}>✓</span>}
      </div>
      {props.label}
    </div>
  );
}

function ProgressBar(props) {
  var pct = Math.round(((props.current + 1) / props.total) * 100);
  return (
    <div style={{ maxWidth: 612, width: "100%", padding: "0 16px", marginBottom: 20, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Question {props.current + 1} of {props.total}</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{pct}% complete</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, height: 5 }}>
        <div style={{ background: brand, width: pct + "%", height: 5, borderRadius: 99 }} />
      </div>
    </div>
  );
}

export default function TMJOnline() {
  var stepState   = useState("q0");
  var step        = stepState[0]; var setStep = stepState[1];
  var answersState = useState({});
  var answers     = answersState[0]; var setAnswers = answersState[1];
  var sliderState = useState(0);
  var slider      = sliderState[0]; var setSlider = sliderState[1];
  var contactState = useState({ name: "", phone: "", email: "" });
  var contact     = contactState[0]; var setContact = contactState[1];
  var sendingState = useState(false);
  var sending     = sendingState[0]; var setSending = sendingState[1];
  var errorState  = useState("");
  var error       = errorState[0]; var setError = errorState[1];

  var qIdx = step.startsWith("q") ? parseInt(step.slice(1), 10) : null;
  var isQ  = qIdx !== null;
  var cq   = isQ ? QUESTIONS[qIdx] : null;
  var score = calcScore(answers);
  var stage = getStage(score);
  var gd    = GUIDANCE[stage];

  var canNextQ = function() {
    if (!isQ) return true;
    if (cq.type === "slider") return true;
    if (cq.type === "multi")  return (answers[qIdx] || []).length > 0;
    return answers[qIdx] !== undefined;
  };

  var canSubmit = function() {
    return contact.name.trim().length > 0 && contact.phone.trim().length > 0;
  };

  var nextQ = function() {
    if (!isQ) return;
    if (cq.type === "slider") {
      setAnswers(function(a) { var n = Object.assign({}, a); n[qIdx] = slider; return n; });
    }
    setStep(qIdx < QUESTIONS.length - 1 ? "q" + (qIdx + 1) : "results");
  };

  var backQ = function() {
    if (step === "q0")      { return; }
    if (step === "results") { setStep("q" + (QUESTIONS.length - 1)); return; }
    if (step === "contact") { setStep("results"); return; }
    if (isQ)                { setStep("q" + (qIdx - 1)); return; }
  };

  var setAnswer = function(v) {
    setAnswers(function(a) { var n = Object.assign({}, a); n[qIdx] = v; return n; });
  };

  var toggleMulti = function(v) {
    var cur = answers[qIdx] || [];
    if (v === "none") {
      setAnswers(function(a) { var n = Object.assign({}, a); n[qIdx] = ["none"]; return n; });
      return;
    }
    var f = cur.filter(function(x) { return x !== "none"; });
    setAnswers(function(a) {
      var n = Object.assign({}, a);
      n[qIdx] = f.includes(v) ? f.filter(function(x) { return x !== v; }) : f.concat([v]);
      return n;
    });
  };

  // Build a plain-text summary of answers for the email (no Wilkes)
  var buildAnswerSummary = function() {
    return QUESTIONS.map(function(q, idx) {
      var ans = answers[idx];
      var ansText = "Not answered";
      if (q.type === "slider") {
        ansText = ans !== undefined ? ans + "/10" : "Not answered";
      } else if (q.type === "multi") {
        ansText = (ans || []).length
          ? (ans || []).map(function(v) { var o = q.options.find(function(x) { return x.value === v; }); return o ? o.label : ""; }).filter(Boolean).join(", ")
          : "Not answered";
      } else {
        var found = ans && q.options && q.options.find(function(o) { return o.value === ans; });
        ansText = found ? found.label : "Not answered";
      }
      return "Q" + (idx + 1) + ". " + q.text + "\n   -> " + ansText;
    }).join("\n\n");
  };

  var handleSend = async function() {
    setSending(true);
    setError("");
  
    try {
      var res = await fetch("/api/send-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "tmj",
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          severity: gd.severity,
          dateSubmitted: new Date().toLocaleDateString("en-GB"),
          answerSummary: buildAnswerSummary(),
        }),
      });
  
      if (!res.ok) throw new Error("Send failed");
      setStep("sent");
  
    } catch (err) {
      console.error("Send error:", err);
      setError("There was a problem sending your request. Please call us on 01883 622222 or try again.");
    } finally {
      setSending(false);
    }
  };
  return (
    <div style={{ fontFamily: font, background: bgPage, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ width: "100%", background: primary, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
        <div>
          <div style={{ fontFamily: serif, fontSize: 22, color: white, letterSpacing: "0.3px" }}>Complete Dentistry</div>
          <div style={{ color: brand, fontSize: 11, marginTop: 2, letterSpacing: "2px", textTransform: "uppercase" }}>Jaw Pain Checker</div>
        </div>
      </div>
      <div style={{ width: "100%", background: brand, height: 6, marginBottom: 32 }} />

      {/* Progress bar during questions */}
      {isQ && <ProgressBar current={qIdx} total={QUESTIONS.length} />}

      {/* ── Questions ── */}
      {isQ && cq && (
        <div style={Object.assign({}, cardStyle, { margin: "0 16px" })}>
          <div style={{ fontFamily: serif, fontSize: 24, color: primary, lineHeight: 1.35, marginBottom: cq.hint ? 6 : 20 }}>{cq.text}</div>
          {cq.hint && <p style={{ fontSize: 13, color: muted, marginBottom: 18 }}>{cq.hint}</p>}

          {cq.type === "single" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {cq.options.map(function(opt) {
                return <OptionCard key={opt.value} label={opt.label} selected={answers[qIdx] === opt.value} onClick={function() { setAnswer(opt.value); }} type="radio" />;
              })}
            </div>
          )}

          {cq.type === "multi" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {cq.options.map(function(opt) {
                return <OptionCard key={opt.value} label={opt.label} selected={(answers[qIdx] || []).includes(opt.value)} onClick={function() { toggleMulti(opt.value); }} type="check" />;
              })}
            </div>
          )}

          {cq.type === "slider" && (
            <div>
              <div style={{ textAlign: "center", margin: "8px 0 20px" }}>
                <span style={{ fontFamily: serif, fontSize: 56, color: primary }}>{slider}</span>
                <span style={{ fontSize: 22, color: muted }}> / 10</span>
              </div>
              <input
                type="range" min="0" max="10" step="1" value={slider}
                onChange={function(e) { setSlider(Number(e.target.value)); }}
                style={{ width: "100%", accentColor: primary }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: muted }}>
                <span>0 – No pain</span>
                <span>10 – Worst imaginable</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between" }}>
            {qIdx > 0
              ? <button style={btnS} onClick={backQ}>Back</button>
              : <span />
            }
            <button style={Object.assign({}, btnP, { opacity: canNextQ() ? 1 : 0.35 })} onClick={nextQ} disabled={!canNextQ()}>
              {qIdx < QUESTIONS.length - 1 ? "Next" : "See My Results"}
            </button>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {step === "results" && (
        <div style={{ maxWidth: 580, width: "100%", margin: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={Object.assign({}, cardStyle, { margin: 0 })}>

            {/* Completion badge */}
            <div style={{ background: "rgba(61,56,48,0.08)", border: "1.5px solid " + border, borderRadius: 10, padding: "10px 16px", marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: muted }}>
                Assessment completed – {new Date().toLocaleDateString("en-GB")}
              </span>
            </div>

            <div style={{ fontFamily: serif, fontSize: 28, color: primary, marginBottom: 10, lineHeight: 1.3 }}>{gd.title}</div>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "#4B5563", marginBottom: 20 }}>{gd.summary}</p>

            {/* Advice bullets */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: primary, marginBottom: 10 }}>What you can do now:</div>
              {gd.advice.map(function(tip, i) {
                return (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 9 }}>
                    <div style={{ width: 20, height: 20, background: primary, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: white, fontSize: 10 }}>✓</span>
                    </div>
                    <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{tip}</span>
                  </div>
                );
              })}
            </div>

            {/* Urgency note */}
            <p style={{ fontSize: 13, color: muted, lineHeight: 1.6, borderTop: "1px solid " + border, paddingTop: 16, marginBottom: 20 }}>{gd.urgency}</p>

            {/* CTA */}
            <button
              style={Object.assign({}, btnP, { width: "100%", textAlign: "center" })}
              onClick={function() { setStep("contact"); }}
            >
              Request an Appointment
            </button>
          </div>
        </div>
      )}

      {/* ── Contact details ── */}
      {step === "contact" && (
        <div style={Object.assign({}, cardStyle, { margin: "0 16px" })}>
          <div style={{ fontFamily: serif, fontSize: 26, color: primary, marginBottom: 6 }}>Request an Appointment</div>
          <p style={{ fontSize: 13, color: muted, marginBottom: 24, lineHeight: 1.6 }}>
            Please leave your details below and we'll be in touch to arrange a convenient time for your jaw assessment.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input
                style={inputStyle}
                placeholder="e.g. Jane Smith"
                value={contact.name}
                onChange={function(e) { setContact(function(c) { return Object.assign({}, c, { name: e.target.value }); }); }}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone Number *</label>
              <input
                style={inputStyle}
                type="tel"
                placeholder="e.g. 07700 900000"
                value={contact.phone}
                onChange={function(e) { setContact(function(c) { return Object.assign({}, c, { phone: e.target.value }); }); }}
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address <span style={{ color: muted, fontWeight: 400 }}>(optional)</span></label>
              <input
                style={inputStyle}
                type="email"
                placeholder="your@email.com"
                value={contact.email}
                onChange={function(e) { setContact(function(c) { return Object.assign({}, c, { email: e.target.value }); }); }}
              />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 16, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#B91C1C" }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between" }}>
            <button style={btnS} onClick={function() { setStep("results"); }}>Back</button>
            <button
              style={Object.assign({}, btnP, { opacity: (canSubmit() && !sending) ? 1 : 0.45 })}
              onClick={handleSend}
              disabled={!canSubmit() || sending}
            >
              {sending ? "Sending…" : "Send Request"}
            </button>
          </div>

          <p style={{ fontSize: 11, color: muted, marginTop: 12, lineHeight: 1.5 }}>
            Your details and assessment responses will be sent securely to our reception team. We'll contact you within one working day.
          </p>
        </div>
      )}

      {/* ── Confirmation ── */}
      {step === "sent" && (
        <div style={Object.assign({}, cardStyle, { margin: "0 16px", textAlign: "center" })}>
          <div style={{ width: 56, height: 56, background: primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <span style={{ color: brand, fontSize: 26 }}>✓</span>
          </div>
          <div style={{ fontFamily: serif, fontSize: 28, color: primary, marginBottom: 10 }}>Request Received</div>
          <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.75, marginBottom: 24 }}>
            Thank you, {contact.name}. Your appointment request has been sent to our reception team. We'll be in touch within one working day to confirm a time that suits you.
          </p>
          <div style={{ background: primary, borderRadius: 12, padding: "18px 20px" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.55, margin: "0 0 12px" }}>
              If you need to speak to us sooner, please don't hesitate to call.
            </p>
            <a href="tel:01883622222" style={{ background: brand, color: primary, padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none", display: "inline-block" }}>
              Call 01883 622222
            </a>
          </div>
        </div>
      )}

    </div>
  );
}

/*
─────────────────────────────────────────────────────────────────────
 EMAILJS SETUP — do this once in your EmailJS dashboard
─────────────────────────────────────────────────────────────────────

 1. Log in at emailjs.com → Email Templates → Create Template
 2. Set the template fields as follows:

    To:       reception@completedentistrysurrey.co.uk
    Subject:  I would like to book a TMJ assessment

    Body:
    -------------------------------------------------------
    New jaw assessment appointment request — Practify

    Patient name:   {{patient_name}}
    Phone:          {{patient_phone}}
    Email:          {{patient_email}}
    Date submitted: {{date_submitted}}
    Symptom level:  {{severity}}
    Summary:        {{guidance_title}}

    ── Full Assessment Responses ──
    {{answer_summary}}
    -------------------------------------------------------

 3. Copy your Service ID, Template ID, and Public Key into the
    three variables at the top of this file.

─────────────────────────────────────────────────────────────────────
*/
