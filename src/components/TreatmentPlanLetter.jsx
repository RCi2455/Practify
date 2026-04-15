import { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import SignaturePad from 'signature_pad';

const API = '/api/send-treatment-plan';

// ── Design tokens (matching Practify hub) ─────────────────────────────────────
const NAV    = '#1a2e4a';
const GOLD   = '#c4a35a';
const BORDER = '#ddd8cc';
const TEXT   = '#2d3440';
const MUTED  = '#7a8299';
const CREAM  = '#fefcf8';
const LIGHT  = '#f4f2ee';
const GREEN  = '#2e7d52';

// ── Default letter copy ───────────────────────────────────────────────────────
const DEFAULT_CBCT = `Thank you for attending your appointment at Complete Dentistry Surrey. As discussed, you kindly agreed to undergo a Cone Beam CT (CBCT) scan to allow us to plan your implant treatment in greater detail. I have now reviewed your scan and I am pleased to present the following treatment plan for your consideration.`;

const DEFAULT_RISKS = `BENEFITS:
• Dental implants provide a natural look, feel, and function similar to your own teeth
• They help preserve the jawbone and prevent bone loss at the site of the missing tooth
• Implants are a long-term solution and, with proper care, can last many years or a lifetime
• Unlike a bridge, implants do not require reduction of adjacent healthy teeth
• They improve comfort, confidence, and the ability to eat and speak normally

RISKS:
• Infection at the implant site, which may require antibiotic treatment
• Implant failure or rejection, which may require removal and replacement
• Temporary nerve sensitivity, bruising, swelling, or discomfort post-surgery
• Risk of sinus complications if implants are placed in the upper jaw near the sinuses
• A need for bone grafting if insufficient bone volume is present
• Smoking significantly increases the risk of implant failure and is strongly discouraged
• Treatment may span several months and require multiple appointments`;

const DEFAULT_CTA = `I hope this treatment plan gives you a clear picture of what is proposed and what to expect. Please take as much time as you need to consider the information. If you have any questions, please do not hesitate to contact us — we are always happy to help.

Please indicate your preference below, sign, and click the button to send your response directly to our team.`;

const OPT_LABELS = [
  'I am happy with the proposal and would like to schedule an appointment',
  'I am happy, but I have some more questions before proceeding',
  'I do not wish to go ahead at the present time',
];

const EMAIL_SUBJECTS = [
  '',
  'Treatment Plan Accepted – {name} would like to schedule an appointment',
  'Treatment Plan – {name} has some questions before proceeding',
  'Treatment Plan Declined – {name} does not wish to proceed at this time',
];

// ── Letter HTML builder ───────────────────────────────────────────────────────
function buildLetterHTML(data, withResp, sigUrl, selOpt) {
  const addrLines = (data.addr || '').split('\n').map(l => `<div>${l}</div>`).join('');

  const schedFiltered = data.sched.filter(r => r.t || r.s);
  const schedHTML = schedFiltered.length
    ? `<table style="width:100%;border-collapse:collapse;font-size:13.5px;margin-top:3px">
        <thead><tr>
          <th style="background:#f8f6f1;font-family:'Jost',sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#7a8299;font-weight:700;padding:7px 10px;text-align:left;border:1px solid #ece8df">Treatment / Procedure</th>
          <th style="background:#f8f6f1;font-family:'Jost',sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#7a8299;font-weight:700;padding:7px 10px;text-align:left;border:1px solid #ece8df">Timing</th>
        </tr></thead>
        <tbody>${schedFiltered.map((r, i) => `<tr>
          <td style="padding:7px 10px;border:1px solid #ece8df;background:${i % 2 ? '#fdfcf9' : 'white'}">${r.t}</td>
          <td style="padding:7px 10px;border:1px solid #ece8df;background:${i % 2 ? '#fdfcf9' : 'white'}">${r.s}</td>
        </tr>`).join('')}</tbody>
      </table>`
    : '<em style="color:#bbb;font-size:13px">No schedule added.</em>';

  const feeFiltered = data.fees.filter(r => r.item || r.fee);
  const feeTotal = feeFiltered.reduce((sum, r) => sum + (parseFloat(r.fee) || 0), 0);
  const feeHTML = feeFiltered.length
    ? `<table style="width:100%;border-collapse:collapse;font-size:13.5px;margin-top:3px">
        <thead><tr>
          <th style="background:#f8f6f1;font-family:'Jost',sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#7a8299;font-weight:700;padding:7px 10px;text-align:left;border:1px solid #ece8df">Item / Procedure</th>
          <th style="background:#f8f6f1;font-family:'Jost',sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#7a8299;font-weight:700;padding:7px 10px;text-align:right;border:1px solid #ece8df">Fee</th>
        </tr></thead>
        <tbody>${feeFiltered.map((r, i) => `<tr>
          <td style="padding:7px 10px;border:1px solid #ece8df;background:${i % 2 ? '#fdfcf9' : 'white'}">${r.item}</td>
          <td style="padding:7px 10px;border:1px solid #ece8df;text-align:right;background:${i % 2 ? '#fdfcf9' : 'white'}">£${(parseFloat(r.fee) || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
        </tr>`).join('')}</tbody>
      </table>
      <div style="font-family:'Jost',sans-serif;font-size:13px;font-weight:700;text-align:right;padding-top:8px;border-top:2px solid #1a2e4a;color:#1a2e4a;margin-top:3px">
        Total Estimate: £${feeTotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
      </div>`
    : '<em style="color:#bbb;font-size:13px">No fees added.</em>';

  const responseHTML = withResp ? `
    <div style="border-top:1px solid #e5e0d8;margin-top:26px;padding-top:20px">
      <div style="font-family:'Jost',sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:.22em;color:#c4a35a;font-weight:700;margin-bottom:12px">PATIENT RESPONSE</div>
      ${OPT_LABELS.map((l, i) => `
        <div style="display:flex;align-items:flex-start;gap:11px;margin-bottom:9px;padding:10px 13px;border:1px solid ${selOpt === i + 1 ? '#1a2e4a' : '#ddd8cc'};border-radius:6px;background:${selOpt === i + 1 ? '#edf2f9' : 'white'}">
          <div style="width:17px;height:17px;min-width:17px;border:2px solid ${selOpt === i + 1 ? '#1a2e4a' : '#ddd'};border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:${selOpt === i + 1 ? '#1a2e4a' : 'white'};color:white">${selOpt === i + 1 ? '✓' : ''}</div>
          <div style="font-size:14px">${l}</div>
        </div>`).join('')}
      <div style="display:flex;gap:32px;margin-top:22px">
        <div style="flex:1">
          <div style="border-bottom:1px solid #2d3440;min-height:56px;display:flex;align-items:flex-end;padding-bottom:4px">
            ${sigUrl ? `<img src="${sigUrl}" style="max-height:50px" alt="signature" />` : ''}
          </div>
          <div style="font-family:'Jost',sans-serif;font-size:10px;color:#7a8299;margin-top:3px;text-transform:uppercase;letter-spacing:.08em">Patient Signature</div>
        </div>
        <div style="max-width:170px;flex:1">
          <div style="border-bottom:1px solid #2d3440;min-height:56px;display:flex;align-items:flex-end;padding-bottom:6px;font-size:14px">${data.signDate || ''}</div>
          <div style="font-family:'Jost',sans-serif;font-size:10px;color:#7a8299;margin-top:3px;text-transform:uppercase;letter-spacing:.08em">Date</div>
        </div>
      </div>
    </div>` : '';

  const sec = (title, body) => `
    <div style="margin-bottom:20px">
      <div style="font-family:'Jost',sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:.22em;color:#c4a35a;font-weight:700;margin-bottom:6px;padding-bottom:3px;border-bottom:1px solid #f0ece3">${title}</div>
      <div style="font-size:14.5px;white-space:pre-wrap">${body || '<em style="color:#bbb">Not provided</em>'}</div>
    </div>`;

  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:2px solid #1a2e4a;margin-bottom:26px">
      <div>
        <div style="font-size:22px;font-weight:600;color:#1a2e4a">Complete Dentistry Surrey</div>
        <div style="font-size:10px;color:#c4a35a;text-transform:uppercase;letter-spacing:.2em;margin-top:3px;font-family:'Jost',sans-serif">Advanced Implant &amp; Restorative Dentistry</div>
        <div style="font-size:11px;color:#7a8299;margin-top:6px;font-family:'Jost',sans-serif;line-height:1.5">
          1 Church Road, Warlingham, Surrey CR6 9NW<br/>01883 622222 · reception@completedentistrysurrey.co.uk
        </div>
      </div>
      <div style="text-align:right;font-family:'Jost',sans-serif;font-size:12px;color:#7a8299">${data.date}</div>
    </div>

    <div style="margin-bottom:24px">
      <div style="font-size:15px;font-weight:500">${data.name}</div>
      <div style="font-size:13px;color:#7a8299;font-family:'Jost',sans-serif;line-height:1.5;margin-top:2px">${addrLines}</div>
    </div>

    <div style="margin-bottom:16px;font-size:15px">Dear ${data.name.split(' ')[0] || data.name},</div>

    ${sec('RE: Dental Implant Treatment Plan', data.cbct)}
    ${sec('Current Situation', data.situation)}
    ${sec('Areas Requiring Attention', data.attention)}
    ${sec('Proposed Treatment', data.proposed)}
    ${sec('Risks &amp; Benefits of Treatment', data.risks)}

    <div style="margin-bottom:20px">
      <div style="font-family:'Jost',sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:.22em;color:#c4a35a;font-weight:700;margin-bottom:6px;padding-bottom:3px;border-bottom:1px solid #f0ece3">Schedule of Treatment</div>
      ${schedHTML}
    </div>

    <div style="margin-bottom:20px">
      <div style="font-family:'Jost',sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:.22em;color:#c4a35a;font-weight:700;margin-bottom:6px;padding-bottom:3px;border-bottom:1px solid #f0ece3">Estimate of Fees</div>
      ${feeHTML}
    </div>

    <div style="background:#f8f6f1;border-left:3px solid #c4a35a;padding:14px 17px;margin:20px 0;font-size:14px">${(data.cta || '').replace(/\n/g, '<br/>')}</div>

    <div style="margin-top:18px;font-size:14px">Yours sincerely,</div>
    <div style="margin-top:26px;font-size:15px;font-weight:500">${data.dentist}</div>
    <div style="font-family:'Jost',sans-serif;font-size:11px;color:#7a8299;margin-top:2px">Complete Dentistry Surrey</div>

    ${responseHTML}
  `;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TreatmentPlanLetter() {
  const today = new Date().toISOString().split('T')[0];

  const [step,       setStep]       = useState(1);
  const [selOpt,     setSelOpt]     = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [loadMsg,    setLoadMsg]    = useState('');
  const [emailOk,    setEmailOk]    = useState(null);
  const [lastPdf,    setLastPdf]    = useState(null);
  const [resultName, setResultName] = useState('');
  const [letterHTML, setLetterHTML] = useState('');

  // Form fields
  const [pName,      setPName]      = useState('');
  const [pDate,      setPDate]      = useState(today);
  const [pAddr,      setPAddr]      = useState('');
  const [pDentist,   setPDentist]   = useState('');
  const [pCbct,      setPCbct]      = useState(DEFAULT_CBCT);
  const [pSituation, setPSituation] = useState('');
  const [pAttention, setPAttention] = useState('');
  const [pProposed,  setPProposed]  = useState('');
  const [pRisks,     setPRisks]     = useState(DEFAULT_RISKS);
  const [pCta,       setPCta]       = useState(DEFAULT_CTA);
  const [signDate,   setSignDate]   = useState(today);

  const [schedRows, setSchedRows] = useState([
    { t: '', s: '' }, { t: '', s: '' }, { t: '', s: '' }, { t: '', s: '' },
  ]);
  const [feeRows, setFeeRows] = useState([
    { item: '', fee: '' }, { item: '', fee: '' }, { item: '', fee: '' },
  ]);

  const sigCanvasRef = useRef(null);
  const sigPadRef    = useRef(null);
  const pdfRenderRef = useRef(null);

  const feeTotal = feeRows.reduce((sum, r) => sum + (parseFloat(r.fee) || 0), 0);

  // Build data object from current state
  const getData = () => ({
    name:     pName || '[Patient Name]',
    addr:     pAddr || '',
    date:     pDate ? new Date(pDate + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    dentist:  pDentist || 'Complete Dentistry Surrey',
    cbct:     pCbct,
    situation: pSituation,
    attention: pAttention,
    proposed: pProposed,
    risks:    pRisks,
    sched:    schedRows,
    fees:     feeRows,
    cta:      pCta,
    signDate: signDate ? new Date(signDate + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
  });

  const goStep = (n) => {
    if (n === 2 || n === 3) setLetterHTML(buildLetterHTML(getData(), false, '', 0));
    setStep(n);
    window.scrollTo(0, 0);
  };

  // Initialise signature pad when step 3 mounts
  useEffect(() => {
    if (step !== 3) return;
    const timer = setTimeout(() => {
      const canvas = sigCanvasRef.current;
      if (!canvas) return;
      canvas.width  = canvas.offsetWidth * 2;
      canvas.height = 160 * 2;
      canvas.style.height = '160px';
      canvas.getContext('2d').scale(2, 2);
      if (sigPadRef.current) sigPadRef.current.off();
      sigPadRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgba(0,0,0,0)',
        penColor: '#1a2e4a',
        minWidth: 0.8,
        maxWidth: 2.5,
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [step]);

  // PDF generation
  const generatePDF = async (data, sigUrl) => {
    const rd = pdfRenderRef.current;
    rd.innerHTML = `<div style="padding:48px 56px;font-family:'Cormorant Garamond',serif;font-size:15px;line-height:1.75;color:#2d3440">${buildLetterHTML(data, true, sigUrl, selOpt)}</div>`;
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 400));

    const canvas = await html2canvas(rd, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff', width: 750 });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const ratio  = pw / (canvas.width / 2);
    const totalH = (canvas.height / 2) * ratio;
    let rem = totalH, sy = 0;

    while (rem > 0) {
      const slH  = Math.min(ph, rem);
      const srcH = Math.ceil((slH / ratio) * 2);
      const sc   = document.createElement('canvas');
      sc.width   = canvas.width;
      sc.height  = srcH;
      sc.getContext('2d').drawImage(canvas, 0, sy, canvas.width, srcH, 0, 0, canvas.width, srcH);
      pdf.addImage(sc.toDataURL('image/png'), 'PNG', 0, 0, pw, slH);
      rem -= slH;
      sy  += srcH;
      if (rem > 0) pdf.addPage();
    }

    rd.innerHTML = '';
    return { pdf, base64: pdf.output('datauristring').split(',')[1] };
  };

  const finish = async () => {
    if (!selOpt) { alert('Please select one of the three response options.'); return; }
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) { alert('Please add your signature before completing.'); return; }

    const data   = getData();
    const sigUrl = sigPadRef.current.toDataURL('image/png');
    setLoading(true);
    setLoadMsg('Generating your signed letter…');

    let ok = false;
    try {
      const { pdf, base64 } = await generatePDF(data, sigUrl);
      setLastPdf(pdf);
      const safeName = (data.name || 'Patient').replace(/\s+/g, '_');
      setResultName(safeName);
      pdf.save(`TreatmentPlan_${safeName}_Signed.pdf`);

      const subject = EMAIL_SUBJECTS[selOpt].replace('{name}', data.name);
      setLoadMsg('Sending to reception…');
      try {
        const resp = await fetch(API, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfBase64:      base64,
            patientName:    data.name,
            responseChoice: OPT_LABELS[selOpt - 1],
            subject,
            signDate:       data.signDate,
          }),
        });
        ok = resp.ok;
      } catch { ok = false; }

      setEmailOk(ok);
      setStep(4);
      window.scrollTo(0, 0);
    } catch (e) {
      alert('Error generating PDF: ' + e.message);
      console.error(e);
    }
    setLoading(false);
  };

  // ── Shared UI helpers ─────────────────────────────────────────────────────
  const inp = { border: `1px solid ${BORDER}`, borderRadius: 6, padding: '9px 12px', fontFamily: "'Jost',sans-serif", fontSize: 13, color: TEXT, background: CREAM, width: '100%', boxSizing: 'border-box' };
  const ta  = { ...inp, resize: 'vertical', lineHeight: 1.6 };
  const card = { background: 'white', borderRadius: 8, border: `1px solid ${BORDER}`, padding: 20, marginBottom: 16 };
  const cardTitle = { fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: NAV, marginBottom: 15, paddingBottom: 10, borderBottom: `1px solid ${BORDER}` };
  const lbl  = { fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: MUTED, fontWeight: 600, display: 'block', marginBottom: 5 };
  const btnP = { background: NAV, color: 'white', border: 'none', padding: '11px 24px', borderRadius: 6, fontFamily: "'Jost',sans-serif", fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', cursor: 'pointer' };
  const btnS = { background: 'transparent', color: NAV, border: `1px solid ${NAV}`, padding: '11px 20px', borderRadius: 6, fontFamily: "'Jost',sans-serif", fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', cursor: 'pointer' };

  const Field = ({ label, children, full }) => (
    <div style={{ gridColumn: full ? '1/-1' : undefined }}>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );

  const ResultRow = ({ icon, title, body, bg, border }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px', borderRadius: 8, marginBottom: 12, background: bg, border }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div><strong style={{ display: 'block', fontSize: 14, marginBottom: 3 }}>{title}</strong><p style={{ fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.5 }}>{body}</p></div>
    </div>
  );

  const DynTable = ({ rows, setRows, cols }) => (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{[...cols, ''].map((h, i) => (
            <th key={i} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: MUTED, fontWeight: 600, textAlign: 'left', padding: '7px 8px', borderBottom: `1px solid ${BORDER}`, width: i === cols.length ? 40 : 'auto' }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {cols.map((_, j) => {
                const key = Object.keys(row)[j];
                return (
                  <td key={j} style={{ padding: '4px 3px' }}>
                    <input
                      style={{ ...inp, ...(key === 'fee' ? { width: 120 } : {}) }}
                      type={key === 'fee' ? 'number' : 'text'}
                      value={row[key]}
                      placeholder={key === 'fee' ? '0.00' : cols[j]}
                      onChange={e => {
                        const updated = [...rows];
                        updated[i] = { ...updated[i], [key]: e.target.value };
                        setRows(updated);
                      }}
                    />
                  </td>
                );
              })}
              <td style={{ padding: '4px 3px' }}>
                <button onClick={() => rows.length > 1 && setRows(rows.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#e57373', cursor: 'pointer', fontSize: 18 }}>×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setRows([...rows, Object.fromEntries(Object.keys(rows[0]).map(k => [k, '']))])} style={{ background: 'none', border: `1px dashed ${BORDER}`, color: MUTED, fontSize: 11, padding: '7px 14px', cursor: 'pointer', borderRadius: 4, marginTop: 8, width: '100%', textTransform: 'uppercase', letterSpacing: '.1em' }}>+ Add Row</button>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: LIGHT, fontFamily: "'Jost',sans-serif", color: TEXT }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media print{.no-print{display:none!important}}`}</style>

      {/* Hidden PDF render target */}
      <div ref={pdfRenderRef} style={{ position: 'fixed', left: -9999, top: 0, width: 750, background: 'white' }} />

      {/* Loading overlay */}
      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,46,74,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '32px 44px', textAlign: 'center' }}>
            <div style={{ width: 38, height: 38, border: `3px solid ${BORDER}`, borderTopColor: NAV, borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
            <p style={{ marginTop: 12, fontSize: 13, color: MUTED }}>{loadMsg}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="no-print" style={{ background: NAV, color: 'white', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, background: GOLD, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 600, color: NAV }}>C</div>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 500 }}>Complete Dentistry Surrey</div>
          <div style={{ fontSize: 9, color: GOLD, textTransform: 'uppercase', letterSpacing: '.15em' }}>Implant Treatment Plan</div>
        </div>
      </div>

      {/* Step tabs */}
      <div className="no-print" style={{ display: 'flex', background: 'white', borderBottom: `1px solid ${BORDER}`, overflowX: 'auto' }}>
        {[['1. Compose', 1], ['2. Preview', 2], ['3. Patient Signs', 3], ['4. Complete', 4]].map(([label, n]) => (
          <div key={n} style={{ flex: 1, padding: '11px 4px', textAlign: 'center', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: step === n ? NAV : step > n ? GOLD : MUTED, borderBottom: `3px solid ${step === n ? GOLD : 'transparent'}`, whiteSpace: 'nowrap', minWidth: 75 }}>
            {label}
          </div>
        ))}
      </div>

      {/* ────────────────────── STEP 1: COMPOSE ────────────────────── */}
      {step === 1 && (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '18px 14px' }}>

          <div style={card}>
            <div style={cardTitle}>Patient Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Patient Full Name"><input style={inp} value={pName} onChange={e => setPName(e.target.value)} placeholder="e.g. Jane Smith" /></Field>
              <Field label="Letter Date"><input style={inp} type="date" value={pDate} onChange={e => setPDate(e.target.value)} /></Field>
              <Field label="Patient Address" full>
                <textarea style={{ ...ta, minHeight: 72 }} value={pAddr} onChange={e => setPAddr(e.target.value)} placeholder={'123 High Street\nGuildford\nSurrey GU1 1AA'} />
              </Field>
              <Field label="Dentist / Author"><input style={inp} value={pDentist} onChange={e => setPDentist(e.target.value)} placeholder="e.g. Dr. James Webb" /></Field>
            </div>
          </div>

          <div style={card}>
            <div style={cardTitle}>CBCT Scan Acknowledgement</div>
            <Field label="Opening Paragraph"><textarea style={{ ...ta, minHeight: 78 }} value={pCbct} onChange={e => setPCbct(e.target.value)} /></Field>
          </div>

          <div style={card}>
            <div style={cardTitle}>Clinical Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Current Situation"><textarea style={ta} value={pSituation} onChange={e => setPSituation(e.target.value)} placeholder="Describe the patient's current dental situation…" /></Field>
              <Field label="Areas Requiring Attention"><textarea style={ta} value={pAttention} onChange={e => setPAttention(e.target.value)} placeholder="List areas or issues that need to be addressed…" /></Field>
              <Field label="Proposed Treatment"><textarea style={ta} value={pProposed} onChange={e => setPProposed(e.target.value)} placeholder="Describe the proposed implant treatment in detail…" /></Field>
              <Field label="Risks &amp; Benefits"><textarea style={{ ...ta, minHeight: 170 }} value={pRisks} onChange={e => setPRisks(e.target.value)} /></Field>
            </div>
          </div>

          <div style={card}>
            <div style={cardTitle}>Schedule of Treatment</div>
            <DynTable rows={schedRows} setRows={setSchedRows} cols={['Treatment / Procedure', 'Timing']} />
          </div>

          <div style={card}>
            <div style={cardTitle}>Estimate of Fees</div>
            <DynTable rows={feeRows} setRows={setFeeRows} cols={['Item / Procedure', 'Fee (£)']} />
            <div style={{ textAlign: 'right', marginTop: 12, fontSize: 14 }}>
              Total: <strong style={{ color: NAV }}>£{feeTotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

          <div style={card}>
            <div style={cardTitle}>Call to Action</div>
            <Field label="Closing Paragraph"><textarea style={{ ...ta, minHeight: 78 }} value={pCta} onChange={e => setPCta(e.target.value)} /></Field>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button style={btnP} onClick={() => goStep(2)}>Preview Letter →</button>
          </div>
        </div>
      )}

      {/* ────────────────────── STEP 2: PREVIEW ────────────────────── */}
      {step === 2 && (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '18px 14px' }}>
          <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
            <div style={{ padding: '44px 52px', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, lineHeight: 1.75, color: TEXT }} dangerouslySetInnerHTML={{ __html: letterHTML }} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16, flexWrap: 'wrap' }}>
            <button style={btnS} onClick={() => goStep(1)}>← Edit</button>
            <button style={btnP} onClick={() => goStep(3)}>Ready — Send to Patient →</button>
          </div>
        </div>
      )}

      {/* ────────────────────── STEP 3: PATIENT SIGNS ────────────────────── */}
      {step === 3 && (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '18px 14px' }}>

          {/* Banner */}
          <div className="no-print" style={{ background: 'linear-gradient(135deg,#1a2e4a,#243d5f)', color: 'white', padding: '20px 24px', borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, margin: '0 0 6px' }}>Your Treatment Plan</h2>
            <p style={{ fontSize: 13, opacity: .8, margin: 0 }}>Please read the letter below, then follow the simple steps to respond</p>
          </div>

          {/* Instructions */}
          <div className="no-print" style={card}>
            <div style={{ ...cardTitle, fontSize: 16 }}>📋 How to respond — just 3 easy steps:</div>
            {[
              ['1', 'Read your letter', 'Scroll down to read your treatment plan. Take as much time as you need.'],
              ['2', 'Tick one of the three boxes', 'Choose the option that best describes how you feel about the plan.'],
              ['3', 'Sign and tap the green button', "Your letter will save to your device automatically and our team will be notified straight away — you don't need to do anything else."],
            ].map(([n, title, desc]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, minWidth: 30, background: NAV, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{n}</div>
                <div><strong style={{ display: 'block', fontSize: 14, marginBottom: 2 }}>{title}</strong><span style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{desc}</span></div>
              </div>
            ))}
          </div>

          {/* Letter (read-only) */}
          <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${BORDER}`, overflow: 'hidden', opacity: .7, pointerEvents: 'none', marginBottom: 16 }}>
            <div style={{ padding: '44px 52px', fontFamily: "'Cormorant Garamond',serif", fontSize: 15, lineHeight: 1.75, color: TEXT }} dangerouslySetInnerHTML={{ __html: letterHTML }} />
          </div>

          {/* Response options */}
          <div className="no-print" style={card}>
            <div style={cardTitle}>Your Response</div>
            {[
              ['✅ I am happy with the proposal and would like to schedule an appointment', 'Our reception team will be in touch to arrange your first appointment.'],
              ['❓ I am happy, but I have some more questions first', 'A member of our team will contact you to answer any questions before you decide.'],
              ['⏸ I do not wish to go ahead at the present time', "That's completely fine. We'll keep your records on file should you change your mind."],
            ].map(([title, desc], i) => (
              <div key={i} onClick={() => setSelOpt(i + 1)} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, padding: '14px 16px', border: `2px solid ${selOpt === i + 1 ? NAV : BORDER}`, borderRadius: 10, marginBottom: 10, cursor: 'pointer', background: selOpt === i + 1 ? '#edf2f9' : 'white', transition: 'all .2s' }}>
                <div style={{ width: 22, height: 22, minWidth: 22, border: `2px solid ${selOpt === i + 1 ? NAV : BORDER}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, background: selOpt === i + 1 ? NAV : 'white', color: 'white', marginTop: 2 }}>{selOpt === i + 1 ? '✓' : ''}</div>
                <div><strong style={{ display: 'block', fontSize: 14, marginBottom: 2 }}>{title}</strong><span style={{ fontSize: 12, color: MUTED }}>{desc}</span></div>
              </div>
            ))}
          </div>

          {/* Signature */}
          <div className="no-print" style={card}>
            <label style={lbl}>Your Signature — please sign in the box below using your finger or mouse</label>
            <div style={{ border: `2px solid ${BORDER}`, borderRadius: 8, background: '#fafafa', overflow: 'hidden' }}>
              <canvas ref={sigCanvasRef} height={160} style={{ display: 'block', width: '100%', touchAction: 'none', cursor: 'crosshair' }} />
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 6, textAlign: 'center' }}>Draw your signature above. If it doesn't look right, tap Clear and try again.</div>
            <button onClick={() => sigPadRef.current?.clear()} style={{ background: 'none', border: `1px solid ${BORDER}`, color: MUTED, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', padding: '5px 12px', borderRadius: 4, cursor: 'pointer', marginTop: 8 }}>✕ Clear and redo</button>
            <div style={{ marginTop: 16, maxWidth: 190 }}>
              <label style={lbl}>Date</label>
              <input style={inp} type="date" value={signDate} onChange={e => setSignDate(e.target.value)} />
            </div>
          </div>

          <button onClick={finish} style={{ width: '100%', padding: 16, borderRadius: 10, fontFamily: "'Jost',sans-serif", fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', cursor: 'pointer', border: 'none', background: GREEN, color: 'white', marginBottom: 10 }}>
            ✔ Complete — Send My Response
          </button>
          <button onClick={() => window.print()} style={{ width: '100%', padding: 14, borderRadius: 10, fontFamily: "'Jost',sans-serif", fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', cursor: 'pointer', border: `2px solid ${BORDER}`, background: 'white', color: TEXT, marginBottom: 10 }}>
            🖨 Print Instead
          </button>
          <p style={{ fontSize: 12, color: MUTED, textAlign: 'center', lineHeight: 1.6 }}>Your signed letter will save to your device automatically.<br />Our reception team will also be notified immediately.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button style={btnS} onClick={() => goStep(2)}>← Back</button>
          </div>
        </div>
      )}

      {/* ────────────────────── STEP 4: COMPLETE ────────────────────── */}
      {step === 4 && (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '18px 14px' }}>
          <div style={{ ...card, padding: 28 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: NAV, marginBottom: 6 }}>All Done!</div>
              <div style={{ fontSize: 14, color: MUTED }}>Your response has been recorded.</div>
            </div>

            <ResultRow icon="📄" title="Your signed letter has been saved" body={`Look in your Downloads folder for TreatmentPlan_${resultName}_Signed.pdf`} bg="#f0faf5" border="1px solid #a8d5ba" />

            {emailOk
              ? <ResultRow icon="✅" title="Reception has been notified automatically" body="Your signed letter has been emailed to our team. You don't need to do anything else." bg="#f0faf5" border="1px solid #a8d5ba" />
              : <ResultRow icon="⚠️" title="Could not send automatically" body="Please call us on 01883 622222 and we can assist you, or email reception@completedentistrysurrey.co.uk and attach the PDF from your Downloads folder." bg="#fff8ec" border="1px solid #f0d085" />
            }

            <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button style={btnS} onClick={() => window.print()}>🖨 Print a Copy</button>
              <button style={btnP} onClick={() => lastPdf?.save(`TreatmentPlan_${resultName}_Signed.pdf`)}>⬇ Save PDF Again</button>
              <button style={btnS} onClick={() => { setStep(1); setSelOpt(0); setEmailOk(null); setLastPdf(null); setPName(''); setPAddr(''); setPDentist(''); setPSituation(''); setPAttention(''); setPProposed(''); }}>New Letter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
