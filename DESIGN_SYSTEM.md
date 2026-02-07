# OnTrip Design System - Quick Reference

**Based on:** MindConnect reference site  
**Last Updated:** 2026-02-07

---

## Color Tokens

### Primary Colors
```css
primary-600: #4f46e5    /* Main brand color - buttons, links, accents */
primary-700: #4338ca    /* Hover states */
primary-100: #ecf3ff    /* Light backgrounds */
secondary:   #6366f1    /* Secondary accents */
```

### Neutral Palette
```css
neutral-50:  #f9fafb    /* Page background */
neutral-100: #f3f4f6    /* Subtle backgrounds */
neutral-200: #e5e7eb    /* Borders */
neutral-300: #d1d5db    /* Dividers */
neutral-600: #4b5563    /* Muted text */
neutral-700: #374151    /* Body text */
neutral-800: #1f2937    /* Dark text */
neutral-900: #111827    /* Headings */
```

### Semantic Colors
```css
success: #10b981    /* Green - success states */
warning: #f59e0b    /* Amber - warnings */
error:   #ef4444    /* Red - errors */
accent:  #f472b6    /* Pink - special accents */
```

---

## Typography

### Font Family
```css
font-family: 'Outfit', sans-serif;
```

### Font Weights
- **300** - Light
- **400** - Regular (body text)
- **500** - Medium
- **600** - Semibold (buttons)
- **700** - Bold (subheadings)
- **800** - Extrabold (main headings)

### Scale
```css
/* Page Title (h1) */
text-5xl font-extrabold text-neutral-900 tracking-tight
/* 3rem / 48px */

/* Section Title (h2) */
text-4xl font-extrabold text-neutral-900 tracking-tight
/* 2.25rem / 36px */

/* Subsection (h3) */
text-2xl font-bold text-neutral-900
/* 1.5rem / 24px */

/* Body Large */
text-xl text-neutral-600
/* 1.25rem / 20px */

/* Body */
text-base text-neutral-700
/* 1rem / 16px */

/* Small */
text-sm text-neutral-600
/* 0.875rem / 14px */

/* Extra Small */
text-xs text-neutral-500
/* 0.75rem / 12px */
```

---

## Spacing

### Section Padding
```css
py-section    /* 6rem vertical (96px) */
```

### Container
```css
container     /* max-w-container (1100px) + px-6 */
```

### Common Gaps
```css
gap-2   /* 0.5rem / 8px */
gap-4   /* 1rem / 16px */
gap-6   /* 1.5rem / 24px */
gap-8   /* 2rem / 32px */
gap-12  /* 3rem / 48px */
```

---

## Shadows

```css
shadow-sm    /* 0 1px 2px 0 rgb(0 0 0 / 0.05) */
shadow-md    /* 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) */
shadow-lg    /* 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) */
shadow-xl    /* 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) */

shadow-card        /* md */
shadow-card-hover  /* lg */
```

---

## Border Radius

```css
rounded-2xl   /* 1rem / 16px - buttons, inputs */
rounded-3xl   /* 1.5rem / 24px - cards */
```

---

## Component Classes

### Glass Card
```tsx
<div className="card">
  {/* Content */}
</div>

/* Expands to: */
/* glass rounded-3xl shadow-card */
/* Hover: shadow-card-hover -translate-y-0.5 transition-all duration-200 */
```

### Primary Button
```tsx
<button className="btn-primary">
  Click Me
</button>

/* Expands to: */
/* bg-primary-600 hover:bg-primary-700 text-white */
/* px-8 py-4 rounded-2xl shadow-md */
/* transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 */
/* font-semibold */
```

### Input Field
```tsx
<input className="input-field" />

/* Expands to: */
/* glass border border-neutral-200 rounded-2xl */
/* px-5 py-3.5 */
/* focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 */
/* transition-all */
```

### Container
```tsx
<div className="container">
  {/* Content */}
</div>

/* Expands to: */
/* max-w-container mx-auto px-6 w-full */
```

### Section Title
```tsx
<h2 className="section-title">
  Section Heading
</h2>

/* Expands to: */
/* text-4xl font-extrabold text-center mb-12 */
/* tracking-tight text-neutral-900 */
```

---

## Animations

