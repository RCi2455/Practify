// api/send-form.js
// Practify — Vercel serverless email handler via Resend
// Handles: tmj | smile | toothwear | patient_copy

const { Resend } = require("resend");

const resend  = new Resend(process.env.RESEND_API_KEY);
const TO      = "reception@completedentistrysurrey.co.uk";
const FROM    = "Practify <noreply@completedentistrysurrey.co.uk>";
const BOOKING = "https://booking.uk.hsone.app/soe/new?pid=UKCKI01#/perspectives/3";

// ── Shared HTML chrome ────────────────────────────────────────────────────────
function chrome(title, subtitle, body) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;">
      <div style="background:#3D3830;padding:20px 24px;">
        <p style="color:#C9BA9B;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Complete Dentistry Surrey</p>
        <h1 style="color:#ffffff;font-size:20px;margin:0;">${title}</h1>
        ${subtitle ? `<p style="color:rgba(255,255,255,0.55);font-size:12px;margin:6px 0 0;">${subtitle}</p>` : ""}
      </div>
      <div style="padding:24px;background:#f9f7f5;border:1px solid #e2dad0;">
        ${body}
      </div>
      <div style="padding:14px 24px;background:#3D3830;text-align:center;">
        <p style="font-size:11px;color:rgba(255,255,255,0.35);margin:0;">Practify · Complete Dentistry Surrey · 01883 622222</p>
      </div>
    </div>`;
}

function row(label, value) {
  return `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;width:160px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;">${value || "<span style='color:#bbb'>Not provided</span>"}</td>
    </tr>`;
}

function table(rows) {
  return `<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">${rows}</table>`;
}

function panel(label, content) {
  return `
    <div style="background:#fff;border:1px solid #e2dad0;border-radius:6px;padding:16px;margin-bottom:14px;">
      <p style="font-size:11px;font-weight:600;color:#3D3830;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px;">${label}</p>
      ${content}
    </div>`;
}

// ── TMJ ───────────────────────────────────────────────────────────────────────
function buildTMJEmail(data) {
  const rows = table([
    row("Patient name", `<strong>${data.name}</strong>`),
    row("Date of birth", data.dob),
    row("Phone", data.phone),
    row("Email", data.email),
    row("Mode", data.mode === "website" ? "Online (patient self-completed)" : "In-practice"),
    row("Triage score", data.score),
    row("Wilkes stage", `<strong>Stage ${data.stage}</strong>`),
    row("Date submitted", data.dateSubmitted),
  ].join(""));

  const clinicianPanel = panel("Clinician Triage — Confidential",
    `<p style="font-size:13px;color:#374151;line-height:1.65;margin:0;">${data.clinicianNote}</p>`);

  const attachments = data.pdfBase64
    ? [{ filename: `TMJ_Assessment_${(data.name || "Patient").replace(/\s+/g, "_")}.pdf`, content: data.pdfBase64 }]
    : [];

  return {
    subject: `New TMJ Assessment — ${data.name}`,
    html: chrome("New TMJ Assessment", data.mode === "website" ? "Online submission" : "In-practice", rows + clinicianPanel),
    attachments,
  };
}

// ── Smile Design ──────────────────────────────────────────────────────────────
function buildSmileEmail(data) {
  const rows = table([
    row("Patient name", `<strong>${data.name}</strong>`),
    row("Email", data.email),
    row("Phone", data.phone),
    row("Contact preference", data.contactPref === "callback" ? "Callback requested" : "Email"),
    row("Best time to call", data.callTime || "—"),
    row("Budget", data.budget),
    row("Timeline", data.timeline),
    row("Date submitted", data.dateSubmitted),
  ].join(""));

  const responsesPanel = panel("Questionnaire Responses",
    `<pre style="font-size:12px;color:#4b5563;line-height:1.8;white-space:pre-wrap;margin:0;">${data.answerSummary}</pre>`);

  const recPanel = data.recommendation ? panel("Indicative Starting Point (shown to patient)",
    `<p style="font-size:13px;color:#374151;font-style:italic;margin:0;">${data.recommendation}</p>`) : "";

  const notesPanel = data.notes ? panel("Additional Notes",
    `<p style="font-size:13px;color:#374151;margin:0;">${data.notes}</p>`) : "";

  const photoSection = data.photoHtml
    ? panel("Smile Photos", data.photoHtml)
    : `<p style="font-size:12px;color:#9a8c7e;margin:0;">No photos submitted.</p>`;

  const attachments = data.pdfBase64
    ? [{ filename: `Smile_Questionnaire_${(data.name || "Patient").replace(/\s+/g, "_")}.pdf`, content: data.pdfBase64 }]
    : [];

  return {
    subject: `New Smile Design Enquiry — ${data.name}`,
    html: chrome("New Smile Design Enquiry", null, rows + responsesPanel + recPanel + notesPanel + photoSection),
    attachments,
  };
}

