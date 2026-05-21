import { useState } from "react";

var primary  = "#3D3830";
var brand    = "#C9BA9B";
var bgPage   = "#5A5A59";
var white    = "#FFFFFF";
var border   = "#E2DAD0";
var textColor = "#2C2C2C";
var muted    = "#7A7060";
var font     = "DM Sans, system-ui, sans-serif";
var serif    = "Georgia, serif";
var s1c = "#2d7a4f";
var s2c = "#5a8a2e";
var s3c = "#c49a00";
var s4c = "#c06000";
var s5c = "#c0392b";

var BOOKING = "https://booking.uk.hsone.app/soe/new?pid=UKCKI01#/perspectives/3";

var QUESTIONS = [
  {
    id: 1, text: "Where do you experience pain or discomfort?",
    hint: "Select all that apply", type: "multi", maxScore: 2,
    options: [
      { label: "In front of the ear or jaw joint area", value: "joint",   score: 1 },
      { label: "Face or cheek muscles",                 value: "muscles", score: 1 },
      { label: "Inside the ear",                        value: "ear",     score: 0 },
      { label: "Temple or side of head",                value: "temple",  score: 1 },
      { label: "No pain - I only notice sounds",        value: "none",    score: 0 },
    ],
  },
  {
    id: 2, text: "How long have you been experiencing jaw symptoms?",
    type: "single",
    options: [
      { label: "Less than 1 month",                       value: "lt1m",        score: 1 },
      { label: "1 to 6 months",                           value: "1to6m",       score: 2 },
      { label: "6 to 12 months",                          value: "6to12m",      score: 3 },
      { label: "Over 1 year",                             value: "gt1y",        score: 4 },
      { label: "I only notice sounds, no other symptoms", value: "sounds_only", score: 0 },
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
      { label: "No sounds",                             value: "none",     score: 0 },
      { label: "Clicking or popping - consistent",      value: "click_c",  score: 1 },
      { label: "Clicking or popping - comes and goes",  value: "click_v",  score: 2 },
      { label: "Grating or crunching sound",            value: "crepitus", score: 4 },
    ],
  },
  {
    id: 5, text: "Has your jaw ever felt stuck or locked - difficult to open or close?",
    type: "single",
    options: [
      { label: "Never",                                      value: "never",   score: 0 },
      { label: "Occasionally - resolves quickly on its own", value: "occ",     score: 2 },
      { label: "Frequently",                                 value: "freq",    score: 3 },
      { label: "Currently experiencing this",                value: "current", score: 5 },
    ],
  },
  {
    id: 6, text: "How wide can you open your mouth?",
    hint: "Try placing fingers vertically between your front teeth as a guide",
    type: "single",
    options: [
      { label: "Normal - 3 fingers fit comfortably",   value: "normal",   score: 0 },
      { label: "Slightly reduced - 2 to 3 fingers",    value: "slight",   score: 1 },
      { label: "Moderately reduced - about 2 fingers", value: "moderate", score: 2 },
      { label: "Very limited - 1 finger or less",      value: "severe",   score: 3 },
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
      { label: "Sometimes - mainly at night", value: "some", score: 1 },
      { label: "Yes, regularly",              value: "yes",  score: 2 },
    ],
  },
  {
    id: 9, text: "Does jaw discomfort affect your ability to eat?",
    type: "single",
    options: [
      { label: "Not at all",                              value: "no",   score: 0 },
      { label: "Mild difficulty with hard foods",         value: "mild", score: 1 },
      { label: "Significant difficulty - soft diet only", value: "sig",  score: 2 },
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
      { label: "No - only when moving or eating", value: "no",  score: 0 },
      { label: "Occasionally",                    value: "occ", score: 1 },
      { label: "Yes, most of the time",           value: "yes", score: 2 },
    ],
  },
  {
    id: 12, text: "If you previously had jaw clicking - has the clicking stopped but your symptoms worsened?",
    type: "single",
    options: [
      { label: "I never had clicking / not applicable",              value: "na",    score: 0 },
      { label: "Clicking is still present",                          value: "still", score: 0 },
      { label: "Yes - clicking stopped but pain or stiffness increased", value: "yes", score: 3 },
    ],
  },
  {
    id: 13, text: "How would you describe the quality of your jaw or face pain?",
    type: "single",
    options: [
      { label: "A dull ache or pressure",                      value: "dull",     score: 1 },
      { label: "Sharp or stabbing pain",                       value: "sharp",    score: 2 },
      { label: "Burning, tingling or electric-shock sensation", value: "burning",  score: 3 },
      { label: "Throbbing pain",                               value: "throb",    score: 2 },
      { label: "I do not experience pain, only sounds or stiffness", value: "none", score: 0 },
    ],
  },
  {
    id: 14, text: "Where does your pain spread to?",
    type: "single",
    options: [
      { label: "It stays localised to the jaw joint area",                        value: "local",  score: 0 },
      { label: "It spreads to my temple or forehead",                             value: "temple", score: 1 },
      { label: "It spreads to my teeth (which feel painful but my dentist says are fine)", value: "teeth", score: 3 },
      { label: "It spreads down my neck or up into my ear",                       value: "neck",   score: 2 },
      { label: "I do not have spreading pain",                                    value: "none",   score: 0 },
    ],
  },
  {
    id: 15, text: "Do you experience any of the following in your face?",
    hint: "Select all that apply", type: "multi", maxScore: 4,
    options: [
      { label: "Numbness or reduced sensation in the cheek or jaw", value: "numb",    score: 2 },
      { label: "Tingling or pins and needles in the face",          value: "tingle",  score: 2 },
      { label: "A burning feeling across the face",                 value: "burn",    score: 2 },
      { label: "Facial twitching or weakness",                      value: "twitch",  score: 3 },
      { label: "None of the above",                                 value: "none",    score: 0 },
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

// Nerve involvement flags
function getNerveFlags(answers) {
  var flags = [];
  // Q13 - burning/electric pain
  var q13 = answers[12];
  if (q13 === "burning") flags.push("Burning or electric-shock pain quality reported");
  if (q13 === "sharp")   flags.push("Sharp or stabbing pain quality reported");
  // Q14 - pain spread
  var q14 = answers[13];
  if (q14 === "teeth")  flags.push("Pain spreading to teeth with no dental cause - trigeminal referral pattern");
  if (q14 === "temple") flags.push("Pain spreading to temple or forehead");
  if (q14 === "neck")   flags.push("Pain spreading to neck or ear");
  // Q15 - facial symptoms
  var q15 = answers[14] || [];
  if (q15.includes("numb"))   flags.push("Facial numbness or reduced sensation reported");
  if (q15.includes("tingle")) flags.push("Facial tingling or pins and needles reported");
  if (q15.includes("burn"))   flags.push("Facial burning sensation reported");
  if (q15.includes("twitch")) flags.push("Facial twitching or weakness reported - urgent: consider neurological review");
  return flags;
}

function getParafunctionalFlags(answers) {
  var flags = [];
  var q8 = answers[7];
  if (q8 === "some") flags.push("Nocturnal bruxism reported - consider splint therapy");
  if (q8 === "yes")  flags.push("Regular grinding or clenching reported - splint therapy indicated");
  var q11 = answers[10];
  if (q11 === "yes") flags.push("Resting jaw pain present - suggests muscle involvement");
  return flags;
}

function getPriority(stage, nerveFlags) {
  var hasFacialWeakness = nerveFlags.some(function(f) { return f.includes("twitching or weakness"); });
  if (hasFacialWeakness || stage >= 4) return { label: "RED", text: "Contact today", color: s5c };
  if (stage === 3 || nerveFlags.length >= 2) return { label: "AMBER", text: "Within 1-2 weeks", color: s4c };
  if (stage === 2 || nerveFlags.length >= 1) return { label: "AMBER", text: "Within 2-4 weeks", color: s3c };
  return { label: "GREEN", text: "Routine appointment", color: s1c };
}

function getWilkesDescription(stage) {
  var desc = {
    1: "Stage I - Early. Disc displacement with reduction likely. Probable muscular or mild articular aetiology. Minimal structural change expected. Conservative management appropriate.",
    2: "Stage II - Early/Intermediate. Disc displacement with reduction. Some pain and functional limitation. Conservative management with review indicated. Consider occlusal splint therapy.",
    3: "Stage III - Intermediate. Likely disc displacement without reduction. Pain, limitation and possible locking. Active management required - consider splint, physiotherapy and imaging.",
    4: "Stage IV - Intermediate/Late. Degenerative changes likely. Significant pain and functional limitation. Imaging referral indicated. Specialist involvement may be required.",
    5: "Stage V - Late. Advanced degeneration, possible disc perforation. Significant functional disability. Prompt assessment essential. Imaging strongly indicated. Specialist referral likely required.",
  };
  return desc[stage];
}

var GUIDANCE = {
  1: {
    title: "Your jaw symptoms appear mild",
    summary: "Many people experience occasional jaw discomfort, often related to muscle tension or minor joint movement. With some simple self-care, most people see a significant improvement.",
    advice: [
      "Eat softer foods and avoid very hard or chewy items for a while",
      "Avoid wide jaw movements - take small bites and be careful when yawning",
      "Apply a warm compress to the jaw area for 10-15 minutes to ease muscle tension",
      "Try to keep your teeth slightly apart when at rest and be mindful of clenching",
    ],
    urgency: "If your symptoms persist or worsen, we would be happy to see you for a thorough jaw assessment.",
    severity: "Mild",
  },
  2: {
    title: "Your jaw symptoms are worth having assessed",
    summary: "Your answers suggest some jaw discomfort that would benefit from professional attention. While not urgent, a jaw assessment will help us understand what is happening and discuss your options.",
    advice: [
      "Stick to a soft diet and avoid hard or very chewy foods",
      "Take small bites and be cautious when yawning to avoid wide jaw movement",
      "Apply warm compresses to the jaw area to ease muscle tension",
      "Try to notice any clenching or grinding habits, particularly at night",
    ],
    urgency: "We would recommend booking a jaw assessment at the practice - it is a straightforward appointment and lets us properly evaluate your symptoms.",
    severity: "Mild-Moderate",
  },
  3: {
    title: "Your jaw would benefit from a professional assessment",
    summary: "Based on your answers, your jaw symptoms would benefit from being examined by a clinician. This will help us understand what is happening and ensure you receive the right support.",
    advice: [
      "Follow a soft diet to reduce strain on the jaw joint",
      "Avoid any activities or foods that aggravate your symptoms",
      "Apply warmth to the jaw area for comfort as needed",
    ],
    urgency: "Please do book a jaw assessment with us - the sooner we see you, the sooner we can help you feel more comfortable.",
    severity: "Moderate",
  },
  4: {
    title: "Your jaw symptoms need professional attention",
    summary: "Your answers suggest significant jaw symptoms and we would like to see you at the practice so we can properly assess what is happening and ensure you have the right support.",
    advice: [
      "Follow a very soft diet to minimise strain on the jaw",
      "Avoid movements that significantly worsen your symptoms",
      "Apply warmth for comfort as needed",
    ],
    urgency: "Please contact the practice soon to arrange a jaw assessment - our team will make sure you are seen promptly.",
    severity: "Moderate-Significant",
  },
  5: {
    title: "Please contact us to arrange an assessment",
    summary: "Your answers suggest you are experiencing significant jaw symptoms that we would like to assess as soon as possible. Our team is here to help and will ensure you are seen promptly.",
    advice: [
      "Stick to a very soft diet - avoid anything that causes pain",
      "Avoid unnecessary jaw movement where possible",
      "Contact the practice as soon as you can",
    ],
    urgency: "Please contact the practice as soon as possible to arrange a jaw assessment. We want to ensure you receive the right care without delay.",
    severity: "Significant",
  },
};

var stageColors = { 1: s1c, 2: s2c, 3: s3c, 4: s4c, 5: s5c };

var cardStyle  = { background: white, borderRadius: 16, padding: "28px 28px", border: "1px solid " + border, maxWidth: 580, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.22)", boxSizing: "border-box" };
var btnP       = { background: primary, color: white, border: "none", borderRadius: 10, padding: "13px 26px", fontSize: 14, fontFamily: font, fontWeight: 500, cursor: "pointer" };
var btnS       = { background: "transparent", color: primary, border: "1.5px solid rgba(61,56,48,0.22)", borderRadius: 10, padding: "11px 22px", fontSize: 13, fontFamily: font, cursor: "pointer" };
var labelStyle = { fontSize: 12, fontWeight: 500, color: primary, display: "block", marginBottom: 6 };
var inputStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid " + border, borderRadius: 10, fontSize: 14, fontFamily: font, boxSizing: "border-box", outline: "none", color: textColor, background: white };

function OptionCard(props) {
  var sel = props.selected;
  return (
    <div onClick={props.onClick} style={{ border: "1.5px solid " + (sel ? primary : border), background: sel ? "rgba(61,56,48,0.06)" : white, borderRadius: 10, padding: "12px 16px", cursor: "pointer", fontSize: 14, color: sel ? primary : textColor, fontWeight: sel ? 500 : 400, display: "flex", alignItems: "center", gap: 12, userSelect: "none", marginBottom: 8 }}>
      <div style={{ width: 18, height: 18, flexShrink: 0, borderRadius: props.type === "radio" ? "50%" : 4, border: "1.5px solid " + (sel ? primary : border), background: sel ? primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {sel && props.type === "radio" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: white }} />}
        {sel && props.type !== "radio" && <span style={{ color: white, fontSize: 10, fontWeight: 700 }}>v</span>}
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

function TriageTree(props) {
  var score       = props.score;
  var stage       = props.stage;
  var nerveFlags  = props.nerveFlags;
  var paraFlags   = props.paraFlags;
  var priority    = props.priority;
  var stageColor  = stageColors[stage];

  var treeRow = function(icon, label, value, color, sub) {
    return (
      <div style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid " + border }}>
        <div style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: "center" }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: color || primary }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: muted, marginTop: 3, lineHeight: 1.5 }}>{sub}</div>}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: "#F7F5F1", borderRadius: 12, padding: "16px 20px", marginTop: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: primary, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>Clinical Triage Tree</div>

      {treeRow("1", "Wilkes Classification", "Stage " + stage + " - " + GUIDANCE[stage].severity, stageColor, getWilkesDescription(stage))}
      {treeRow("2", "Nerve Involvement", nerveFlags.length > 0 ? "Indicators present (" + nerveFlags.length + ")" : "No indicators", nerveFlags.length > 0 ? s4c : s1c,
        nerveFlags.length > 0 ? nerveFlags.join(" | ") : "No trigeminal or facial nerve indicators from responses"
      )}
      {treeRow("3", "Parafunctional / Muscle", paraFlags.length > 0 ? "Factors identified" : "No factors identified", paraFlags.length > 0 ? s3c : s1c,
        paraFlags.length > 0 ? paraFlags.join(" | ") : "No significant bruxism or muscle involvement reported"
      )}
      {treeRow("4", "Symptom Score", score + " / 30+", stageColor, null)}
      <div style={{ display: "flex", gap: 10, padding: "10px 0" }}>
        <div style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: "center" }}>5</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>Priority</div>
          <div style={{ display: "inline-block", background: priority.color, color: white, padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{priority.label} - {priority.text}</div>
        </div>
      </div>
    </div>
  );
}

export default function TMJOnline() {
  var stepS    = useState("details"); var step = stepS[0]; var setStep = stepS[1];
  var patientS = useState({ name: "", dob: "", email: "", phone: "" }); var patient = patientS[0]; var setPatient = patientS[1];
  var answersS = useState({}); var answers = answersS[0]; var setAnswers = answersS[1];
  var sliderS  = useState(0); var slider = sliderS[0]; var setSlider = sliderS[1];
  var sendingS = useState(false); var sending = sendingS[0]; var setSending = sendingS[1];
  var doneS    = useState(false); var done = doneS[0]; var setDone = doneS[1];
  var errorS   = useState(""); var error = errorS[0]; var setError = errorS[1];
  var showTriS = useState(false); var showTriage = showTriS[0]; var setShowTriage = showTriS[1];

  var qIdx = step.startsWith("q") ? parseInt(step.slice(1), 10) : null;
  var isQ  = qIdx !== null;
  var cq   = isQ ? QUESTIONS[qIdx] : null;

  var score      = calcScore(answers);
  var stage      = getStage(score);
  var gd         = GUIDANCE[stage];
  var nerveFlags = getNerveFlags(answers);
  var paraFlags  = getParafunctionalFlags(answers);
  var priority   = getPriority(stage, nerveFlags);

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
      if (cq.type === "slider") { setAnswers(function(a) { var n = Object.assign({}, a); n[qIdx] = slider; return n; }); }
      setStep(qIdx < QUESTIONS.length - 1 ? "q" + (qIdx + 1) : "results");
    }
  };

  var back = function() {
    if (step === "q0")      { setStep("details"); return; }
    if (step === "results") { setStep("q" + (QUESTIONS.length - 1)); return; }
    if (isQ)                { setStep("q" + (qIdx - 1)); return; }
  };

  var setAnswer = function(v) { setAnswers(function(a) { var n = Object.assign({}, a); n[qIdx] = v; return n; }); };
  var toggleMulti = function(v) {
    var cur = answers[qIdx] || [];
    if (v === "none") { setAnswers(function(a) { var n = Object.assign({}, a); n[qIdx] = ["none"]; return n; }); return; }
    var f = cur.filter(function(x) { return x !== "none"; });
    setAnswers(function(a) {
      var n = Object.assign({}, a);
      n[qIdx] = f.includes(v) ? f.filter(function(x) { return x !== v; }) : f.concat([v]);
      return n;
    });
  };

  var handleSubmit = function() {
    setSending(true);
    setError("");

    var answersHtml = QUESTIONS.map(function(q, idx) {
      var ans = answers[idx];
      var ansLabel = "Not answered";
      if (q.type === "slider") { ansLabel = (ans !== undefined ? ans + "/10" : "Not answered"); }
      else if (q.type === "multi") {
        var arr = Array.isArray(ans) ? ans : [];
        ansLabel = arr.length ? arr.map(function(v) { var o = q.options.find(function(x) { return x.value === v; }); return o ? o.label : v; }).join(", ") : "Not answered";
      } else {
        var opt = ans && q.options && q.options.find(function(o) { return o.value === ans; });
        ansLabel = opt ? opt.label : "Not answered";
      }
      return "<tr style='border-bottom:1px solid #e2dad0;'>" +
        "<td style='padding:8px 10px;font-size:11px;color:#7a7060;width:28px;vertical-align:top;'><strong>Q" + (idx + 1) + "</strong></td>" +
        "<td style='padding:8px 10px;font-size:12px;color:#3D3830;vertical-align:top;'>" + q.text + "</td>" +
        "<td style='padding:8px 10px;font-size:12px;color:#2C2C2C;font-weight:500;vertical-align:top;'>" + ansLabel + "</td></tr>";
    }).join("");

    var nerveSummary = nerveFlags.length > 0 ? nerveFlags.join("<br>") : "None identified";
    var paraSummary  = paraFlags.length  > 0 ? paraFlags.join("<br>")  : "None identified";

    var emailHtml =
      "<div style='font-family:Arial,sans-serif;max-width:640px;margin:0 auto;'>" +
      "<div style='background:#3D3830;padding:20px 24px;'>" +
      "<p style='color:#C9BA9B;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;'>Complete Dentistry Surrey</p>" +
      "<h1 style='color:#fff;font-size:20px;margin:0;'>TMJ Jaw Assessment</h1>" +
      "<p style='color:rgba(255,255,255,0.55);font-size:12px;margin:6px 0 0;'>Online Patient Submission - " + new Date().toLocaleDateString("en-GB") + "</p>" +
      "</div>" +
      "<div style='padding:24px;background:#f9f7f5;border:1px solid #e2dad0;'>" +
      "<table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>" +
      "<tr><td style='padding:8px 12px;font-size:12px;color:#7a7060;width:130px;'>Patient name</td><td style='padding:8px 12px;font-size:13px;font-weight:600;color:#3D3830;'>" + patient.name + "</td></tr>" +
      "<tr><td style='padding:8px 12px;font-size:12px;color:#7a7060;'>Date of birth</td><td style='padding:8px 12px;font-size:13px;'>" + patient.dob + "</td></tr>" +
      (patient.email ? "<tr><td style='padding:8px 12px;font-size:12px;color:#7a7060;'>Email</td><td style='padding:8px 12px;font-size:13px;'>" + patient.email + "</td></tr>" : "") +
      (patient.phone ? "<tr><td style='padding:8px 12px;font-size:12px;color:#7a7060;'>Phone</td><td style='padding:8px 12px;font-size:13px;'>" + patient.phone + "</td></tr>" : "") +
      "</table>" +
      "<div style='background:#EBF0F5;border-left:4px solid " + stageColors[stage] + ";padding:16px 18px;margin-bottom:16px;border-radius:4px;'>" +
      "<p style='font-size:11px;color:#7a7060;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;'>CLINICIAN TRIAGE - CONFIDENTIAL</p>" +
      "<table style='width:100%;border-collapse:collapse;'>" +
      "<tr><td style='font-size:12px;color:#7a7060;padding:4px 0;width:180px;'>Wilkes Classification</td><td style='font-size:13px;font-weight:700;color:" + stageColors[stage] + ";'>Stage " + stage + " - " + GUIDANCE[stage].severity + "</td></tr>" +
      "<tr><td style='font-size:12px;color:#7a7060;padding:4px 0;'>Symptom Score</td><td style='font-size:13px;font-weight:600;color:#3D3830;'>" + score + "</td></tr>" +
      "<tr><td style='font-size:12px;color:#7a7060;padding:4px 0;'>Priority</td><td style='font-size:13px;font-weight:700;color:" + priority.color + ";'>" + priority.label + " - " + priority.text + "</td></tr>" +
      "<tr><td style='font-size:12px;color:#7a7060;padding:4px 0;vertical-align:top;'>Nerve Indicators</td><td style='font-size:12px;color:#374151;'>" + nerveSummary + "</td></tr>" +
      "<tr><td style='font-size:12px;color:#7a7060;padding:4px 0;vertical-align:top;'>Parafunctional</td><td style='font-size:12px;color:#374151;'>" + paraSummary + "</td></tr>" +
      "<tr><td style='font-size:12px;color:#7a7060;padding:4px 0;vertical-align:top;'>Clinical Note</td><td style='font-size:12px;color:#374151;'>" + getWilkesDescription(stage) + "</td></tr>" +
      "</table></div>" +
      "<p style='font-size:13px;font-weight:600;color:#3D3830;margin:0 0 10px;'>Patient Responses</p>" +
      "<table style='width:100%;border-collapse:collapse;background:white;border:1px solid #e2dad0;'>" + answersHtml + "</table>" +
      "</div>" +
      "<div style='padding:14px 24px;background:#3D3830;text-align:center;'>" +
      "<p style='font-size:11px;color:rgba(255,255,255,0.35);margin:0;'>Practify - Complete Dentistry Surrey - 01883 622222</p>" +
      "</div></div>";

    fetch("/api/send-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formType: "toothwear",
        name: patient.name,
        dob: patient.dob,
        email: patient.email,
        phone: patient.phone,
        mode: "website",
        dateSubmitted: new Date().toLocaleDateString("en-GB"),
        answerSummary: emailHtml,
        rawHtml: true,
      }),
    }).then(function(res) {
      if (!res.ok) throw new Error("Send failed");
      setDone(true);
    }).catch(function() {
      setError("Something went wrong. Please call us on 01883 622222.");
    }).finally(function() {
      setSending(false);
    });
  };

  var reset = function() {
    setStep("details"); setPatient({ name: "", dob: "", email: "", phone: "" });
    setAnswers({}); setSlider(0); setDone(false); setError(""); setShowTriage(false);
  };

  return (
    <div style={{ fontFamily: font, background: bgPage, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 48 }}>

      <div style={{ width: "100%", background: primary, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0, boxSizing: "border-box" }}>
        <div>
          <div style={{ fontFamily: serif, fontSize: 22, color: white }}>Complete Dentistry</div>
          <div style={{ color: brand, fontSize: 11, marginTop: 2, letterSpacing: "2px", textTransform: "uppercase" }}>TMJ Jaw Assessment</div>
        </div>
      </div>
      <div style={{ width: "100%", background: brand, height: 6, marginBottom: 32 }} />

      {isQ && <ProgressBar current={qIdx} total={QUESTIONS.length} />}

      {done && (
        <div style={Object.assign({}, cardStyle, { margin: "0 16px", textAlign: "center" })}>
          <div style={{ width: 56, height: 56, background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>v</div>
          <div style={{ fontFamily: serif, fontSize: 28, color: primary, marginBottom: 12 }}>Thank you, {patient.name.split(" ")[0]}</div>
          <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.75, marginBottom: 24 }}>We have received your jaw assessment and a member of our team will be in touch to discuss your results and next steps.</p>
          <p style={{ fontSize: 13, color: muted, marginBottom: 28 }}>If you have any concerns in the meantime, please call us on <strong style={{ color: primary }}>01883 622222</strong>.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:01883622222" style={{ background: brand, color: primary, padding: "12px 24px", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>Call 01883 622222</a>
            <a href={BOOKING} target="_blank" rel="noreferrer" style={{ background: primary, color: white, padding: "12px 24px", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>Book Online</a>
          </div>
        </div>
      )}

      {!done && step === "details" && (
        <div style={Object.assign({}, cardStyle, { margin: "0 16px" })}>
          <div style={{ fontFamily: serif, fontSize: 26, color: primary, marginBottom: 6 }}>Your Details</div>
          <p style={{ fontSize: 13, color: muted, marginBottom: 24 }}>Please fill in your details so we can match this assessment to your records.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label style={labelStyle}>Full Name *</label><input style={inputStyle} placeholder="e.g. Jane Smith" value={patient.name} onChange={function(e) { setPatient(function(p) { return Object.assign({}, p, { name: e.target.value }); }); }} /></div>
            <div><label style={labelStyle}>Date of Birth *</label><input style={inputStyle} type="date" value={patient.dob} onChange={function(e) { setPatient(function(p) { return Object.assign({}, p, { dob: e.target.value }); }); }} /></div>
            <div><label style={labelStyle}>Email Address</label><input style={inputStyle} type="email" placeholder="your@email.com" value={patient.email} onChange={function(e) { setPatient(function(p) { return Object.assign({}, p, { email: e.target.value }); }); }} /></div>
            <div><label style={labelStyle}>Phone Number</label><input style={inputStyle} type="tel" placeholder="e.g. 07700 900000" value={patient.phone} onChange={function(e) { setPatient(function(p) { return Object.assign({}, p, { phone: e.target.value }); }); }} /></div>
          </div>
          <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
            <button style={Object.assign({}, btnP, { opacity: canNext() ? 1 : 0.35 })} onClick={next} disabled={!canNext()}>Start Assessment</button>
          </div>
        </div>
      )}

      {!done && isQ && cq && (
        <div style={Object.assign({}, cardStyle, { margin: "0 16px" })}>
          <div style={{ fontFamily: serif, fontSize: 22, color: primary, lineHeight: 1.35, marginBottom: cq.hint ? 6 : 20 }}>{cq.text}</div>
          {cq.hint && <p style={{ fontSize: 13, color: muted, marginBottom: 18 }}>{cq.hint}</p>}

          {cq.type === "single" && cq.options.map(function(opt) {
            return <OptionCard key={opt.value} label={opt.label} selected={answers[qIdx] === opt.value} onClick={function() { setAnswer(opt.value); }} type="radio" />;
          })}

          {cq.type === "multi" && cq.options.map(function(opt) {
            return <OptionCard key={opt.value} label={opt.label} selected={(answers[qIdx] || []).includes(opt.value)} onClick={function() { toggleMulti(opt.value); }} type="check" />;
          })}

          {cq.type === "slider" && (
            <div>
              <div style={{ textAlign: "center", margin: "8px 0 20px" }}>
                <span style={{ fontFamily: serif, fontSize: 56, color: primary }}>{slider}</span>
                <span style={{ fontSize: 22, color: muted }}> / 10</span>
              </div>
              <input type="range" min="0" max="10" step="1" value={slider} onChange={function(e) { setSlider(Number(e.target.value)); }} style={{ width: "100%", accentColor: primary }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: muted }}>
                <span>0 - No pain</span><span>10 - Worst imaginable</span>
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

      {!done && step === "results" && (
        <div style={{ maxWidth: 580, width: "100%", margin: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Patient card */}
          <div style={Object.assign({}, cardStyle, { margin: 0 })}>
            <div style={{ background: stageColors[stage] + "18", border: "1.5px solid " + stageColors[stage] + "40", borderRadius: 10, padding: "10px 14px", marginBottom: 18 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: stageColors[stage] }}>Assessment completed - {new Date().toLocaleDateString("en-GB")}</span>
            </div>
            <div style={{ fontFamily: serif, fontSize: 26, color: primary, marginBottom: 10, lineHeight: 1.3 }}>{gd.title}</div>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "#4B5563", marginBottom: 18 }}>{gd.summary}</p>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: primary, marginBottom: 10 }}>What you can do now:</div>
              {gd.advice.map(function(tip, i) {
                return (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ width: 20, height: 20, background: primary, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: white, fontSize: 10 }}>v</span>
                    </div>
                    <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{tip}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ background: primary, borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.55, margin: 0, flex: 1 }}>{gd.urgency}</p>
              <a href="tel:01883622222" style={{ background: brand, color: primary, padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}>Call 01883 622222</a>
            </div>
          </div>

          {/* Clinician triage tree */}
          <div style={Object.assign({}, cardStyle, { margin: 0, border: "1.5px solid " + primary })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={function() { setShowTriage(function(s) { return !s; }); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: primary }}>Clinician Triage</span>
                <span style={{ background: stageColors[stage], color: white, padding: "2px 10px", borderRadius: 20, fontSize: 11 }}>Wilkes Stage {stage}</span>
                <span style={{ background: priority.color, color: white, padding: "2px 10px", borderRadius: 20, fontSize: 11 }}>{priority.label}</span>
              </div>
              <span style={{ color: primary, fontSize: 14 }}>{showTriage ? "Hide" : "Show"}</span>
            </div>
            {showTriage && (
              <TriageTree score={score} stage={stage} nerveFlags={nerveFlags} paraFlags={paraFlags} priority={priority} />
            )}
          </div>

          {/* Submit */}
          <div style={Object.assign({}, cardStyle, { margin: 0 })}>
            <div style={{ fontSize: 13, fontWeight: 500, color: primary, marginBottom: 6 }}>Send results to the practice</div>
            <p style={{ fontSize: 13, color: muted, marginBottom: 16, lineHeight: 1.6 }}>Submit your assessment and our team will be in touch to discuss your results and arrange a convenient time to see you.</p>
            {error && <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={handleSubmit} style={Object.assign({}, btnP, { flex: 1, opacity: sending ? 0.5 : 1 })} disabled={sending}>
                {sending ? "Sending..." : "Submit Assessment"}
              </button>
              <button onClick={reset} style={Object.assign({}, btnS, { flex: 1 })}>Start Again</button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
