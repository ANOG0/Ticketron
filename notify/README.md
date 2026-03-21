# 🔔 Notify — Drop-in Toast Notification System

A zero-dependency, fully configurable notification/toast system.  
Drop one folder into your project, add two tags, done.

---

## Quick Start

```html
<!-- 1. Include the styles and scripts in order -->
<link rel="stylesheet" href="notify/notify.css" />
<script src="notify/notify.config.js"></script>
<script src="notify/notify.js"></script>

<!-- 2. Use anywhere in your JS -->
<script>
  Notify.success("File saved!");
  Notify.error("Something went wrong.");
  Notify.warning("Low disk space.", { title: "Warning" });
  Notify.info("New update available.", { duration: 8000 });
</script>
```

---

## API

### Shorthand methods
```js
Notify.success(message, options?)
Notify.error(message, options?)
Notify.warning(message, options?)
Notify.info(message, options?)
```

### Full control
```js
Notify.show({
  message:  "Your file was uploaded.",
  title:    "Success",               // optional heading
  type:     "success",               // success | error | warning | info | default
  duration: 5000,                    // ms, 0 = sticky
  actions: [                         // optional action buttons
    { label: "Undo",    onClick: () => undoAction(), primary: false },
    { label: "View",    onClick: () => openFile(),   primary: true  },
  ],
  onShow:    (id) => {},
  onDismiss: (id) => {},
  onClick:   (id) => {},
})
```

### Dismiss
```js
const id = Notify.success("Hello!");
Notify.dismiss(id);     // dismiss a specific toast
Notify.dismissAll();    // dismiss all toasts
```

### Runtime reconfigure
```js
Notify.configure({ position: "top-center", theme: "dark" });
```

---

## Config Reference (`notify.config.js`)

| Key                | Default          | Description |
|--------------------|------------------|-------------|
| `position`         | `"bottom-right"` | `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right` |
| `offsetX`          | `24`             | Distance from screen edge horizontally (px) |
| `offsetY`          | `24`             | Distance from screen edge vertically (px) |
| `stackGap`         | `12`             | Gap between stacked toasts (px) |
| `maxVisible`       | `5`              | Max toasts shown at once (0 = unlimited) |
| `duration`         | `4000`           | Auto-dismiss time in ms (0 = sticky) |
| `animationDirection` | `"auto"`       | `auto`, `left`, `right`, `up`, `down` |
| `animationDuration`| `320`            | Enter/exit animation speed (ms) |
| `showProgress`     | `true`           | Show countdown progress bar |
| `showCloseButton`  | `true`           | Show × button |
| `pauseOnHover`     | `true`           | Pause timer on hover |
| `showIcons`        | `true`           | Show type icons |
| `theme`            | `"auto"`         | `light`, `dark`, `auto` |
| `borderRadius`     | `12`             | Card border radius (px) |
| `minWidth`         | `300`            | Min toast width (px) |
| `maxWidth`         | `420`            | Max toast width (px) |
| `accentBorder`     | `true`           | Colored left accent border |
| `shadow`           | `"normal"`       | `none`, `subtle`, `normal`, `strong` |
| `preventDuplicates`| `true`           | Shake instead of duplicating |
| `zIndex`           | `9999`           | CSS z-index |
| `sounds`           | `{}`             | Paths to audio files per type |
| `onShow`           | `() => {}`       | Global callback when any toast shows |
| `onDismiss`        | `() => {}`       | Global callback when any toast dismisses |
| `onClick`          | `() => {}`       | Global callback when any toast is clicked |

---

## Folder Structure

```
notify/
├── notify.config.js   ← Edit this to configure globally
├── notify.css         ← Styles (don't edit unless customizing)
├── notify.js          ← Core engine (don't edit)
└── README.md          ← This file
```

---

## Notes

- **No dependencies** — pure HTML/CSS/JS, no frameworks required
- **Toasts push, never overlap** — smooth stacking with CSS transitions
- **Responsive** — collapses to full-width bar on mobile
- **Accessible** — uses `aria-live` regions and semantic roles
- **Themeable** — light/dark/auto via `prefers-color-scheme`
