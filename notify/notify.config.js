/**
 * ┌─────────────────────────────────────────┐
 * │         NOTIFY — CONFIG FILE            │
 * │  Edit this file to customize globally   │
 * └─────────────────────────────────────────┘
 *
 * Drop the /notify folder anywhere in your project,
 * include notify.css and notify.js, done.
 */

const NotifyConfig = {

  // ─── POSITION ──────────────────────────────────────────────────
  // Where notifications appear on screen.
  // Options: "top-left" | "top-center" | "top-right"
  //          "bottom-left" | "bottom-center" | "bottom-right"
  position: "top-center",

  // ─── OFFSET ─────────────────────────────────────────────────────
  // Distance from the screen edge (px)
  offsetX: 24,
  offsetY: 24,

  // ─── STACKING ───────────────────────────────────────────────────
  // Gap between stacked notifications (px)
  stackGap: 12,

  // Maximum number of visible notifications at once.
  // Older ones are removed when limit is exceeded. 0 = unlimited.
  maxVisible: 5,

  // ─── DURATION ───────────────────────────────────────────────────
  // Default time before a notification auto-dismisses (ms).
  // Set to 0 to disable auto-dismiss globally.
  duration: 4000,

  // ─── ANIMATION ──────────────────────────────────────────────────
  // Slide-in animation direction.
  // "auto" follows position (e.g. right-side → slides from right)
  // Or force: "left" | "right" | "up" | "down"
  animationDirection: "auto",

  // Duration of enter/exit animation (ms)
  animationDuration: 320,

  // ─── PROGRESS BAR ───────────────────────────────────────────────
  // Show a countdown progress bar on timed notifications.
  showProgress: false,

  // ─── CLOSE BUTTON ───────────────────────────────────────────────
  showCloseButton: true,

  // ─── PAUSE ON HOVER ─────────────────────────────────────────────
  // Pause the auto-dismiss timer when the user hovers over a toast.
  pauseOnHover: false,

  // ─── ICONS ──────────────────────────────────────────────────────
  // Show type icons (success ✓, error ✕, warning !, info i)
  showIcons: true,

  // Custom SVG icons per type — set to null to use defaults
  icons: {
    success: null,
    error: null,
    warning: null,
    info: null,
    default: null,
  },

  // ─── APPEARANCE ─────────────────────────────────────────────────
  // Visual theme: "light" | "dark" | "auto" (follows prefers-color-scheme)
  theme: "light",

  // Border radius of each notification card (px)
  borderRadius: 4,

  // Min and max width of a notification (px)
  minWidth: 300,
  maxWidth: 420,

  // Show a colored left-accent border on each notification
  accentBorder: true,

  // Drop shadow intensity: "none" | "subtle" | "normal" | "strong"
  shadow: "strong",

  // ─── DUPLICATES ─────────────────────────────────────────────────
  // Prevent duplicate messages. If the same message is already visible,
  // it will shake/bump instead of spawning a new toast.
  preventDuplicates: false,

  // ─── Z-INDEX ────────────────────────────────────────────────────
  zIndex: 9999,

  // ─── SOUNDS (optional) ──────────────────────────────────────────
  // Paths to audio files to play on notification type (null = silent)
  sounds: {
    success: null,
    error: null,
    warning: null,
    info: null,
  },

  // ─── CALLBACKS ──────────────────────────────────────────────────
  // Global lifecycle hooks — called for every notification
  onShow:    (id, options) => {},
  onDismiss: (id, options) => {},
  onClick:   (id, options) => {},
};
