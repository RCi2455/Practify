import { useState } from "react";

var primary = "#3D3830";
var brand   = "#C9BA9B";
var bgPage  = "#5A5A59";
var white   = "#FFFFFF";
var border  = "#E2DAD0";
var muted   = "#7A7060";
var font    = "DM Sans, system-ui, sans-serif";
var serif   = "Georgia, serif";
var r1c = "#2d7a4f";
var r2c = "#5a8a2e";
var r3c = "#c49a00";
var r4c = "#c06000";
var r5c = "#c0392b";

var cardStyle  = { background: white, borderRadius: 16, padding: "32px 36px", border: "1px solid " + border, maxWidth: 580, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.22)", boxSizing: "border-box" };
var btnP       = { background: primary, color: white, border: "none", borderRadius: 10, padding: "13px 26px", fontSize: 14, fontFamily: font, fontWeight: 500, cursor: "pointer" };
var btnS       = { background: "transparent", color: primary, border: "1.5px solid rgba(61,56,48,0.22)", borderRadius: 10, padding: "11px 22px", fontSize: 13, fontFamily: font, cursor: "pointer" };
var labelStyle = { fontSize: 12, fontWeight: 500, color: primary, display: "block", marginBottom: 6 };
var inputStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid " + border, borderRadius: 10, fontSize: 14, fontFamily: font, boxSizing: "border-box", outline: "none", color: primary, background: white };

var QUESTIONS = [
  {
    id: 1,
    text: "Have you noticed any change in the length, shape, or appearance of your teeth?",
    type: "single",
    options: [
      { label: "No, my teeth look the same as always",         value: "no",       score: 0 },
      { label: "Possibly - they may look slightly shorter",     value: "possible", score: 2 },
      { label: "Yes - they are noticeably shorter or chipped",  value: "yes",      score: 4 },
    ],
  },
  {
    id: 2,
    text: "Which of the following acidic foods or drinks do you consume?",
    hint: "Select all that apply",
    type: "multi",
    maxScore: 3,
    options: [
      { label: "Fizzy drinks (including diet/sugar-free)",       value: "fizzy",   score: 1 },
      { label: "Citrus fruits or juices",                       value: "citrus",  score: 1 },
      { label: "Wine or cider",                                 value: "wine",    score: 1 },
      { label: "Vinegar-based foods (pickles, salad dressings)", value: "vinegar", score: 1 },
      { label: "Sports or energy drinks",                       value: "sports",  score: 1 },
      { label: "None of the above",                             value: "none",    score: 0 },
    ],
  },
  {
    id: 3,
    text: "How often do you consume acidic foods or drinks?",
    type: "single",
    options: [
      { label: "Rarely or never",          value: "never", score: 0 },
      { label: "A few times per week",      value: "few",   score: 1 },
      { label: "Once a day",               value: "daily", score: 2 },
      { label: "Multiple times a day",     value: "multi", score: 3 },
    ],
  },
  {
    id: 4,
    text: "Do you suffer from acid reflux, heartburn or GORD?",
    type: "single",
    options: [
      { label: "No",                                value: "no",  score: 0 },
      { label: "Occasionally",                      value: "occ", score: 2 },
      { label: "Regularly or diagnosed with GORD",  value: "yes", score: 4 },
    ],
  },
  {
    id: 5,
    text: "Do you experience frequent vomiting or regurgitation?",
    type: "single",
    options: [
      { label: "No",            value: "no",   score: 0 },
      { label: "Occasionally",  value: "occ",  score: 2 },
      { label: "Frequently",    value: "freq", score: 4 },
    ],
  },
  {
    id: 6,
    text: "Do you grind or clench your teeth?",
    type: "single",
    options: [
      { label: "No",                                    value: "no",    score: 0 },
      { label: "I think so - mainly at night",           value: "night", score: 2 },
      { label: "Yes, I notice it during the day",        value: "day",   score: 2 },
      { label: "Both day and night grinding/clenching",  value: "both",  score: 4 },
    ],
  },
  {
    id: 7,
    text: "Do you experience tooth sensitivity?",
    type: "single",
    options: [
      { label: "No sensitivity",                           value: "none", score: 0 },
      { label: "Occasionally to cold or sweet things",     value: "occ",  score: 1 },
      { label: "Regularly, affecting eating or drinking",  value: "reg",  score: 2 },
    ],
  },
  {
    id: 8,
    text: "How soon after eating or drinking do you usually brush your teeth?",
    type: "single",
    options: [
      { label: "I wait at least 60 minutes",          value: "wait",      score: 0 },
      { label: "After about 30 minutes",              value: "30min",     score: 1 },
      { label: "Immediately or within a few minutes", value: "immediate", score: 2 },
    ],
  },
  {
    id: 9,
    text: "How would you describe your toothbrushing pressure and technique?",
    type: "single",
    options: [
      { label: "Light, circular or gentle technique", value: "light", score: 0 },
      { label: "Moderate",                            value: "mod",   score: 1 },
      { label: "Firm or scrubbing action",            value: "hard",  score: 2 },
    ],
  },
  {
    id: 10,
    text: "Has a dentist, hygienist or doctor previously mentioned tooth wear or erosion to you?",
    type: "single",
    options: [
      { label: "No, never mentioned",             value: "no",  score: 0 },
      { label: "Yes, it has been mentioned before", value: "yes", score: 2 },
    ],
  },
];

