# Overlay Components Guide

This guide documents best practices for implementing overlay components (modals, drawers, toasts, popovers) in this project.

## Key Principles

### 1. Always Use React Portal

All overlay components MUST use React Portal to render directly to `document.body`. This prevents:
- Parent container clipping (`overflow: hidden`)
- Z-index stacking issues
- Positioning conflicts with nested layouts

### 2. Use Inline Styles for Critical Positioning

For portal-rendered elements, use **inline styles** for:
- `position: fixed`
- `top`, `right`, `bottom`, `left` positioning
- `zIndex` values

Tailwind classes may not apply correctly to portal-rendered elements in some cases.

## Implementation Pattern

```tsx
'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function OverlayComponent({ children, isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  // Ensure client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0"
      style={{ zIndex: 9999 }} // Use inline style for z-index
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>,
    document.body
  );
}
```

## Component Types & Positioning

### Toast Notifications
**Position:** Fixed bottom-right corner

```tsx
style={{
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  zIndex: 9999
}}
```

**Reference:** See `/src/contexts/ToastContext.tsx` for working implementation

### Modals (Center Screen)
**Position:** Fixed center with backdrop

```tsx
<div
  className="fixed inset-0 flex items-center justify-center"
  style={{ zIndex: 9999 }}
>
  <div className="absolute inset-0 bg-black/50" /> {/* Backdrop */}
  <div className="relative bg-white rounded-lg p-6 max-w-lg">
    {/* Modal content */}
  </div>
</div>
```

### Side Drawers (Right/Left)
**Position:** Fixed edge with slide animation

```tsx
// Right drawer
<div
  className="fixed top-0 bottom-0 w-[400px] bg-white shadow-xl"
  style={{
    right: 0,
    zIndex: 9999,
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 300ms ease-out'
  }}
>
  {/* Drawer content */}
</div>

// Left drawer - use left: 0 and translateX(-100%)
```

### Popovers & Dropdowns
**Position:** Absolute to trigger element (may need dynamic positioning)

```tsx
<div
  className="absolute bg-white rounded-lg shadow-lg"
  style={{
    top: triggerRect.bottom + 8,
    left: triggerRect.left,
    zIndex: 9999
  }}
>
  {/* Popover content */}
</div>
```

## Common Pitfalls & Solutions

### Problem: Overlay not visible
**Solution:** Check that:
1. You're using `createPortal(element, document.body)`
2. Z-index is set via inline style (not just Tailwind)
3. Position is `fixed` (not `absolute`)

### Problem: Duplicate renders in development
**Solution:** Use a ref to track state:
```tsx
const handledRef = useRef(false);

useEffect(() => {
  if (!handledRef.current) {
    handledRef.current = true;
    // Your logic here
  }
}, [dependency]);
```

### Problem: Animation timing issues
**Solution:** Separate mount state from visibility state:
```tsx
const [mounted, setMounted] = useState(false);
const [visible, setVisible] = useState(false);

useEffect(() => {
  setMounted(true);
  setTimeout(() => setVisible(true), 10); // Trigger animation
}, []);
```

## Z-Index Scale

Use these z-index values for consistency:
- **Base content:** 0-10
- **Sticky headers:** 100-200
- **Dropdowns/Popovers:** 1000
- **Side drawers:** 5000
- **Modals:** 9000
- **Toasts:** 9999

## Accessibility Considerations

### Modal/Drawer Focus Management
```tsx
useEffect(() => {
  if (isOpen) {
    // Trap focus inside modal
    const previousFocus = document.activeElement;

    return () => {
      // Restore focus when closed
      previousFocus?.focus();
    };
  }
}, [isOpen]);
```

### ARIA Attributes
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Modal Title</h2>
  <p id="modal-description">Modal description</p>
</div>
```

### Escape Key Handling
```tsx
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  if (isOpen) {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }
}, [isOpen, onClose]);
```

## Body Scroll Lock

Prevent background scrolling when overlay is open:

```tsx
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }
}, [isOpen]);
```

## Testing Checklist

When implementing a new overlay component:
- [ ] Renders via React Portal to `document.body`
- [ ] Uses inline styles for position and z-index
- [ ] Only renders client-side (check `mounted` state)
- [ ] Handles open/close animations smoothly
- [ ] Prevents duplicate renders with refs if needed
- [ ] Includes backdrop/overlay for modals
- [ ] Handles escape key to close
- [ ] Manages focus correctly
- [ ] Locks body scroll when open
- [ ] Works on mobile and desktop
- [ ] Has proper ARIA attributes

## Related Files

- **Toast Implementation:** `/src/contexts/ToastContext.tsx`
- **Toast Component:** `/src/design-system/components/Toast.tsx`
- **Providers Setup:** `/src/components/Providers.tsx`
- **Root Layout:** `/src/app/layout.tsx`

---

**Last Updated:** 2025-10-09
**Note:** This guide is based on lessons learned from implementing the Toast notification system.
