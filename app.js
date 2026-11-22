/**
 * Rise Altitude Enterprises - Solar Installations & Solar Electrical Items
 * Serving All 14 Districts Across Kerala | HQ: Aluva, Ernakulam
 * 
 * Registered Address: Building No. 23/1006, Market Road, Near Fire Station, Periyar Nagar, Aluva, Kerala - 683101
 * GSTIN: 32ABOFR7364P1ZC
 * Official Phone / WhatsApp: +91 94973 97446
 * Email: risealtitude.in@gmail.com
 * Warranty: Up to 30 Years Solar Panel Performance Warranty
 */

// ==========================================
// CONFIGURATION & INTEGRATION HOOKS
// ==========================================
const CONFIG = {
  companyName: "Rise Altitude Enterprises",
  serviceScope: "All Kerala Service (All 14 Districts)",
  headquarters: "Aluva, Ernakulam, Kerala",
  phoneDisplay: "+91 94973 97446",
  phoneRaw: "919497397446", // For WhatsApp and tel: links
  landlineDisplay: "+91 484 262 0000",
  emailDisplay: "risealtitude.in@gmail.com",
  gstin: "32ABOFR7364P1ZC",
  address: "Building No. 23/1006, Market Road, Near Fire Station, Periyar Nagar, Aluva, Ernakulam, Kerala - 683101",
  warrantyYears: "Up to 30 Years",
  
  // WEBHOOK / INTEGRATION URL (Replace with your Google Apps Script, Zapier, Make.com, or CRM webhook URL)
  // See lead-integration-guide.md for step-by-step setup instructions.
  WEBHOOK_ENDPOINT: "", // e.g. "https://script.google.com/macros/s/AKfycbx.../exec"
  
  // Kerala KSEB & PM Surya Ghar Sizing Constants
  ksebAvgRatePerUnit: 7.2, // Kerala domestic telescopic average ~ ₹7.20/kWh
  ksebCommercialRate: 10.5, // Kerala commercial LT-VIIA rate ~ ₹10.50/kWh
  unitsPerKwPerMonth: 120, // Kerala solar irradiation produces ~4 units/day = 120 units/month per kW
  sqFtPerKw: 85, // High-efficiency TOPCon / Mono PERC panels require ~80-90 sq.ft./kW
  
  // PM Surya Ghar Muft Bijli Yojana Central Subsidies (Residential)
  subsidySlabs: {
    1: 30000,
    2: 60000,
    3: 78000, // 3 kW and above is capped at ₹78,000 for residential
  },
  
  // Approximate benchmark system cost per kW before subsidy in Kerala
  benchmarkCostPerKw: 62000
};

// ==========================================
// STATE MANAGEMENT FOR QUOTE CALCULATOR
// ==========================================
const quoteState = {
  requirement: "rooftop-solar",
  propertyType: "residential",
  monthlyBill: 3500,
  roofArea: 800,
  roofType: "concrete-flat",
  calculated: {
    recommendedKw: 3,
    roofNeededSqFt: 255,
    monthlyUnits: 360,
    monthlySavings: 3100,
    annualSavings: 37200,
    subsidyAmount: 78000,
    estimatedCostRange: "₹1,15,000 - ₹1,35,000 (After Subsidy)",
    lifetimeSavings30Yrs: "₹11.8 Lakhs+",
    co2OffsetTonnes: "3.6 T / year"
  },
  customer: {
    fullName: "",
    phone: "",
    whatsappOptIn: true,
    location: "Ernakulam",
    district: "Ernakulam",
    pincode: "683101",
    email: "",
    notes: ""
  }
};

