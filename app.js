/* ===================================================================
   Shivansh International — Invoice Management System
   Application Logic
   =================================================================== */

// ─── State ────────────────────────────────────────────────────────
const state = {
    invoices: JSON.parse(localStorage.getItem('si_invoices') || '[]'),
    counters: JSON.parse(localStorage.getItem('si_counters') || JSON.stringify({
        proforma: 1, purchase: 1, commercial: 1, packing: 1, local: 1
    }))
};

const currencySymbols = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', AED: 'د.إ'
};

// ─── Initialization ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initDate();
    initNavigation();
    initMobileSidebar();
    generateInvoiceNumbers();
    setTodayDates();
    updateDashboard();
    initSearchFilter();
});

// ─── Date Display ────────────────────────────────────────────────
function initDate() {
    const dateEl = document.getElementById('currentDate');
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
}

// ─── Navigation ──────────────────────────────────────────────────
function initNavigation() {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
            // Close mobile sidebar
            closeMobileSidebar();
        });
    });
}

function navigateTo(page) {
    // Update nav
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const activePage = document.getElementById(`page-${page}`);
    if (activePage) activePage.classList.add('active');

    // Update title
    const titles = {
        dashboard: ['Dashboard', 'Welcome back! Here\'s your business overview.'],
        proforma: ['Proforma Invoice', 'Generate pre-shipment quotation invoices'],
        purchase: ['Purchase Order', 'Create official purchase orders for vendors'],
        commercial: ['Commercial Invoice', 'Prepare customs-ready commercial invoices'],
        packing: ['Packing List', 'Prepare detailed packing lists with weights'],
        local: ['Local Invoice', 'Generate GST-compliant domestic tax invoices']
    };

    const [title, subtitle] = titles[page] || ['Dashboard', ''];
    document.getElementById('pageTitle').textContent = title;
    document.getElementById('pageSubtitle').textContent = subtitle;

    // Scroll to top of the content container
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ─── Mobile Sidebar ──────────────────────────────────────────────
function initMobileSidebar() {
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('sidebarOverlay');

    hamburger.addEventListener('click', toggleMobileSidebar);
    overlay.addEventListener('click', closeMobileSidebar);
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar.classList.toggle('open');
    hamburger.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar.classList.remove('open');
    hamburger.classList.remove('active');
    overlay.classList.remove('active');
}

// ─── Invoice Numbers ─────────────────────────────────────────────
function generateInvoiceNumbers() {
    const year = new Date().getFullYear();
    const pad = (n) => String(n).padStart(4, '0');

    document.getElementById('pi-invoice-no').value = `SI/PI/${year}/${pad(state.counters.proforma)}`;
    document.getElementById('po-order-no').value   = `SI/PO/${year}/${pad(state.counters.purchase)}`;
    document.getElementById('ci-invoice-no').value  = `SI/CI/${year}/${pad(state.counters.commercial)}`;
    document.getElementById('pl-ref-no').value      = `SI/PL/${year}/${pad(state.counters.packing)}`;
    document.getElementById('li-invoice-no').value  = `SI/LI/${year}/${pad(state.counters.local)}`;
}

function setTodayDates() {
    const today = new Date().toISOString().split('T')[0];
    ['pi-date', 'po-date', 'ci-date', 'pl-date', 'li-date', 'pi-delivery-date', 'po-delivery-date', 'ci-dec-date', 'pl-dec-date'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = today;
    });
}

// ─── Item Row Management ─────────────────────────────────────────
function addRow(prefix) {
    const tbody = document.getElementById(`${prefix}-items-body`);
    const rowCount = tbody.rows.length + 1;

    let row;
    switch(prefix) {
        case 'pi':
            row = createProformaRow(rowCount);
            break;
        case 'po':
            row = createPurchaseRow(rowCount);
            break;
        case 'ci':
            row = createCommercialRow(rowCount);
            break;
        case 'pl':
            row = createPackingRow(rowCount);
            break;
        case 'li':
            row = createLocalRow(rowCount);
            break;
    }

    tbody.appendChild(row);
    renumberRows(prefix);
}

function createProformaRow(num) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" placeholder="e.g., 001" class="item-code" value="${String(num).padStart(3, '0')}"></td>
        <td><input type="text" placeholder="Item description" class="item-desc"></td>
        <td><input type="number" value="1" min="0" class="item-qty" onchange="calculateRow(this, 'pi')"></td>
        <td><input type="number" value="0" min="0" step="0.01" class="item-price" onchange="calculateRow(this, 'pi')"></td>
        <td><input type="text" value="0.00" class="item-amount" readonly></td>
        <td><button type="button" class="btn-remove" onclick="removeRow(this, 'pi')"><i class="fas fa-times"></i></button></td>
    `;
    return tr;
}

function createPurchaseRow(num) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${num}</td>
        <td><input type="text" placeholder="Item description" class="item-desc"></td>
        <td><input type="number" value="1" min="0" class="item-qty" onchange="calculateRow(this, 'po')"></td>
        <td><input type="number" value="0" min="0" step="0.01" class="item-price" onchange="calculateRow(this, 'po')"></td>
        <td><input type="text" value="0.00" class="item-amount" readonly></td>
        <td><button type="button" class="btn-remove" onclick="removeRow(this, 'po')"><i class="fas fa-times"></i></button></td>
    `;
    return tr;
}

function createCommercialRow(num) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" class="item-marks" value="SPD"></td>
        <td><input type="text" placeholder="Description of goods" class="item-desc"></td>
        <td><input type="number" value="1" min="0" class="item-qty" onchange="calculateRow(this, 'ci')"></td>
        <td><input type="number" value="0" min="0" step="0.01" class="item-net-wt"></td>
        <td><input type="text" class="item-hsn" value="42023120"></td>
        <td><input type="number" value="0" min="0" step="0.01" class="item-price" onchange="calculateRow(this, 'ci')"></td>
        <td><input type="text" value="0.00" class="item-amount" readonly></td>
        <td><button type="button" class="btn-remove" onclick="removeRow(this, 'ci')"><i class="fas fa-times"></i></button></td>
    `;
    return tr;
}

function createPackingRow(num) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" class="item-marks" value="SPD"></td>
        <td><input type="text" class="item-pkgs-desc" placeholder="e.g. 1-13 Black Color"></td>
        <td><input type="text" placeholder="Description of goods" class="item-desc"></td>
        <td><input type="number" value="1" min="0" class="item-qty" onchange="calculateTotals('pl')"></td>
        <td><input type="number" value="0" min="0" step="0.01" class="item-net-wt" onchange="calculateTotals('pl')"></td>
        <td><input type="number" value="0" min="0" step="0.01" class="item-gross-wt" onchange="calculateTotals('pl')"></td>
        <td><button type="button" class="btn-remove" onclick="removeRow(this, 'pl')"><i class="fas fa-times"></i></button></td>
    `;
    return tr;
}

