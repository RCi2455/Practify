# Practify — Project Handover Notes
_Paste this file at the start of every Claude session to resume instantly_

---

## Project Overview
- **Product name:** Practify
- **Practice:** Complete Dentistry Surrey, 1 Church Road, Warlingham, Surrey CR6 9NW. Tel: 01883 622222
- **Live URL:** https://symptoms-checker-tau.vercel.app
- **Local folder:** C:\Users\richa\Desktop\symptom-checker
- **Stack:** React (Create React App) + Vercel Serverless Functions
- **Email:** Resend (installed, API key in Vercel env vars)
- **Deployment:** GitHub → Vercel auto-deploy on push

---

## Environment Variables (set in Vercel dashboard)
- `RESEND_API_KEY` — Resend API key
- `GMAIL_USER` — legacy, no longer used
- `GMAIL_APP_PASSWORD` — legacy, no longer used
- `RECEPTION_EMAIL` — reception@completedentistrysurrey.co.uk

---

## API Files (`/api` folder)
All files must use this Vercel + Resend format:
```js
module.exports = async function handler(req, res) { ... }
```
NOT `exports.handler` (that is Netlify format and will not work).

| File | Status | What it does |
|------|--------|--------------|
| `send-form.js` | ✅ Working | Handles TMJ, Smile Design, Medical History form emails via Resend |
| `send-medical-history.js` | ✅ Fixed | Sends signed Medical History PDF to reception via Resend |
| `send-treatment-plan.js` | ✅ Fixed | Sends signed Treatment Plan PDF to reception via Resend |

### API Payloads

**`/api/send-form`** — accepts `formType` + data:
- `formType: "tmj"` → fields: `name, phone, email, severity, dateSubmitted, answerSummary`
- `formType: "smile"` → fields: `name, phone, email, dateSubmitted, answerSummary`
- `formType: "medical"` → fields: `patientName, patientDob, pdfBase64`

**`/api/send-medical-history`** — fields: `pdfBase64, patientName, patientDob`

**`/api/send-treatment-plan`** — fields: `pdfBase64, patientName, responseChoice, subject, signDate`

---

## React Components (`/src/components`)

| File | What it does | Sends to API |
|------|-------------|--------------|
| `SymptomChecker.jsx` | Dental symptom triage — Red/Amber/Green outcome | No email |
| `TMJOnline.jsx` | Jaw pain assessment questionnaire | `/api/send-form` (formType: tmj) |
| `TMJAssessment.js` | (Legacy/clinical version of TMJ) | Unknown |
| `TMJSurgery.jsx` | TMJ surgery information | Unknown |
| `ToothWearAssessment.jsx` | Erosion/wear risk screening + PDF | Unknown |
| `SmileDesignQuestionnaire.jsx` | Smile goals questionnaire | `/api/send-form` (formType: smile) |
| `MedicalHistoryForm.jsx` | Pre-appointment medical history + signature + PDF | `/api/send-medical-history` |

---

## Hub (`/src/App.js`)
The main hub shows 5 tool cards + patient documents section.

**Current tool cards:**
1. Symptom Checker
2. Jaw Pain Checker (TMJ)
3. Tooth Wear Assessment
4. Smile Design Questionnaire
5. Medical History Form

**Patient documents section** links to HTML files in `/public/patient-documents/`

**TO ADD:** Treatment Plan Letter tool (6th card) — component to be built and added to App.js

---

## Treatment Plan Letter Tool
- Built as a Claude widget (not yet added to hub as a React component)
- 4-step flow: Compose → Preview → Patient Signs → Complete
- On completion: generates PDF, auto-downloads for patient, POSTs to `/api/send-treatment-plan`
- PDF sent to reception with the signed letter attached
- Patient response options determine email subject line:
  - Option 1: "Treatment Plan Accepted – [Name] would like to schedule an appointment"
  - Option 2: "Treatment Plan – [Name] has some questions before proceeding"  
  - Option 3: "Treatment Plan Declined – [Name] does not wish to proceed at this time"
- **Status:** API file fixed. Widget built. Needs adding to App.js as a React component.

---

## To Deploy Changes
In Cursor terminal (C:\Users\richa\Desktop\symptom-checker):
```
git add .
git commit -m "your message here"
git push
```
Vercel auto-deploys in ~60 seconds. Check status at vercel.com dashboard.

---

## Known Issues / To Do
- [ ] Add Treatment Plan tool as 6th card in App.js hub
- [ ] Convert Treatment Plan widget into a proper React component
- [ ] Confirm TMJAssessment.js, TMJSurgery.jsx, ToothWearAssessment.jsx API connections
- [ ] Test all email routes end-to-end after Resend migration
- [ ] Remove legacy GMAIL_USER and GMAIL_APP_PASSWORD env vars from Vercel once confirmed working
