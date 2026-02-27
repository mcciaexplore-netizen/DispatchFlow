# DispatchFlow

> **OCR-enabled Dispatch Slip Generator for Indian MSMEs**

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-orange.svg)](https://aistudio.google.com/)

---

## Why DispatchFlow?

- **Manual dispatch slips waste time** — operators spend 5–10 minutes per slip typing from tags
- **Errors in handwriting** cause wrong deliveries and customer disputes
- **No digital record** means tracking dispatches later is painful
- **Existing ERP software** is expensive and overkill for small dispatch stations

DispatchFlow fixes this: scan a dispatch tag with your phone camera, AI extracts all the data, you get a professional printable slip in seconds.

---

## Features

- 📸 **AI OCR Scanning** — Use Gemini 2.0 Flash to read dispatch tags/labels and auto-fill form fields
- 📷 **Camera Capture** — Live camera with viewfinder overlay (optimized for mobile/tablet)
- 📁 **Image Upload & Drag-Drop** — Upload photos of dispatch tags
- ✏️ **Manual Entry Mode** — Works fully offline without any API keys
- 🖨️ **Professional Print Slips** — A4 printable layout with signature lines
- 📋 **History & Records** — All slips saved to browser localStorage with search/filter
- ☁️ **Google Sheets Sync** — Optional cloud backup to Google Sheets
- 📱 **Mobile Responsive** — Built for tablets and phones on the dispatch floor
- 🇮🇳 **Indian MSME Ready** — Indian date format, GSTIN field, vehicle number format

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-org/dispatchflow.git
cd dispatchflow

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# 4. Fill in your details in .env (see Configuration section below)

# 5. Start the app
npm run dev

# Open http://localhost:5173
```

---

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key and paste it into `.env` as `VITE_GEMINI_API_KEY`

The free tier is sufficient for dozens of scans per day.

---

## Google Sheets Setup (Optional)

Google Sheets acts as a lightweight cloud database for all dispatch records.

1. Create a new Google Sheet
2. Add this header row in Row 1:
   ```
   Slip No | Date | Item | Batch | Grade | Qty | Unit | Weight | PO | Customer | Destination | Vehicle | Driver | Transporter | HSN | Invoice | Remarks | Status
   ```
3. Share the sheet — **Anyone with link can edit**
4. Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)
5. Get a Google Sheets API key from [Google Cloud Console](https://console.cloud.google.com/)
6. Add both to your `.env`:
   ```
   VITE_GOOGLE_SHEETS_ID="your-sheet-id"
   VITE_GOOGLE_SHEETS_API_KEY="your-api-key"
   ```

---

## Configuration Reference

| Variable | Required | Description |
|---|---|---|
| `VITE_COMPANY_NAME` | Yes | Company name shown on slip header |
| `VITE_COMPANY_ADDRESS` | Yes | Full company address |
| `VITE_COMPANY_GSTIN` | Yes | GST Identification Number |
| `VITE_COMPANY_PHONE` | Yes | Contact phone number |
| `VITE_COMPANY_EMAIL` | Yes | Contact email |
| `VITE_COMPANY_LOGO_URL` | No | URL to company logo image |
| `VITE_GEMINI_API_KEY` | No* | Gemini API key for OCR scanning |
| `VITE_GOOGLE_SHEETS_ID` | No | Google Sheet ID for cloud backup |
| `VITE_GOOGLE_SHEETS_API_KEY` | No | Google Sheets API key |
| `VITE_SLIP_PREFIX` | No | Prefix for slip numbers (default: `DS`) |

*App works in manual-entry mode without Gemini key.

---

## How OCR Works

```
[Camera / Upload Image]
        ↓
[Convert to Base64]
        ↓
[Send to Gemini 2.0 Flash Vision API]
        ↓
[Structured JSON Response with 15 fields]
        ↓
[Auto-fill Form Fields]
        ↓
[User Reviews & Edits]
        ↓
[Generate Print-Ready Slip + Save to History]
```

The Gemini prompt is tuned for industrial dispatch tags — handles smudged text, partial prints, and Indian-specific fields (GSTIN, challan numbers, lorry receipts).

---

## Slip Number Format

`{PREFIX}-{YYMMDD}-{SEQUENCE}` — e.g. `DS-260226-0001`

Sequence resets daily. Tracked in localStorage. Prefix configurable via `VITE_SLIP_PREFIX`.

---

## Deployment

### Vercel / Netlify
```bash
npm run build
# Deploy the dist/ folder, or connect your Git repo
# Add environment variables in the platform dashboard
```

### Local Network (warehouse intranet)
```bash
npm run dev -- --host
# Access from tablets on the same Wi-Fi via your machine's IP
```

---

## Roadmap

- [ ] Multi-item slips (multiple rows in item table)
- [ ] Barcode / QR code scanning support
- [ ] WhatsApp sharing of slips
- [ ] Role-based access (supervisor / operator)
- [ ] Analytics dashboard (dispatch trends, top customers)
- [ ] E-way bill integration

---

## License

MIT — free for commercial and personal use.

---

Built for Indian MSMEs.
