// js/main.js — Student Signout Page
document.addEventListener('DOMContentLoaded', () => {

    // ── Auth check ────────────────────────────────────────────────────────────
    // Everything is inside DOMContentLoaded so CONFIG is guaranteed to be loaded
    const KEY = CONFIG.STORAGE_PREFIX + '__currentUser';
    let currentUser = null;
    try { currentUser = JSON.parse(localStorage.getItem(KEY)); } catch {}

    if (!currentUser) { window.location.replace('login.html'); return; }
    if (currentUser.role === 'teacher') { window.location.replace('teacher.html'); return; }

    STATE.currentUser = currentUser;

    // ── Storage helpers ───────────────────────────────────────────────────────
    function getTickets()      { try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + '__tickets')) || []; } catch { return []; } }
    function saveTickets(t)    { localStorage.setItem(CONFIG.STORAGE_PREFIX + '__tickets', JSON.stringify(t)); }
    function getSettings()     {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + '__settings')) || defaultSettings();
        } catch { return defaultSettings(); }
    }
    function defaultSettings() {
        return { ticketsOpen: true, maxActive: 5, maxPerStudent: 3, windowMinutes: 60 };
    }

    // ── DOM refs ──────────────────────────────────────────────────────────────
    const user         = STATE.currentUser;
    const form         = document.getElementById('form');
    const nameInput    = document.getElementById('name-input');
    const teacherInput = document.getElementById('teacher-input');
    const reasonItems  = document.querySelectorAll('.tag-wrapper li');
    const errorMsg     = document.getElementById('error-messages');
    const submitBtn    = form.querySelector('button[type="submit"]');

    // Update header
    document.querySelector('h1').textContent = 'Signout';
    document.querySelector('h2').textContent = user.username;

    // Pre-fill name
    nameInput.value = user.username;

    // Status banner
    const statusBanner = document.createElement('div');
    statusBanner.id = 'status-banner';
    // Insert before tag-wrapper
    const tagWrapper = document.querySelector('.tag-wrapper');
    form.insertBefore(statusBanner, tagWrapper);

    // Active ticket panel
    const activePanel = document.createElement('div');
    activePanel.id = 'active-ticket-panel';
    activePanel.className = 'active-ticket-panel hidden';
    activePanel.innerHTML = `
        <p class="active-label">Your Active Ticket</p>
        <p id="active-ticket-info"></p>
        <p id="active-ticket-status"></p>
        <button type="button" id="close-ticket-btn">Close Ticket</button>`;
    form.insertBefore(activePanel, errorMsg);

    // Sign out button
    const signOutBtn = document.createElement('button');
    signOutBtn.type = 'button';
    signOutBtn.className = 'secondary-btn-inline';
    signOutBtn.textContent = 'Sign Out';
    signOutBtn.addEventListener('click', () => {
        localStorage.removeItem(KEY);
        window.location.replace('login.html');
    });
    form.appendChild(signOutBtn);

    // ── Reason selection ──────────────────────────────────────────────────────
    let selectedReason = null;
    reasonItems.forEach(li => {
        li.addEventListener('click', () => {
            reasonItems.forEach(l => l.classList.remove('selected'));
            li.classList.add('selected');
            selectedReason = li.textContent.trim();
        });
    });

    // ── Render ────────────────────────────────────────────────────────────────
    function render() {
        const settings = getSettings();
        const tickets  = getTickets();
        const myTicket = tickets.find(t => t.studentId === user.id && t.status !== 'closed');
        const pendingCount = tickets.filter(t => t.status === 'pending').length;
        const windowMs  = (settings.windowMinutes || 60) * 60 * 1000;
        const recentMine = tickets.filter(t => t.studentId === user.id && (Date.now() - t.createdAt) < windowMs).length;

        // Status banner
        if (!settings.ticketsOpen) {
            statusBanner.className = 'banner banner-closed';
            statusBanner.textContent = '⛔ Tickets are currently closed.';
        } else if (myTicket) {
            statusBanner.className = 'banner banner-active';
            statusBanner.textContent = '📋 You have an active ticket.';
        } else if (pendingCount >= settings.maxActive) {
            statusBanner.className = 'banner banner-warn';
            statusBanner.textContent = `⏳ All ${settings.maxActive} ticket slots are full. Please wait.`;
        } else if (recentMine >= settings.maxPerStudent) {
            statusBanner.className = 'banner banner-warn';
            statusBanner.textContent = `⏳ You've used your ticket limit for this period.`;
        } else {
            statusBanner.className = 'banner banner-open';
            statusBanner.textContent = '✅ Tickets are open.';
        }

        const formInputDivs = form.querySelectorAll('form > div, .tag-wrapper');

        if (myTicket) {
            // Hide form fields, show active panel
            form.querySelectorAll('form > div').forEach(el => el.style.display = 'none');
            tagWrapper.style.display = 'none';
            submitBtn.style.display = 'none';
            errorMsg.textContent = '';
            activePanel.classList.remove('hidden');

            document.getElementById('active-ticket-info').textContent =
                `Reason: ${myTicket.reason}  ·  Teacher: ${myTicket.teacherName}`;

            const statusEl = document.getElementById('active-ticket-status');
            const statusMap = { pending: '🟡 Waiting for teacher…', accepted: '✅ Accepted — you may go!', denied: '❌ Ticket denied.' };
            statusEl.textContent = statusMap[myTicket.status] || '';
            statusEl.className = 'ticket-status-' + myTicket.status;

            document.getElementById('close-ticket-btn').onclick = () => {
                const all = getTickets();
                const idx = all.findIndex(t => t.id === myTicket.id);
                if (idx !== -1) { all[idx].status = 'closed'; saveTickets(all); }
                render();
            };
        } else {
            // Show form fields, hide active panel
            activePanel.classList.add('hidden');
            form.querySelectorAll('form > div').forEach(el => el.style.display = '');
            tagWrapper.style.display = '';

            const canSubmit = settings.ticketsOpen &&
                              pendingCount < settings.maxActive &&
                              recentMine < settings.maxPerStudent;
            submitBtn.style.display = canSubmit ? '' : 'none';
        }
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    form.addEventListener('submit', e => {
        e.preventDefault();
        const settings = getSettings();
        const tickets  = getTickets();
        const pendingCount = tickets.filter(t => t.status === 'pending').length;
        const windowMs = (settings.windowMinutes || 60) * 60 * 1000;
        const recentMine = tickets.filter(t => t.studentId === user.id && (Date.now() - t.createdAt) < windowMs).length;

        let err = null;

        if (!nameInput.value.trim()) {
            nameInput.parentElement.classList.add('apply-shake', 'incorrect');
            nameInput.parentElement.addEventListener('animationend', () => nameInput.parentElement.classList.remove('apply-shake'), { once: true });
            err = 'Name is required.';
        }
        if (!teacherInput.value.trim()) {
            teacherInput.parentElement.classList.add('apply-shake', 'incorrect');
            teacherInput.parentElement.addEventListener('animationend', () => teacherInput.parentElement.classList.remove('apply-shake'), { once: true });
            if (!err) err = 'Teacher name is required.';
        }
        if (!selectedReason && !err) err = 'Please select a reason.';
        if (!settings.ticketsOpen && !err) err = 'Tickets are currently closed.';
        if (pendingCount >= settings.maxActive && !err) err = 'All ticket slots are full.';
        if (recentMine >= settings.maxPerStudent && !err) err = 'You have reached your ticket limit.';

        if (err) { errorMsg.textContent = err; return; }

        const ticket = {
            id: crypto.randomUUID(),
            studentId:   user.id,
            studentName: nameInput.value.trim(),
            teacherName: teacherInput.value.trim(),
            reason:      selectedReason,
            status:      'pending',
            createdAt:   Date.now(),
        };

        tickets.push(ticket);
        saveTickets(tickets);
        render();
    });

    // Clear error styling on input
    [nameInput, teacherInput].forEach(inp => {
        inp.addEventListener('input', () => {
            inp.parentElement.classList.remove('incorrect');
            errorMsg.textContent = '';
        });
    });

    // Poll every 4s for teacher status changes
    setInterval(render, 4000);
    render();
});
