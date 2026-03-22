# COSMOS — Frontend Architecture Reference

## Framework
Next.js 14 App Router, React 18, TypeScript

## Directory Structure
```
apps/web/
  app/                  # App Router pages
    (auth)/             # Auth group (login, register)
    (dashboard)/        # Dashboard group
    chart/              # Chart creation + display
    layout.tsx          # Root layout
    page.tsx            # Homepage
  components/           # App-specific components
    ChartWheel.tsx      # D3.js SVG chart rendering
    PlanetTable.tsx     # Planet positions table
    Providers.tsx       # Context providers wrapper
  lib/
    api.ts              # API client functions
    store.ts            # Zustand auth store
```

## State Management
- **Server state:** TanStack Query (data fetching, caching, mutations)
- **Client state:** Zustand (auth tokens, UI state)
- **Form state:** React Hook Form + Zod validation
- **Server Components:** Use where possible (data fetching, static content)
- **Client Components:** For interactivity (forms, charts, auth state)

## Styling
- Tailwind CSS with custom cosmos theme
- Dark mode via `class` strategy
- Mobile-first responsive design
- Custom colors: celestial blues, golds, deep purples

## Chart Rendering
- D3.js for SVG natal wheel
- Layered: zodiac ring → house divisions → planet glyphs → aspect lines
- Ascendant oriented at 9 o'clock (left)
- Element-colored sign glyphs
- Retrograde indicators

## Forms
- React Hook Form for form state
- Zod schemas from @cosmos/types for validation
- Debounced geocoding autocomplete for location

## Loading/Error States
- Skeleton components for async loading
- Error boundaries with retry functionality
- Loading spinners from @cosmos/ui

## Accessibility
- ARIA labels on chart SVG elements
- Keyboard navigation for forms
- Screen reader support: PlanetTable provides text data alongside visual chart
- Sufficient color contrast in dark mode
