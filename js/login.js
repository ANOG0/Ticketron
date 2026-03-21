// js/login.js
document.addEventListener('DOMContentLoaded', () => {

    const KEY = CONFIG.STORAGE_PREFIX + 'currentUser';

    function getStoredUser() {
        try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
    }
    function getUsers() {
        try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'users')) || []; } catch { return []; }
    }
    function saveUsers(u)       { localStorage.setItem(CONFIG.STORAGE_PREFIX + 'users', JSON.stringify(u)); }
    function saveCurrentUser(u) { localStorage.setItem(KEY, JSON.stringify(u)); }

    function goToRole(user) {
        window.location.replace(user.role === 'teacher' ? 'teacher.html' : 'index.html');
    }

    // If already logged in, go to the right page — done, no further logic
    const existing = getStoredUser();
    if (existing && existing.role) { goToRole(existing); return; }

    //  Elements 
    const loginForm     = document.getElementById('login-form');
    const registerForm  = document.getElementById('register-form');
    const registerBtn   = document.getElementById('register-btn');
    const backBtn       = document.getElementById('back-btn');
    const overlay       = document.getElementById('register-overlay');
    const overlayPanel  = overlay.querySelector('.overlay-panel');

    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const loginError    = document.getElementById('login-error');

    const regUsername   = document.getElementById('reg-username');
    const regPassword   = document.getElementById('reg-password');
    const regConfirm    = document.getElementById('reg-confirm');
    const registerError = document.getElementById('register-error');
    const roleToggle    = document.getElementById('role-toggle');
    const roleLabel     = document.getElementById('role-label');

    //  Role toggle 
    roleToggle.addEventListener('change', () => {
        roleLabel.textContent = roleToggle.checked ? 'Teacher Account' : 'Student Account';
    });

    //  Field helpers 
    function fieldError(wrapId, on) {
        const el = document.getElementById(wrapId);
        if (!el) return;
        if (on) {
            el.classList.add('incorrect', 'apply-shake');
            el.addEventListener('animationend', () => el.classList.remove('apply-shake'), { once: true });
        } else {
            el.classList.remove('incorrect');
        }
    }

    function clearOn(input, wrapId, errEl) {
        input.addEventListener('input', () => {
            document.getElementById(wrapId)?.classList.remove('incorrect');
            errEl.textContent = '';
        });
    }

    clearOn(usernameInput, 'username-wrap', loginError);
    clearOn(passwordInput, 'password-wrap', loginError);
    clearOn(regUsername,   'reg-username-wrap', registerError);
    clearOn(regPassword,   'reg-password-wrap', registerError);
    clearOn(regConfirm,    'reg-confirm-wrap',  registerError);

    //  Login 
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username) { fieldError('username-wrap', true); loginError.textContent = 'Please fill in all fields.'; return; }
        if (!password) { fieldError('password-wrap', true); loginError.textContent = 'Please fill in all fields.'; return; }

        const user = getUsers().find(u => u.username === username && u.password === password);
        if (!user) {
            fieldError('username-wrap', true);
            fieldError('password-wrap', true);
            loginError.textContent = 'Incorrect username or password.';
            return;
        }

        saveCurrentUser(user);
        goToRole(user);
    });

    //  Register overlay 
    registerBtn.addEventListener('click', () => {
        overlay.classList.remove('hidden');
        overlayPanel.classList.remove('leaving');
        overlayPanel.classList.add('entering');
        overlayPanel.addEventListener('animationend', () => overlayPanel.classList.remove('entering'), { once: true });
    });

    backBtn.addEventListener('click', closeOverlay);

    function closeOverlay() {
        overlayPanel.classList.add('leaving');
        overlayPanel.addEventListener('animationend', () => {
            overlayPanel.classList.remove('leaving');
            overlay.classList.add('hidden');
            registerError.textContent = '';
        }, { once: true });
    }

    //  Register 
    registerForm.addEventListener('submit', e => {
        e.preventDefault();
        const username = regUsername.value.trim();
        const password = regPassword.value;
        const confirm  = regConfirm.value;
        const role     = roleToggle.checked ? 'teacher' : 'student';
        const { USERNAME_MIN, USERNAME_MAX, USERNAME_PATTERN, PASSWORD_PATTERN } = CONFIG.VALIDATION;

        let err = null;
        function fail(wrapId, msg) { fieldError(wrapId, true); if (!err) err = msg; }

        if (!username)                                        fail('reg-username-wrap', 'Username is required.');
        else if (username.length < USERNAME_MIN || username.length > USERNAME_MAX)
                                                              fail('reg-username-wrap', `Username must be ${USERNAME_MIN}–${USERNAME_MAX} characters.`);
        else if (!USERNAME_PATTERN.test(username))            fail('reg-username-wrap', 'Letters and numbers only.');

        if (!password)                                        fail('reg-password-wrap', 'Password is required.');
        else if (!PASSWORD_PATTERN.test(password))            fail('reg-password-wrap', 'Password needs a letter and a number.');

        if (password && confirm !== password)                 fail('reg-confirm-wrap',  'Passwords do not match.');

        if (err) { registerError.textContent = err; return; }

        const users = getUsers();
        if (users.find(u => u.username === username)) {
            fieldError('reg-username-wrap', true);
            registerError.textContent = 'Username already taken.';
            return;
        }

        const newUser = {
            id: crypto.randomUUID(),
            username, password, role,
            memberType: role === 'teacher' ? CONFIG.MEMBER_TYPES.DEVELOPER : CONFIG.MEMBER_TYPES.FREE,
            createdAt: Date.now(),
        };

        users.push(newUser);
        saveUsers(users);
        saveCurrentUser(newUser);
        goToRole(newUser);
    });
});
