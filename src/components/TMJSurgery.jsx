import { useState } from "react";
import { jsPDF } from "jspdf";

var primary  = "#3D3830";
var brand    = "#C9BA9B";
var bgPage   = "#5A5A59";
var white    = "#FFFFFF";
var border   = "#E2DAD0";
var textColor = "#2C2C2C";
var muted    = "#7A7060";
var s1c = "#2d7a4f";
var s2c = "#5a8a2e";
var s3c = "#c49a00";
var s4c = "#c06000";
var s5c = "#c0392b";

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
      { label: "Less than 1 month",                        value: "lt1m",       score: 1 },
      { label: "1 to 6 months",                            value: "1to6m",      score: 2 },
      { label: "6 to 12 months",                           value: "6to12m",     score: 3 },
      { label: "Over 1 year",                              value: "gt1y",       score: 4 },
      { label: "I only notice sounds, no other symptoms",  value: "sounds_only",score: 0 },
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
      { label: "No sounds",                           value: "none",    score: 0 },
      { label: "Clicking or popping – consistent",    value: "click_c", score: 1 },
      { label: "Clicking or popping – comes and goes",value: "click_v", score: 2 },
      { label: "Grating or crunching sound",          value: "crepitus",score: 4 },
    ],
  },
  {
    id: 5, text: "Has your jaw ever felt stuck or locked – difficult to open or close?",
    type: "single",
    options: [
      { label: "Never",                                       value: "never",  score: 0 },
      { label: "Occasionally – resolves quickly on its own", value: "occ",    score: 2 },
      { label: "Frequently",                                  value: "freq",   score: 3 },
      { label: "Currently experiencing this",                 value: "current",score: 5 },
    ],
  },
  {
    id: 6, text: "How wide can you open your mouth?",
    hint: "Try placing fingers vertically between your front teeth as a guide",
    type: "single",
    options: [
      { label: "Normal – 3 fingers fit comfortably",   value: "normal",  score: 0 },
      { label: "Slightly reduced – 2 to 3 fingers",    value: "slight",  score: 1 },
      { label: "Moderately reduced – about 2 fingers", value: "moderate",score: 2 },
      { label: "Very limited – 1 finger or less",      value: "severe",  score: 3 },
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
      { label: "No",                          value: "no",   score: 0 },
      { label: "Sometimes – mainly at night", value: "some", score: 1 },
      { label: "Yes, regularly",              value: "yes",  score: 2 },
    ],
  },
  {
    id: 9, text: "Does jaw discomfort affect your ability to eat?",
    type: "single",
    options: [
      { label: "Not at all",                              value: "no",   score: 0 },
      { label: "Mild difficulty with hard foods",         value: "mild", score: 1 },
      { label: "Significant difficulty – soft diet only", value: "sig",  score: 2 },
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
      { label: "I never had clicking / not applicable",              value: "na",    score: 0 },
      { label: "Clicking is still present",                          value: "still", score: 0 },
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

var STAGE = {
  1: {
    color: s1c,
    clinician: "Wilkes Stage I – Early. Disc displacement with reduction likely. Probable muscular or mild articular aetiology. Minimal structural change expected. Conservative management and monitoring appropriate.",
    patientTitle: "Your jaw symptoms appear mild",
    patientSummary: "Many people experience occasional jaw discomfort, often related to muscle tension or minor joint movement. With some simple self-care, most people see a significant improvement.",
    advice: [
      "Eat softer foods and avoid very hard or chewy items for a period",
      "Avoid wide jaw movements – take small bites and be careful when yawning",
      "Apply a warm compress to the jaw area for 10–15 minutes to ease muscle tension",
      "Try to keep your teeth slightly apart when at rest, and be mindful of clenching",
    ],
    cta: "If your symptoms persist or worsen, we would be happy to see you for a thorough jaw assessment – simply give us a call.",
  },
  2: {
    color: s2c,
    clinician: "Wilkes Stage II – Early/Intermediate. Disc displacement with reduction. Some pain and functional limitation present. Conservative management with review indicated. Consider occlusal splint therapy.",
    patientTitle: "Your jaw symptoms are worth having assessed",
    patientSummary: "Your answers suggest some jaw discomfort that would benefit from professional attention. While not urgent, a jaw assessment will help us understand what is happening and discuss your options.",
    advice: [
      "Stick to a soft diet and avoid hard or very chewy foods",
      "Take small bites and be cautious when yawning to avoid wide jaw movement",
      "Apply warm compresses to the jaw area to ease muscle tension",
      "Try to notice any clenching or grinding habits, particularly at night",
    ],
    cta: "We would recommend booking a jaw assessment at the practice. It is a straightforward appointment and lets us properly evaluate your symptoms.",
  },
  3: {
    color: s3c,
    clinician: "Wilkes Stage III – Intermediate. Likely disc displacement without reduction. Pain, limitation and possible locking episodes. Active management required – consider splint therapy, physiotherapy, and imaging assessment.",
    patientTitle: "Your jaw would benefit from a professional assessment",
    patientSummary: "Based on your answers, your jaw symptoms would benefit from being examined by a clinician. This will help us understand what is happening and ensure you receive the right support.",
    advice: [
      "Follow a soft diet to reduce strain on the jaw joint",
      "Avoid any activities or foods that aggravate your symptoms",
      "Apply warmth to the jaw area for comfort as needed",
    ],
    cta: "Please do book a jaw assessment with us – the sooner we see you, the sooner we can help you feel more comfortable.",
  },
  4: {
    color: s4c,
    clinician: "Wilkes Stage IV – Intermediate/Late. Degenerative changes likely. Significant pain and functional limitation. Assessment with imaging referral indicated. Specialist involvement may be required.",
    patientTitle: "Your jaw symptoms need professional attention",
    patientSummary: "Your answers suggest significant jaw symptoms and we would like to see you at the practice so we can properly assess what is happening and ensure you have the right support.",
    advice: [
      "Follow a very soft diet to minimise strain on the jaw",
      "Avoid movements that significantly worsen your symptoms",
      "Apply warmth for comfort as needed",
    ],
    cta: "Please contact the practice soon to arrange a jaw assessment. Our team will make sure you are seen promptly.",
  },
  5: {
    color: s5c,
    clinician: "Wilkes Stage V – Late. Advanced degeneration, possible disc perforation. Significant functional disability. Prompt assessment essential. Imaging strongly indicated. Specialist referral likely required.",
    patientTitle: "Please contact us to arrange an assessment",
    patientSummary: "Your answers suggest you are experiencing significant jaw symptoms that we would like to assess as soon as possible. Our team is here to help and will ensure you are seen promptly.",
    advice: [
      "Stick to a very soft diet – avoid anything that causes pain",
      "Avoid unnecessary jaw movement where possible",
      "Contact the practice as soon as you can",
    ],
    cta: "Please contact the practice as soon as possible to arrange a jaw assessment. We want to ensure you receive the right care without delay.",
  },
};

function buildPDF(patient, answers) {
  var doc   = new jsPDF({ unit: "mm", format: "a4" });
  var W = 210;
  var M = 16;
  var score = calcScore(answers);
  var stage = getStage(score);
  var sd    = STAGE[stage];
  var y = 0;

  doc.setFillColor(61, 56, 48);
  doc.rect(0, 0, W, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("TMJ Symptom Assessment – In-Surgery", M, 14);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("Complete Dentistry Surrey  |  reception@completedentistrysurrey.co.uk", M, 22);
  doc.text("Date: " + new Date().toLocaleDateString("en-GB") + "   Mode: In-Practice", M, 29);
  y = 44;

  var line = function() {
    doc.setDrawColor(220, 212, 205);
    doc.line(M, y, W - M, y);
    y += 6;
  };

  // Patient details
  doc.setTextColor(61, 56, 48);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Details", M, y); y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 44, 44);
  doc.text("Name:  " + patient.name, M, y); y += 5;
  doc.text("DOB:   " + patient.dob,  M, y); y += 5;
  y += 3; line();

  // Clinician triage box
  doc.setFillColor(240, 237, 231);
  doc.rect(M - 2, y - 2, W - (M - 2) * 2, 34, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(61, 56, 48);
  doc.text("CLINICIAN TRIAGE – CONFIDENTIAL", M, y + 5);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 44, 44);
  doc.text("Symptom Score: " + score + "   |   Wilkes Classification: Stage " + stage, M, y + 12);
  var clinLines = doc.splitTextToSize(sd.clinician, W - M * 2 - 4);
  doc.text(clinLines, M, y + 19);
  y += 40; line();

  // Patient responses
  doc.setTextColor(61, 56, 48);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Responses", M, y); y += 7;

  QUESTIONS.forEach(function(q, idx) {
    if (y > 262) { doc.addPage(); y = 20; }
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(61, 56, 48);
    var qLines = doc.splitTextToSize("Q" + (idx + 1) + ". " + q.text, W - M * 2);
    doc.text(qLines, M, y); y += qLines.length * 4.5 + 1;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 55, 55);
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
    var aLines = doc.splitTextToSize("→ " + ansText, W - M * 2 - 4);
    doc.text(aLines, M + 4, y); y += aLines.length * 4.5 + 5;
  });

  // Footer
  var pages = doc.internal.getNumberOfPages();
  for (var i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(160, 155, 150);
    doc.text("Complete Dentistry Surrey  |  Practify TMJ Assessment (In-Surgery)  |  Page " + i + " of " + pages, M, 291);
  }

  return {
    doc: doc,
    score: score,
    stage: stage,
    fname: "TMJ_Surgery_" + patient.name.replace(/\s+/g, "_") + "_" + new Date().toLocaleDateString("en-GB").replace(/\//g, "-") + ".pdf",
  };
}

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

export default function TMJSurgery() {
  var stepState    = useState("details");
  var step         = stepState[0]; var setStep = stepState[1];
  var patientState = useState({ name: "", dob: "" });
  var patient      = patientState[0]; var setPatient = patientState[1];
  var answersState = useState({});
  var answers      = answersState[0]; var setAnswers = answersState[1];
  var sliderState  = useState(0);
  var slider       = sliderState[0]; var setSlider = sliderState[1];
  var clinState    = useState(false);
  var showClinician = clinState[0]; var setShowClinician = clinState[1];

  var qIdx = step.startsWith("q") ? parseInt(step.slice(1), 10) : null;
  var isQ  = qIdx !== null;
  var cq   = isQ ? QUESTIONS[qIdx] : null;
  var score = calcScore(answers);
  var stage = getStage(score);
  var sd    = STAGE[stage];

  var canNext = function() {
    if (step === "details") return !!(patient.name.trim()) && !!(patient.dob);
    if (isQ) {
      if (cq.type === "slider") return true;
      if (cq.type === "multi")  return (answers[qIdx] || []).length > 0;
      return answers[qIdx] !== undefined;
    }
    return true;
  };

  var next = function() {
    if (step === "details") { setStep("q0"); return; }
    if (isQ) {
      if (cq.type === "slider") {
        setAnswers(function(a) { var n = Object.assign({}, a); n[qIdx] = slider; return n; });
      }
      setStep(qIdx < QUESTIONS.length - 1 ? "q" + (qIdx + 1) : "results");
    }
  };

  var back = function() {
    if (step === "q0")      { setStep("details"); return; }
    if (isQ)                { setStep("q" + (qIdx - 1)); return; }
    if (step === "results") { setStep("q" + (QUESTIONS.length - 1)); return; }
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

  var handlePDF = function() {
    var result = buildPDF(patient, answers);
    result.doc.save(result.fname);
  };

  var reset = function() {
    setStep("details");
    setPatient({ name: "", dob: "" });
    setAnswers({});
    setSlider(0);
    setShowClinician(false);
  };

  return (
    <div style={{ fontFamily: font, background: bgPage, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ width: "100%", background: primary, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
        <div>
          <div style={{ fontFamily: serif, fontSize: 22, color: white, letterSpacing: "0.3px" }}>Complete Dentistry</div>
          <div style={{ color: brand, fontSize: 11, marginTop: 2, letterSpacing: "2px", textTransform: "uppercase" }}>TMJ Assessment – Surgery</div>
        </div>
        <div style={{ background: "rgba(201,186,155,0.15)", border: "1px solid " + brand, color: brand, padding: "4px 14px", borderRadius: 20, fontSize: 12 }}>
          In-Practice
        </div>
      </div>
      <div style={{ width: "100%", background: brand, height: 6, marginBottom: 32 }} />

      {isQ && <ProgressBar current={qIdx} total={QUESTIONS.length} />}

      {/* ── Patient Details ── */}
      {step === "details" && (
        <div style={Object.assign({}, cardStyle, { margin: "0 16px" })}>
          <div style={{ fontFamily: serif, fontSize: 26, color: primary, marginBottom: 6 }}>Patient Details</div>
          <p style={{ fontSize: 13, color: muted, marginBottom: 24 }}>Enter the patient's details before beginning the assessment.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} placeholder="e.g. Jane Smith" value={patient.name} onChange={function(e) { setPatient(function(p) { return Object.assign({}, p, { name: e.target.value }); }); }} />
            </div>
            <div>
              <label style={labelStyle}>Date of Birth *</label>
              <input style={inputStyle} type="date" value={patient.dob} onChange={function(e) { setPatient(function(p) { return Object.assign({}, p, { dob: e.target.value }); }); }} />
            </div>
          </div>
          <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
            <button style={Object.assign({}, btnP, { opacity: canNext() ? 1 : 0.35 })} onClick={next} disabled={!canNext()}>
              Start Assessment
            </button>
          </div>
        </div>
      )}

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
            <button style={btnS} onClick={back}>Back</button>
            <button style={Object.assign({}, btnP, { opacity: canNext() ? 1 : 0.35 })} onClick={next} disabled={!canNext()}>
              {qIdx < QUESTIONS.length - 1 ? "Next" : "See Results"}
            </button>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {step === "results" && (
        <div style={{ maxWidth: 580, width: "100%", margin: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Patient-facing card */}
          <div style={Object.assign({}, cardStyle, { margin: 0 })}>
            <div style={{ background: sd.color + "20", border: "1.5px solid " + sd.color + "50", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: sd.color }}>Assessment completed – {new Date().toLocaleDateString("en-GB")}</span>
            </div>
            <div style={{ fontFamily: serif, fontSize: 28, color: primary, marginBottom: 10, lineHeight: 1.3 }}>{sd.patientTitle}</div>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "#4B5563", marginBottom: 20 }}>{sd.patientSummary}</p>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: primary, marginBottom: 10 }}>What you can do now:</div>
              {sd.advice.map(function(tip, i) {
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
            <div style={{ background: primary, borderRadius: 12, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.55, margin: 0, flex: 1 }}>{sd.cta}</p>
              <a href="tel:01883622222" style={{ background: brand, color: primary, padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
                Call 01883 622222
              </a>
            </div>
          </div>

          {/* Clinician triage panel */}
          <div style={Object.assign({}, cardStyle, { margin: 0, border: "1.5px solid " + primary })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={function() { setShowClinician(function(s) { return !s; }); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: primary }}>Clinician Triage Summary</span>
                <span style={{ background: sd.color, color: white, padding: "2px 10px", borderRadius: 20, fontSize: 11 }}>Wilkes Stage {stage}</span>
              </div>
              <span style={{ color: primary, fontSize: 16, userSelect: "none" }}>{showClinician ? "▲" : "▼"}</span>
            </div>
            {showClinician && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid " + border }}>
                <div style={{ display: "flex", gap: 28, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: serif, fontSize: 40, color: primary, lineHeight: 1 }}>{score}</div>
                    <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>Symptom score</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: serif, fontSize: 40, color: sd.color, lineHeight: 1 }}>Stage {stage}</div>
                    <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>Wilkes classification</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "#374151", background: "#F8F5F0", padding: "12px 14px", borderRadius: 8, margin: 0 }}>{sd.clinician}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={Object.assign({}, cardStyle, { margin: 0 })}>
            <div style={{ fontSize: 13, fontWeight: 500, color: primary, marginBottom: 14 }}>Actions</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={handlePDF} style={Object.assign({}, btnP, { flex: 1, minWidth: 160 })}>
                Download PDF
              </button>
              <button onClick={reset} style={Object.assign({}, btnS, { flex: 1, minWidth: 120 })}>
                New Assessment
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