// ==========================================
// SOLAR CALCULATION ENGINE
// ==========================================
function calculateSolarMetrics(bill, propertyType = "residential") {
  const normType = (propertyType || "residential").toLowerCase();
  const isResidential = normType === "residential";
  const rate = isResidential ? CONFIG.ksebAvgRatePerUnit : CONFIG.ksebCommercialRate;
  
  // Monthly units consumed approximately
  const estimatedUnits = Math.round(bill / rate);
  
  // Recommended kW capacity (minimum 1 kW, max 50 kW for calculator)
  let rawKw = estimatedUnits / CONFIG.unitsPerKwPerMonth;
  let recommendedKw = Math.round(rawKw * 2) / 2; // Round to nearest 0.5 kW
  if (recommendedKw < 1) recommendedKw = 1;
  if (recommendedKw > 50) recommendedKw = 50;

  // Approx roof area required in sq ft (~85 sq ft per kW)
  const roofNeeded = Math.round(recommendedKw * CONFIG.sqFtPerKw);
  
  // Monthly generation in Kerala (~120 units per kW)
  const monthlyUnits = Math.round(recommendedKw * CONFIG.unitsPerKwPerMonth);
  
  // Estimated monthly bill savings (capped at bill amount)
  const monthlySavings = Math.min(bill, Math.round(monthlyUnits * rate));
  const annualSavings = monthlySavings * 12;

  // PM Surya Ghar Central Subsidy (Kerala Residential only)
  let subsidy = 0;
  if (isResidential) {
    if (recommendedKw >= 3) {
      subsidy = CONFIG.subsidySlabs[3]; // ₹78,000
    } else if (recommendedKw >= 2) {
      subsidy = CONFIG.subsidySlabs[2]; // ₹60,000
    } else if (recommendedKw >= 1) {
      subsidy = CONFIG.subsidySlabs[1]; // ₹30,000
    }
  }

  // Total System Cost Estimation
  const grossCost = recommendedKw * CONFIG.benchmarkCostPerKw;
  const netMin = Math.max(25000, Math.round((grossCost * 0.92) - subsidy));
  const netMax = Math.max(30000, Math.round((grossCost * 1.08) - subsidy));
  const avgNet = isResidential ? (netMin + netMax) / 2 : grossCost;
  
  let costDisplay = "";
  let netCostDisplay = "";
  if (isResidential) {
    const netMinL = (netMin / 100000).toFixed(2);
    const netMaxL = (netMax / 100000).toFixed(2);
    const subsidyK = Math.round(subsidy / 1000);
    costDisplay = `₹${netMinL}L - ₹${netMaxL}L (After ₹${subsidyK}k Subsidy)`;
    netCostDisplay = `₹${(avgNet / 100000).toFixed(2)} Lakhs`;
  } else {
    const grossMinL = ((grossCost * 0.92) / 100000).toFixed(2);
    const grossMaxL = ((grossCost * 1.08) / 100000).toFixed(2);
    costDisplay = `₹${grossMinL}L - ₹${grossMaxL}L (Eligible for 40% Tax Depr.)`;
    netCostDisplay = `₹${(grossCost / 100000).toFixed(2)} Lakhs`;
  }

  // Payback period
  let paybackYears = 0;
  if (annualSavings > 0) {
    paybackYears = (avgNet / annualSavings).toFixed(1);
    if (Number(paybackYears) < 2.5) paybackYears = "2.5";
  }

  // 30 Years lifetime savings estimate (with conservative 3.5% annual electricity tariff hike)
  const lifetime30 = Math.round((annualSavings * 30 * 1.35) / 100000); // in Lakhs
  const co2Tonnes = (recommendedKw * 1.2).toFixed(1);

  return {
    recommendedKw,
    roofNeededSqFt: roofNeeded,
    monthlyUnits,
    monthlySavings,
    annualSavings,
    subsidyAmount: subsidy,
    estimatedCostRange: costDisplay,
    netCostEstimate: netCostDisplay,
    paybackYears: `~ ${paybackYears} Years`,
    lifetimeSavings30Yrs: `₹${lifetime30 < 1 ? 1.5 : lifetime30} Lakhs+`,
    co2OffsetTonnes: `${co2Tonnes} T / year`
  };
}

// Update the global state with recalculated values
function updateCalculations() {
  quoteState.calculated = calculateSolarMetrics(quoteState.monthlyBill, quoteState.propertyType);
  renderEstimateUI();
}

// Quick Hero Bill Selector Button Handler
function setQuickHeroBill(amount, clickedBtn) {
  const billVal = parseInt(amount, 10) || 3500;
  quoteState.monthlyBill = billVal;

  // Sync sliders
  const mainSlider = document.getElementById('billSlider');
  if (mainSlider) mainSlider.value = billVal;
  const modalSlider = document.getElementById('modalKsebBillSlider');
  if (modalSlider) modalSlider.value = billVal;

  // Update button highlights
  const heroBtns = document.querySelectorAll('.hero-bill-btn');
  heroBtns.forEach(btn => {
    btn.className = "hero-bill-btn py-2.5 px-2 rounded-lg text-xs font-bold bg-brand-900/90 border border-brand-700 hover:border-cyan-400 text-slate-200 transition-all text-center";
  });
  if (clickedBtn) {
    clickedBtn.className = "hero-bill-btn py-2.5 px-2 rounded-lg text-xs font-bold bg-brand-700 border-2 border-cyan-400 text-white shadow-md transition-all text-center";
  }

  updateCalculations();
}
window.setQuickHeroBill = setQuickHeroBill;

