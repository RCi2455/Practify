// api/send-treatment-plan.js
// Vercel serverless function — sends signed treatment plan PDF to reception via Resend

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const TO   = "reception@completedentistrysurrey.co.uk";
const FROM = "Practify <noreply@completedentistrysurrey.co.uk>";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { pdfBase64, patientName, responseChoice, subject, signDate } = req.body;

    const safeName = (patientName || "Patient")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_");

    await resend.emails.send({
      from: FROM,
      to:   TO,
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#3D3830;padding:20px 24px;">
            <p style="color:#C9BA9B;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0;">Complete Dentistry Surrey</p>
            <h1 style="color:#ffffff;font-size:20px;margin:8px 0 0;">Signed Treatment Plan Received</h1>
          </div>
          <div style="padding:24px;background:#f9f7f5;border:1px solid #e2dad0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;width:140px;">Patient name</td>
                <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;font-weight:600;">${patientName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #e2dad0;color:#7a7060;font-size:13px;">Response</td>
                <td style="padding:8px 0;border-bottom:1px solid #e2dad0;font-size:13px;">${responseChoice}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#7a7060;font-size:13px;">Date signed</td>
                <td style="padding:8px 0;font-size:13px;">${signDate}</td>
              </tr>
            </table>
            <p style="font-size:13px;color:#4b5563;margin:20px 0 0;line-height:1.6;">
              The signed treatment plan PDF is attached. Please save this to the patient's record.
            </p>
          </div>
          <div style="padding:16px 24px;background:#3D3830;text-align:center;">
            <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:0;">Practify · Complete Dentistry Surrey · 01883 622222</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Treatment_Plan_${safeName}_Signed.pdf`,
          content:  pdfBase64,
        },
      ],
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("send-treatment-plan error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
};