function createLocalRow(num) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${num}</td>
        <td><input type="text" placeholder="Item description" class="item-desc"></td>
        <td><input type="text" placeholder="HSN" class="item-hsn"></td>
        <td><input type="number" value="1" min="0" class="item-qty" onchange="calculateRow(this, 'li')"></td>
        <td>
            <select class="item-unit">
                <option value="PCS">PCS</option>
                <option value="KGS">KGS</option>
                <option value="MTR">MTR</option>
                <option value="SET">SET</option>
                <option value="NOS">NOS</option>
            </select>
        </td>
        <td><input type="number" value="0" min="0" step="0.01" class="item-price" onchange="calculateRow(this, 'li')"></td>
        <td><input type="text" value="0.00" class="item-amount" readonly></td>
        <td><button type="button" class="btn-remove" onclick="removeRow(this, 'li')"><i class="fas fa-times"></i></button></td>
    `;
    return tr;
}

function removeRow(btn, prefix) {
    const tbody = document.getElementById(`${prefix}-items-body`);
    if (tbody.rows.length > 1) {
        btn.closest('tr').remove();
        renumberRows(prefix);
        calculateTotals(prefix);
    } else {
        showToast('At least one item is required', 'error');
    }
}

function renumberRows(prefix) {
    const tbody = document.getElementById(`${prefix}-items-body`);
    Array.from(tbody.rows).forEach((row, i) => {
        if (prefix === 'po' || prefix === 'li') {
            row.cells[0].textContent = i + 1;
        } else if (prefix === 'pi') {
            const codeInput = row.cells[0].querySelector('.item-code');
            if (codeInput && !codeInput.value) {
                codeInput.value = String(i + 1).padStart(3, '0');
            }
        }
    });
}

// ─── Calculations ────────────────────────────────────────────────
function calculateRow(input, prefix) {
    const row = input.closest('tr');
    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const amount = qty * price;
    row.querySelector('.item-amount').value = amount.toFixed(2);
    calculateTotals(prefix);
}

function calculateTotals(prefix) {
    const tbody = document.getElementById(`${prefix}-items-body`);
    let subtotal = 0;

    if (prefix === 'pl') {
        // Packing list totals
        let totalQty = 0, totalNet = 0, totalGross = 0;
        Array.from(tbody.rows).forEach(row => {
            totalQty += parseInt(row.querySelector('.item-qty')?.value) || 0;
            totalNet += parseFloat(row.querySelector('.item-net-wt')?.value) || 0;
            totalGross += parseFloat(row.querySelector('.item-gross-wt')?.value) || 0;
        });
        
        // Show in UI
        document.getElementById('pl-total-pkgs').textContent = totalQty;
        document.getElementById('pl-total-net').textContent = totalNet.toFixed(2) + ' KG';
        document.getElementById('pl-total-gross').textContent = totalGross.toFixed(2) + ' KG';
        return;
    }

    Array.from(tbody.rows).forEach(row => {
        subtotal += parseFloat(row.querySelector('.item-amount')?.value) || 0;
    });

    document.getElementById(`${prefix}-subtotal`).textContent = subtotal.toFixed(2);

    let grandTotal = subtotal;

    if (prefix === 'pi') {
        const shipping = parseFloat(document.getElementById('pi-shipping').value) || 0;
        const otherCost = parseFloat(document.getElementById('pi-other-cost').value) || 0;
        grandTotal = subtotal + shipping + otherCost;
    } else if (prefix === 'po') {
        const shipping = parseFloat(document.getElementById('po-shipping').value) || 0;
        const otherCost = parseFloat(document.getElementById('po-other-cost').value) || 0;
        grandTotal = subtotal + shipping + otherCost;
    } else if (prefix === 'ci') {
        const freight = parseFloat(document.getElementById('ci-freight').value) || 0;
        const insurance = parseFloat(document.getElementById('ci-insurance').value) || 0;
        const discount = parseFloat(document.getElementById('ci-discount').value) || 0;
        grandTotal = subtotal + freight + insurance - discount;
    } else if (prefix === 'li') {
        const cgst = parseFloat(document.getElementById('li-cgst').value) || 0;
        const sgst = parseFloat(document.getElementById('li-sgst').value) || 0;
        const igst = parseFloat(document.getElementById('li-igst').value) || 0;
        grandTotal = subtotal + subtotal * (cgst + sgst + igst) / 100;
        document.getElementById('li-amount-words').textContent = numberToWords(Math.round(grandTotal)) + ' Only';
    }

    document.getElementById(`${prefix}-grand-total`).textContent = grandTotal.toFixed(2);
}

// ─── Number to Words ─────────────────────────────────────────────
function numberToWords(num) {
    if (num === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convert(n) {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    }

    return convert(num);
}

// ─── Generate Invoice ────────────────────────────────────────────
function generateInvoice(type) {
    let html = '';

    switch (type) {
        case 'proforma':
            html = generateProformaHTML();
            break;
        case 'purchase':
            html = generatePurchaseHTML();
            break;
        case 'commercial':
            html = generateCommercialHTML();
            break;
        case 'packing':
            html = generatePackingHTML();
            break;
        case 'local':
            html = generateLocalHTML();
            break;
    }

    document.getElementById('printContent').innerHTML = html;
    document.getElementById('modalTitle').textContent = getTypeLabel(type) + ' Preview';
    document.getElementById('previewModal').classList.add('active');

    // Save to state
    saveInvoice(type);
}

function getTypeLabel(type) {
    const labels = {
        proforma: 'Proforma Invoice',
        purchase: 'Purchase Order',
        commercial: 'Commercial Invoice',
        packing: 'Packing List',
        local: 'Local Invoice'
    };
    return labels[type] || type;
}

// ─── Save Invoice ────────────────────────────────────────────────
function saveInvoice(type) {
    const prefixMap = { proforma: 'pi', purchase: 'po', commercial: 'ci', packing: 'pl', local: 'li' };
    const prefix = prefixMap[type];

    let clientName = '';
    let amount = '';
    let invoiceNo = '';

    switch (type) {
        case 'proforma':
            clientName = document.getElementById('pi-buyer-name').value || 'N/A';
            amount = document.getElementById('pi-grand-total').textContent;
            invoiceNo = document.getElementById('pi-invoice-no').value;
            break;
        case 'purchase':
            clientName = document.getElementById('po-customer-name').value || 'N/A';
            amount = document.getElementById('po-grand-total').textContent;
            invoiceNo = document.getElementById('po-order-no').value;
            break;
        case 'commercial':
            clientName = document.getElementById('ci-consignee-name').value || 'N/A';
            amount = document.getElementById('ci-grand-total').textContent;
            invoiceNo = document.getElementById('ci-invoice-no').value;
            break;
        case 'packing':
            clientName = document.getElementById('pl-consignee-name').value || 'N/A';
            amount = document.getElementById('pl-total-gross').textContent;
            invoiceNo = document.getElementById('pl-ref-no').value;
            break;
        case 'local':
            clientName = document.getElementById('li-buyer-name').value || 'N/A';
            amount = document.getElementById('li-grand-total').textContent;
            invoiceNo = document.getElementById('li-invoice-no').value;
            break;
    }

    const invoice = {
        id: Date.now(),
        type,
        invoiceNo,
        clientName,
        amount,
        date: new Date().toLocaleDateString('en-IN')
    };

    state.invoices.unshift(invoice);
    if (state.invoices.length > 50) state.invoices.pop();

    state.counters[type]++;

    localStorage.setItem('si_invoices', JSON.stringify(state.invoices));
    localStorage.setItem('si_counters', JSON.stringify(state.counters));

    generateInvoiceNumbers();
    updateDashboard();
    showToast(`${getTypeLabel(type)} generated successfully!`, 'success');
}

// ─── Dashboard Update ────────────────────────────────────────────
function updateDashboard() {
    const counts = { proforma: 0, purchase: 0, commercial: 0, packing: 0, local: 0 };
    state.invoices.forEach(inv => {
        if (counts[inv.type] !== undefined) counts[inv.type]++;
    });

    Object.keys(counts).forEach(type => {
        const el = document.getElementById(`stat-${type}`);
        if (el) animateCounter(el, counts[type]);
    });

    updateRecentTable();
}

function animateCounter(el, target) {
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;

    const duration = 600;
    const start = performance.now();

    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(current + (target - current) * eased);
        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

function updateRecentTable() {
    const tbody = document.getElementById('recentTableBody');
    const table = document.getElementById('recentTable');
    const emptyState = document.getElementById('emptyState');

    if (state.invoices.length === 0) {
        table.classList.remove('has-data');
        emptyState.style.display = 'block';
        return;
    }

    table.classList.add('has-data');
    emptyState.style.display = 'none';

    const recent = state.invoices.slice(0, 10);
    tbody.innerHTML = recent.map(inv => `
        <tr>
            <td><strong>${inv.invoiceNo}</strong></td>
            <td><span class="type-badge ${inv.type}">${getTypeLabel(inv.type)}</span></td>
            <td>${inv.clientName}</td>
            <td>${inv.amount}</td>
            <td>${inv.date}</td>
            <td>
                <button class="table-action-btn" onclick="viewInvoice(${inv.id})" title="View"><i class="fas fa-eye"></i></button>
                <button class="table-action-btn" onclick="deleteInvoice(${inv.id})" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');
}

function viewInvoice(id) {
    showToast('Invoice details saved locally', 'info');
}

function deleteInvoice(id) {
    state.invoices = state.invoices.filter(inv => inv.id !== id);
    localStorage.setItem('si_invoices', JSON.stringify(state.invoices));
    updateDashboard();
    showToast('Invoice deleted', 'info');
}