// Render dynamic calculations to all bound UI elements
function renderEstimateUI() {
  const c = quoteState.calculated;
  const bill = quoteState.monthlyBill;
  const normType = (quoteState.propertyType || "residential").toLowerCase();
  const isResidential = normType === "residential";

  // 1. Update Hero Quick Card
  const heroRecKw = document.getElementById('heroRecKw');
  if (heroRecKw) heroRecKw.textContent = `${c.recommendedKw} kW Rooftop Solar`;

  const heroSubsidy = document.getElementById('heroSubsidy');
  if (heroSubsidy) {
    heroSubsidy.textContent = isResidential 
      ? `₹${c.subsidyAmount.toLocaleString('en-IN')} Direct`
      : '40% Tax Depr.';
  }

  const heroSavings = document.getElementById('heroSavings');
  if (heroSavings) heroSavings.textContent = `₹${c.monthlySavings.toLocaleString('en-IN')} / month`;

  // Sync Hero Button Active State based on current bill
  const heroBtns = document.querySelectorAll('.hero-bill-btn');
  if (heroBtns.length >= 3) {
    heroBtns.forEach(b => {
      b.className = "hero-bill-btn py-2.5 px-2 rounded-lg text-xs font-bold bg-brand-900/90 border border-brand-700 hover:border-cyan-400 text-slate-200 transition-all text-center";
    });
    if (bill <= 2000) {
      heroBtns[0].className = "hero-bill-btn py-2.5 px-2 rounded-lg text-xs font-bold bg-brand-700 border-2 border-cyan-400 text-white shadow-md transition-all text-center";
    } else if (bill <= 5000) {
      heroBtns[1].className = "hero-bill-btn py-2.5 px-2 rounded-lg text-xs font-bold bg-brand-700 border-2 border-cyan-400 text-white shadow-md transition-all text-center";
    } else {
      heroBtns[2].className = "hero-bill-btn py-2.5 px-2 rounded-lg text-xs font-bold bg-brand-700 border-2 border-cyan-400 text-white shadow-md transition-all text-center";
    }
  }

  // 2. Update Solar Calculator Section
  const billSlider = document.getElementById('billSlider');
  if (billSlider && Number(billSlider.value) !== Number(bill)) {
    billSlider.value = bill;
  }

  const billAmountDisplay = document.getElementById('billAmountDisplay');
  if (billAmountDisplay) {
    billAmountDisplay.textContent = `₹${Number(bill).toLocaleString('en-IN')}`;
  }

  const recKwDisplay = document.getElementById('recKwDisplay');
  if (recKwDisplay) recKwDisplay.textContent = `${c.recommendedKw} kWp`;

  const monthlyGenDisplay = document.getElementById('monthlyGenDisplay');
  if (monthlyGenDisplay) monthlyGenDisplay.textContent = `${c.monthlyUnits} Units`;

  const subsidyDisplay = document.getElementById('subsidyDisplay');
  if (subsidyDisplay) {
    subsidyDisplay.textContent = isResidential 
      ? `₹${c.subsidyAmount.toLocaleString('en-IN')}`
      : '40% Tax Depr.';
  }

  const netCostDisplay = document.getElementById('netCostDisplay');
  if (netCostDisplay) netCostDisplay.textContent = c.netCostEstimate;

  const annualSavingsDisplay = document.getElementById('annualSavingsDisplay');
  if (annualSavingsDisplay) annualSavingsDisplay.textContent = `₹${c.annualSavings.toLocaleString('en-IN')} / yr`;

  const paybackDisplay = document.getElementById('paybackDisplay');
  if (paybackDisplay) paybackDisplay.textContent = c.paybackYears;

  const roofAreaDisplay = document.getElementById('roofAreaDisplay');
  if (roofAreaDisplay) roofAreaDisplay.textContent = `~ ${c.roofNeededSqFt} sq. ft.`;

  const calcCtaBtn = document.getElementById('calcCtaBtn');
  if (calcCtaBtn) {
    const span = calcCtaBtn.querySelector('span');
    if (span) {
      span.innerHTML = isResidential && c.subsidyAmount > 0
        ? `Lock in ₹${c.subsidyAmount.toLocaleString('en-IN')} Subsidy &amp; Request Site Survey`
        : `Request ${c.recommendedKw} kW Commercial Solar Site Survey`;
    }
  }

  // 3. Update Modal Elements (Step 2 & Step 3)
  const modalKsebBillSlider = document.getElementById('modalKsebBillSlider');
  if (modalKsebBillSlider && Number(modalKsebBillSlider.value) !== Number(bill)) {
    modalKsebBillSlider.value = bill;
  }

  const modalBillValueDisplay = document.getElementById('modalBillValueDisplay');
  if (modalBillValueDisplay) {
    modalBillValueDisplay.textContent = `₹${Number(bill).toLocaleString('en-IN')}`;
  }

  // 4. Update data-bind Elements
  document.querySelectorAll('[data-bind="billDisplay"]').forEach(el => {
    el.textContent = `₹${Number(bill).toLocaleString('en-IN')}`;
  });

  document.querySelectorAll('[data-bind="billInput"]').forEach(el => {
    if (Number(el.value) !== Number(bill)) el.value = bill;
  });

  document.querySelectorAll('[data-bind="recommendedKw"]').forEach(el => {
    el.textContent = `${c.recommendedKw} kWp`;
  });

  document.querySelectorAll('[data-bind="roofNeeded"]').forEach(el => {
    el.textContent = `~${c.roofNeededSqFt} sq. ft.`;
  });

  document.querySelectorAll('[data-bind="monthlySavings"]').forEach(el => {
    el.textContent = `₹${c.monthlySavings.toLocaleString('en-IN')}/mo`;
  });

  document.querySelectorAll('[data-bind="annualSavings"]').forEach(el => {
    el.textContent = `₹${c.annualSavings.toLocaleString('en-IN')}/yr saved`;
  });

  document.querySelectorAll('[data-bind="subsidyAmount"]').forEach(el => {
    el.textContent = isResidential 
      ? `₹${c.subsidyAmount.toLocaleString('en-IN')}`
      : "40% Tax Depr.";
  });

  document.querySelectorAll('[data-bind="costRange"]').forEach(el => {
    el.textContent = c.estimatedCostRange;
  });

  document.querySelectorAll('[data-bind="lifetimeSavings"]').forEach(el => {
    el.textContent = c.lifetimeSavings30Yrs;
  });

  document.querySelectorAll('[data-bind="monthlyUnits"]').forEach(el => {
    el.textContent = `~${c.monthlyUnits} Units`;
  });
}

