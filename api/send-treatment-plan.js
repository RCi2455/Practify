const { Resend } = require('resend');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { pdfBase64, patientName, responseChoice, subject, signDate } = req.body;

    if (!pdfBase64 || !patientName || !subject) {
      return res.status(400).json({ error: 'Missing required fields: pdfBase64, patientName, subject' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL, // e.g. noreply@completedentistrysurrey.co.uk (must be verified in Resend)
      to: 'reception@completedentistrysurrey.co.uk',
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:0">
          <div style="background:#1a2e4a;padding:22px 28px;border-radius:8px 8px 0 0">
            <h1 style="color:white;font-size:20px;margin:0;font-weight:400;letter-spacing:.03em">Complete Dentistry Surrey</h1>
            <p style="color:#c4a35a;font-size:10px;margin:5px 0 0;text-transform:uppercase;letter-spacing:.2em">Signed Treatment Plan</p>
          </div>
          <div style="border:1px solid #ddd8cc;border-top:none;padding:28px;border-radius:0 0 8px 8px;background:#fff">
            <p style="color:#555;font-size:15px;margin:0 0 20px">A patient has signed and returned their treatment plan. Details below:</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr>
                <td style="padding:11px 14px;border:1px solid #ece8df;font-weight:600;background:#f8f6f1;width:32%;color:#1a2e4a;font-size:13px">Patient</td>
                <td style="padding:11px 14px;border:1px solid #ece8df;font-size:14px">${patientName}</td>
              </tr>
              <tr>
                <td style="padding:11px 14px;border:1px solid #ece8df;font-weight:600;background:#f8f6f1;color:#1a2e4a;font-size:13px">Response</td>
                <td style="padding:11px 14px;border:1px solid #ece8df;font-size:14px">${responseChoice}</td>
              </tr>
              <tr>
                <td style="padding:11px 14px;border:1px solid #ece8df;font-weight:600;background:#f8f6f1;color:#1a2e4a;font-size:13px">Date Signed</td>
                <td style="padding:11px 14px;border:1px solid #ece8df;font-size:14px">${signDate}</td>
              </tr>
            </table>
            <div style="background:#f0faf5;border:1px solid #a8d5ba;border-radius:6px;padding:14px 18px;margin-bottom:20px">
              <p style="margin:0;font-size:14px;color:#2e7d52">📎 The signed treatment plan PDF is attached to this email.</p>
            </div>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
            <p style="color:#aaa;font-size:11px;margin:0">Sent automatically · Complete Dentistry Surrey Treatment Plan System</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `TreatmentPlan_${(patientName || 'Patient').replace(/\s+/g, '_')}_Signed.pdf`,
          content: pdfBase64, // Resend accepts raw base64 string
        },
      ],
    });

    if (error) throw new Error(error.message);

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error('send-treatment-plan error:', err);
    return res.status(500).json({ error: err.message });
  }
};
