import { useState, useRef, useEffect } from "react";

// ── Update this with your online booking page URL ──
const BOOKING_URL = "https://booking.uk.hsone.app/soe/new?pid=UKCKI01#/perspectives/3";

const QUESTIONS = [
  {
    id: "main",
    text: "Hi there 👋 I'm here to help assess your dental concern. Which best describes your main symptom?",
    options: [
      { label: "Pain or ache", next: "pain" },
      { label: "Swelling", next: "swelling" },
      { label: "Broken or chipped tooth", next: "broken" },
      { label: "Cracked tooth or pain when biting", next: "cracked" },
      { label: "Jaw pain or clicking", next: "jaw" },
      { label: "Cosmetic concern", next: "cosmetic" },
      { label: "Something else", next: "other" },
    ],
  },
  {
    id: "pain",
    text: "How would you describe the pain?",
    options: [
      { label: "Severe — I can barely cope", triage: "RED", reason: "Severe dental pain needs same-day attention. Please contact us today." },
      { label: "Throbbing or constant", triage: "AMBER", reason: "Persistent pain should be assessed within 1–2 weeks." },
      { label: "Mild or occasional", triage: "AMBER", reason: "Mild pain that doesn't resolve should be checked soon." },
      { label: "Only when eating or drinking", next: "sensitivity" },
    ],
  },
  {
    id: "sensitivity",
    text: "Is the sensitivity to hot, cold, or sweet things?",
    options: [
      { label: "Hot liquids cause lingering pain", triage: "AMBER", reason: "Sensitivity to heat can indicate nerve involvement — worth seeing us soon." },
      { label: "Cold or sweet — pain goes away quickly", triage: "GREEN", reason: "This is likely sensitivity. We can check at your next routine appointment." },
    ],
  },
  {
    id: "swelling",
    text: "Where is the swelling?",
    options: [
      { label: "My face, cheek or neck", triage: "RED", reason: "Facial or neck swelling can be a dental emergency. Please contact us today." },
      { label: "My gum around a tooth", triage: "AMBER", reason: "Gum swelling needs attention within 1–2 weeks." },
      { label: "My gums in general", triage: "GREEN", reason: "General gum swelling is manageable — book a routine appointment." },
    ],
  },
  {
    id: "broken",
    text: "Is there any pain with the broken tooth?",
    options: [
      { label: "Yes — sharp or severe pain", triage: "RED", reason: "A painful broken tooth needs to be seen today." },
      { label: "Mild discomfort", triage: "AMBER", reason: "We'd like to see you within 1–2 weeks to assess and repair this." },
      { label: "No pain at all", triage: "GREEN", reason: "No immediate emergency — book a routine appointment to have it repaired." },
    ],
  },
  {
    id: "cracked",
    text: "What are you experiencing with the cracked tooth?",
    options: [
      { label: "Sharp pain when I bite down or let go", next: "cracked_bite" },
      { label: "Sensitivity to cold or sweet things", triage: "AMBER", reason: "Sensitivity can be a sign of a crack affecting the tooth — worth seeing us within 1–2 weeks." },
      { label: "A sharp edge I can feel with my tongue", triage: "AMBER", reason: "A rough or sharp edge can indicate a crack or chip — we'd like to check this within 1–2 weeks." },
      { label: "I can see a visible crack or the tooth looks split", next: "cracked_visible" },
    ],
  },
  {
    id: "cracked_bite",
    text: "How severe is the pain when you bite?",
    options: [
      { label: "Severe — it's stopping me from eating", triage: "RED", reason: "Severe pain on biting can indicate a significant crack — please contact us today." },
      { label: "Moderate — uncomfortable but manageable", triage: "AMBER", reason: "Pain on biting is a classic sign of a cracked tooth — we'd like to see you within 1–2 weeks." },
    ],
  },
  {
    id: "cracked_visible",
    text: "What does the crack look like?",
    options: [
      { label: "The tooth looks split or broken into pieces", triage: "RED", reason: "A split tooth needs urgent attention — please contact us today." },
      { label: "I can see a crack but the tooth is still in one piece", triage: "AMBER", reason: "A visible crack needs assessment within 1–2 weeks to prevent it from worsening." },
    ],
  },
  {
    id: "jaw",
    text: "Are you experiencing any of the following?",
    options: [
      { label: "Jaw locked open or closed", triage: "RED", reason: "A locked jaw needs urgent attention — please contact us today." },
      { label: "Regular clicking and pain", triage: "AMBER", reason: "This sounds like it could be TMD — we'd like to assess you within 1–2 weeks." },
      { label: "Occasional clicking, no real pain", triage: "GREEN", reason: "Occasional jaw clicking is common — mention it at your next check-up." },
    ],
  },
  {
    id: "cosmetic",
    text: "What cosmetic concern can we help with?",
    options: [
      { label: "Whitening or staining", triage: "GREEN", reason: "We can discuss whitening options at a routine appointment." },
      { label: "Gaps or alignment", triage: "GREEN", reason: "We can discuss options like Invisalign at a consultation." },
      { label: "A veneer or crown has come off", triage: "AMBER", reason: "We'd like to see you within 1–2 weeks to recement or replace this." },
    ],
  },
  {
    id: "other",
    text: "Which of these applies?",
    options: [
      { label: "I've had an accident or trauma to my mouth", triage: "RED", reason: "Dental trauma needs same-day assessment." },
      { label: "I've lost a filling", triage: "AMBER", reason: "A lost filling should be replaced within 1–2 weeks to protect the tooth." },
      { label: "I'm overdue a check-up", triage: "GREEN", reason: "Great that you're getting back on track — book a routine check-up." },
      { label: "Bleeding gums", triage: "GREEN", reason: "Bleeding gums are very common — we can help at a routine hygiene appointment." },
    ],
  },
];