var RISK = {
  1: { color: r1c, label: "Low Risk",           clinical: "Low risk of significant tooth wear. Routine monitoring at check-up appointments appropriate. Reinforce good dietary and brushing habits." },
  2: { color: r2c, label: "Low-Moderate Risk",  clinical: "Low-moderate risk. Some erosive or abrasive risk factors identified. Consider dietary advice, fluoride reinforcement, and review at next appointment." },
  3: { color: r3c, label: "Moderate Risk",      clinical: "Moderate risk. Multiple risk factors present. Clinical examination to assess wear pattern and severity recommended. Consider BEWE scoring and preventive prescription." },
  4: { color: r4c, label: "High Risk",          clinical: "High risk. Significant erosive and/or abrasive risk factors. Priority appointment for clinical assessment, BEWE scoring, and active management plan." },
  5: { color: r5c, label: "Severe Risk",        clinical: "Severe risk. Multiple high-weighted risk factors. Urgent clinical assessment required. Consider specialist referral if extensive wear confirmed." },
};

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

function getAnswerLabel(q, ans) {
  if (!ans) return "Not answered";
  if (q.type === "multi") {
    var arr = Array.isArray(ans) ? ans : [ans];
    var labels = arr.map(function(v) {
      var opt = q.options.find(function(o) { return o.value === v; });
      return opt ? opt.label : v;
    }).filter(Boolean);
    return labels.length ? labels.join(", ") : "Not answered";
  }
  var opt = q.options && q.options.find(function(o) { return o.value === ans; });
  return opt ? opt.label : "Not answered";
}

