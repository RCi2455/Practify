# Practify — Project Handover Notes
_Paste this file at the start of every Claude session to resume instantly_
_Last updated: 15 April 2026_

---

## Project Overview
- **Product name:** Practify
- **Practice:** Complete Dentistry Surrey, 1 Church Road, Warlingham, Surrey CR6 9NW. Tel: 01883 622222
- **Live URL:** https://practify-lovat.vercel.app
- **Old URL (disconnected):** https://symptoms-checker-tau.vercel.app — no longer in use
- **Local folder:** C:\Users\richa\Desktop\symptom-checker
- **GitHub repo:** https://github.com/RCi2455/Practify
- **Stack:** React (Create React App) + Vercel Serverless Functions
- **Email:** Resend (API key in Vercel env vars)
- **Deployment:** `vercel --prod` from Cursor terminal (GitHub auto-deploy is disconnected)

---

## How to Deploy
In Cursor terminal (C:\Users\richa\Desktop\symptom-checker):
```
git add .
git commit -m "your message here"
git push
vercel --prod
```
Note: GitHub → Vercel auto-deploy is disconnected. Always run `vercel --prod` manually after pushing.

---

## Environment Variables (Vercel dashboard → practify project → Settings → Environment Variables)
| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | re_F3SeYx7d_3hVc7FQaKR6tNm7wYXPDitpU |
| `RECEPTION_EMAIL` | reception@completedentistrysurrey.co.uk |

Note: `GMAIL_USER` and `GMAIL_APP_PASSWORD` are legacy and no longer used. Safe to delete from Vercel.

---

## Resend Setup
- Account: resend.com
- Domain: completedentistrysurrey.co.uk — **verified** ✅
- From address: `Practify <noreply@completedentistrysurrey.co.uk>`
- To address: `reception@completedentistrysurrey.co.uk`

---

## API Files (`/api` folder)
All files use Vercel + Resend format:
```js
module.exports = async function handler(req, res) { ... }
```
**Never use `exports.handler` — that is Netlify format and will NOT work on Vercel.**

| File | Status | What it does |
|------|--------|--------------|
| `send-form.js` | ✅ Working | Handles TMJ, Smile Design form emails. Uses `formType` to route. |
| `send-medical-history.js` | ✅ Fixed 15 Apr | Sends signed Medical History PDF to reception via Resend |
| `send-treatment-plan.js` | ✅ Fixed 15 Apr | Sends signed Treatment Plan PDF to reception via Resend |

### API Payloads

**`/api/send-form`** — POST with `formType` + data:
- `formType: "tmj"` → `name, phone, email, severity, dateSubmitted, answerSummary`
- `formType: "smile"` → `name, phone, email, dateSubmitted, answerSummary`
- `formType: "medical"` → `patientName, patientDob, pdfBase64`

**`/api/send-medical-history`** — POST:
- `pdfBase64, patientName, patientDob`

**`/api/send-treatment-plan`** — POST:
- `pdfBase64, patientName, responseChoice, subject, signDate`
- Subject line set by patient response:
  - Option 1: `"Treatment Plan Accepted – {name} would like to schedule an appointment"`
  - Option 2: `"Treatment Plan – {name} has some questions before proceeding"`
  - Option 3: `"Treatment Plan Declined – {name} does not wish to proceed at this time"`

---

## React Components (`/src/components`)

| File | What it does | API used |
|------|-------------|----------|
| `SymptomChecker.jsx` | Dental symptom triage — Red/Amber/Green | None |
| `TMJOnline.jsx` | Jaw pain assessment questionnaire | `/api/send-form` (tmj) |
| `TMJAssessment.js` | Legacy/clinical TMJ version | Unknown — needs checking |
| `TMJSurgery.jsx` | TMJ surgery information page | Unknown — needs checking |
| `ToothWearAssessment.jsx` | Erosion/wear risk screening + PDF | Unknown — needs checking |
| `SmileDesignQuestionnaire.jsx` | Smile goals questionnaire | `/api/send-form` (smile) |
| `MedicalHistoryForm.jsx` | Medical history + digital signature + PDF | `/api/send-medical-history` |
| `TreatmentPlanLetter.jsx` | Implant treatment plan letter + signature + PDF | `/api/send-treatment-plan` |