### Fade In
```tsx
<div className="animate-fade-in">
  {/* Content */}
</div>

/* 0.6s ease-out */
/* 0% { opacity: 0 } → 100% { opacity: 1 } */
```

### Slide Up
```tsx
<div className="animate-slide-up">
  {/* Content */}
</div>

/* 0.6s ease-out */
/* 0% { translateY(8px), opacity: 0 } */
/* 100% { translateY(0), opacity: 1 } */
```

### Hover Lift
```tsx
<div className="hover:-translate-y-0.5 transition-all duration-200">
  {/* Content */}
</div>
```

---

## Common Patterns

### Page Layout
```tsx
<div className="container max-w-4xl py-12">
  <h1 className="text-4xl font-extrabold mb-8 text-neutral-900 tracking-tight">
    Page Title
  </h1>
  {/* Content */}
</div>
```

### Section with Cards
```tsx
<section className="container py-section">
  <h2 className="section-title">Section Title</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="card p-8">
      {/* Card content */}
    </div>
  </div>
</section>
```

### Link Styling
```tsx
<a 
  href="/path"
  className="text-primary-600 hover:text-primary-700 transition-colors"
>
  Link Text →
</a>
```

### Form Group
```tsx
<div>
  <label className="block text-sm font-medium text-neutral-700 mb-2">
    Label
  </label>
  <input 
    type="text"
    className="input-field w-full"
    placeholder="Placeholder"
  />
</div>
```

---

## Responsive Breakpoints

```css
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Small desktops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large screens */
```

### Container Behavior
- **Mobile (<640px):** Full width with px-6 padding
- **Tablet-Desktop:** Centers with max-width 1100px

---

## Background System

### Body Background
```css
/* Dual radial gradient overlay */
background: radial-gradient(circle at top left, #f3e8ff 0%, transparent 40%),
            radial-gradient(circle at top right, #e0f2fe 0%, transparent 40%),
            #f9fafb;
background-attachment: fixed;
```

### Glass Morphism
```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.3);
```

---

## Usage Examples

### Hero Section
```tsx
<section className="py-section animate-fade-in">
  <div className="container max-w-4xl text-center">
    <h1 className="text-5xl font-extrabold mb-6 text-neutral-900 tracking-tight">
      Hero Title
    </h1>
    <p className="text-xl text-neutral-600 mb-12 leading-relaxed">
      Hero description text
    </p>
  </div>
</section>
```

### Feature Cards
```tsx
<section className="container py-section">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="card p-8 text-center">
      <div className="text-4xl font-bold text-primary-600 mb-3">✓</div>
      <h3 className="font-semibold text-neutral-900 mb-3">Feature Title</h3>
      <p className="text-neutral-600 text-sm leading-relaxed">
        Feature description
      </p>
    </div>
  </div>
</section>
```

### Content Card
```tsx
<div className="card p-10">
  <h2 className="text-3xl font-bold mb-6 text-neutral-900">
    Card Title
  </h2>
  <p className="text-neutral-700 leading-relaxed">
    Card content
  </p>
</div>
```

---

## Color Usage Guidelines

| Element | Color Token | Example |
|---------|-------------|---------|
| Page headings | `text-neutral-900` | `<h1 className="text-neutral-900">` |
| Section headings | `text-neutral-900` | `<h2 className="text-neutral-900">` |
| Body text | `text-neutral-700` | `<p className="text-neutral-700">` |
| Muted text | `text-neutral-600` | `<span className="text-neutral-600">` |
| Placeholder | `text-neutral-500` | `<div className="text-neutral-500">` |
| Borders | `border-neutral-200` | `<div className="border-neutral-200">` |
| Backgrounds | `bg-neutral-50` | `<div className="bg-neutral-50">` |
| Primary CTA | `bg-primary-600` | `<button className="bg-primary-600">` |
| Links | `text-primary-600` | `<a className="text-primary-600">` |
| Success | `text-success` | `<span className="text-success">` |
| Warning | `text-warning` | `<span className="text-warning">` |
| Error | `text-error` | `<span className="text-error">` |

---

## Accessibility Notes

- All color combinations meet WCAG AA contrast requirements
- Focus states use `ring-2 ring-primary-600/20`
- Interactive elements have visible hover states
- Animations respect `prefers-reduced-motion`
