# Rise Altitude Enterprises — Lead Capture Integration Guide

This guide explains how to connect the interactive solar quote estimator and lead capture form on the **Rise Altitude Enterprises** website to Google Sheets, CRM webhooks (Zapier/Make/n8n), or email notifications.

---

## 1. Architecture Overview

When a user completes the 4-step quote estimator:
1. **Client-side Validation:** Ensures valid name and 10-digit mobile number.
2. **Local Persistence:** Lead data is saved to the browser's `localStorage` (`rise_altitude_leads`). You can view and download all leads via the admin viewer link in the website footer.
3. **Dynamic WhatsApp Routing:** The confirmation screen provides a pre-formatted WhatsApp chat link directly addressed to Rise Altitude's sales desk (`+91 94973 97446`) containing the customer's full specifications, location, monthly bill, up to 30-year warranty highlight, and recommended kW system size.
4. **Automated Webhook Dispatch:** `app.js` executes `sendToWebhook(leadPayload)`, which can POST the lead JSON directly to your chosen backend endpoint.

---

## 2. Option A: Free Google Sheets Integration (No Coding Required)

Google Apps Script provides a 100% free webhook endpoint that appends every lead as a new row in a Google Sheet in real-time.

### Step 1: Create a Google Sheet
Create a new Google Sheet named **"Rise Altitude Solar Leads"** with the following header row in Row 1:
- `A1`: Lead ID
- `B1`: Timestamp
- `C1`: Customer Name
- `D1`: Phone
- `E1`: WhatsApp Enabled
- `F1`: Location
- `G1`: PIN Code
- `H1`: Requirement
- `I1`: Property Type
- `J1`: Monthly KSEB Bill (₹)
- `K1`: Recommended kW
- `L1`: Estimated Subsidy (₹)
- `M1`: Email
- `N1`: Notes

### Step 2: Add Apps Script Code
In your Google Sheet, click **Extensions > Apps Script** and paste this script:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.id || "",
      data.createdAt || new Date().toISOString(),
      data.customer ? data.customer.fullName : "",
      data.customer ? data.customer.phone : "",
      data.customer ? (data.customer.whatsappOptIn ? "Yes" : "No") : "",
      data.customer ? data.customer.location : "",
      data.customer ? data.customer.pincode : "",
      data.requirement || "",
      data.propertyType || "",
      data.monthlyBill || 0,
      data.recommendedKw || 0,
      data.subsidyAmount || 0,
      data.customer ? data.customer.email : "",
      data.customer ? data.customer.notes : ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 3: Deploy as Web App
1. Click **Deploy > New deployment**.
2. Select type: **Web app**.
3. Set **Execute as:** `Me`.
4. Set **Who has access:** `Anyone`.
5. Click **Deploy** and copy the resulting **Web App URL** (e.g., `https://script.google.com/macros/s/AKfycb.../exec`).

### Step 4: Paste into `app.js`
Open `app.js` and update `CONFIG.WEBHOOK_ENDPOINT`:
```javascript
const CONFIG = {
  ...
  WEBHOOK_ENDPOINT: "https://script.google.com/macros/s/AKfycb.../exec",
  ...
};
```
*Note: The script uses `mode: 'no-cors'` in `app.js`, ensuring browser submissions to Google Apps Script work smoothly without cross-origin blocks.*

---

## 3. Option B: Zapier / Make.com / n8n Webhook

1. Create a new scenario or Zap with a **Custom Webhook** trigger.
2. Copy the generated Webhook URL.
3. Paste it into `CONFIG.WEBHOOK_ENDPOINT` in `app.js`.
4. Set up downstream actions:
   - Send an immediate SMS/WhatsApp notification to the sales engineer at Aluva office (`+91 94973 97446`).
   - Add the contact to Zoho CRM, HubSpot, or Google Contacts.
   - Send an automated confirmation email to the customer with Rise Altitude's solar catalog.

---

## 4. Option C: Formspree / EmailJS / Resend Email Notification

If you prefer receiving email notifications directly in your inbox (`risealtitude.in@gmail.com`):

### Using Formspree:
1. Register at [formspree.io](https://formspree.io) and create a form endpoint.
2. Replace `WEBHOOK_ENDPOINT` with your Formspree URL (`https://formspree.io/f/xyz...`).
3. Whenever a quote is submitted, Formspree sends a structured notification email with all lead fields directly to your company inbox.

---

## 5. Stored Lead Inspection & CSV Export

For offline management:
1. Scroll to the footer of `index.html`.
2. Click **[Admin: Leads Console]**.
3. View the table of captured customer inquiries.
4. Click **Export CSV** to download an Excel-ready spreadsheet of all submitted quotes.