---

## Hub (`/src/App.js`)
Main hub with 6 tool cards + patient documents section.

**Tool cards (in order):**
1. Symptom Checker → `SymptomChecker`
2. Jaw Pain Checker → `TMJOnline`
3. Tooth Wear Assessment → `ToothWearAssessment`
4. Smile Design Questionnaire → `SmileDesignQuestionnaire`
5. Medical History Form → `MedicalHistoryForm`
6. Implant Treatment Plan → `TreatmentPlanLetter` ← added 15 Apr 2026

**Patient documents** link to HTML files in `/public/patient-documents/`

---

## Treatment Plan Letter Tool
- React component: `src/components/TreatmentPlanLetter.jsx`
- 4-step flow: Compose → Preview → Patient Signs → Complete
- Uses `html2canvas` + `jsPDF` for PDF generation
- Uses `signature_pad` for digital signature capture
- On completion:
  - PDF auto-downloads to patient's device
  - POST to `/api/send-treatment-plan` sends PDF + details to reception via Resend
  - If email fails, patient sees fallback instructions + phone number 01883 622222
- npm packages required: `html2canvas`, `signature_pad` (both installed)
- Important: This tool must be hosted on Vercel (not run from Claude) — Claude's iframe blocks external API calls due to CORS

---

## npm Packages
Key packages installed:
- `react`, `react-dom`, `react-scripts`
- `jspdf` — PDF generation
- `html2canvas` — renders HTML to canvas for PDF
- `signature_pad` — digital signature capture
- `resend` — email sending
- `nodemailer` — legacy, no longer used

---

## Patient Documents (`/public/patient-documents/`)
HTML files linked from the hub:
- post-op-oral-surgery.html
- post-op-implant-surgery.html
- implant-consent.html
- implant-aftercare-info.html
- conscious-sedation-info.html
- sedation-instructions.html
- tooth-wear-assessment.html
- tooth-wear-patient-leaflet.html
- bisphosphonate-advice.html

---

## Known Issues / To Do
- [ ] Test Treatment Plan end-to-end after deployment — confirm email arrives at reception
- [ ] Check TMJAssessment.js, TMJSurgery.jsx, ToothWearAssessment.jsx — confirm what APIs they call if any
- [ ] Reconnect GitHub → Vercel auto-deploy (currently disconnected — must use `vercel --prod`)
- [ ] Delete legacy `GMAIL_USER` and `GMAIL_APP_PASSWORD` env vars from Vercel once confirmed safe
- [ ] Consider future treatment plan types beyond implants (e.g. orthodontics, restorative)

---

## Session History
| Date | What was done |
|------|--------------|
| 14 Apr 2026 | Built Practify hub. Built Symptom Checker, TMJ, Smile Design, Medical History, Tooth Wear tools. Set up Vercel. Tried EmailJS for email — abandoned (couldn't handle PDFs). Switched to Resend. |
| 15 Apr 2026 | Discovered all API files were in Netlify format (exports.handler) — not Vercel compatible. Rewrote send-medical-history.js and send-treatment-plan.js in correct Vercel + Resend format. Built Treatment Plan Letter as Claude widget, then converted to React component (TreatmentPlanLetter.jsx). Added as 6th card in App.js hub. Diagnosed CORS issue — Claude iframe cannot call external APIs. Solution: host tool on Vercel. New Vercel project created: practify-lovat.vercel.app (old symptoms-checker-tau.vercel.app disconnected). Verified Resend domain. Confirmed API working via curl test. |
