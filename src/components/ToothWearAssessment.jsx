import { useState } from "react";
import { jsPDF } from "jspdf";

var primary   = "#3D3830";
var brand     = "#C9BA9B";
var bgPage    = "#5A5A59";
var white     = "#FFFFFF";
var border    = "#E2DAD0";
var textColor = "#2C2C2C";
var muted     = "#7A7060";
var font      = "DM Sans, system-ui, sans-serif";
var serif     = "Georgia, serif";

// Risk level colours
var r1c = "#2d7a4f"; // Low
var r2c = "#5a8a2e"; // Low–Moderate
var r3c = "#c49a00"; // Moderate
var r4c = "#c06000"; // High
var r5c = "#c0392b"; // Severe

var QUESTIONS = [
  {
    id: 1,
    text: "Have you noticed any change in the length, shape, or appearance of your teeth?",
    type: "single",
    options: [
      { label: "No, my teeth look the same as always",          value: "no",       score: 0 },
      { label: "Possibly — they may look slightly shorter",      value: "possible", score: 2 },
      { label: "Yes — they are noticeably shorter or chipped",   value: "yes",      score: 4 },
    ],
  },
  {
    id: 2,
    text: "Which of the following acidic foods or drinks do you consume?",
    hint: "Select all that apply",
    type: "multi",
    maxScore: 3,
    options: [
      { label: "Fizzy drinks (including diet/sugar-free)",        value: "fizzy",   score: 1 },
      { label: "Citrus fruits or juices",                        value: "citrus",  score: 1 },
      { label: "Wine or cider",                                  value: "wine",    score: 1 },
      { label: "Vinegar-based foods (pickles, salad dressings)",  value: "vinegar", score: 1 },
      { label: "Sports or energy drinks",                        value: "sports",  score: 1 },
      { label: "None of the above",                              value: "none",    score: 0 },
    ],
  },
  {
    id: 3,
    text: "How often do you consume acidic foods or drinks?",
    type: "single",
    options: [
      { label: "Rarely or never",                 value: "never",  score: 0 },
      { label: "A few times per week",             value: "few",    score: 1 },
      { label: "Once a day",                       value: "daily",  score: 2 },
      { label: "Multiple times a day",             value: "multi",  score: 3 },
    ],
  },
  {
    id: 4,
    text: "Do you suffer from acid reflux, heartburn or GORD (gastro-oesophageal reflux disease)?",
    type: "single",
    options: [
      { label: "No",                               value: "no",        score: 0 },
      { label: "Occasionally",                     value: "occ",       score: 2 },
      { label: "Regularly or diagnosed with GORD", value: "yes",       score: 4 },
    ],
  },
  {
    id: 5,
    text: "Do you experience frequent vomiting or regurgitation (e.g. eating disorder, morning sickness, chronic illness)?",
    type: "single",
    options: [
      { label: "No",                               value: "no",   score: 0 },
      { label: "Occasionally",                     value: "occ",  score: 2 },
      { label: "Frequently",                       value: "freq", score: 4 },
    ],
  },
  {
    id: 6,
    text: "Do you grind or clench your teeth?",
    type: "single",
    options: [
      { label: "No",                                          value: "no",    score: 0 },
      { label: "I think so — mainly at night",                value: "night", score: 2 },
      { label: "Yes, I notice it during the day",             value: "day",   score: 2 },
      { label: "Both day and night grinding/clenching",       value: "both",  score: 4 },
    ],
  },
  {
    id: 7,
    text: "Do you experience tooth sensitivity?",
    type: "single",
    options: [
      { label: "No sensitivity",                              value: "none",   score: 0 },
      { label: "Occasionally to cold or sweet things",        value: "occ",    score: 1 },
      { label: "Regularly, affecting eating or drinking",     value: "reg",    score: 2 },
    ],
  },
  {
    id: 8,
    text: "How soon after eating or drinking do you usually brush your teeth?",
    type: "single",
    options: [
      { label: "I wait at least 60 minutes",                  value: "wait",      score: 0 },
      { label: "After about 30 minutes",                      value: "30min",     score: 1 },
      { label: "Immediately or within a few minutes",         value: "immediate", score: 2 },
    ],
  },
  {
    id: 9,
    text: "How would you describe your toothbrushing pressure and technique?",
    type: "single",
    options: [
      { label: "Light, circular or gentle technique",         value: "light",  score: 0 },
      { label: "Moderate",                                    value: "mod",    score: 1 },
      { label: "Firm or scrubbing action",                    value: "hard",   score: 2 },
    ],
  },
  {
    id: 10,
    text: "Has a dentist, hygienist or doctor previously mentioned tooth wear or erosion to you?",
    type: "single",
    options: [
      { label: "No, never mentioned",                         value: "no",  score: 0 },
      { label: "Yes, it has been mentioned before",           value: "yes", score: 2 },
    ],
  },
];