function OptionCard(props) {
  var sel = props.selected;
  return (
    <div onClick={props.onClick} style={{ border: "1.5px solid " + (sel ? primary : border), background: sel ? "rgba(61,56,48,0.06)" : white, borderRadius: 10, padding: "12px 16px", cursor: "pointer", fontSize: 14, color: sel ? primary : "#2C2C2C", fontWeight: sel ? 500 : 400, display: "flex", alignItems: "center", gap: 12, userSelect: "none" }}>
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

export default function ToothWearAssessment() {
  var stepS    = useState("details"); var step = stepS[0]; var setStep = stepS[1];
  var patientS = useState({ name: "", dob: "", email: "", phone: "" }); var patient = patientS[0]; var setPatient = patientS[1];
  var answersS = useState({}); var answers = answersS[0]; var setAnswers = answersS[1];
  var sendingS = useState(false); var sending = sendingS[0]; var setSending = sendingS[1];
  var doneS    = useState(false); var done = doneS[0]; var setDone = doneS[1];
  var errorS   = useState(""); var error = errorS[0]; var setError = errorS[1];

  var qIdx = step.startsWith("q") ? parseInt(step.slice(1), 10) : null;
  var isQ  = qIdx !== null;
  var cq   = isQ ? QUESTIONS[qIdx] : null;

  var score = calcScore(answers);
  // eslint-disable-next-line no-unused-vars
  var risk  = getRisk(score);
 

  var canNext = function() {
    if (step === "details") return !!(patient.name.trim()) && !!(patient.dob);
    if (isQ) {
      if (cq.type === "multi") return (answers[qIdx] || []).length > 0;
      return answers[qIdx] !== undefined;
    }
    return true;
  };

  var next = function() {
    if (step === "details") { setStep("q0"); return; }
    if (isQ) { setStep(qIdx < QUESTIONS.length - 1 ? "q" + (qIdx + 1) : "submit"); }
  };

  var back = function() {
    if (step === "q0")    { setStep("details"); return; }
    if (isQ)              { setStep("q" + (qIdx - 1)); return; }
    if (step === "submit"){ setStep("q" + (QUESTIONS.length - 1)); }
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

    var sc = calcScore(answers);
    var rk = getRisk(sc);
    var rdata = RISK[rk];

    var answersHtml = QUESTIONS.map(function(q, idx) {
      var ans = answers[idx];
      var ansLabel = getAnswerLabel(q, ans);
      return "<tr style='border-bottom:1px solid #e2dad0;'>" +
        "<td style='padding:10px 12px;font-size:12px;color:#7a7060;width:30px;vertical-align:top;'><strong>Q" + (idx + 1) + "</strong></td>" +
        "<td style='padding:10px 12px;font-size:13px;color:#3D3830;vertical-align:top;'>" + q.text + "</td>" +
        "<td style='padding:10px 12px;font-size:13px;color:#2C2C2C;font-weight:500;vertical-align:top;'>" + ansLabel + "</td>" +
        "</tr>";
    }).join("");

    var emailBody = "<div style='font-family:Arial,sans-serif;max-width:640px;margin:0 auto;'>" +
      "<div style='background:#3D3830;padding:20px 24px;'>" +
      "<p style='color:#C9BA9B;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;'>Complete Dentistry Surrey</p>" +
      "<h1 style='color:#ffffff;font-size:20px;margin:0;'>Tooth Wear Risk Assessment</h1>" +
      "<p style='color:rgba(255,255,255,0.55);font-size:12px;margin:6px 0 0;'>Online Patient Submission</p>" +
      "</div>" +
      "<div style='padding:24px;background:#f9f7f5;border:1px solid #e2dad0;'>" +
      "<table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>" +
      "<tr><td style='padding:8px 12px;font-size:12px;color:#7a7060;width:140px;'>Patient name</td><td style='padding:8px 12px;font-size:13px;font-weight:600;color:#3D3830;'>" + patient.name + "</td></tr>" +
      "<tr><td style='padding:8px 12px;font-size:12px;color:#7a7060;'>Date of birth</td><td style='padding:8px 12px;font-size:13px;color:#2C2C2C;'>" + patient.dob + "</td></tr>" +
      (patient.email ? "<tr><td style='padding:8px 12px;font-size:12px;color:#7a7060;'>Email</td><td style='padding:8px 12px;font-size:13px;color:#2C2C2C;'>" + patient.email + "</td></tr>" : "") +
      (patient.phone ? "<tr><td style='padding:8px 12px;font-size:12px;color:#7a7060;'>Phone</td><td style='padding:8px 12px;font-size:13px;color:#2C2C2C;'>" + patient.phone + "</td></tr>" : "") +
      "<tr><td style='padding:8px 12px;font-size:12px;color:#7a7060;'>Date submitted</td><td style='padding:8px 12px;font-size:13px;color:#2C2C2C;'>" + new Date().toLocaleDateString("en-GB") + "</td></tr>" +
      "</table>" +
      "<div style='background:#EBF5F0;border-left:4px solid " + rdata.color + ";padding:14px 18px;margin-bottom:20px;border-radius:4px;'>" +
      "<p style='font-size:11px;color:#7a7060;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;'>CLINICIAN TRIAGE - CONFIDENTIAL</p>" +
      "<p style='font-size:16px;font-weight:700;color:" + rdata.color + ";margin:0 0 6px;'>" + rdata.label + " (Score: " + sc + ")</p>" +
      "<p style='font-size:13px;color:#374151;margin:0;'>" + rdata.clinical + "</p>" +
      "</div>" +
      "<p style='font-size:13px;font-weight:600;color:#3D3830;margin:0 0 12px;'>Patient Responses</p>" +
      "<table style='width:100%;border-collapse:collapse;background:white;border:1px solid #e2dad0;border-radius:8px;overflow:hidden;'>" +
      answersHtml +
      "</table>" +
      "</div>" +
      "<div style='padding:14px 24px;background:#3D3830;text-align:center;'>" +
      "<p style='font-size:11px;color:rgba(255,255,255,0.35);margin:0;'>Practify - Complete Dentistry Surrey - 01883 622222</p>" +
      "</div>" +
      "</div>";

    fetch("/api/send-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "toothwear",
        name: patient.name,
        dob: patient.dob,
        email: patient.email,
        phone: patient.phone,
        mode: "website",
        dateSubmitted: new Date().toLocaleDateString("en-GB"),
        answerSummary: emailBody,
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
    setStep("details");
    setPatient({ name: "", dob: "", email: "", phone: "" });
    setAnswers({});
    setDone(false);
    setError("");
  };

  return (
    <div style={{ fontFamily: font, background: bgPage, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 48 }}>

      <div style={{ width: "100%", background: primary, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0, boxSizing: "border-box" }}>
        <div>
          <div style={{ fontFamily: serif, fontSize: 22, color: white }}>Complete Dentistry</div>
          <div style={{ color: brand, fontSize: 11, marginTop: 2, letterSpacing: "2px", textTransform: "uppercase" }}>Tooth Wear Risk Assessment</div>
        </div>
      </div>
      <div style={{ width: "100%", background: brand, height: 6, marginBottom: 32 }} />

      {isQ && <ProgressBar current={qIdx} total={QUESTIONS.length} />}

      {done && (
        <div style={Object.assign({}, cardStyle, { margin: "0 16px", textAlign: "center" })}>
          <div style={{ width: 56, height: 56, background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24 }}>&#10003;</div>
          <div style={{ fontFamily: serif, fontSize: 28, color: primary, marginBottom: 12 }}>Thank you, {patient.name.split(" ")[0]}</div>
          <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.75, marginBottom: 24 }}>
            We have received your tooth wear assessment and a member of our team will be in touch to discuss your results and arrange a convenient time to see you.
          </p>
          <p style={{ fontSize: 13, color: muted, lineHeight: 1.65, marginBottom: 28 }}>
            If you have any concerns in the meantime, please do not hesitate to call us on <strong style={{ color: primary }}>01883 622222</strong>.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:01883622222" style={{ background: brand, color: primary, padding: "12px 24px", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>Call 01883 622222</a>
            <button onClick={reset} style={btnS}>New Assessment</button>
          </div>
        </div>
      )}

      {!done && step === "details" && (
        <div style={Object.assign({}, cardStyle, { margin: "0 16px" })}>
          <div style={{ fontFamily: serif, fontSize: 26, color: primary, marginBottom: 6 }}>Your Details</div>
          <p style={{ fontSize: 13, color: muted, marginBottom: 24 }}>Please fill in your details so we can match this assessment to your patient record.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} placeholder="e.g. Jane Smith" value={patient.name} onChange={function(e) { setPatient(function(p) { return Object.assign({}, p, { name: e.target.value }); }); }} />
            </div>
            <div>
              <label style={labelStyle}>Date of Birth *</label>
              <input style={inputStyle} type="date" value={patient.dob} onChange={function(e) { setPatient(function(p) { return Object.assign({}, p, { dob: e.target.value }); }); }} />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input style={inputStyle} type="email" placeholder="your@email.com" value={patient.email} onChange={function(e) { setPatient(function(p) { return Object.assign({}, p, { email: e.target.value }); }); }} />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input style={inputStyle} type="tel" placeholder="e.g. 07700 900000" value={patient.phone} onChange={function(e) { setPatient(function(p) { return Object.assign({}, p, { phone: e.target.value }); }); }} />
            </div>
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
              {qIdx < QUESTIONS.length - 1 ? "Next" : "Review and Submit"}
            </button>
          </div>
        </div>
      )}

      {!done && step === "submit" && (
        <div style={Object.assign({}, cardStyle, { margin: "0 16px" })}>
          <div style={{ fontFamily: serif, fontSize: 26, color: primary, marginBottom: 8 }}>Ready to submit</div>
          <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.7, marginBottom: 20 }}>
            Thank you for completing the assessment, {patient.name.split(" ")[0]}. When you submit, your responses will be sent securely to our team. We will review your information and be in touch to discuss next steps.
          </p>

          <div style={{ background: "#F7F5F1", borderRadius: 10, padding: "16px 18px", marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: muted, marginBottom: 10, fontWeight: 500 }}>Summary of your answers</div>
            {QUESTIONS.map(function(q, idx) {
              return (
                <div key={idx} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: brand, fontWeight: 600, flexShrink: 0 }}>Q{idx + 1}.</span>
                  <span style={{ color: muted, flex: 1 }}>{q.text}</span>
                  <span style={{ color: primary, fontWeight: 500, textAlign: "right", flexShrink: 0, maxWidth: "40%" }}>{getAnswerLabel(q, answers[idx])}</span>
                </div>
              );
            })}
          </div>

          {error && <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 16 }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <button style={btnS} onClick={back} disabled={sending}>Back</button>
            <button style={Object.assign({}, btnP, { opacity: sending ? 0.5 : 1 })} onClick={handleSubmit} disabled={sending}>
              {sending ? "Sending..." : "Submit Assessment"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