// ==========================================
// MULTI-STEP WIZARD NAVIGATION
// ==========================================
let currentModalStep = 1;

function goToModalStep(stepNumber) {
  currentModalStep = stepNumber;

  // Hide all step contents
  document.querySelectorAll('.wizard-step-content').forEach(el => {
    el.classList.add('hidden');
  });

  // Show target step
  const targetStep = document.getElementById(`modalStep${stepNumber}`);
  if (targetStep) {
    targetStep.classList.remove('hidden');
  }

  // Update Progress Stepper Indicator in Logo Theme
  for (let i = 1; i <= 4; i++) {
    const indicator = document.getElementById(`stepIndicator${i}`);
    const line = document.getElementById(`stepLine${i}`);
    
    if (indicator) {
      if (i < stepNumber) {
        indicator.className = "w-8 h-8 rounded-full bg-brand-800 text-white flex items-center justify-center font-bold text-xs ring-4 ring-brand-100";
        indicator.innerHTML = "✓";
      } else if (i === stepNumber) {
        indicator.className = "w-8 h-8 rounded-full bg-brand-800 text-white flex items-center justify-center font-bold text-xs ring-4 ring-brand-100 shadow-md";
        indicator.textContent = i;
      } else {
        indicator.className = "w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-medium text-xs";
        indicator.textContent = i;
      }
    }

    if (line && i < 4) {
      if (i < stepNumber) {
        line.className = "flex-1 h-1 bg-brand-800 transition-colors duration-300";
      } else {
        line.className = "flex-1 h-1 bg-slate-200 transition-colors duration-300";
      }
    }
  }

  // Refresh calculations when entering Step 3
  if (stepNumber === 3) {
    updateCalculations();
  }
}

