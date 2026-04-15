// api/send-treatment-plan.js
// Practify — Treatment Plan email handler via Resend
// Called by TreatmentPlanLetter.jsx after patient signs

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const TO     = "reception@completedentistrysurrey.co.uk";
const FROM   = "Practify <noreply@completedentistrysurrey.co.uk>";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const { pdfBase64, patientName, responseChoice, subject, signDate } = req.body;

  if (!pdfBase64 || !patientName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const safeName = (patientName || "Patient").replace(/\s+/g, "_");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;">
      <div style="background:#1a2e4a;padding:20px 24px;">
        <p style="color:#c4a35a;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Complete Dentistry Surrey</p>
        <h1 style="color:#ffffff;font-size:20px;margin:0;">Treatment Plan — Patient Response Received</h1>
      </div>
      <div style="padding:24px;background:#f9f7f5;border:1px solid #e2dad0;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;width:160px;">Patient name</td>
            <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;font-weight:600;">${patientName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;">Date signed</td>
            <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;">${signDate || "Not recorded"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#7a7060;font-size:13px;vertical-align:top;padding-top:12px;">Patient response</td>
            <td style="padding:8px 0;font-size:13px;padding-top:12px;">
              <div style="background:#edf2f9;border:1px solid #1a2e4a;border-radius:6px;padding:12px 14px;font-weight:500;color:#1a2e4a;">
                ${responseChoice || "Response not recorded"}
              </div>
            </td>
          </tr>
        </table>
        <p style="font-size:13px;color:#4b5563;line-height:1.65;margin:0;">
          The signed treatment plan letter is attached as a PDF. Please save this to the patient's record in SOE.
        </p>
      </div>
      <div style="padding:14px 24px;background:#1a2e4a;text-align:center;">
        <p style="font-size:11px;color:rgba(255,255,255,0.35);margin:0;">Practify · Complete Dentistry Surrey · 01883 622222</p>
      </div>
    </div>`;

  try {
    await resend.emails.send({
      from:        FROM,
      to:          TO,
      subject:     subject || `Treatment Plan Response — ${patientName}`,
      html,
      attachments: [{
        filename: `TreatmentPlan_${safeName}_Signed.pdf`,
        content:  pdfBase64,
      }],
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[send-treatment-plan] Resend error:", err);
    return res.status(500).json({ error: "Failed to send email", detail: err.message });
  }
};