function calcScore(answers) {
  return QUESTIONS.reduce(function(total, q, idx) {
    var ans = answers[idx];
    if (ans === undefined || ans === null) return total;
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

function getRisk(score) {
  if (score <= 4)  return 1;
  if (score <= 9)  return 2;
  if (score <= 14) return 3;
  if (score <= 19) return 4;
  return 5;
}

var RISK = {
  1: {
    color: r1c,
    label: "Low Risk",
    clinician: "Low erosion/wear risk profile. No significant dietary, intrinsic acid, or parafunctional risk factors identified. Routine monitoring at standard recall intervals. Reinforce preventive advice. Baseline photographs and study models may be considered.",
    patientTitle: "Your tooth wear risk appears low",
    patientSummary: "Based on your answers, you have few of the factors commonly associated with tooth wear. Keeping up with your regular dental appointments and following a good oral hygiene routine should help keep your teeth in great shape.",
    advice: [
      "Continue attending regular dental check-ups and hygiene appointments",
      "Brush twice daily with a fluoride toothpaste using a gentle technique",
      "If you consume acidic drinks, use a straw and rinse with water afterwards",
      "Wait at least 60 minutes after eating or drinking before brushing",
    ],
    cta: "We recommend continuing your routine dental check-ups. If anything changes or you notice sensitivity, please do get in touch.",
  },
  2: {
    color: r2c,
    label: "Low–Moderate Risk",
    clinician: "Low-to-moderate risk profile. Some dietary or lifestyle risk factors present. Preventive advice indicated. Consider fluoride varnish application. Review at 6-monthly intervals. Document with photographs if not already done.",
    patientTitle: "Your tooth wear risk is low to moderate",
    patientSummary: "Your answers suggest a few factors that can contribute to tooth wear over time. The good news is that with some straightforward changes and regular monitoring, we can help protect your teeth effectively.",
    advice: [
      "Reduce the frequency of acidic foods and drinks where possible",
      "Rinse with water after consuming acidic food or drink — do not brush immediately",
      "Use a fluoride mouthwash daily, ideally at a different time to brushing",
      "Consider using a sensitivity toothpaste if you notice discomfort",
    ],
    cta: "We would recommend a check-up so we can monitor your teeth and offer personalised preventive advice. Please give us a call to arrange an appointment.",
  },
  3: {
    color: r3c,
    label: "Moderate Risk",
    clinician: "Moderate risk profile. Multiple erosive or parafunctional risk factors identified. Active preventive protocol indicated: high-fluoride toothpaste (2800–5000ppm), fluoride varnish, dietary counselling. 6-monthly review with photographic documentation. Consider study models as baseline.",
    patientTitle: "Your tooth wear risk is moderate — worth a professional assessment",
    patientSummary: "Your answers suggest a moderate level of risk for tooth wear. We would like to see you for a proper assessment so we can check your teeth carefully, identify exactly what is happening, and put a plan in place to protect them.",
    advice: [
      "Aim to limit acidic drinks to mealtimes only",
      "Always rinse with water or use a fluoride mouthwash after acidic food or drink",
      "Wait at least 60 minutes before brushing after eating",
      "Discuss with us whether a prescription-strength fluoride toothpaste would help",
    ],
    cta: "We recommend booking a tooth wear assessment at the practice. Please call us to arrange an appointment.",
  },
  4: {
    color: r4c,
    label: "High Risk",
    clinician: "High risk profile. Significant risk factors across multiple aetiological categories. Clinical assessment essential: document wear pattern, severity and distribution. High-fluoride prescription indicated. Consider occlusal splint if parafunctional component. Dietary and medical referral as appropriate. 3–6 monthly recall.",
    patientTitle: "Your tooth wear risk is high — please book an assessment",
    patientSummary: "Your answers suggest a high risk of tooth wear. We would like to see you at the practice as soon as convenient so we can properly assess your teeth and ensure you have the right support and protection in place.",
    advice: [
      "Avoid acidic drinks between meals where possible",
      "Rinse with water immediately after any acidic food or drink",
      "Do not brush teeth for at least 60 minutes after eating or drinking",
      "Avoid brushing hard — use a soft-bristled brush with gentle circular movements",
    ],
    cta: "Please contact the practice to arrange a tooth wear assessment. Early action makes a significant difference — we are here to help.",
  },
  5: {
    color: r5c,
    label: "Severe Risk",
    clinician: "Severe risk profile. Multiple high-scoring risk factors across erosion, attrition and abrasion categories. Urgent clinical assessment required. Document with photographs and study models. High-fluoride prescription essential. Specialist referral may be required depending on severity. Consider restorative implications. Very frequent recall.",
    patientTitle: "Please contact us to arrange an urgent assessment",
    patientSummary: "Your answers suggest significant risk factors for tooth wear across several categories. We would like to see you at the practice as soon as possible so we can assess your teeth thoroughly and ensure you have the right care in place without delay.",
    advice: [
      "Avoid acidic drinks entirely where possible, or limit to strict mealtimes",
      "Rinse with plain water immediately after eating or drinking",
      "Do not brush your teeth for at least 60 minutes after eating",
      "Contact the practice to arrange an assessment as soon as you are able",
    ],
    cta: "Please contact the practice as soon as possible to arrange a tooth wear assessment. We want to ensure you receive the right care promptly.",
  },
};

function buildPDF(patient, answers, mode) {
  var doc   = new jsPDF({ unit: "mm", format: "a4" });
  var W     = 210;
  var M     = 16;
  var score = calcScore(answers);
  var risk  = getRisk(score);
  var rd    = RISK[risk];
  var y     = 0;

  // Header
  doc.setFillColor(61, 56, 48);
  doc.rect(0, 0, W, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Tooth Wear Risk Assessment", M, 14);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("Complete Dentistry Surrey  |  reception@completedentistrysurrey.co.uk", M, 22);
  doc.text("Date: " + new Date().toLocaleDateString("en-GB") + "   Mode: " + (mode === "website" ? "Online" : "In-Practice"), M, 29);
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
  doc.text("DOB:   " + patient.dob, M, y); y += 5;
  if (mode === "website" && patient.email) { doc.text("Email: " + patient.email, M, y); y += 5; }
  y += 3; line();

  // Clinician triage
  doc.setFillColor(240, 237, 231);
  doc.rect(M - 2, y - 2, W - (M - 2) * 2, 34, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(61, 56, 48);
  doc.text("CLINICIAN TRIAGE — CONFIDENTIAL", M, y + 5);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 44, 44);
  doc.text("Risk Score: " + score + "   |   Risk Category: " + rd.label, M, y + 12);
  var clinLines = doc.splitTextToSize(rd.clinician, W - M * 2 - 4);
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
    if (q.type === "multi") {
      ansText = (ans || []).length
        ? (ans || []).map(function(v) { var o = q.options.find(function(x) { return x.value === v; }); return o ? o.label : ""; }).filter(Boolean).join(", ")
        : "Not answered";
    } else {
      var found = ans && q.options && q.options.find(function(o) { return o.value === ans; });
      ansText = found ? found.label : "Not answered";
    }
    var aLines = doc.splitTextToSize("→ " + ansText, W - M * 2 - 4);
    doc.text(aLines, M + 3, y); y += aLines.length * 4.5 + 4;
  });

  y += 3; line();

  // Patient advice
  if (y > 235) { doc.addPage(); y = 20; }
  doc.setTextColor(61, 56, 48);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Advice Provided", M, y); y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 44, 44);
  var sumLines = doc.splitTextToSize(rd.patientSummary, W - M * 2);
  doc.text(sumLines, M, y); y += sumLines.length * 5 + 4;
  rd.advice.forEach(function(tip) {
    if (y > 270) { doc.addPage(); y = 20; }
    var tLines = doc.splitTextToSize("* " + tip, W - M * 2 - 3);
    doc.text(tLines, M + 2, y); y += tLines.length * 5 + 2;
  });
  y += 3;
  if (y > 262) { doc.addPage(); y = 20; }
  doc.setFont("helvetica", "italic");
  doc.setTextColor(61, 56, 48);
  var ctaLines = doc.splitTextToSize(rd.cta, W - M * 2);
  doc.text(ctaLines, M, y);

  // Page numbers
  var pages = doc.internal.getNumberOfPages();
  for (var i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(160, 155, 150);
    doc.text("Complete Dentistry Surrey  |  Practify Tooth Wear Assessment  |  Page " + i + " of " + pages, M, 291);
  }

  return {
    doc: doc, score: score, risk: risk,
    fname: "ToothWear_" + patient.name.replace(/\s+/g, "_") + "_" + new Date().toLocaleDateString("en-GB").replace(/\//g, "-") + ".pdf",
  };
}

// ── Shared UI components ──────────────────────────────────────────────────────

var cardStyle  = { background: white, borderRadius: 16, padding: "32px 36px", border: "1px solid " + border, maxWidth: 580, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.22)" };
var btnP       = { background: primary, color: white, border: "none", borderRadius: 10, padding: "13px 26px", fontSize: 14, fontFamily: font, fontWeight: 500, cursor: "pointer" };
var btnS       = { background: "transparent", color: primary, border: "1.5px solid rgba(61,56,48,0.22)", borderRadius: 10, padding: "11px 22px", fontSize: 13, fontFamily: font, cursor: "pointer" };
var labelStyle = { fontSize: 12, fontWeight: 500, color: primary, display: "block", marginBottom: 6 };
var inputStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid " + border, borderRadius: 10, fontSize: 14, fontFamily: font, boxSizing: "border-box", outline: "none", color: textColor, background: white };

function OptionCard(props) {
  var sel = props.selected;
  return (
    <div onClick={props.onClick} style={{ border: "1.5px solid " + (sel ? primary : border), background: sel ? "rgba(61,56,48,0.06)" : white, borderRadius: 10, padding: "12px 16px", cursor: "pointer", fontSize: 14, color: sel ? primary : textColor, fontWeight: sel ? 500 : 400, display: "flex", alignItems: "center", gap: 12, userSelect: "none" }}>
      <div style={{ width: 18, height: 18, flexShrink: 0, borderRadius: props.type === "radio" ? "50%" : 4, border: "1.5px solid " + (sel ? primary : border), background: sel ? primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {sel && props.type === "radio" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: white }} />}
        {sel && props.type !== "radio" && <span style={{ color: white, fontSize: 10, fontWeight: 700 }}>✓</span>}
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
        <div style={{ background: brand, width: pct + "%", height: 5, borderRadius: 99, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ToothWearAssessment() {
  var modeState    = useState(null);        var mode = modeState[0];    var setMode = modeState[1];
  var stepState    = useState("mode");      var step = stepState[0];    var setStep = stepState[1];
  var patientState = useState({ name: "", dob: "", email: "" }); var patient = patientState[0]; var setPatient = patientState[1];
  var answersState = useState({});          var answers = answersState[0]; var setAnswers = answersState[1];
  var clinState    = useState(false);       var showClinician = clinState[0]; var setShowClinician = clinState[1];

  var qIdx = step.startsWith("q") ? parseInt(step.slice(1), 10) : null;
  var isQ  = qIdx !== null;
  var cq   = isQ ? QUESTIONS[qIdx] : null;
  var score = calcScore(answers);
  var risk  = getRisk(score);
  var rd    = RISK[risk];

  var canNext = function() {
    if (step === "mode")    return !!mode;
    if (step === "details") return !!(patient.name.trim()) && !!(patient.dob);
    if (isQ) {
      if (cq.type === "multi") return (answers[qIdx] || []).length > 0;
      return answers[qIdx] !== undefined;
    }
    return true;
  };

  var next = function() {
    if (step === "mode")    { setStep("details"); return; }
    if (step === "details") { setStep("q0"); return; }
    if (isQ) { setStep(qIdx < QUESTIONS.length - 1 ? "q" + (qIdx + 1) : "results"); }
  };

  var back = function() {
    if (step === "details")  { setStep("mode"); return; }
    if (step === "q0")       { setStep("details"); return; }
    if (isQ)                 { setStep("q" + (qIdx - 1)); return; }
    if (step === "results")  { setStep("q" + (QUESTIONS.length - 1)); }
  };

  var setAnswer    = function(v) { setAnswers(function(a) { var n = Object.assign({}, a); n[qIdx] = v; return n; }); };
  var toggleMulti  = function(v) {
    var cur = answers[qIdx] || [];
    if (v === "none") { setAnswers(function(a) { var n = Object.assign({}, a); n[qIdx] = ["none"]; return n; }); return; }
    var f = cur.filter(function(x) { return x !== "none"; });
    setAnswers(function(a) { var n = Object.assign({}, a); n[qIdx] = f.includes(v) ? f.filter(function(x) { return x !== v; }) : f.concat([v]); return n; });
  };

  var handlePDF = function() {
    var result = buildPDF(patient, answers, mode);
    result.doc.save(result.fname);
    if (mode === "website") {
      var sub  = encodeURIComponent("Tooth Wear Assessment — " + patient.name);
      var body = encodeURIComponent("Dear Reception,\n\nPlease find the attached tooth wear risk assessment PDF for " + patient.name + " (DOB: " + patient.dob + ").\n\nRisk Score: " + score + "  |  Category: " + rd.label + "\n\nPlease attach the downloaded PDF before sending.\n\n— Practify");
      window.open("mailto:reception@completedentistrysurrey.co.uk?subject=" + sub + "&body=" + body);
    }
  };

  var reset = function() { setMode(null); setStep("mode"); setPatient({ name: "", dob: "", email: "" }); setAnswers({}); setShowClinician(false); };

  return (
    <div style={{ fontFamily: font, background: bgPage, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 48 }}>

      {/* ── HEADER ── */}
      <div style={{ width: "100%", background: primary, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
        <div>
          <div style={{ fontFamily: serif, fontSize: 22, color: white }}>Complete Dentistry</div>
          <div style={{ color: brand, fontSize: 11, marginTop: 2, letterSpacing: "2px", textTransform: "uppercase" }}>Tooth Wear Risk Assessment</div>
        </div>
        {mode && <div style={{ background: "rgba(201,186,155,0.15)", border: "1px solid " + brand, color: brand, padding: "4px 14px", borderRadius: 20, fontSize: 12 }}>{mode === "website" ? "Online" : "In-Practice"}</div>}
      </div>
      <div style={{ width: "100%", background: brand, height: 6, marginBottom: 32 }} />

      {isQ && <ProgressBar current={qIdx} total={QUESTIONS.length} />}

      {/* ── MODE SELECTION ── */}
      {step === "mode" && (
        <div style={Object.assign({}, cardStyle, { margin: "0 16px" })}>
          <div style={{ fontFamily: serif, fontSize: 30, color: primary, marginBottom: 8 }}>Tooth Wear Assessment</div>
          <p style={{ fontSize: 14, color: muted, lineHeight: 1.7, marginBottom: 28 }}>This short questionnaire helps us understand your risk of tooth wear and erosion. It takes around 3–4 minutes. Please answer as accurately as you can.</p>
          <p style={{ fontSize: 13, fontWeight: 500, color: textColor, marginBottom: 14 }}>How are you completing this assessment?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { val: "website", label: "Online — at home or on my phone", sub: "Results will be sent to the practice by email" },
              { val: "surgery", label: "In the dental surgery",            sub: "A PDF will be generated for your patient notes" },
            ].map(function(opt) {
              return (
                <div key={opt.val} onClick={function() { setMode(opt.val); }} style={{ border: "1.5px solid " + (mode === opt.val ? primary : border), background: mode === opt.val ? "rgba(61,56,48,0.06)" : white, borderRadius: 12, padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid " + (mode === opt.val ? primary : border), background: mode === opt.val ? primary : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {mode === opt.val && <div style={{ width: 6, height: 6, borderRadius: "50%", background: white }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: primary }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{opt.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
            <button style={Object.assign({}, btnP, { opacity: canNext() ? 1 : 0.35 })} onClick={next} disabled={!canNext()}>Begin Assessment</button>
          </div>
        </div>
      )}

      {/* ── PATIENT DETAILS ── */}
      {step === "details" && (
        <div style={Object.assign({}, cardStyle, { margin: "0 16px" })}>
          <div style={{ fontFamily: serif, fontSize: 26, color: primary, marginBottom: 6 }}>Your Details</div>
          <p style={{ fontSize: 13, color: muted, marginBottom: 24 }}>This helps us match your assessment to your patient record.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} placeholder="e.g. Jane Smith" value={patient.name} onChange={function(e) { setPatient(function(p) { return Object.assign({}, p, { name: e.target.value }); }); }} />
            </div>
            <div>
              <label style={labelStyle}>Date of Birth *</label>
              <input style={inputStyle} type="date" value={patient.dob} onChange={function(e) { setPatient(function(p) { return Object.assign({}, p, { dob: e.target.value }); }); }} />
            </div>
            {mode === "website" && (
              <div>
                <label style={labelStyle}>Email Address</label>
                <input style={inputStyle} type="email" placeholder="your@email.com" value={patient.email} onChange={function(e) { setPatient(function(p) { return Object.assign({}, p, { email: e.target.value }); }); }} />
              </div>
            )}
          </div>
          <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between" }}>
            <button style={btnS} onClick={back}>Back</button>
            <button style={Object.assign({}, btnP, { opacity: canNext() ? 1 : 0.35 })} onClick={next} disabled={!canNext()}>Start Questions</button>
          </div>
        </div>
      )}

      {/* ── QUESTIONS ── */}
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

          <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between" }}>
            <button style={btnS} onClick={back}>Back</button>
            <button style={Object.assign({}, btnP, { opacity: canNext() ? 1 : 0.35 })} onClick={next} disabled={!canNext()}>
              {qIdx < QUESTIONS.length - 1 ? "Next" : "See Results"}
            </button>
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {step === "results" && (
        <div style={{ maxWidth: 580, width: "100%", margin: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={Object.assign({}, cardStyle, { margin: 0 })}>
            <div style={{ background: rd.color + "20", border: "1.5px solid " + rd.color + "50", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: rd.color }}>Assessment completed — {new Date().toLocaleDateString("en-GB")}</span>
            </div>
            <div style={{ fontFamily: serif, fontSize: 28, color: primary, marginBottom: 10, lineHeight: 1.3 }}>{rd.patientTitle}</div>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "#4B5563", marginBottom: 20 }}>{rd.patientSummary}</p>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: primary, marginBottom: 10 }}>What you can do now:</div>
              {rd.advice.map(function(tip, i) {
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
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.55, margin: 0, flex: 1 }}>{rd.cta}</p>
              <a href="tel:01883622222" style={{ background: brand, color: primary, padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>Call 01883 622222</a>
            </div>
          </div>

          <div style={Object.assign({}, cardStyle, { margin: 0, border: "1.5px solid " + primary })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={function() { setShowClinician(function(s) { return !s; }); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: primary }}>Clinician Triage Summary</span>
                <span style={{ background: rd.color, color: white, padding: "2px 10px", borderRadius: 20, fontSize: 11 }}>{rd.label}</span>
              </div>
              <span style={{ color: primary, fontSize: 16, userSelect: "none" }}>{showClinician ? "▲" : "▼"}</span>
            </div>
            {showClinician && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid " + border }}>
                <div style={{ display: "flex", gap: 28, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: serif, fontSize: 40, color: primary, lineHeight: 1 }}>{score}</div>
                    <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>Risk score</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: serif, fontSize: 28, color: rd.color, lineHeight: 1, marginTop: 6 }}>{rd.label}</div>
                    <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>Risk category</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "#374151", background: "#F8F5F0", padding: "12px 14px", borderRadius: 8, margin: 0 }}>{rd.clinician}</p>
              </div>
            )}
          </div>

          <div style={Object.assign({}, cardStyle, { margin: 0 })}>
            <div style={{ fontSize: 13, fontWeight: 500, color: primary, marginBottom: 14 }}>Actions</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={handlePDF} style={Object.assign({}, btnP, { flex: 1, minWidth: 160 })}>
                {mode === "website" ? "Download PDF & Email" : "Download PDF"}
              </button>
              <button onClick={reset} style={Object.assign({}, btnS, { flex: 1, minWidth: 120 })}>New Assessment</button>
            </div>
            {mode === "website" && <p style={{ fontSize: 12, color: muted, marginTop: 10, lineHeight: 1.5 }}>The PDF will download automatically. Your email client will open — please attach the PDF before sending.</p>}
          </div>

        </div>
      )}

    </div>
  );
}
