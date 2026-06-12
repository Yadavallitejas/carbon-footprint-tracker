# Carbonly ─ Everyday Carbon Footprint Optimizer

Created for **PromptWars Challenge 3**.

Carbonly is a clean, lightweight, fully client-side web application built to help users track, understand, and reduce their daily personal carbon footprint.

---

## 👤 Persona: "The Everyday Optimizer"
Our target user is someone who:
- Wants to live more sustainably but feels overwhelmed by complex carbon calculators.
- Seeks real-time visual feedback on how small choices (meals, commutes, recycling) impact emissions.
- Is motivated by streaks, gamification (XP points, achievements), and actionable "what-if" simulations.

---

## 🛠️ Technology Stack
- **Framework**: React 19 + TypeScript (Scaffolded with Vite)
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide Icons
- **Persistence**: Client-side `localStorage` (No server or database required, zero hosting cost)
- **Size**: Under 10MB including setup configuration.

---

## 📂 Project Architecture
The codebase is structured into self-contained, modular directories:

```
/src
  ├── /components     # SVG-based interactive UI elements (ProgressRing, CarbonChart, Layout)
  ├── /data           # CO2 emission intensity constants & baseline thresholds (emissionFactors.ts)
  ├── /logic          # Carbon calculations & gamification models (carbonCalculator.ts, recommendationEngine.ts)
  ├── /pages          # Key application views (Dashboard, LogActivity, Insights, Settings)
  ├── /utils          # Client storage & date calendar formatting helpers (storage.ts, dateHelpers.ts)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
Clone this repository and run:
```bash
npm install
```

### Local Development
Start the local Vite dev server:
```bash
npm run dev
```

### Formatting & Code Quality
Run ESLint to check for code issues:
```bash
npm run lint
```

Format files using Prettier:
```bash
npx prettier --write .
```

### Production Build
Build a static web application optimized for deployment (e.g., Vercel, Netlify, or GitHub Pages):
```bash
npm run build
```
The production assets will be placed in the `/dist` directory.