// ─── Search Filter ───────────────────────────────────────────────
function initSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const rows = document.querySelectorAll('#recentTableBody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

// ─── Reset Form ──────────────────────────────────────────────────
function resetForm(type) {
    const formMap = {
        proforma: 'proformaForm',
        purchase: 'purchaseForm',
        commercial: 'commercialForm',
        packing: 'packingForm',
        local: 'localForm'
    };

    const form = document.getElementById(formMap[type]);
    if (!form) return;

    // Save readonly values
    const readonlyInputs = form.querySelectorAll('input[readonly]');
    const savedValues = [];
    readonlyInputs.forEach(input => savedValues.push({ el: input, val: input.value }));

    form.reset();

    // Restore readonly values
    savedValues.forEach(item => item.el.value = item.val);

    // Reset totals
    const prefixMap = { proforma: 'pi', purchase: 'po', commercial: 'ci', packing: 'pl', local: 'li' };
    const prefix = prefixMap[type];

    // Remove extra rows
    const tbody = document.getElementById(`${prefix}-items-body`);
    while (tbody.rows.length > 1) {
        tbody.deleteRow(tbody.rows.length - 1);
    }

    // Reset first row amounts
    const firstRow = tbody.rows[0];
    if (firstRow) {
        const amountInput = firstRow.querySelector('.item-amount');
        if (amountInput) amountInput.value = '0.00';
    }

    calculateTotals(prefix);
    setTodayDates();

    showToast('Form reset successfully', 'info');
}

// ─── Modal ───────────────────────────────────────────────────────
function closeModal() {
    document.getElementById('previewModal').classList.remove('active');
}

function printInvoice() {
    window.print();
}

// Close modal on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// ─── Toast ───────────────────────────────────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut .35s ease forwards';
        setTimeout(() => toast.remove(), 350);
    }, 3500);
}

// ===================================================================
//  INVOICE HTML GENERATORS (HIGH FIDELITY SCREENSHOT REPLICAS)
// ===================================================================

function getProformaItemsHTML() {
    const tbody = document.getElementById('pi-items-body');
    let rows = '';
    const totalRows = 15;
    const rowCount = tbody.rows.length;

    Array.from(tbody.rows).forEach((row) => {
        const code = row.querySelector('.item-code')?.value || '';
        const desc = row.querySelector('.item-desc')?.value || '';
        const qty = row.querySelector('.item-qty')?.value || '0';
        const price = row.querySelector('.item-price')?.value || '0.00';
        const amount = row.querySelector('.item-amount')?.value || '0.00';
        rows += `
            <tr>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${code}</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 8px;">${desc}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${qty}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${parseFloat(price).toFixed(2)}</td>
                <td style="text-align: right; border-bottom: 1px solid #000; padding: 3px 8px;">${parseFloat(amount).toFixed(2)}</td>
            </tr>
        `;
    });

    for (let i = rowCount; i < totalRows; i++) {
        rows += `
            <tr class="empty-row">
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
            </tr>
        `;
    }
    return rows;
}

function getPurchaseItemsHTML() {
    const tbody = document.getElementById('po-items-body');
    let rows = '';
    const totalRows = 15;
    const rowCount = tbody.rows.length;

    Array.from(tbody.rows).forEach((row, i) => {
        const desc = row.querySelector('.item-desc')?.value || '';
        const qty = row.querySelector('.item-qty')?.value || '0';
        const price = row.querySelector('.item-price')?.value || '0.00';
        const amount = row.querySelector('.item-amount')?.value || '0.00';
        rows += `
            <tr>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${i + 1}</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 8px;">${desc}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${qty}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${parseFloat(price).toFixed(2)}</td>
                <td style="text-align: right; border-bottom: 1px solid #000; padding: 3px 8px;">${parseFloat(amount).toFixed(2)}</td>
            </tr>
        `;
    });

    for (let i = rowCount; i < totalRows; i++) {
        rows += `
            <tr class="empty-row">
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
            </tr>
        `;
    }
    return rows;
}

function getCommercialItemsHTML() {
    const tbody = document.getElementById('ci-items-body');
    let rows = '';
    const totalRows = 15;
    const rowCount = tbody.rows.length;

    Array.from(tbody.rows).forEach((row) => {
        const marks = row.querySelector('.item-marks')?.value || '';
        const desc = row.querySelector('.item-desc')?.value || '';
        const qty = row.querySelector('.item-qty')?.value || '0';
        const netWt = row.querySelector('.item-net-wt')?.value || '0';
        const hsn = row.querySelector('.item-hsn')?.value || '';
        const price = row.querySelector('.item-price')?.value || '0.00';
        const amount = row.querySelector('.item-amount')?.value || '0.00';
        rows += `
            <tr>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${marks}</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 8px;">${desc}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${qty}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${netWt}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${hsn}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${parseFloat(price).toFixed(2)}</td>
                <td style="text-align: right; border-bottom: 1px solid #000; padding: 3px 8px;">${parseFloat(amount).toFixed(2)}</td>
            </tr>
        `;
    });

    for (let i = rowCount; i < totalRows; i++) {
        rows += `
            <tr class="empty-row">
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
            </tr>
        `;
    }
    return rows;
}

function getPackingItemsHTML() {
    const tbody = document.getElementById('pl-items-body');
    let rows = '';
    const totalRows = 15;
    const rowCount = tbody.rows.length;

    Array.from(tbody.rows).forEach((row) => {
        const marks = row.querySelector('.item-marks')?.value || '';
        const pkgs = row.querySelector('.item-pkgs-desc')?.value || '';
        const desc = row.querySelector('.item-desc')?.value || '';
        const qty = row.querySelector('.item-qty')?.value || '0';
        const netWt = row.querySelector('.item-net-wt')?.value || '0';
        const grossWt = row.querySelector('.item-gross-wt')?.value || '0';
        rows += `
            <tr>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${marks}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${pkgs}</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 8px;">${desc}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${qty}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 5px;">${parseFloat(netWt).toFixed(0)}</td>
                <td style="text-align: center; border-bottom: 1px solid #000; padding: 3px 5px;">${parseFloat(grossWt).toFixed(0)}</td>
            </tr>
        `;
    });

    for (let i = rowCount; i < totalRows; i++) {
        rows += `
            <tr class="empty-row">
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
                <td style="border-bottom: 1px solid #000; height: 21px;">&nbsp;</td>
            </tr>
        `;
    }
    return rows;
}