// Open Quote Modal
function openQuoteModal(initialRequirement = "rooftop-solar", billAmount = null) {
  const modal = document.getElementById('quoteModal');
  if (!modal) return;

  if (initialRequirement) {
    quoteState.requirement = initialRequirement;
    const radio = document.querySelector(`input[name="modalRequirement"][value="${initialRequirement}"]`);
    if (radio) radio.checked = true;
  }

  if (billAmount) {
    quoteState.monthlyBill = parseInt(billAmount, 10) || 3500;
  }

  // Ensure calculations and all modal inputs/displays are synchronized
  updateCalculations();

  goToModalStep(1);
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
window.openQuoteModal = openQuoteModal;

// Close Quote Modal
function closeQuoteModal() {
  const modal = document.getElementById('quoteModal');
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}
window.closeQuoteModal = closeQuoteModal;
window.goToModalStep = goToModalStep;

// ==========================================
// FORM SUBMISSION & LEAD STORAGE
// ==========================================
async function handleQuoteSubmission(event) {
  event.preventDefault();
  
  const form = event.target;
  const nameInput = form.querySelector('[name="customerName"]');
  const phoneInput = form.querySelector('[name="customerPhone"]');
  const locationInput = form.querySelector('[name="customerLocation"]');
  const pincodeInput = form.querySelector('[name="customerPincode"]');
  const emailInput = form.querySelector('[name="customerEmail"]');
  const whatsappOptIn = form.querySelector('[name="whatsappOptIn"]');
  const notesInput = form.querySelector('[name="customerNotes"]');
  
  // Validation
  if (!nameInput.value.trim()) {
    alert("Please enter your Full Name.");
    nameInput.focus();
    return;
  }

  const phoneClean = phoneInput.value.replace(/[^0-9]/g, '');
  if (phoneClean.length < 10) {
    alert("Please enter a valid 10-digit mobile number.");
    phoneInput.focus();
    return;
  }

  // Populate Customer Data
  quoteState.customer = {
    fullName: nameInput.value.trim(),
    phone: phoneClean,
    whatsappOptIn: whatsappOptIn ? whatsappOptIn.checked : true,
    location: locationInput ? locationInput.value.trim() : "Kerala",
    pincode: pincodeInput ? pincodeInput.value.trim() : "",
    email: emailInput ? emailInput.value.trim() : "",
    notes: notesInput ? notesInput.value.trim() : "",
    timestamp: new Date().toISOString()
  };

  const leadPayload = {
    id: "LEAD-" + Date.now().toString().slice(-6),
    createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    customer: quoteState.customer,
    requirement: quoteState.requirement,
    propertyType: quoteState.propertyType,
    monthlyBill: quoteState.monthlyBill,
    roofArea: quoteState.roofArea,
    roofType: quoteState.roofType,
    recommendedKw: quoteState.calculated.recommendedKw,
    monthlySavings: quoteState.calculated.monthlySavings,
    subsidyAmount: quoteState.calculated.subsidyAmount,
    warranty: "Up to 30 Years Performance Warranty",
    serviceCoverage: "All Kerala Service",
    status: "New Lead - Kerala Central Desk"
  };

  // 1. Save to Local Storage (Always persistent)
  saveLeadLocally(leadPayload);

  // 2. Trigger Optional Webhook (Google Sheets / Zapier / CRM)
  sendToWebhook(leadPayload);

  // 3. Render Success View
  showSubmissionConfirmation(leadPayload);
}

// Show clean confirmation screen
function showSubmissionConfirmation(lead) {
  // Build dynamic WhatsApp prefilled message addressed to official number 9497397446
  const waMessage = encodeURIComponent(
    `Hello Rise Altitude Enterprises (All Kerala Solar Team),\n\n` +
    `I just requested a Solar Quote on your website for my property in Kerala:\n` +
    `• Name: ${lead.customer.fullName}\n` +
    `• Mobile: ${lead.customer.phone}\n` +
    `• Location: ${lead.customer.location} (PIN: ${lead.customer.pincode || 'Kerala'})\n` +
    `• Monthly KSEB Bill: ₹${lead.monthlyBill.toLocaleString('en-IN')}\n` +
    `• Recommended System: ${lead.recommendedKw} kW (Up to 30 Years Warranty)\n` +
    `• Subsidy: ₹${lead.subsidyAmount.toLocaleString('en-IN')}\n` +
    `• Requirement: ${lead.requirement}\n\n` +
    `Please share the detailed quotation, solar components datasheet, and KSEB feasibility site survey schedule.`
  );

  const waLink = `https://wa.me/${CONFIG.phoneRaw}?text=${waMessage}`;

  // Hide form content and show success modal content
  document.querySelectorAll('.wizard-step-content').forEach(el => el.classList.add('hidden'));
  const successContainer = document.getElementById('modalStepSuccess');
  
  if (successContainer) {
    successContainer.classList.remove('hidden');
    
    // Inject dynamic values
    const nameEl = document.getElementById('successCustomerName');
    if (nameEl) nameEl.textContent = lead.customer.fullName;

    const summaryEl = document.getElementById('successSummary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="bg-slate-50 p-4 rounded-xl border border-brand-100 text-sm space-y-1.5 text-slate-700">
          <div class="flex justify-between"><span>System Size:</span> <strong class="text-brand-900">${lead.recommendedKw} kWp Rooftop</strong></div>
          <div class="flex justify-between"><span>Panel Warranty:</span> <strong class="text-brand-800 font-bold">Up to 30 Years</strong></div>
          <div class="flex justify-between"><span>Monthly Bill:</span> <strong>₹${lead.monthlyBill.toLocaleString('en-IN')}</strong></div>
          <div class="flex justify-between"><span>Est. Monthly Savings:</span> <strong class="text-brand-800 font-bold">₹${lead.monthlySavings.toLocaleString('en-IN')}/mo</strong></div>
          <div class="flex justify-between"><span>PM Surya Ghar Subsidy:</span> <strong class="text-brand-800 font-bold">₹${lead.subsidyAmount.toLocaleString('en-IN')}</strong></div>
          <div class="flex justify-between"><span>Service Scope:</span> <strong class="text-brand-800">All Kerala &bull; ${lead.customer.location}</strong></div>
        </div>
      `;
    }

    const waBtn = document.getElementById('successWhatsAppBtn');
    if (waBtn) {
      waBtn.href = waLink;
    }
  }
}

// Local Storage Helper
function saveLeadLocally(lead) {
  try {
    const existing = JSON.parse(localStorage.getItem('rise_altitude_leads') || '[]');
    existing.unshift(lead);
    localStorage.setItem('rise_altitude_leads', JSON.stringify(existing));
    console.log('[Rise Altitude] Lead successfully saved to LocalStorage:', lead);
    renderAdminLeadsTable();
  } catch (e) {
    console.warn('[Rise Altitude] Could not save to localStorage:', e);
  }
}

// Webhook / Google Sheets / Email Integration Dispatcher
async function sendToWebhook(lead) {
  if (!CONFIG.WEBHOOK_ENDPOINT) {
    console.info(
      '%c[Rise Altitude Webhook]%c Ready to connect to Google Sheets / Zapier / Make. Check lead-integration-guide.md for simple instructions.',
      'color: #18407d; font-weight: bold;',
      'color: inherit;'
    );
    return;
  }

  try {
    const response = await fetch(CONFIG.WEBHOOK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead),
      mode: 'no-cors' // Allows posting to Google Apps Script web apps without CORS block
    });
    console.log('[Rise Altitude] Webhook dispatch completed.');
  } catch (error) {
    console.error('[Rise Altitude] Webhook dispatch error:', error);
  }
}

// ==========================================
// ADMIN LEADS DRAWER & DEMO VIEWER
// ==========================================
function toggleAdminDrawer() {
  const drawer = document.getElementById('adminLeadsDrawer');
  if (!drawer) return;
  drawer.classList.toggle('hidden');
  renderAdminLeadsTable();
}

function renderAdminLeadsTable() {
  const tableBody = document.getElementById('adminLeadsTableBody');
  const countBadge = document.getElementById('adminLeadsCount');
  if (!tableBody) return;

  const leads = JSON.parse(localStorage.getItem('rise_altitude_leads') || '[]');
  if (countBadge) countBadge.textContent = leads.length;

  if (leads.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-slate-400 text-sm">
          No customer inquiries recorded yet. Submit a test quote from the estimator above to see it appear here in real-time.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = leads.map(l => `
    <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td class="p-3 text-xs font-mono font-semibold text-slate-500">${l.id}</td>
      <td class="p-3">
        <div class="font-semibold text-slate-800 text-sm">${escapeHtml(l.customer.fullName)}</div>
        <div class="text-xs text-slate-500">${escapeHtml(l.customer.location)}, Kerala ${l.customer.pincode ? '- ' + escapeHtml(l.customer.pincode) : ''}</div>
      </td>
      <td class="p-3">
        <div class="text-sm font-medium text-slate-700">📞 ${escapeHtml(l.customer.phone)}</div>
        ${l.customer.whatsappOptIn ? '<span class="inline-flex items-center text-[10px] bg-brand-50 text-brand-800 border border-brand-200 px-1.5 py-0.5 rounded font-medium">WhatsApp Enabled</span>' : ''}
      </td>
      <td class="p-3">
        <span class="inline-block px-2.5 py-1 text-xs font-bold rounded-full bg-brand-100 text-brand-900">
          ${l.recommendedKw} kW
        </span>
        <div class="text-xs text-slate-500 mt-0.5">Bill: ₹${l.monthlyBill.toLocaleString('en-IN')}</div>
      </td>
      <td class="p-3 text-xs text-slate-500">${l.createdAt}</td>
      <td class="p-3 text-right">
        <a href="https://wa.me/91${l.customer.phone}?text=Hello%20${encodeURIComponent(l.customer.fullName)},%20this%20is%20Rise%20Altitude%20Enterprises%20regarding%20your%20${l.recommendedKw}kW%20solar%20quote%20in%20${encodeURIComponent(l.customer.location)}." target="_blank" class="inline-flex items-center gap-1 text-xs bg-brand-800 hover:bg-brand-900 text-white px-2 py-1 rounded transition-colors">
          Chat
        </a>
      </td>
    </tr>
  `).join('');
}

function clearAllLeads() {
  if (confirm("Are you sure you want to clear stored lead demo records?")) {
    localStorage.removeItem('rise_altitude_leads');
    renderAdminLeadsTable();
  }
}

function exportLeadsCSV() {
  const leads = JSON.parse(localStorage.getItem('rise_altitude_leads') || '[]');
  if (leads.length === 0) {
    alert("No leads available to export.");
    return;
  }

  const headers = ["Lead ID", "Date", "Name", "Phone", "Location", "PIN Code", "Monthly Bill", "Recommended kW", "Warranty", "Est Subsidy", "Requirement", "Coverage"];
  const rows = leads.map(l => [
    l.id,
    `"${l.createdAt}"`,
    `"${l.customer.fullName.replace(/"/g, '""')}"`,
    `"${l.customer.phone}"`,
    `"${l.customer.location.replace(/"/g, '""')}"`,
    `"${l.customer.pincode}"`,
    l.monthlyBill,
    l.recommendedKw,
    `"${l.warranty || 'Up to 30 Years'}"`,
    l.subsidyAmount,
    `"${l.requirement}"`,
    `"${l.serviceCoverage || 'All Kerala'}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Rise_Altitude_Solar_Leads_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ==========================================
// SOLAR ELECTRICAL PRODUCTS CATALOG FILTERING
// ==========================================
function filterProducts(category, clickedBtn) {
  // Update Active Button styling in Logo Theme
  const buttons = document.querySelectorAll('.product-filter-btn');
  buttons.forEach(btn => {
    btn.classList.remove('bg-brand-800', 'text-white', 'shadow-md');
    btn.classList.add('bg-brand-50', 'text-brand-800', 'border', 'border-brand-200');
  });
  if (clickedBtn) {
    clickedBtn.classList.remove('bg-brand-50', 'text-brand-800', 'border', 'border-brand-200');
    clickedBtn.classList.add('bg-brand-800', 'text-white', 'shadow-md');
  }

  // Filter Items
  const items = document.querySelectorAll('.product-card-item');
  items.forEach(item => {
    const itemCat = item.getAttribute('data-category');
    if (category === 'all' || itemCat === category) {
      item.classList.remove('hidden');
      item.style.animation = 'fadeIn 0.3s ease forwards';
    } else {
      item.classList.add('hidden');
    }
  });
}

// ==========================================
// FAQ ACCORDION HANDLER
// ==========================================
function toggleFaq(index) {
  const answer = document.getElementById(`faq-ans-${index}`);
  const icon = document.getElementById(`faq-icon-${index}`);
  if (!answer) return;

  const isHidden = answer.classList.contains('hidden');
  
  // Close all FAQs first
  document.querySelectorAll('.faq-answer').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.faq-icon').forEach(el => el.style.transform = 'rotate(0deg)');

  // If it was hidden, open it
  if (isHidden) {
    answer.classList.remove('hidden');
    if (icon) icon.style.transform = 'rotate(180deg)';
  }
}

// ==========================================
// GENERAL INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial calculation
  updateCalculations();

  // 2. Bind Main Calculator Bill Slider
  const mainBillSlider = document.getElementById('billSlider');
  if (mainBillSlider) {
    mainBillSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 1000;
      quoteState.monthlyBill = val;
      updateCalculations();
    });
  }

  // Bind Modal KSEB Bill Slider
  const modalBillSlider = document.getElementById('modalKsebBillSlider');
  if (modalBillSlider) {
    modalBillSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 1000;
      quoteState.monthlyBill = val;
      updateCalculations();
    });
  }

  // Bind any other Bill Sliders and Number Inputs (Two-way sync)
  const billInputs = document.querySelectorAll('[data-bind="billInput"]');
  billInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 1000;
      quoteState.monthlyBill = val;
      updateCalculations();
    });
  });

  // 3. Bind Property Type Switches (both in modal and on page)
  document.querySelectorAll('input[name="modalPropertyType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      quoteState.propertyType = (e.target.value || "residential").toLowerCase();
      updateCalculations();
    });
  });

  document.querySelectorAll('input[name="propertyType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      quoteState.propertyType = (e.target.value || "residential").toLowerCase();
      updateCalculations();
    });
  });

  // Modal roof area and type inputs
  const modalRoofArea = document.getElementById('modalRoofAreaInput');
  if (modalRoofArea) {
    modalRoofArea.addEventListener('input', (e) => {
      quoteState.roofArea = parseInt(e.target.value, 10) || 0;
    });
  }

  const modalRoofType = document.getElementById('modalRoofTypeSelect');
  if (modalRoofType) {
    modalRoofType.addEventListener('change', (e) => {
      quoteState.roofType = e.target.value;
    });
  }

  // 4. Bind Requirement Radios
  document.querySelectorAll('input[name="modalRequirement"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      quoteState.requirement = e.target.value;
    });
  });

  // 5. Pre-suggested City Chips in Contact Step (All Kerala Coverage)
  document.querySelectorAll('.city-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const city = chip.getAttribute('data-city');
      const pin = chip.getAttribute('data-pin');
      
      const cityInput = document.querySelector('[name="customerLocation"]');
      const pinInput = document.querySelector('[name="customerPincode"]');
      
      if (cityInput) cityInput.value = city;
      if (pinInput && pin) pinInput.value = pin;

      // Active styling in Logo Theme
      document.querySelectorAll('.city-chip').forEach(c => {
        c.classList.remove('border-brand-800', 'bg-brand-100', 'text-brand-900', 'font-bold');
        c.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
      });
      chip.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
      chip.classList.add('border-brand-800', 'bg-brand-100', 'text-brand-900', 'font-bold');
    });
  });

  // 6. Mobile Navigation Drawer
  const mobileMenuBtn = document.getElementById('mobileMenuToggle');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavClose = document.getElementById('mobileNavClose');

  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNavDrawer.classList.remove('hidden');
    });
  }

  if (mobileNavClose && mobileNavDrawer) {
    mobileNavClose.addEventListener('click', () => {
      mobileNavDrawer.classList.add('hidden');
    });
  }

  // Close mobile drawer when clicking a link
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNavDrawer) mobileNavDrawer.classList.add('hidden');
    });
  });

  // 7. Navbar scroll shadow & glass intensity (Executive Dashboard Theme)
  const navSections = document.querySelectorAll('section[id]');
  const dashLinks = document.querySelectorAll('.nav-dash-link');

  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('mainNavbar');
    if (navbar) {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Scrollspy to highlight active dashboard nav pill
    if (dashLinks.length > 0) {
      let currentSectionId = 'home';
      const scrollPos = window.scrollY + 140;

      navSections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = section.getAttribute('id');
        }
      });

      dashLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}`) {
          link.className = 'nav-dash-link active px-3.5 py-1.5 rounded-lg text-white bg-brand-700/90 font-bold border border-cyan-400/50 shadow-sm transition-all flex items-center gap-1.5';
        } else {
          link.className = 'nav-dash-link px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-brand-800/80 transition-all flex items-center gap-1.5';
        }
      });
    }
  });

  // 8. Contact Form on Main Page (if present)
  const contactForm = document.getElementById('directContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('[name="name"]').value;
      const phone = contactForm.querySelector('[name="phone"]').value;
      const location = contactForm.querySelector('[name="location"]').value;
      
      alert(`Thank you, ${name}! Your inquiry for ${location} has been received. Our Rise Altitude All-Kerala technical team will contact you at ${phone} shortly.`);
      contactForm.reset();
    });
  }

  // 9. Modal Form submit listener
  const modalForm = document.getElementById('quoteModalForm');
  if (modalForm) {
    modalForm.addEventListener('submit', handleQuoteSubmission);
  }

  // 10. Load admin table initial
  renderAdminLeadsTable();
});

// Expose functions globally for inline HTML handlers
window.calculateSolarMetrics = calculateSolarMetrics;
window.updateCalculations = updateCalculations;
window.renderEstimateUI = renderEstimateUI;
window.setQuickHeroBill = setQuickHeroBill;
window.openQuoteModal = openQuoteModal;
window.closeQuoteModal = closeQuoteModal;
window.goToModalStep = goToModalStep;
window.handleQuoteSubmission = handleQuoteSubmission;
window.toggleAdminDrawer = toggleAdminDrawer;
window.renderAdminLeadsTable = renderAdminLeadsTable;
window.clearAllLeads = clearAllLeads;
window.exportLeadsCSV = exportLeadsCSV;
window.filterProducts = filterProducts;
window.toggleFaq = toggleFaq;

