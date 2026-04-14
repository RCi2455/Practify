// api/send-form.js
// Vercel serverless function — handles all Practify form emails via Resend
// Handles: TMJ Online, Smile Design Questionnaire, Medical History Form

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const TO   = "reception@completedentistrysurrey.co.uk";
const FROM = "Practify <noreply@completedentistrysurrey.co.uk>";

// ── TMJ email builder ─────────────────────────────────────────────
function buildTMJEmail(data) {
  return {
    subject: "I would like to book a TMJ assessment",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#3D3830;padding:20px 24px;">
          <p style="color:#C9BA9B;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0;">Complete Dentistry Surrey</p>
          <h1 style="color:#ffffff;font-size:20px;margin:8px 0 0;">New Jaw Pain Assessment Request</h1>
        </div>
        <div style="padding:24px;background:#f9f7f5;border:1px solid #e2dad0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;width:140px;">Patient name</td>
                <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;font-weight:600;">${data.name}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;">Phone</td>
                <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;">${data.phone}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;">Email</td>
                <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;">${data.email || "Not provided"}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;">Symptom level</td>
                <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;">${data.severity}</td></tr>
            <tr><td style="padding:8px 0;color:#7a7060;font-size:13px;">Date submitted</td>
                <td style="padding:8px 0;font-size:13px;">${data.dateSubmitted}</td></tr>
          </table>
          <div style="margin-top:24px;background:#fff;border:1px solid #e2dad0;border-radius:6px;padding:16px;">
            <p style="font-size:12px;font-weight:600;color:#3D3830;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Assessment Responses</p>
            <pre style="font-size:12px;color:#4b5563;line-height:1.8;white-space:pre-wrap;margin:0;">${data.answerSummary}</pre>
          </div>
        </div>
        <div style="padding:16px 24px;background:#3D3830;text-align:center;">
          <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:0;">Practify · Complete Dentistry Surrey · 01883 622222</p>
        </div>
      </div>
    `,
  };
}

// ── Smile Design email builder ────────────────────────────────────
function buildSmileEmail(data) {
  return {
    subject: "New Smile Design Enquiry — Practify",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#3D3830;padding:20px 24px;">
          <p style="color:#C9BA9B;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0;">Complete Dentistry Surrey</p>
          <h1 style="color:#ffffff;font-size:20px;margin:8px 0 0;">New Smile Design Enquiry</h1>
        </div>
        <div style="padding:24px;background:#f9f7f5;border:1px solid #e2dad0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;width:140px;">Patient name</td>
                <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;font-weight:600;">${data.name}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;">Phone</td>
                <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;">${data.phone}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;">Email</td>
                <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;">${data.email || "Not provided"}</td></tr>
            <tr><td style="padding:8px 0;color:#7a7060;font-size:13px;">Date submitted</td>
                <td style="padding:8px 0;font-size:13px;">${data.dateSubmitted}</td></tr>
          </table>
          <div style="margin-top:24px;background:#fff;border:1px solid #e2dad0;border-radius:6px;padding:16px;">
            <p style="font-size:12px;font-weight:600;color:#3D3830;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Questionnaire Responses</p>
            <pre style="font-size:12px;color:#4b5563;line-height:1.8;white-space:pre-wrap;margin:0;">${data.answerSummary}</pre>
          </div>
        </div>
        <div style="padding:16px 24px;background:#3D3830;text-align:center;">
          <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:0;">Practify · Complete Dentistry Surrey · 01883 622222</p>
        </div>
      </div>
    `,
  };
}

// ── Medical History email builder ─────────────────────────────────
function buildMedicalEmail(data) {
  const attachments = data.pdfBase64
    ? [{ filename: `Medical_History_${data.patientName.replace(/\s+/g, "_")}_${data.patientDob}.pdf`, content: data.pdfBase64 }]
    : [];

  return {
    subject: `Medical History Form — ${data.patientName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#3D3830;padding:20px 24px;">
          <p style="color:#C9BA9B;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0;">Complete Dentistry Surrey</p>
          <h1 style="color:#ffffff;font-size:20px;margin:8px 0 0;">Medical History Form Received</h1>
        </div>
        <div style="padding:24px;background:#f9f7f5;border:1px solid #e2dad0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;width:140px;">Patient name</td>
                <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;font-weight:600;">${data.patientName}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;">Date of birth</td>
                <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;">${data.patientDob}</td></tr>
            <tr><td style="padding:8px 0;color:#7a7060;font-size:13px;">Date submitted</td>
                <td style="padding:8px 0;font-size:13px;">${new Date().toLocaleDateString("en-GB")}</td></tr>
          </table>
          <p style="font-size:13px;color:#4b5563;margin:20px 0 0;line-height:1.6;">The completed medical history form is attached as a PDF. Please save this to the patient's record in SOE.</p>
        </div>
        <div style="padding:16px 24px;background:#3D3830;text-align:center;">
          <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:0;">Practify · Complete Dentistry Surrey · 01883 622222</p>
        </div>
      </div>
    `,
    attachments,
  };
}

// ── Main handler ──────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { formType, ...data } = req.body;

  try {
    let emailData;

    switch (formType) {
      case "tmj":     emailData = buildTMJEmail(data);     break;
      case "smile":   emailData = buildSmileEmail(data);   break;
      case "medical": emailData = buildMedicalEmail(data); break;
      default:
        return res.status(400).json({ error: "Unknown form type" });
    }

    await resend.emails.send({ from: FROM, to: TO, ...emailData });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Resend error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
};
