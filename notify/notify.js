/**
 * ═══════════════════════════════════════════════════════
 * NOTIFY.JS  —  Drop-in Notification / Toast System
 * ═══════════════════════════════════════════════════════
 *
 * Usage:
 *   Notify.success("Saved!")
 *   Notify.error("Something went wrong", { title: "Error" })
 *   Notify.show({ message: "Hello", type: "info", duration: 6000 })
 *   Notify.dismiss(id)
 *   Notify.dismissAll()
 *
 * Requires: notify.config.js loaded before this file.
 */

(function (global) {
  'use strict';

  // ── Merge config with defaults ─────────────────────────
  const defaults = {
    position: 'bottom-right',
    offsetX: 24,
    offsetY: 24,
    stackGap: 12,
    maxVisible: 5,
    duration: 4000,
    animationDirection: 'auto',
    animationDuration: 320,
    showProgress: true,
    showCloseButton: true,
    pauseOnHover: true,
    showIcons: true,
    icons: { success: null, error: null, warning: null, info: null, default: null },
    theme: 'auto',
    borderRadius: 12,
    minWidth: 300,
    maxWidth: 420,
    accentBorder: true,
    shadow: 'normal',
    preventDuplicates: true,
    zIndex: 9999,
    sounds: { success: null, error: null, warning: null, info: null },
    onShow: () => {},
    onDismiss: () => {},
    onClick: () => {},
  };

  const cfg = Object.assign({}, defaults, typeof NotifyConfig !== 'undefined' ? NotifyConfig : {});

  // ── State ──────────────────────────────────────────────
  let container = null;
  let toasts = [];
  let idCounter = 0;

  // ── Icons ──────────────────────────────────────────────
  const defaultIcons = {
    success: `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    warning: `<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info:    `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    default: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  const closeIcon = `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  // ── Get slide direction from position ─────────────────
  function getSlideDirection(position) {
    if (cfg.animationDirection !== 'auto') return cfg.animationDirection;
    if (position.includes('right'))  return 'right';
    if (position.includes('left'))   return 'left';
    if (position.includes('top'))    return 'up';
    return 'down';
  }

  // ── Create / ensure container ─────────────────────────
  function getContainer() {
    if (container) return container;

    container = document.createElement('div');
    container.className = 'notify-container';
    container.setAttribute('data-pos', cfg.position);
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Notifications');

    // Apply theme
    if (cfg.theme !== 'auto') {
      document.documentElement.setAttribute('data-notify-theme', cfg.theme);
    }

    // CSS variable overrides from config
    container.style.setProperty('--notify-z', cfg.zIndex);
    container.style.setProperty('--notify-radius', cfg.borderRadius + 'px');
    container.style.setProperty('--notify-min-w', cfg.minWidth + 'px');
    container.style.setProperty('--notify-max-w', cfg.maxWidth + 'px');
    container.style.setProperty('--notify-anim-dur', cfg.animationDuration + 'ms');

    // Position
    applyPosition(container, cfg.position);

    document.body.appendChild(container);
    return container;
  }

  function applyPosition(el, position) {
    el.style.position = 'fixed';
    el.style.margin = '0';

    const [v, h] = position.split('-');

    // Vertical
    if (v === 'top')    { el.style.top = cfg.offsetY + 'px'; el.style.bottom = 'auto'; }
    else                { el.style.bottom = cfg.offsetY + 'px'; el.style.top = 'auto'; }

    // Horizontal
    if (h === 'left')   { el.style.left = cfg.offsetX + 'px'; el.style.right = 'auto'; el.style.alignItems = 'flex-start'; }
    else if (h === 'right') { el.style.right = cfg.offsetX + 'px'; el.style.left = 'auto'; el.style.alignItems = 'flex-end'; }
    else {
      // center
      el.style.left = '50%';
      el.style.right = 'auto';
      el.style.transform = 'translateX(-50%)';
      el.style.alignItems = 'center';
    }
  }

  // ── Build toast DOM ───────────────────────────────────
  function buildToast(options) {
    const { id, type, title, message, duration, actions } = options;
    const slideDir = getSlideDirection(cfg.position);

    const toast = document.createElement('div');
    toast.className = 'notify-toast notify-entering';
    toast.setAttribute('data-id', id);
    toast.setAttribute('data-type', type);
    toast.setAttribute('data-slide', slideDir);
    toast.setAttribute('data-shadow', cfg.shadow);
    toast.setAttribute('data-accent', cfg.accentBorder ? 'true' : 'false');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.style.marginBottom = cfg.stackGap + 'px';

    // Icon
    if (cfg.showIcons) {
      const iconEl = document.createElement('div');
      iconEl.className = 'notify-icon';
      iconEl.innerHTML = (cfg.icons[type] || defaultIcons[type] || defaultIcons.default);
      toast.appendChild(iconEl);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'notify-body';

    if (title) {
      const titleEl = document.createElement('p');
      titleEl.className = 'notify-title';
      titleEl.textContent = title;
      body.appendChild(titleEl);
    }

    if (message) {
      const msgEl = document.createElement('p');
      msgEl.className = 'notify-message';
      msgEl.textContent = message;
      body.appendChild(msgEl);
    }

    // Action buttons
    if (actions && actions.length) {
      const actionsEl = document.createElement('div');
      actionsEl.className = 'notify-actions';
      actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'notify-action-btn' + (action.primary ? ' notify-action-primary' : '');
        btn.textContent = action.label;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          action.onClick && action.onClick(id);
          if (action.dismiss !== false) dismiss(id);
        });
        actionsEl.appendChild(btn);
      });
      body.appendChild(actionsEl);
    }

    toast.appendChild(body);

    // Close button
    if (cfg.showCloseButton) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'notify-close';
      closeBtn.innerHTML = closeIcon;
      closeBtn.setAttribute('aria-label', 'Dismiss notification');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismiss(id);
      });
      toast.appendChild(closeBtn);
    }

    // Progress bar
    if (cfg.showProgress && duration > 0) {
      const prog = document.createElement('div');
      prog.className = 'notify-progress';
      const fill = document.createElement('div');
      fill.className = 'notify-progress-fill';
      fill.style.transition = `transform ${duration}ms linear`;
      prog.appendChild(fill);
      toast.appendChild(prog);
    }

    // Click handler
    toast.addEventListener('click', () => {
      cfg.onClick(id, options);
      if (options.onClick) options.onClick(id);
    });

    return toast;
  }

  // ── Timer logic ───────────────────────────────────────
  function startTimer(toastObj) {
    const { id, options, el } = toastObj;
    const duration = options.duration;
    if (!duration || duration <= 0) return;

    const fill = el.querySelector('.notify-progress-fill');

    toastObj._startTime = Date.now();
    toastObj._remaining = duration;

    function run(remaining) {
      if (fill) {
        fill.style.transitionDuration = remaining + 'ms';
        // force reflow
        fill.getBoundingClientRect();
        fill.style.transform = 'scaleX(0)';
      }
      toastObj._timer = setTimeout(() => dismiss(id), remaining);
    }

    run(toastObj._remaining);

    if (cfg.pauseOnHover) {
      el.addEventListener('mouseenter', () => {
        clearTimeout(toastObj._timer);
        toastObj._remaining -= Date.now() - toastObj._startTime;
        if (fill) {
          const computed = getComputedStyle(fill).transform;
          fill.style.transitionDuration = '0ms';
          fill.style.transform = computed;
        }
      });

      el.addEventListener('mouseleave', () => {
        toastObj._startTime = Date.now();
        run(Math.max(0, toastObj._remaining));
      });
    }
  }

  // ── Play sound ────────────────────────────────────────
  function playSound(type) {
    const src = cfg.sounds[type];
    if (!src) return;
    try {
      const audio = new Audio(src);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  // ── Dismiss ───────────────────────────────────────────
  function dismiss(id) {
    const idx = toasts.findIndex(t => t.id === id);
    if (idx === -1) return;

    const toastObj = toasts[idx];
    const el = toastObj.el;
    clearTimeout(toastObj._timer);

    el.classList.remove('notify-visible');
    el.classList.add('notify-exiting');
    el.style.marginBottom = '0';
    el.style.maxHeight = el.offsetHeight + 'px';

    cfg.onDismiss(id, toastObj.options);
    if (toastObj.options.onDismiss) toastObj.options.onDismiss(id);

    const dur = 200;
    setTimeout(() => {
      el.style.maxHeight = '0';
      el.style.padding = '0';
      el.style.border = '0';
    }, 0);

    setTimeout(() => {
      el.remove();
      toasts.splice(idx, 1);
    }, dur + cfg.animationDuration);
  }

  function dismissAll() {
    [...toasts].forEach(t => dismiss(t.id));
  }

  // ── Show ──────────────────────────────────────────────
  function show(options) {
    // Normalize options
    if (typeof options === 'string') options = { message: options };

    options = Object.assign({
      type: 'default',
      duration: cfg.duration,
    }, options);

    const id = ++idCounter;
    options._id = id;

    // Prevent duplicates
    if (cfg.preventDuplicates) {
      const dup = toasts.find(t =>
        t.options.message === options.message &&
        t.options.title === options.title &&
        t.options.type === options.type
      );
      if (dup) {
        dup.el.classList.remove('notify-shake');
        void dup.el.offsetWidth; // reflow
        dup.el.classList.add('notify-shake');
        return dup.id;
      }
    }

    // Max visible — dismiss oldest
    if (cfg.maxVisible > 0 && toasts.length >= cfg.maxVisible) {
      const oldest = cfg.position.startsWith('bottom')
        ? toasts[toasts.length - 1]
        : toasts[0];
      if (oldest) dismiss(oldest.id);
    }

    const cont = getContainer();
    const el = buildToast({ id, ...options });

    const toastObj = { id, el, options };
    toasts.push(toastObj);

    cont.appendChild(el);

    // Animate in on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.remove('notify-entering');
        el.classList.add('notify-visible');
      });
    });

    // Start auto-dismiss timer
    startTimer(toastObj);

    // Play sound
    playSound(options.type);

    // Callback
    cfg.onShow(id, options);
    if (options.onShow) options.onShow(id);

    return id;
  }

  // ── Shorthand methods ─────────────────────────────────
  function success(message, options) {
    return show(Object.assign({ message, type: 'success' }, typeof options === 'object' ? options : {}));
  }

  function error(message, options) {
    return show(Object.assign({ message, type: 'error' }, typeof options === 'object' ? options : {}));
  }

  function warning(message, options) {
    return show(Object.assign({ message, type: 'warning' }, typeof options === 'object' ? options : {}));
  }

  function info(message, options) {
    return show(Object.assign({ message, type: 'info' }, typeof options === 'object' ? options : {}));
  }

  // ── Update config at runtime ──────────────────────────
  function configure(newCfg) {
    Object.assign(cfg, newCfg);
    if (container) {
      container.setAttribute('data-pos', cfg.position);
      applyPosition(container, cfg.position);
      container.style.setProperty('--notify-z', cfg.zIndex);
      container.style.setProperty('--notify-radius', cfg.borderRadius + 'px');
      container.style.setProperty('--notify-min-w', cfg.minWidth + 'px');
      container.style.setProperty('--notify-max-w', cfg.maxWidth + 'px');
    }
  }

  // ── Public API ────────────────────────────────────────
  const Notify = {
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
    configure,
    get count() { return toasts.length; },
    get ids() { return toasts.map(t => t.id); },
  };

  // Expose globally
  global.Notify = Notify;

})(window);
