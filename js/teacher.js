// js/teacher.js — Teacher Dashboard
document.addEventListener('DOMContentLoaded', () => {

    //  Auth check 
    const KEY = CONFIG.STORAGE_PREFIX + 'currentUser';
    let currentUser = null;
    try { currentUser = JSON.parse(localStorage.getItem(KEY)); } catch {}

    if (!currentUser) { window.location.replace('login.html'); return; }
    if (currentUser.role !== 'teacher') { window.location.replace('index.html'); return; }

    STATE.currentUser = currentUser;

    //  Storage helpers 
    function getTickets()   { try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'tickets')) || []; } catch { return []; } }
    function saveTickets(t) { localStorage.setItem(CONFIG.STORAGE_PREFIX + 'tickets', JSON.stringify(t)); }
    function getSettings()  {
        try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'settings')) || defaultSettings(); }
        catch { return defaultSettings(); }
    }
    function saveSettings(s) { localStorage.setItem(CONFIG.STORAGE_PREFIX + 'settings', JSON.stringify(s)); }
    function defaultSettings() { return { ticketsOpen: true, maxActive: 5, maxPerStudent: 3, windowMinutes: 60 }; }

    //  Init UI 
    document.getElementById('teacher-name').textContent = currentUser.username;

    const tabTickets    = document.getElementById('tab-tickets');
    const tabSettings   = document.getElementById('tab-settings');
    const panelTickets  = document.getElementById('panel-tickets');
    const panelSettings = document.getElementById('panel-settings');

    function showTab(tab) {
        const isTickets = tab === 'tickets';
        tabTickets.classList.toggle('active', isTickets);
        tabSettings.classList.toggle('active', !isTickets);
        panelTickets.classList.toggle('hidden', !isTickets);
        panelSettings.classList.toggle('hidden', isTickets);
        if (isTickets) renderTickets(); else renderSettings();
    }

    tabTickets.addEventListener('click',  () => showTab('tickets'));
    tabSettings.addEventListener('click', () => showTab('settings'));

    document.getElementById('signout-btn').addEventListener('click', () => {
        localStorage.removeItem(KEY);
        window.location.replace('login.html');
    });

    //  Tickets 
    const ticketList = document.getElementById('ticket-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let activeFilter = 'pending';

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            renderTickets();
        });
    });

    function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function timeAgo(ts) {
        const s = Math.floor((Date.now() - ts) / 1000);
        if (s < 60)   return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s/60)}m ago`;
        return `${Math.floor(s/3600)}h ago`;
    }

    function badge(status) {
        const m = { pending: ['badge-pending','🟡 Pending'], accepted: ['badge-accepted','✅ Accepted'], denied: ['badge-denied','❌ Denied'], closed: ['badge-closed','⚫ Closed'] };
        const [cls, label] = m[status] || ['',''];
        return `<span class="badge ${cls}">${label}</span>`;
    }

    function renderTickets() {
        const tickets  = getTickets();
        const filtered = tickets
            .filter(t => activeFilter === 'all' || t.status === activeFilter)
            .sort((a, b) => b.createdAt - a.createdAt);

        document.getElementById('count-pending').textContent  = tickets.filter(t => t.status === 'pending').length;
        document.getElementById('count-accepted').textContent = tickets.filter(t => t.status === 'accepted').length;
        document.getElementById('count-denied').textContent   = tickets.filter(t => t.status === 'denied').length;
        document.getElementById('count-all').textContent      = tickets.length;

        if (!filtered.length) {
            ticketList.innerHTML = `<div class="empty-state">No ${activeFilter === 'all' ? '' : activeFilter + ' '}tickets.</div>`;
            return;
        }

        ticketList.innerHTML = filtered.map(t => `
            <div class="ticket-card status-${t.status}" data-id="${t.id}">
                <div class="ticket-header">
                    <span class="ticket-uuid" title="${t.id}">#${t.id.slice(0,8).toUpperCase()}</span>
                    ${badge(t.status)}
                    <span class="ticket-time">${timeAgo(t.createdAt)}</span>
                </div>
                <div class="ticket-body">
                    <div class="ticket-row"><span class="ticket-field-label">Student</span><span class="ticket-field-value">${esc(t.studentName)}</span></div>
                    <div class="ticket-row"><span class="ticket-field-label">Teacher</span><span class="ticket-field-value">${esc(t.teacherName)}</span></div>
                    <div class="ticket-row"><span class="ticket-field-label">Reason</span><span class="ticket-field-value reason-tag">${esc(t.reason)}</span></div>
                    <div class="ticket-row"><span class="ticket-field-label">Time</span><span class="ticket-field-value">${new Date(t.createdAt).toLocaleTimeString()}</span></div>
                </div>
                ${t.status === 'pending' ? `
                <div class="ticket-actions">
                    <button class="btn-accept" data-id="${t.id}">✓ Accept</button>
                    <button class="btn-deny"   data-id="${t.id}">✗ Deny</button>
                </div>` : ''}
            </div>`).join('');

        ticketList.querySelectorAll('.btn-accept').forEach(b => b.addEventListener('click', () => updateTicket(b.dataset.id, 'accepted')));
        ticketList.querySelectorAll('.btn-deny').forEach(b =>   b.addEventListener('click', () => updateTicket(b.dataset.id, 'denied')));
    }

    function updateTicket(id, status) {
        const tickets = getTickets();
        const idx = tickets.findIndex(t => t.id === id);
        if (idx !== -1) { tickets[idx].status = status; saveTickets(tickets); renderTickets(); }
    }

    //  Settings 
    function renderSettings() {
        const s = getSettings();
        document.getElementById('setting-tickets-open').checked     = !!s.ticketsOpen;
        document.getElementById('setting-max-active').value         = s.maxActive     || 5;
        document.getElementById('setting-max-per-student').value    = s.maxPerStudent || 3;
        document.getElementById('setting-window-minutes').value     = s.windowMinutes || 60;
    }

    document.getElementById('settings-form').addEventListener('submit', e => {
        e.preventDefault();
        saveSettings({
            ticketsOpen:   document.getElementById('setting-tickets-open').checked,
            maxActive:     parseInt(document.getElementById('setting-max-active').value)      || 5,
            maxPerStudent: parseInt(document.getElementById('setting-max-per-student').value) || 3,
            windowMinutes: parseInt(document.getElementById('setting-window-minutes').value)  || 60,
        });
        const saved = document.getElementById('settings-saved');
        saved.classList.remove('hidden');
        setTimeout(() => saved.classList.add('hidden'), 2000);
    });

    // Poll every 5s
    setInterval(() => { if (!panelTickets.classList.contains('hidden')) renderTickets(); }, 5000);

    // Boot
    showTab('tickets');
    renderSettings();
});
