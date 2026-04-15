import { useState } from 'react';
import SymptomChecker from './components/SymptomChecker';
import TMJOnline from './components/TMJOnline';
import ToothWearAssessment from './components/ToothWearAssessment';
import SmileDesignQuestionnaire from './components/SmileDesignQuestionnaire';
import MedicalHistoryForm from './components/MedicalHistoryForm';
import TreatmentPlanLetter from './components/TreatmentPlanLetter';

const primary = '#3D3830';
const gold    = '#C9BA9B';
const pageBg  = '#5A5A59';

const TOOLS = [
  {
    id: 'symptom',
    icon: '🦷',
    title: 'Symptom Checker',
    desc: 'Quick triage for dental concerns — Red, Amber or Green outcome with booking prompt.',
  },
  {
    id: 'tmj',
    icon: '🦴',
    title: 'Jaw Pain Checker',
    desc: "Answer a few short questions about your jaw symptoms and we'll give you personalised guidance.",
  },
  {
    id: 'toothwear',
    icon: '🔬',
    title: 'Tooth Wear Assessment',
    desc: 'Erosion and wear risk screening with patient advice and clinician PDF.',
  },
  {
    id: 'smiledesign',
    icon: '✿',
    title: 'Smile Design Questionnaire',
    desc: "Tell us about your smile goals and we'll be in touch to talk through your options.",
  },
  {
    id: 'medhistory',
    icon: '📋',
    title: 'Medical History Form',
    desc: 'Secure pre-appointment medical history — completed online, signed digitally, sent directly to the practice.',
  },
  {
    id: 'treatmentplan',
    icon: '📄',
    title: 'Implant Treatment Plan',
    desc: 'Generate a personalised implant treatment plan letter — reviewed, signed digitally by the patient, and sent automatically to reception.',
  },
];

const DOCS = [
  { title: 'Post-Op Instructions — Oral Surgery / Extraction', file: 'patient-documents/post-op-oral-surgery.html' },
  { title: 'Post-Op Instructions — Implant Surgery',           file: 'patient-documents/post-op-implant-surgery.html' },
  { title: 'Implant Consent Form',                             file: 'patient-documents/implant-consent.html' },
  { title: 'Patient Implant & Aftercare Information',          file: 'patient-documents/implant-aftercare-info.html' },
  { title: 'Conscious Sedation Information',                   file: 'patient-documents/conscious-sedation-info.html' },
  { title: 'Sedation Instructions — Before & After',           file: 'patient-documents/sedation-instructions.html' },
  { title: 'Tooth Wear Assessment (Clinical)',                  file: 'patient-documents/tooth-wear-assessment.html' },
  { title: 'Tooth Wear Risk — Patient Leaflet',                file: 'patient-documents/tooth-wear-patient-leaflet.html' },
  { title: 'Bisphosphonates & Your Dental Health',             file: 'patient-documents/bisphosphonate-advice.html' },
];

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed', top: 14, left: 14, zIndex: 1000,
        background: 'rgba(61,56,48,0.93)', color: gold,
        border: '1px solid rgba(201,186,155,0.3)',
        borderRadius: 20, padding: '8px 16px',
        fontSize: 12, fontFamily: 'system-ui', cursor: 'pointer',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}
    >
      ← Hub
    </button>
  );
}

function Hub({ setView }) {
  return (
    <div style={{ minHeight: '100vh', background: pageBg, fontFamily: 'system-ui', paddingBottom: 60 }}>

      {/* HEADER */}
      <div style={{ background: primary, padding: '28px 32px' }}>
        <div style={{ height: 3, background: 'linear-gradient(to right, #BFA98A, #C9BA9B, #BFA98A)', marginBottom: 24, marginLeft: -32, marginRight: -32, marginTop: -28 }} />
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(201,186,155,0.5)', marginBottom: 6 }}>
              Complete Dentistry Surrey
            </div>
            <div style={{ fontSize: 30, fontFamily: 'Georgia, serif', color: gold, letterSpacing: 0.5 }}>
              Practify
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Clinical Tools &amp; Patient Documents
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 10, color: 'rgba(201,186,155,0.4)', lineHeight: 2 }}>
            <div>1 Church Road, Warlingham, Surrey CR6 9NW</div>
            <div>01883 622222</div>
            <div>completedentistrysurrey.co.uk</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        {/* CLINICAL TOOLS */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
            Clinical Tools
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))', gap: 16 }}>
            {TOOLS.map(tool => (
              <div
                key={tool.id}
                onClick={() => setView(tool.id)}
                style={{
                  background: '#FFFFFF', borderRadius: 12, padding: '26px 24px',
                  cursor: 'pointer', border: '1px solid rgba(201,186,155,0.15)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.28)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.22)'; }}
              >
                <div style={{ fontSize: 34, marginBottom: 14 }}>{tool.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: primary, marginBottom: 7 }}>{tool.title}</div>
                <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.65 }}>{tool.desc}</div>
                <div style={{ marginTop: 20, fontSize: 10, color: '#BFA98A', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Open →
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PATIENT DOCUMENTS */}
        <div>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
            Patient Documents
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))', gap: 10 }}>
            {DOCS.map(doc => (
              <div
                key={doc.file}
                onClick={() => window.open('/' + doc.file, '_blank')}
                style={{
                  background: 'rgba(255,255,255,0.07)', borderRadius: 10,
                  padding: '15px 18px', cursor: 'pointer',
                  border: '1px solid rgba(201,186,155,0.12)',
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>📄</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.88)', lineHeight: 1.45 }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize: 10, color: gold, marginTop: 4, letterSpacing: 0.5 }}>
                    Open in new tab →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid rgba(201,186,155,0.12)', padding: '16px 32px', textAlign: 'center' }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 0.5 }}>
          Practify · Complete Dentistry is a trading name of Warlingham Green Health Limited · Registered No. 07311805
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('hub');

  if (view === 'symptom')      return <><BackButton onClick={() => setView('hub')} /><SymptomChecker /></>;
  if (view === 'tmj')          return <><BackButton onClick={() => setView('hub')} /><TMJOnline /></>;
  if (view === 'toothwear')    return <><BackButton onClick={() => setView('hub')} /><ToothWearAssessment /></>;
  if (view === 'smiledesign')  return <><BackButton onClick={() => setView('hub')} /><SmileDesignQuestionnaire /></>;
  if (view === 'medhistory')   return <><BackButton onClick={() => setView('hub')} /><MedicalHistoryForm /></>;
  if (view === 'treatmentplan') return <><BackButton onClick={() => setView('hub')} /><TreatmentPlanLetter /></>;
  return <Hub setView={setView} />;
}