const triageConfig = {
  GREEN: {
    color: "#166534", bg: "#f0fdf4", border: "#86efac",
    label: "Routine Appointment",
    detail: "This doesn't appear urgent. Book a check-up at your convenience.",
    emoji: "✓",
  },
  AMBER: {
    color: "#92400e", bg: "#fffbeb", border: "#fcd34d",
    label: "Book Within 1–2 Weeks",
    detail: "We'd like to see you relatively soon to assess this properly.",
    emoji: "!",
  },
  RED: {
    color: "#991b1b", bg: "#fff1f2", border: "#fca5a5",
    label: "Contact Us Today",
    detail: "This needs prompt attention. Please call the practice today.",
    emoji: "!!",
  },
};

const getQuestion = (id) => QUESTIONS.find(q => q.id === id);

export default function SymptomChecker() {
  const [phase, setPhase] = useState("welcome");
  const [messages, setMessages] = useState([]);
  const [triage, setTriage] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const start = () => {
    const q = getQuestion("main");
    setMessages([{ role: "bot", text: q.text, options: q.options }]);
    setPhase("chat");
  };

  const handleOption = (option) => {
    const updated = [...messages];
    updated[updated.length - 1] = { ...updated[updated.length - 1], options: null };
    const newMessages = [...updated, { role: "user", text: option.label }];
    if (option.triage) {
      setTriage(option.triage);
      newMessages.push({ role: "bot", text: option.reason });
      setMessages(newMessages);
      setPhase("result");
    } else if (option.next) {
      const nextQ = getQuestion(option.next);
      if (nextQ) {
        newMessages.push({ role: "bot", text: nextQ.text, options: nextQ.options });
        setMessages(newMessages);
      }
    }
  };

  const reset = () => {
    setPhase("welcome"); setMessages([]); setTriage(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#5A5A59", fontFamily: "Georgia,serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 500, background: "white", borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,.10)", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        <div style={{ background: "#3D3830", padding: "22px 26px", color: "white", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🦷</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>Dental Symptom Checker</div>
            <div style={{ fontSize: 12, opacity: .65, fontFamily: "system-ui", marginTop: 2 }}>Quick triage · Not a diagnosis</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", maxHeight: 520, minHeight: 400 }}>

          {phase === "welcome" && (
            <div style={{ textAlign: "center", paddingTop: 30 }}>
              <div style={{ fontSize: 52, marginBottom: 18 }}>🦷</div>
              <div style={{ fontSize: 20, color: "#3D3830", fontWeight: 700, marginBottom: 10 }}>Concerned about a dental problem?</div>
              <div style={{ fontSize: 14, color: "#6b7280", fontFamily: "system-ui", lineHeight: 1.7, marginBottom: 28, maxWidth: 340, margin: "0 auto 28px" }}>
                Answer a few quick questions and we'll let you know how urgently you should be seen.
              </div>
              <button onClick={start} style={{ background: "#3D3830", color: "white", border: "none", borderRadius: 50, padding: "15px 40px", fontSize: 16, fontFamily: "Georgia,serif", cursor: "pointer", boxShadow: "0 6px 20px rgba(26,58,92,.25)" }}>
                Start Symptom Check →
              </button>
              <div style={{ marginTop: 16, fontSize: 11, color: "#9ca3af", fontFamily: "system-ui" }}>For emergencies, always call the practice directly</div>
            </div>
          )}

          {phase !== "welcome" && messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "bot" && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#3D3830", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginTop: 2 }}>🦷</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "4px 16px 16px 16px", padding: "12px 15px", fontSize: 14, fontFamily: "system-ui", color: "#1f2937", lineHeight: 1.6 }}>
                      {msg.text}
                    </div>
                    {msg.options && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 10 }}>
                        {msg.options.map((opt, j) => (
                          <button key={j} onClick={() => handleOption(opt)} style={{ background: "white", border: "1.5px solid #d1d5db", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontFamily: "system-ui", color: "#374151", cursor: "pointer", textAlign: "left" }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {msg.role === "user" && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ background: "#3D3830", color: "white", borderRadius: "16px 4px 16px 16px", padding: "10px 15px", fontSize: 14, fontFamily: "system-ui", maxWidth: "75%" }}>
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          ))}

          {phase === "result" && triage && (
            <div style={{ background: triageConfig[triage].bg, border: `2px solid ${triageConfig[triage].border}`, borderRadius: 16, padding: 20, marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#3D3830", color: "#C9BA9B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                  {triageConfig[triage].emoji}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: triageConfig[triage].color }}>{triageConfig[triage].label}</div>
              </div>
              <div style={{ fontSize: 13, color: "#374151", fontFamily: "system-ui", lineHeight: 1.6, marginBottom: 16 }}>{triageConfig[triage].detail}</div>

              {triage === "RED" ? (
                <div>
                  <a href="tel:01883622222" style={{ display: "block", background: "#3D3830", color: "#C9BA9B", borderRadius: 50, padding: "11px 0", fontSize: 14, fontFamily: "Georgia,serif", cursor: "pointer", width: "100%", textAlign: "center", textDecoration: "none" }}>
                    Call Us Now — 01883 622222
                  </a>
                  <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#6b7280", fontFamily: "system-ui", lineHeight: 1.6 }}>
                    If we're closed, please leave a message and we'll respond as soon as possible.
                  </div>
                </div>
              ) : (
                <div>
                  <a href={BOOKING_URL} target="_blank" rel="noreferrer" style={{ display: "block", background: "#3D3830", color: "#C9BA9B", borderRadius: 50, padding: "11px 0", fontSize: 14, fontFamily: "Georgia,serif", cursor: "pointer", width: "100%", textAlign: "center", textDecoration: "none" }}>
                    Book Online Now →
                  </a>
                  <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#6b7280", fontFamily: "system-ui" }}>
                    Or call us on 01883 622222 if you prefer to speak to someone
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {phase !== "welcome" && (
          <div style={{ borderTop: "1px solid #f3f4f6", padding: 12, textAlign: "center", background: "#fafafa" }}>
            <button onClick={reset} style={{ background: "transparent", border: "1px solid #d1d5db", color: "#6b7280", borderRadius: 50, padding: "7px 20px", fontSize: 12, cursor: "pointer", fontFamily: "system-ui" }}>
              ← Start again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