// ── Tooth Wear ────────────────────────────────────────────────────────────────
function buildToothWearEmail(data) {
  const rows = table([
    row("Patient name", `<strong>${data.name}</strong>`),
    row("Date of birth", data.dob),
    row("Phone", data.phone),
    row("Email", data.email),
    row("Mode", data.mode === "website" ? "Online (patient self-completed)" : "In-practice"),
    row("Date submitted", data.dateSubmitted),
  ].join(""));

  const responsesPanel = panel("Assessment Responses",
    `<pre style="font-size:12px;color:#4b5563;line-height:1.8;white-space:pre-wrap;margin:0;">${data.answerSummary}</pre>`);

  const attachments = data.pdfBase64
    ? [{ filename: `ToothWear_Assessment_${(data.name || "Patient").replace(/\s+/g, "_")}.pdf`, content: data.pdfBase64 }]
    : [];

  return {
    subject: `New Tooth Wear Assessment — ${data.name}`,
    html: chrome("New Tooth Wear Assessment", data.mode === "website" ? "Online submission" : "In-practice", rows + responsesPanel),
    attachments,
  };
}

// ── Patient acknowledgement (website mode auto-send) ──────────────────────────
function buildAckEmail(patientName, formTitle) {
  const body = `
    <p style="font-size:15px;color:#3D3830;margin:0 0 16px;">Dear ${patientName},</p>
    <p style="font-size:14px;color:#4b5563;line-height:1.75;margin:0 0 16px;">
      Thank you for completing your <strong>${formTitle}</strong>. We have received your responses
      and a member of our team will be in touch shortly.
    </p>
    <p style="font-size:14px;color:#4b5563;line-height:1.75;margin:0 0 28px;">
      If you would like to book an appointment in the meantime, you can do so online —
      or simply give us a call on <strong>01883 622222</strong>.
    </p>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${BOOKING}" style="background:#C9BA9B;color:#3D3830;padding:14px 30px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;display:inline-block;">
        Book an Appointment Online
      </a>
    </div>
    <p style="font-size:13px;color:#7a7060;line-height:1.6;margin:0;">
      We look forward to seeing you.<br/>
      <strong>The Complete Dentistry Surrey team</strong>
    </p>`;

  return {
    subject: `We've received your ${formTitle} — Complete Dentistry Surrey`,
    html: chrome("We've received your details", null, body),
  };
}

// ── Patient copy (surgery mode — staff emails patient after) ──────────────────
function buildPatientCopyEmail(data) {
  const body = `
    <p style="font-size:15px;color:#3D3830;margin:0 0 16px;">Dear ${data.patientName},</p>
    <p style="font-size:14px;color:#4b5563;line-height:1.75;margin:0 0 16px;">
      Thank you for completing your <strong>${data.formTitle}</strong> with us today.
      Please find your personalised summary attached as a PDF for your records.
    </p>
    <p style="font-size:14px;color:#4b5563;line-height:1.75;margin:0 0 28px;">
      If you have any questions or would like to book a follow-up appointment, you can
      book online or call us on <strong>01883 622222</strong>.
    </p>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${BOOKING}" style="background:#C9BA9B;color:#3D3830;padding:14px 30px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;display:inline-block;">
        Book an Appointment Online
      </a>
    </div>
    <p style="font-size:13px;color:#7a7060;line-height:1.6;margin:0;">
      Kind regards,<br/>
      <strong>The Complete Dentistry Surrey team</strong>
    </p>`;

  return {
    subject: `Your ${data.formTitle} — Complete Dentistry Surrey`,
    html: chrome("Your Assessment Summary", null, body),
    attachments: data.pdfBase64
      ? [{ filename: data.filename || "Assessment_Summary.pdf", content: data.pdfBase64 }]
      : [],
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { formType, ...data } = req.body;

  const TITLES = {
    tmj:       "Jaw Pain Assessment",
    smile:     "Smile Design Questionnaire",
    toothwear: "Tooth Wear Assessment",
  };

  try {
    // ── patient_copy: staff emails patient a PDF copy post-appointment ──
    if (formType === "patient_copy") {
      const emailData = buildPatientCopyEmail(data);
      await resend.emails.send({ from: FROM, to: data.patientEmail, ...emailData });
      return res.status(200).json({ success: true });
    }

    // ── Standard form submissions ──
    let emailData;
    switch (formType) {
      case "tmj":       emailData = buildTMJEmail(data);       break;
      case "smile":     emailData = buildSmileEmail(data);     break;
      case "toothwear": emailData = buildToothWearEmail(data); break;
      default:
        return res.status(400).json({ error: `Unknown formType: ${formType}` });
    }

    // Send to reception
    await resend.emails.send({ from: FROM, to: TO, ...emailData });

    // Send patient acknowledgement if email provided (website mode)
    const patientEmail = data.email;
    const isWebsite    = data.mode === "website" || formType === "smile";
    if (isWebsite && patientEmail) {
      const ack = buildAckEmail(data.name, TITLES[formType]);
      await resend.emails.send({ from: FROM, to: patientEmail, ...ack });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("[send-form] Resend error:", err);
    return res.status(500).json({ error: "Failed to send email", detail: err.message });
  }
};
