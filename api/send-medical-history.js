const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { pdfBase64, patientName, patientDob } = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Safe filename
    const safeName = patientName.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
    const safeDob  = String(patientDob).replace(/\//g, "-");
    const filename = `Medical_History_${safeName}_DOB_${safeDob}.pdf`;

    await transporter.sendMail({
      from:    `"Practify" <${process.env.GMAIL_USER}>`,
      to:      process.env.RECEPTION_EMAIL,
      subject: `Medical History Form — ${patientName} (DOB: ${patientDob})`,
      text:    `Medical history form received from ${patientName} (DOB: ${patientDob}).\n\nCompleted electronically via Practify. Please find the completed form attached.\n\nThis is an automated message — please do not reply to this email.`,
      attachments: [
        {
          filename,
          content:     pdfBase64,
          encoding:    "base64",
          contentType: "application/pdf",
        },
      ],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("send-medical-history error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