function getLocalItemsHTML() {
    const tbody = document.getElementById('li-items-body');
    let rows = '';
    Array.from(tbody.rows).forEach((row, i) => {
        const desc = row.querySelector('.item-desc')?.value || '';
        const hsn = row.querySelector('.item-hsn')?.value || '';
        const qty = row.querySelector('.item-qty')?.value || '0';
        const unit = row.querySelector('.item-unit')?.value || 'PCS';
        const price = row.querySelector('.item-price')?.value || '0.00';
        const amount = row.querySelector('.item-amount')?.value || '0.00';
        rows += `
            <tr>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;">${i + 1}</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 8px;">${desc}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;">${hsn}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;">${qty}</td>
                <td style="text-align: center; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;">${unit}</td>
                <td style="text-align: right; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 8px;">${parseFloat(price).toFixed(2)}</td>
                <td style="text-align: right; border-bottom: 1px solid #000; padding: 4px 8px;">${parseFloat(amount).toFixed(2)}</td>
            </tr>
        `;
    });
    return rows;
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`; // DD.MM.YYYY
    }
    return dateStr;
}

function generateProformaHTML() {
    const items = getProformaItemsHTML();
    const currency = document.getElementById('pi-currency').value;
    const sym = currencySymbols[currency] || currency;

    const sellerName = document.getElementById('pi-seller-name').value;
    const sellerAddress = document.getElementById('pi-seller-address').value;
    const sellerEmail = document.getElementById('pi-seller-email').value;
    const sellerContact = document.getElementById('pi-seller-contact').value;
    const sellerMobile = document.getElementById('pi-seller-mobile').value;

    const buyerName = document.getElementById('pi-buyer-name').value;
    const buyerAddress = document.getElementById('pi-buyer-address').value;
    const buyerEmail = document.getElementById('pi-buyer-email').value;
    const buyerContact = document.getElementById('pi-buyer-contact').value;
    const buyerMobile = document.getElementById('pi-buyer-mobile').value;

    const invoiceNo = document.getElementById('pi-invoice-no').value;
    const dateVal = formatDateDisplay(document.getElementById('pi-date').value);
    const portLoading = document.getElementById('pi-port-loading').value;
    const portDischarge = document.getElementById('pi-port-discharge').value;
    const dispatchMethod = document.getElementById('pi-dispatch-method').value;
    const incoterms = document.getElementById('pi-incoterms').value;
    const deliveryDate = formatDateDisplay(document.getElementById('pi-delivery-date').value);

    const subtotal = document.getElementById('pi-subtotal').textContent;
    const shipping = parseFloat(document.getElementById('pi-shipping').value || 0).toFixed(2);
    const otherCost = parseFloat(document.getElementById('pi-other-cost').value || 0).toFixed(2);
    const grandTotal = document.getElementById('pi-grand-total').textContent;

    const bankName = document.getElementById('pi-bank-name').value;
    const bankAcc = document.getElementById('pi-bank-acc').value;
    const bankSwift = document.getElementById('pi-bank-swift').value;
    const bankBranch = document.getElementById('pi-bank-branch').value;
    const bankAddress = document.getElementById('pi-bank-address').value;

    const sigCompany = document.getElementById('pi-sig-company').value;
    const sigName = document.getElementById('pi-sig-name').value;
    const sigDesignation = document.getElementById('pi-sig-designation').value;
    
    const paymentTerms = document.getElementById('pi-payment-terms').value;
    const remarks = document.getElementById('pi-remarks').value;

    return `
    <div class="print-invoice custom-invoice-layout pi-po-layout">
        <!-- Logo / Title Header -->
        <div class="company-header-row">
            <div class="header-left-info">
                <div class="company-logo-text">${sellerName}</div>
                <div class="company-sub-info"><strong>Email:</strong> ${sellerEmail}</div>
                <div class="company-sub-info"><strong>Contact:</strong> ${sellerMobile}</div>
                <div class="company-sub-info"><strong>Address:</strong> ${sellerAddress}</div>
            </div>
            <div class="header-right-page">
                Page 1 of 1
            </div>
        </div>

        <!-- Details Grid -->
        <div class="invoice-grid-box">
            <div class="grid-row border-bottom">
                <div class="grid-col col-6 border-right padding-box">
                    <div class="box-section-title">Seller Details</div>
                    <div class="box-detail-line"><strong>Name:</strong> ${sellerName}</div>
                    <div class="box-detail-line"><strong>Address:</strong> ${sellerAddress}</div>
                    <div class="box-detail-line"><strong>Email:</strong> ${sellerEmail}</div>
                    <div class="box-detail-line"><strong>Contact Per:</strong> ${sellerContact}</div>
                    <div class="box-detail-line"><strong>Mobile No:</strong> ${sellerMobile}</div>
                </div>
                <div class="grid-col col-6 padding-box" style="display: flex; flex-direction: column;">
                    <div class="document-title-large" style="text-align: center; margin-bottom: 8px;">PROFORMA INVOICE</div>
                    <div class="box-detail-line"><strong>Invoice Number:</strong> ${invoiceNo}</div>
                    <div class="box-detail-line" style="margin-top: 8px;"><strong>Date:</strong> ${dateVal}</div>
                </div>
            </div>
            
            <div class="grid-row border-bottom">
                <div class="grid-col col-6 border-right padding-box">
                    <div class="box-section-title">Buyer Details</div>
                    <div class="box-detail-line"><strong>Name:</strong> ${buyerName}</div>
                    <div class="box-detail-line"><strong>Address:</strong> ${buyerAddress}</div>
                    <div class="box-detail-line"><strong>Email:</strong> ${buyerEmail}</div>
                    <div class="box-detail-line"><strong>Contact Per:</strong> ${buyerContact}</div>
                    <div class="box-detail-line"><strong>Mobile No:</strong> ${buyerMobile}</div>
                </div>
                <div class="grid-col col-6 padding-box">
                    <div class="box-detail-line" style="margin-bottom: 12px;"><strong>Port Of Loading:</strong> ${portLoading}</div>
                    <div class="box-detail-line"><strong>Port Of Discharge:</strong> ${portDischarge}</div>
                </div>
            </div>

            <!-- Incoterms Table Row -->
            <div class="grid-row-incoterms">
                <div class="incoterm-cell border-right">
                    <div class="incoterm-label">Method Of Dispatch</div>
                    <div class="incoterm-val">${dispatchMethod}</div>
                </div>
                <div class="incoterm-cell border-right">
                    <div class="incoterm-label">Incoterms</div>
                    <div class="incoterm-val">${incoterms}</div>
                </div>
                <div class="incoterm-cell border-right">
                    <div class="incoterm-label">Delivery Date</div>
                    <div class="incoterm-val">${deliveryDate}</div>
                </div>
                <div class="incoterm-cell">
                    <div class="incoterm-label">Currency</div>
                    <div class="incoterm-val">${currency}</div>
                </div>
            </div>
        </div>

        <!-- Product Table -->
        <table class="invoice-data-table">
            <thead>
                <tr>
                    <th style="width: 10%; text-align: center; border-right: 1px solid #000;">Product Code</th>
                    <th style="width: 50%; text-align: center; border-right: 1px solid #000;">Description</th>
                    <th style="width: 12%; text-align: center; border-right: 1px solid #000;">Quantity</th>
                    <th style="width: 13%; text-align: center; border-right: 1px solid #000;">Unit Price (${currency})</th>
                    <th style="width: 15%; text-align: center;">Total Amount (${currency})</th>
                </tr>
            </thead>
            <tbody>
                ${items}
            </tbody>
        </table>

        <!-- Bottom Grid Section -->
        <div class="invoice-bottom-grid">
            <!-- Left bottom section: Payment & Bank -->
            <div class="bottom-left-col border-right padding-box">
                <div class="bottom-group-block">
                    <strong>Payment Terms</strong><br>
                    ${paymentTerms}
                </div>
                
                ${remarks ? `<div class="bottom-group-block"><strong>Additional Info</strong><br>${remarks}</div>` : `<div class="bottom-group-block" style="min-height: 15px;"><strong>Additional Info</strong></div>`}

                <div class="bottom-group-block bank-details-block" style="margin-top: 5px;">
                    <strong>Bank Details</strong><br>
                    Account Name: ${bankName}<br>
                    Account No: ${bankAcc}<br>
                    Swift Code: ${bankSwift}<br>
                    Branch Name: ${bankBranch}<br>
                    Address: ${bankAddress}
                </div>
            </div>

            <!-- Right bottom section: Totals & Signature -->
            <div class="bottom-right-col">
                <div class="totals-table-box border-bottom">
                    <table class="compact-totals-table">
                        <tr>
                            <td class="total-label">Subtotal (${currency})</td>
                            <td class="total-value">${sym}${subtotal}</td>
                        </tr>
                        <tr>
                            <td class="total-label">Shipping & Handling</td>
                            <td class="total-value">${parseFloat(shipping) > 0 ? sym + shipping : ''}</td>
                        </tr>
                        <tr>
                            <td class="total-label">Other Cost</td>
                            <td class="total-value">${parseFloat(otherCost) > 0 ? sym + otherCost : ''}</td>
                        </tr>
                        <tr class="grand-total-row">
                            <td class="total-label">Grand Total (${currency})</td>
                            <td class="total-value">${sym}${grandTotal}</td>
                        </tr>
                    </table>
                </div>
                <div class="signature-block-container" style="text-align: center; padding: 15px 10px 5px;">
                    <div class="sig-company-name">${sigCompany}</div>
                    <div class="handwritten-signature">${sigName}</div>
                    <div class="sig-designation">${sigDesignation}</div>
                    <div class="sig-auth">Authorized Signatory</div>
                </div>
            </div>
        </div>
    </div>`;
}

function generatePurchaseHTML() {
    const items = getPurchaseItemsHTML();
    const currency = document.getElementById('po-currency').value;
    const sym = currencySymbols[currency] || currency;

    const vendorName = document.getElementById('po-vendor-name').value;
    const vendorAddress = document.getElementById('po-vendor-address').value;
    const vendorEmail = document.getElementById('po-vendor-email').value;
    const vendorContact = document.getElementById('po-vendor-contact').value;
    const vendorMobile = document.getElementById('po-vendor-mobile').value;

    const customerName = document.getElementById('po-customer-name').value;
    const customerAddress = document.getElementById('po-customer-address').value;
    const customerEmail = document.getElementById('po-customer-email').value;
    const customerContact = document.getElementById('po-customer-contact').value;
    const customerMobile = document.getElementById('po-customer-mobile').value;

    const deliverName = document.getElementById('po-deliver-name').value;
    const deliverAddress = document.getElementById('po-deliver-address').value;
    const deliverContact = document.getElementById('po-deliver-contact').value;
    const deliverMobile = document.getElementById('po-deliver-mobile').value;

    const orderNo = document.getElementById('po-order-no').value;
    const dateVal = formatDateDisplay(document.getElementById('po-date').value);
    const shippingMethod = document.getElementById('po-shipping-method').value;
    const shippingTerm = document.getElementById('po-shipping-term').value;
    const deliveryDate = formatDateDisplay(document.getElementById('po-delivery-date').value);

    const subtotal = document.getElementById('po-subtotal').textContent;
    const shipping = parseFloat(document.getElementById('po-shipping').value || 0).toFixed(2);
    const otherCost = parseFloat(document.getElementById('po-other-cost').value || 0).toFixed(2);
    const grandTotal = document.getElementById('po-grand-total').textContent;

    const sigCompany = document.getElementById('po-sig-company').value;
    const sigName = document.getElementById('po-sig-name').value;
    const sigDesignation = document.getElementById('po-sig-designation').value;
    
    const paymentTerms = document.getElementById('po-payment-terms').value;
    const remarks = document.getElementById('po-remarks').value;

    return `
    <div class="print-invoice custom-invoice-layout pi-po-layout">
        <!-- Logo / Title Header -->
        <div class="company-header-row">
            <div class="header-left-info">
                <div class="company-logo-text">${vendorName}</div>
                <div class="company-sub-info"><strong>Email:</strong> ${vendorEmail}</div>
                <div class="company-sub-info"><strong>Contact:</strong> ${vendorMobile}</div>
                <div class="company-sub-info"><strong>Address:</strong> ${vendorAddress}</div>
            </div>
            <div class="header-right-page">
                Page 1 of 1
            </div>
        </div>

        <!-- Details Grid -->
        <div class="invoice-grid-box">
            <div class="grid-row border-bottom">
                <div class="grid-col col-6 border-right padding-box">
                    <div class="box-section-title">Vendor Details</div>
                    <div class="box-detail-line"><strong>Name:</strong> ${vendorName}</div>
                    <div class="box-detail-line"><strong>Address:</strong> ${vendorAddress}</div>
                    <div class="box-detail-line"><strong>Email:</strong> ${vendorEmail}</div>
                    <div class="box-detail-line"><strong>Contact Per:</strong> ${vendorContact}</div>
                    <div class="box-detail-line"><strong>Mobile No:</strong> ${vendorMobile}</div>
                </div>
                <div class="grid-col col-6 padding-box" style="display: flex; flex-direction: column;">
                    <div class="document-title-large" style="text-align: center; margin-bottom: 8px;">PURCHASE ORDER</div>
                    <div class="box-detail-line"><strong>Invoice Number:</strong> ${orderNo}</div>
                    <div class="box-detail-line" style="margin-top: 8px;"><strong>Date:</strong> ${dateVal}</div>
                </div>
            </div>
            
            <div class="grid-row border-bottom">
                <div class="grid-col col-6 border-right padding-box">
                    <div class="box-section-title">Customer Details</div>
                    <div class="box-detail-line"><strong>Name:</strong> ${customerName}</div>
                    <div class="box-detail-line"><strong>Address:</strong> ${customerAddress}</div>
                    <div class="box-detail-line"><strong>Email:</strong> ${customerEmail}</div>
                    <div class="box-detail-line"><strong>Contact Per:</strong> ${customerContact}</div>
                    <div class="box-detail-line"><strong>Mobile No:</strong> ${customerMobile}</div>
                </div>
                <div class="grid-col col-6 padding-box">
                    <div class="box-section-title">Deliver To</div>
                    <div class="box-detail-line"><strong>Name:</strong> ${deliverName}</div>
                    <div class="box-detail-line"><strong>Address:</strong> ${deliverAddress}</div>
                    <div class="box-detail-line"><strong>Contact Per:</strong> ${deliverContact}</div>
                    <div class="box-detail-line"><strong>Mobile No:</strong> ${deliverMobile}</div>
                </div>
            </div>

            <!-- Incoterms Table Row -->
            <div class="grid-row-incoterms">
                <div class="incoterm-cell border-right">
                    <div class="incoterm-label">Shipping Method</div>
                    <div class="incoterm-val">${shippingMethod}</div>
                </div>
                <div class="incoterm-cell border-right">
                    <div class="incoterm-label">Shipping Term</div>
                    <div class="incoterm-val">${shippingTerm}</div>
                </div>
                <div class="incoterm-cell border-right">
                    <div class="incoterm-label">Delivery Date</div>
                    <div class="incoterm-val">${deliveryDate}</div>
                </div>
                <div class="incoterm-cell">
                    <div class="incoterm-label">Currency</div>
                    <div class="incoterm-val">${currency}</div>
                </div>
            </div>
        </div>

        <!-- Product Table -->
        <table class="invoice-data-table">
            <thead>
                <tr>
                    <th style="width: 10%; text-align: center; border-right: 1px solid #000;">Sl. No</th>
                    <th style="width: 50%; text-align: center; border-right: 1px solid #000;">Description</th>
                    <th style="width: 12%; text-align: center; border-right: 1px solid #000;">Quantity</th>
                    <th style="width: 13%; text-align: center; border-right: 1px solid #000;">Unit Price (${currency})</th>
                    <th style="width: 15%; text-align: center;">Amount (${currency})</th>
                </tr>
            </thead>
            <tbody>
                ${items}
            </tbody>
        </table>

        <!-- Bottom Grid Section -->
        <div class="invoice-bottom-grid">
            <!-- Left bottom section: Payment -->
            <div class="bottom-left-col border-right padding-box">
                <div class="bottom-group-block">
                    <strong>Payment Terms</strong><br>
                    ${paymentTerms}
                </div>
                ${remarks ? `<div class="bottom-group-block" style="margin-top: 10px;"><strong>Remarks</strong><br>${remarks}</div>` : ''}
            </div>

            <!-- Right bottom section: Totals & Signature -->
            <div class="bottom-right-col">
                <div class="totals-table-box border-bottom">
                    <table class="compact-totals-table">
                        <tr>
                            <td class="total-label">Subtotal (${currency})</td>
                            <td class="total-value">${sym}${subtotal}</td>
                        </tr>
                        <tr>
                            <td class="total-label">Shipping & Handling</td>
                            <td class="total-value">${parseFloat(shipping) > 0 ? sym + shipping : ''}</td>
                        </tr>
                        <tr>
                            <td class="total-label">Other Cost</td>
                            <td class="total-value">${parseFloat(otherCost) > 0 ? sym + otherCost : ''}</td>
                        </tr>
                        <tr class="grand-total-row">
                            <td class="total-label">Total Amount (${currency})</td>
                            <td class="total-value">${sym}${grandTotal}</td>
                        </tr>
                    </table>
                </div>
                <div class="signature-block-container" style="text-align: center; padding: 15px 10px 5px;">
                    <div class="sig-company-name">${sigCompany}</div>
                    <div class="handwritten-signature">${sigName}</div>
                    <div class="sig-designation">${sigDesignation}</div>
                    <div class="sig-auth">Authorized Signatory</div>
                </div>
            </div>
        </div>
    </div>`;
}

function generateCommercialHTML() {
    const items = getCommercialItemsHTML();
    const currency = document.getElementById('ci-currency').value;
    const sym = currencySymbols[currency] || currency;

    const exporterName = document.getElementById('ci-exporter-name').value;
    const exporterAddress = document.getElementById('ci-exporter-address').value;
    const exporterEmail = document.getElementById('ci-exporter-email').value;
    const exporterMobile = document.getElementById('ci-exporter-mobile').value;

    const consigneeName = document.getElementById('ci-consignee-name').value;
    const consigneeAddress = document.getElementById('ci-consignee-address').value;
    const consigneeContact = document.getElementById('ci-consignee-contact').value;
    const consigneeMobile = document.getElementById('ci-consignee-mobile').value;
    const consigneeGst = document.getElementById('ci-consignee-gst').value;

    const deliverName = document.getElementById('ci-deliver-name').value;
    const deliverAddress = document.getElementById('ci-deliver-address').value;
    const deliverContact = document.getElementById('ci-deliver-contact').value;
    const deliverMobile = document.getElementById('ci-deliver-mobile').value;

    const invoiceNo = document.getElementById('ci-invoice-no').value;
    const dateVal = formatDateDisplay(document.getElementById('ci-date').value);
    const iec = document.getElementById('ci-iec').value;
    const adCode = document.getElementById('ci-ad-code').value;
    const lutArn = document.getElementById('ci-lut-arn').value;

    const preCarriage = document.getElementById('ci-pre-carriage').value;
    const receiptPlace = document.getElementById('ci-receipt-place').value;
    const originCountry = document.getElementById('ci-origin-country').value;
    const destCountry = document.getElementById('ci-dest-country').value;
    const vessel = document.getElementById('ci-vessel').value;
    const portLoading = document.getElementById('ci-port-loading').value;
    const delPayTerms = document.getElementById('ci-delivery-payment-terms').value;
    const portDischarge = document.getElementById('ci-port-discharge').value;
    const finalPort = document.getElementById('ci-final-port').value;
    const exporterGstin = document.getElementById('ci-exporter-gstin').value;

    const subtotal = document.getElementById('ci-subtotal').textContent;
    const freight = parseFloat(document.getElementById('ci-freight').value || 0).toFixed(2);
    const insurance = parseFloat(document.getElementById('ci-insurance').value || 0).toFixed(2);
    const discount = parseFloat(document.getElementById('ci-discount').value || 0).toFixed(2);
    const grandTotal = document.getElementById('ci-grand-total').textContent;

    const dimensions = document.getElementById('ci-dimensions').value;
    const totalQtyCtns = document.getElementById('ci-total-qty-ctns').value;
    const totalWeightLabel = document.getElementById('ci-total-weight-label').value;

    const decExporter = document.getElementById('ci-dec-exporter').value;
    const decRex = document.getElementById('ci-dec-rex').value;
    const decDate = formatDateDisplay(document.getElementById('ci-dec-date').value || document.getElementById('ci-date').value);
    const decOrigin = document.getElementById('ci-dec-origin').value;
    const decCriterion = document.getElementById('ci-dec-criterion').value;
    const decHscode = document.getElementById('ci-dec-hscode').value;
    
    let decText = document.getElementById('ci-remarks').value;
    if (!decText) {
        decText = `Declaration: The Exporter ${decExporter} REX Number: ${decRex} Date: ${decDate} of the products covered by this document declares that, except where otherwise clearly indicated, these products are of ${decOrigin} Preferential origin of the generalised system of preferences of the European Union and that the origin criterion met is ${decCriterion} HS Code ${decHscode}`;
    }

    const sigCompany = document.getElementById('ci-sig-company').value;
    const sigName = document.getElementById('ci-sig-name').value;
    const sigDesignation = document.getElementById('ci-sig-designation').value;

    const totalInWords = numberToWords(Math.round(parseFloat(grandTotal))).toUpperCase();

    return `
    <div class="print-invoice custom-invoice-layout ci-pl-layout">
        <!-- Watermark -->
        <div class="watermark-container">
            <div class="watermark-text">Shivansh International</div>
        </div>

        <div style="text-align: center; margin-bottom: 5px;">
            <div class="document-title-large" style="margin-bottom: 2px;">EXPORT INVOICE</div>
            <div style="font-size: 8pt; font-weight: bold; letter-spacing: 0.5px;">"SUPPLY MEANT FOR EXPORT ON LUT"</div>
        </div>

        <!-- Details Grid -->
        <div class="invoice-grid-box">
            <!-- Row 1: Exporter vs References -->
            <div class="grid-row border-bottom">
                <div class="grid-col col-6 border-right padding-box">
                    <div class="box-detail-line"><strong>Exporter:</strong> ${exporterName}</div>
                    <div class="box-detail-line"><strong>Address:</strong> ${exporterAddress}</div>
                    <div class="box-detail-line"><strong>Email:</strong> ${exporterEmail}</div>
                    <div class="box-detail-line"><strong>Mobile:</strong> ${exporterMobile}</div>
                </div>
                <div class="grid-col col-6 padding-box">
                    <div class="grid-row">
                        <div class="grid-col col-6 border-right" style="padding-bottom: 4px;">
                            <div class="box-detail-line"><strong>Invoice No:</strong> ${invoiceNo}</div>
                        </div>
                        <div class="grid-col col-6" style="padding-left: 8px; padding-bottom: 4px;">
                            <div class="box-detail-line"><strong>Date:</strong> ${dateVal}</div>
                        </div>
                    </div>
                    <div class="border-top" style="padding-top: 4px; margin-top: 2px;">
                        <div class="box-detail-line"><strong>Other Reference(s):</strong></div>
                        <div class="box-detail-line">IEC: ${iec}</div>
                        <div class="box-detail-line">A.D CODE: ${adCode}</div>
                        <div class="box-detail-line">LUT ARN NO: ${lutArn}</div>
                    </div>
                </div>
            </div>

            <!-- Row 2: Consignee vs Deliver To -->
            <div class="grid-row border-bottom">
                <div class="grid-col col-6 border-right padding-box">
                    <div class="box-detail-line"><strong>Consignee:</strong> ${consigneeName}</div>
                    <div class="box-detail-line"><strong>Address:</strong> ${consigneeAddress}</div>
                    <div class="box-detail-line"><strong>Contact Per:</strong> ${consigneeContact}</div>
                    <div class="box-detail-line"><strong>Mobile:</strong> ${consigneeMobile}</div>
                    <div class="box-detail-line"><strong>GSTIN/VAT:</strong> ${consigneeGst}</div>
                </div>
                <div class="grid-col col-6 padding-box">
                    <div class="box-detail-line"><strong>Deliver To:</strong> ${deliverName}</div>
                    <div class="box-detail-line"><strong>Address:</strong> ${deliverAddress}</div>
                    <div class="box-detail-line"><strong>Contact Per:</strong> ${deliverContact}</div>
                    <div class="box-detail-line"><strong>Mobile:</strong> ${deliverMobile}</div>
                </div>
            </div>

            <!-- Row 3: Pre-Carriage Info -->
            <div class="grid-row border-bottom incoterm-style-row">
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Pre-Carriage by:</div>
                    <div class="incoterm-val-bold">${preCarriage}</div>
                </div>
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Place of receipt by pre-carrier</div>
                    <div class="incoterm-val-bold">${receiptPlace}</div>
                </div>
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Country of Origin of goods</div>
                    <div class="incoterm-val-bold">${originCountry}</div>
                </div>
                <div class="grid-col col-3 padding-box">
                    <div class="incoterm-label">Country of Final Destination</div>
                    <div class="incoterm-val-bold">${destCountry}</div>
                </div>
            </div>

            <!-- Row 4: Transport details -->
            <div class="grid-row border-bottom incoterm-style-row">
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Vessel/Flight No.</div>
                    <div class="incoterm-val-bold">${vessel}</div>
                </div>
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Port of Loading</div>
                    <div class="incoterm-val-bold">${portLoading}</div>
                </div>
                <div class="grid-col col-6 padding-box">
                    <div class="incoterm-label">Terms of Delivery and Payment:</div>
                    <div class="incoterm-val-bold">${delPayTerms}</div>
                </div>
            </div>

            <!-- Row 5: Port details & Exporter GSTIN -->
            <div class="grid-row incoterm-style-row">
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Port of Discharge</div>
                    <div class="incoterm-val-bold">${portDischarge}</div>
                </div>
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Final Port of Delivery</div>
                    <div class="incoterm-val-bold">${finalPort}</div>
                </div>
                <div class="grid-col col-6 padding-box">
                    <div class="incoterm-label">GSTIN:</div>
                    <div class="incoterm-val-bold">${exporterGstin}</div>
                </div>
            </div>
        </div>

        <!-- Product Table -->
        <table class="invoice-data-table">
            <thead>
                <tr>
                    <th style="width: 12%; text-align: center; border-right: 1px solid #000;">Marks & Nos.</th>
                    <th style="width: 38%; text-align: center; border-right: 1px solid #000;">Description of Goods.</th>
                    <th style="width: 10%; text-align: center; border-right: 1px solid #000;">Quantity (Pcs)</th>
                    <th style="width: 10%; text-align: center; border-right: 1px solid #000;">Net Wt. (Kgs)</th>
                    <th style="width: 10%; text-align: center; border-right: 1px solid #000;">HSN Code</th>
                    <th style="width: 10%; text-align: center; border-right: 1px solid #000;">Rate (${currency})</th>
                    <th style="width: 10%; text-align: center;">Amount (${currency})</th>
                </tr>
            </thead>
            <tbody>
                ${items}
            </tbody>
        </table>

        <!-- Bottom Grid Section -->
        <div class="invoice-bottom-grid">
            <!-- Left: package info -->
            <div class="bottom-left-col border-right padding-box">
                <div style="font-size: 8.5pt; font-weight: bold; line-height: 1.4; margin-bottom: 12px; white-space: pre-line;">
                    ${dimensions}
                </div>
                <div style="font-size: 8.5pt; font-weight: bold;">
                    ${totalQtyCtns} &nbsp;&nbsp;&nbsp;&nbsp; ${totalWeightLabel}
                </div>
            </div>

            <!-- Right: totals -->
            <div class="bottom-right-col">
                <div class="totals-table-box" style="border-bottom: none;">
                    <table class="compact-totals-table">
                        <tr>
                            <td class="total-label">Total (${currency})</td>
                            <td class="total-value">${sym}${subtotal}</td>
                        </tr>
                        <tr>
                            <td class="total-label">Freight</td>
                            <td class="total-value">${parseFloat(freight) > 0 ? sym + freight : ''}</td>
                        </tr>
                        <tr>
                            <td class="total-label">Insurance</td>
                            <td class="total-value">${parseFloat(insurance) > 0 ? sym + insurance : ''}</td>
                        </tr>
                        <tr>
                            <td class="total-label">Discount</td>
                            <td class="total-value">${parseFloat(discount) > 0 ? sym + discount : ''}</td>
                        </tr>
                        <tr class="grand-total-row" style="border-top: 1px solid #000;">
                            <td class="total-label">G.Total (${currency})</td>
                            <td class="total-value">${sym}${grandTotal}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <!-- Footer Grid -->
        <div class="declaration-footer-row border-top">
            <div class="dec-left-col border-right padding-box">
                <div class="dec-word-amount">Amount Chargeable in words: <strong>${totalInWords} ONLY</strong></div>
                <div class="dec-text-box" style="margin-top: 6px; font-size: 7.2pt; line-height: 1.25; color: #111;">
                    ${decText}
                </div>
            </div>
            <div class="dec-right-col padding-box" style="text-align: center; display: flex; flex-direction: column; justify-content: space-between; min-height: 100px;">
                <div class="sig-company-name" style="font-size: 9pt;">${sigCompany}</div>
                <div class="handwritten-signature" style="font-size: 1.35rem; margin: 4px 0;">${sigName}</div>
                <div>
                    <div class="sig-designation" style="font-size: 8.5pt;">${sigDesignation}</div>
                    <div class="sig-auth" style="font-size: 7.5pt;">Authorized Signatory</div>
                </div>
            </div>
        </div>
    </div>`;
}

function generatePackingHTML() {
    const items = getPackingItemsHTML();

    const shipperName = document.getElementById('pl-shipper-name').value;
    const shipperAddress = document.getElementById('pl-shipper-address').value;
    const shipperEmail = document.getElementById('pl-shipper-email').value;
    const shipperMobile = document.getElementById('pl-shipper-mobile').value;

    const consigneeName = document.getElementById('pl-consignee-name').value;
    const consigneeAddress = document.getElementById('pl-consignee-address').value;
    const consigneeContact = document.getElementById('pl-consignee-contact').value;
    const consigneeMobile = document.getElementById('pl-consignee-mobile').value;
    const consigneeGst = document.getElementById('pl-consignee-gst').value;

    const deliverName = document.getElementById('pl-deliver-name').value;
    const deliverAddress = document.getElementById('pl-deliver-address').value;
    const deliverContact = document.getElementById('pl-deliver-contact').value;
    const deliverMobile = document.getElementById('pl-deliver-mobile').value;

    const invoiceNo = document.getElementById('pl-ref-no').value;
    const dateVal = formatDateDisplay(document.getElementById('pl-date').value);
    const iec = document.getElementById('pl-iec').value;
    const adCode = document.getElementById('pl-ad-code').value;
    const lutArn = document.getElementById('pl-lut-arn').value;

    const preCarriage = document.getElementById('pl-pre-carriage').value;
    const receiptPlace = document.getElementById('pl-receipt-place').value;
    const originCountry = document.getElementById('pl-origin-country').value;
    const destCountry = document.getElementById('pl-dest-country').value;
    const vessel = document.getElementById('pl-vessel').value;
    const portLoading = document.getElementById('pl-port-loading').value;
    const delPayTerms = document.getElementById('pl-delivery-payment-terms').value;
    const portDischarge = document.getElementById('pl-port-discharge').value;
    const finalPort = document.getElementById('pl-final-port').value;
    const exporterGstin = document.getElementById('pl-exporter-gstin').value;

    const totalQty = document.getElementById('pl-total-pkgs').textContent;
    const totalNet = document.getElementById('pl-total-net').textContent.replace(' KG', '');
    const totalGross = document.getElementById('pl-total-gross').textContent.replace(' KG', '');
    const totalPkgsInput = document.getElementById('pl-total-pkgs-input').value;

    const dimensions = document.getElementById('pl-dimensions').value;

    const decExporter = document.getElementById('pl-dec-exporter').value;
    const decRex = document.getElementById('pl-dec-rex').value;
    const decDate = formatDateDisplay(document.getElementById('pl-dec-date').value || document.getElementById('pl-date').value);
    const decOrigin = document.getElementById('pl-dec-origin').value;
    const decCriterion = document.getElementById('pl-dec-criterion').value;
    const decHscode = document.getElementById('pl-dec-hscode').value;

    let decText = document.getElementById('pl-remarks').value;
    if (!decText) {
        decText = `Declaration: The Exporter ${decExporter} REX Number: ${decRex} Date: ${decDate} of the products covered by this document declares that, except where otherwise clearly indicated, these products are of ${decOrigin} Preferential origin of the generalised system of preferences of the European Union and that the origin criterion met is ${decCriterion} HS Code ${decHscode}`;
    }

    const sigCompany = document.getElementById('pl-sig-company').value;
    const sigName = document.getElementById('pl-sig-name').value;
    const sigDesignation = document.getElementById('pl-sig-designation').value;

    return `
    <div class="print-invoice custom-invoice-layout ci-pl-layout">
        <!-- Watermark -->
        <div class="watermark-container">
            <div class="watermark-text">Shivansh International</div>
        </div>

        <div style="text-align: center; margin-bottom: 5px;">
            <div class="document-title-large" style="margin-bottom: 2px;">PACKING LIST</div>
            <div style="font-size: 8pt; font-weight: bold; letter-spacing: 0.5px;">"SUPPLY MEANT FOR EXPORT ON LUT"</div>
        </div>

        <!-- Details Grid -->
        <div class="invoice-grid-box">
            <!-- Row 1: Exporter vs References -->
            <div class="grid-row border-bottom">
                <div class="grid-col col-6 border-right padding-box">
                    <div class="box-detail-line"><strong>Exporter:</strong> ${shipperName}</div>
                    <div class="box-detail-line"><strong>Address:</strong> ${shipperAddress}</div>
                    <div class="box-detail-line"><strong>Email:</strong> ${shipperEmail}</div>
                    <div class="box-detail-line"><strong>Mobile:</strong> ${shipperMobile}</div>
                </div>
                <div class="grid-col col-6 padding-box">
                    <div class="grid-row">
                        <div class="grid-col col-6 border-right" style="padding-bottom: 4px;">
                            <div class="box-detail-line"><strong>Invoice No:</strong> ${invoiceNo}</div>
                        </div>
                        <div class="grid-col col-6" style="padding-left: 8px; padding-bottom: 4px;">
                            <div class="box-detail-line"><strong>Date:</strong> ${dateVal}</div>
                        </div>
                    </div>
                    <div class="border-top" style="padding-top: 4px; margin-top: 2px;">
                        <div class="box-detail-line"><strong>Other Reference(s):</strong></div>
                        <div class="box-detail-line">IEC: ${iec}</div>
                        <div class="box-detail-line">A.D CODE: ${adCode}</div>
                        <div class="box-detail-line">LUT ARN NO: ${lutArn}</div>
                    </div>
                </div>
            </div>

            <!-- Row 2: Consignee vs Deliver To -->
            <div class="grid-row border-bottom">
                <div class="grid-col col-6 border-right padding-box">
                    <div class="box-detail-line"><strong>Consignee:</strong> ${consigneeName}</div>
                    <div class="box-detail-line"><strong>Address:</strong> ${consigneeAddress}</div>
                    <div class="box-detail-line"><strong>Contact Per:</strong> ${consigneeContact}</div>
                    <div class="box-detail-line"><strong>Mobile:</strong> ${consigneeMobile}</div>
                    <div class="box-detail-line"><strong>GSTIN/VAT:</strong> ${consigneeGst}</div>
                </div>
                <div class="grid-col col-6 padding-box">
                    <div class="box-detail-line"><strong>Deliver To:</strong> ${deliverName}</div>
                    <div class="box-detail-line"><strong>Address:</strong> ${deliverAddress}</div>
                    <div class="box-detail-line"><strong>Contact Per:</strong> ${deliverContact}</div>
                    <div class="box-detail-line"><strong>Mobile:</strong> ${deliverMobile}</div>
                </div>
            </div>

            <!-- Row 3: Pre-Carriage Info -->
            <div class="grid-row border-bottom incoterm-style-row">
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Pre-Carriage by:</div>
                    <div class="incoterm-val-bold">${preCarriage}</div>
                </div>
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Place of receipt by pre-carrier</div>
                    <div class="incoterm-val-bold">${receiptPlace}</div>
                </div>
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Country of Origin of goods</div>
                    <div class="incoterm-val-bold">${originCountry}</div>
                </div>
                <div class="grid-col col-3 padding-box">
                    <div class="incoterm-label">Country of Final Destination</div>
                    <div class="incoterm-val-bold">${destCountry}</div>
                </div>
            </div>

            <!-- Row 4: Transport details -->
            <div class="grid-row border-bottom incoterm-style-row">
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Vessel/Flight No.</div>
                    <div class="incoterm-val-bold">${vessel}</div>
                </div>
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Port of Loading</div>
                    <div class="incoterm-val-bold">${portLoading}</div>
                </div>
                <div class="grid-col col-6 padding-box">
                    <div class="incoterm-label">Terms of Delivery and Payment:</div>
                    <div class="incoterm-val-bold">${delPayTerms}</div>
                </div>
            </div>

            <!-- Row 5: Port details & Exporter GSTIN -->
            <div class="grid-row incoterm-style-row">
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Port of Discharge</div>
                    <div class="incoterm-val-bold">${portDischarge}</div>
                </div>
                <div class="grid-col col-3 border-right padding-box">
                    <div class="incoterm-label">Final Port of Delivery</div>
                    <div class="incoterm-val-bold">${finalPort}</div>
                </div>
                <div class="grid-col col-6 padding-box">
                    <div class="incoterm-label">GSTIN:</div>
                    <div class="incoterm-val-bold">${exporterGstin}</div>
                </div>
            </div>
        </div>

        <!-- Product Table -->
        <table class="invoice-data-table">
            <thead>
                <tr>
                    <th style="width: 15%; text-align: center; border-right: 1px solid #000;">Marks & Nos. Container.No.</th>
                    <th style="width: 15%; text-align: center; border-right: 1px solid #000;">No. & Kind of Packages.</th>
                    <th style="width: 40%; text-align: center; border-right: 1px solid #000;">Description of Goods.</th>
                    <th style="width: 10%; text-align: center; border-right: 1px solid #000;">Quantity In Pcs</th>
                    <th style="width: 10%; text-align: center; border-right: 1px solid #000;">NET WEIGHT</th>
                    <th style="width: 10%; text-align: center;">GROSS WEIGHT</th>
                </tr>
            </thead>
            <tbody>
                ${items}
                <tr class="totals-row-inside" style="font-weight: bold; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000;">
                    <td colspan="3" style="text-align: right; padding-right: 20px; height: 21px; border-right: 1px solid #000;">Total:</td>
                    <td style="text-align: center; border-right: 1px solid #000;">${totalQty}</td>
                    <td style="text-align: center; border-right: 1px solid #000;">${parseInt(totalNet)}</td>
                    <td style="text-align: center;">${parseInt(totalGross)}</td>
                </tr>
            </tbody>
        </table>

        <!-- Bottom Grid Section -->
        <div class="invoice-bottom-grid">
            <div class="bottom-left-col padding-box" style="width: 100%; border-right: none;">
                <div style="font-size: 8.5pt; font-weight: bold; line-height: 1.4; white-space: pre-line;">
                    ${dimensions}
                </div>
            </div>
        </div>

        <!-- Footer Grid -->
        <div class="declaration-footer-row border-top">
            <div class="dec-left-col border-right padding-box">
                <div class="dec-text-box" style="font-size: 7.2pt; line-height: 1.25; color: #111;">
                    ${decText}
                </div>
            </div>
            <div class="dec-right-col padding-box" style="text-align: center; display: flex; flex-direction: column; justify-content: space-between; min-height: 100px;">
                <div class="sig-company-name" style="font-size: 9pt;">${sigCompany}</div>
                <div class="handwritten-signature" style="font-size: 1.35rem; margin: 4px 0;">${sigName}</div>
                <div>
                    <div class="sig-designation" style="font-size: 8.5pt;">${sigDesignation}</div>
                    <div class="sig-auth" style="font-size: 7.5pt;">Authorized Signatory</div>
                </div>
            </div>
        </div>
    </div>`;
}

function generateLocalHTML() {
    const items = getLocalItemsHTML();

    return `
    <div class="print-invoice">
        <div class="print-header">
            <div class="print-company">
                <h2>Shivansh International</h2>
                <p>${document.getElementById('li-seller-address').value || ''}</p>
                <p>GSTIN: ${document.getElementById('li-seller-gst').value || 'N/A'} | PAN: ${document.getElementById('li-seller-pan').value || 'N/A'}</p>
                <p>State: ${document.getElementById('li-seller-state').value || 'N/A'} | ${document.getElementById('li-seller-phone').value || ''}</p>
            </div>
            <div class="print-doc-type">
                <h3>Tax Invoice</h3>
                <p>${document.getElementById('li-invoice-no').value}</p>
                <p>Date: ${document.getElementById('li-date').value}</p>
            </div>
        </div>

        <div class="print-parties">
            <div class="print-party">
                <h5>Seller</h5>
                <p><strong>Shivansh International</strong></p>
                <p>${document.getElementById('li-seller-address').value || ''}</p>
                <p>GSTIN: ${document.getElementById('li-seller-gst').value || 'N/A'}</p>
            </div>
            <div class="print-party">
                <h5>Buyer</h5>
                <p><strong>${document.getElementById('li-buyer-name').value || ''}</strong></p>
                <p>${document.getElementById('li-buyer-address').value || ''}</p>
                <p>GSTIN: ${document.getElementById('li-buyer-gst').value || 'N/A'}</p>
                <p>State: ${document.getElementById('li-buyer-state').value || 'N/A'}</p>
            </div>
        </div>

        <div class="print-details">
            <div class="print-detail"><label>Place of Supply</label><span>${document.getElementById('li-place-supply').value || 'N/A'}</span></div>
            <div class="print-detail"><label>Reverse Charge</label><span>${document.getElementById('li-reverse-charge').value || 'No'}</span></div>
            <div class="print-detail"><label>E-Way Bill</label><span>${document.getElementById('li-eway-bill').value || 'N/A'}</span></div>
            <div class="print-detail"><label>Transport</label><span>${document.getElementById('li-transport').value || 'N/A'}</span></div>
        </div>

        <table class="print-items-table">
            <thead>
                <tr><th>#</th><th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Unit</th><th>Rate (₹)</th><th>Amount (₹)</th></tr>
            </thead>
            <tbody>${items}</tbody>
        </table>

        <div class="print-totals">
            <div class="print-totals-box">
                <div class="print-total-row"><span>Taxable Value</span><span>₹ ${document.getElementById('li-subtotal').textContent}</span></div>
                <div class="print-total-row"><span>CGST @ ${document.getElementById('li-cgst').value}%</span><span>₹ ${(parseFloat(document.getElementById('li-subtotal').textContent) * parseFloat(document.getElementById('li-cgst').value) / 100).toFixed(2)}</span></div>
                <div class="print-total-row"><span>SGST @ ${document.getElementById('li-sgst').value}%</span><span>₹ ${(parseFloat(document.getElementById('li-subtotal').textContent) * parseFloat(document.getElementById('li-sgst').value) / 100).toFixed(2)}</span></div>
                <div class="print-total-row"><span>IGST @ ${document.getElementById('li-igst').value}%</span><span>₹ ${(parseFloat(document.getElementById('li-subtotal').textContent) * parseFloat(document.getElementById('li-igst').value) / 100).toFixed(2)}</span></div>
                <div class="print-total-row grand"><span>Total Amount</span><span>₹ ${document.getElementById('li-grand-total').textContent}</span></div>
            </div>
        </div>

        <div class="print-remarks">
            <h5>Amount in Words</h5>
            <p><strong>${document.getElementById('li-amount-words').textContent}</strong></p>
        </div>

        ${document.getElementById('li-bank-name').value ? `
        <div class="print-details" style="margin-top:1rem;">
            <div class="print-detail"><label>Bank Name</label><span>${document.getElementById('li-bank-name').value}</span></div>
            <div class="print-detail"><label>Account No.</label><span>${document.getElementById('li-account-no').value || 'N/A'}</span></div>
            <div class="print-detail"><label>IFSC Code</label><span>${document.getElementById('li-ifsc').value || 'N/A'}</span></div>
            <div class="print-detail"><label>Branch</label><span>${document.getElementById('li-branch').value || 'N/A'}</span></div>
        </div>` : ''}

        ${document.getElementById('li-remarks').value ? `<div class="print-remarks"><h5>Terms & Conditions</h5><p>${document.getElementById('li-remarks').value}</p></div>` : ''}

        <div class="print-footer">
            <div class="signature"><div class="line"></div><p>Receiver's Signature</p></div>
            <div class="company-stamp"><strong>For Shivansh International</strong><div class="line" style="width:180px;height:1px;background:#1e293b;margin:0 auto .4rem;"></div><p>Authorized Signatory</p></div>
        </div>
    </div>`;
}
