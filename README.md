# Rise Altitude Enterprises — Website & Solar Estimator

A modern, responsive, high-converting business website and interactive solar quote estimator engineered for **Rise Altitude Enterprises**, a leading solar installation and electrical sales company based in Aluva, Kerala.

---

## 1. Business Profile & Identity

- **Company Name:** Rise Altitude Enterprises
- **Industry:** Renewable Energy & Electrical Supplies
- **Registered Address:** Building No. 23/1006, Market Road, Near Fire Station, Periyar Nagar, Aluva, Ernakulam, Kerala - 683101
- **GSTIN:** `32ABOFR7364P1ZC`
- **Contact Hotline:** +91 94973 97446 / +91 484 262 0000
- **Email:** `risealtitude.in@gmail.com`
- **Official Logo & Color Palette:** 100% aligned with the official Rise Altitude emblem mark (`#18407D` Royal Brand Blue), paired with deep midnight (`#07172e`, `#0c2346`), action royal blue (`#1f4f99`, `#2b65be`), ice blue (`#f0f5fc`), and crisp white.
- **Solar Panel Warranty:** Up to 30 Years Linear Performance Warranty on Tier-1 DCR modules.

---

## 2. Core Features

### ⚡ Interactive Multi-Step Solar Quote & Lead Capture Wizard
Accessible via the header button, hero section, embedded on-page calculator, and floating action pill:
1. **Step 1: Requirement Selection**
   - On-Grid Rooftop Solar (with KSEB net metering & PM Surya Ghar subsidy)
   - Solar Inverter & Battery (Hybrid / Off-Grid power outage backup)
   - Electrical Items (Wholesale / Retail / Commercial Wiring)
   - Maintenance & KSEB Feasibility / Load Enhancement
2. **Step 2: Property & Energy Consumption**
   - Property Type: Residential, Commercial, Industrial
   - Interactive KSEB Monthly Electricity Bill Slider (₹1,000 to ₹30,000+)
   - Rooftop Area (sq. ft.) & Roof Architecture (Flat Concrete, Metal Sheet, Clay Tile, Truss)
3. **Step 3: Instant Calculation & Rough Estimate Display**
   - Recommended plant capacity (e.g., 3 kWp)
   - Required shadow-free roof area (e.g., ~255 sq. ft.)
   - Estimated monthly & annual bill savings
   - PM Surya Ghar Muft Bijli Yojana Central Government Subsidy (up to ₹78,000)
   - 30-Year cumulative return on investment and ~3.5 year payback timeline
4. **Step 4: Customer Lead Capture**
   - Full Name
   - 10-Digit Mobile Number with WhatsApp opt-in toggle (pre-checked)
   - Pre-suggested location chips for Kerala regions: Aluva, Kalamassery, Angamaly, Perumbavoor, Edappally, Kakkanad
   - Postal PIN Code validation (pre-filled with 683101)
   - Optional Email & specific notes
5. **Form Submission & Instant Confirmation:**
   - Client-side validation with instant feedback
   - Success state displaying quote summary and an instant **"Chat with Solar Engineer on WhatsApp"** button (preloaded with user specifications and contact details addressed to `+91 94973 97446`)
   - Persistent storage in browser `localStorage`
   - Real-time webhook dispatch hook for CRM / Google Sheets

---

## 3. Product & Solutions Sections

1. **Solar Solutions Grid:**
   - On-Grid Rooftop Solar (PM Surya Ghar up to ₹78,000, KSEB Soura Net Metering, up to 30 years warranty)
   - Hybrid & Off-Grid Solar Systems (Lithium LiFePO4 & Tubular Batteries for Kerala monsoon power stability)
   - Commercial & Industrial Solar (10 kW - 250 kW+, 40% accelerated tax depreciation under IT Act)
2. **Electrical Products & Wholesale Showroom:**
   - Filterable catalog tabs: Inverters & Batteries, Cables & Wires, Switchgear, Solar BOS & Accessories
   - Branded components: Finolex, Polycab, RR Kabel, Schneider Electric, Legrand, L&T, Growatt, Exide
   - Special wholesale contractor pricing banner for builders and electricians in Ernakulam
3. **KSEB Net Metering & Subsidy Guide:**
   - 4-step workflow: Feasibility Survey &rarr; Soura Portal Registration &rarr; Complete Installation & Commissioning &rarr; Bi-Directional Meter & Direct Subsidy Transfer
   - PM Surya Ghar subsidy breakdown table for Kerala
   - Kerala Monsoon Generation Myth-Buster (explaining diffuse light radiation)
4. **Why Choose Rise Altitude:**
   - Hyper-local Aluva team on Market Road
   - 100% KSEB liaising & safety inspection clearance
   - Up to 30-year panel performance warranties
   - GST registered transparency (GSTIN: `32ABOFR7364P1ZC`)
5. **Customer Reviews & FAQ Accordion:**
   - Local testimonials from Periyar Nagar (Aluva), Kalamassery, and Angamaly
   - Collapsible FAQ addressing net metering, monsoon output, roof space, and subsidy timelines
6. **Physical Showroom & Location Guide:**
   - Full address at Building No. 23/1006, Market Road, Near Fire Station, Periyar Nagar, Aluva - 683101
   - Operating hours and direct inquiry form

---

## 4. Admin Lead Management & Webhook Integration

- **Built-in Leads Viewer:** Click `[Admin: Leads Console]` in the website footer to view all submitted inquiries, customer contact details, system size, and timestamp in real-time.
- **Export to CSV:** One-click download of all captured leads into an Excel/CSV spreadsheet.
- **Integration with Google Sheets & CRMs:** See [lead-integration-guide.md](lead-integration-guide.md) for full instructions and copy-paste Google Apps Script code.

---

## 5. File Structure

```
rise-altitude-enterprises/
├── index.html                  # Main responsive single-page application
├── styles.css                  # Custom styling, animations, sliders & glassmorphism
├── app.js                      # Solar calculations, wizard state, validation & leads
├── lead-integration-guide.md   # Google Sheets / Webhook integration documentation
└── README.md                   # Project documentation
```

---

## 6. How to Run & Preview

1. Open `index.html` directly in any modern browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
2. Alternatively, start a static local server via terminal:
   ```powershell
   # Using Python (if installed)
   python -m http.server 8080
   
   # Or using Node / npx (if installed)
   npx serve .
   ```
3. Visit `http://localhost:8080` to experience the website with zero build dependencies.
