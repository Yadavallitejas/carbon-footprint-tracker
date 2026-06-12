# Carbon Footprint Awareness Platform

Carbonly is a clean, lightweight, fully client-side web application designed to help users track, understand, and reduce their daily personal carbon footprint. Built for the **PromptWars Challenge 3**, it operates entirely in the browser, requiring no backend or databases.

---

## Chosen Vertical / Persona
This project targets **"The Everyday Optimizer"** vertical. This persona represents an environmentally conscious individual who is motivated to reduce their carbon footprint but is often overwhelmed by complex, scientific carbon calculators that require obscure utility bill details or extensive questionnaires.

### Why This Vertical Was Chosen:
- **Action-Oriented Focus**: The Everyday Optimizer values small, manageable daily habits over large-scale, intimidating goals.
- **Immediate Feedback Loop**: They need a friction-free logging experience that gives instantaneous visual feedback on the impact of simple choices (e.g., opting for a vegetarian lunch or riding the train).
- **Gamified Motivation**: They are motivated by incremental progress markers like daily streaks, customizable targets, and gamified XP/Achievements.
- **Privacy First**: They prefer their daily schedules and lifestyle choices to remain strictly private and stored locally.

---

## Approach & Logic

Carbonly relies on an intuitive client-side calculation and recommendation engine to translate daily activities into CO₂ equivalents and suggest carbon-reduction paths:

### 1. Carbon Calculation Engine
Every logged action calculates emissions using realistic global averages (in kg CO₂e) compiled from public IPCC, UNEP, and regional EPA grid databases:
- **Transport**: Computes carbon based on travel distance in kilometers (or converted miles).
  - *Petrol Car*: ~0.18 kg/km (global internal combustion average).
  - *Diesel Car*: ~0.17 kg/km.
  - *Electric Vehicle (EV)*: ~0.05 kg/km (reflecting global grid averages for charging).
  - *Public Bus*: ~0.08 kg/km.
  - *Train/Metro*: ~0.03 kg/km.
  - *Bicycle/Walking*: 0.00 kg/km.
  - *Short-Haul Flight*: ~0.15 kg/km.
  - *Long-Haul Flight*: ~0.11 kg/km.
- **Energy**: Multiplies kWh consumption by a configurable grid intensity factor:
  - *Electricity*: Configurable by region (e.g., Global average 0.38 kg/kWh, US 0.42 kg/kWh, Europe 0.24 kg/kWh, Asia 0.58 kg/kWh).
  - *LPG Cooking Gas*: ~1.5 kg per hour of cooking.
- **Food**: Approximates average lifecycle emissions per meal:
  - *Meat-Heavy Meal*: ~2.5 kg CO₂e.
  - *Mixed Diet Meal*: ~1.5 kg CO₂e.
  - *Vegetarian Meal*: ~0.8 kg CO₂e.
  - *Vegan Meal*: ~0.5 kg CO₂e.
- **Shopping & Consumption**: Estimates emissions per item purchased:
  - *Clothing Item*: ~15.0 kg CO₂e.
  - *Electronics*: ~80.0 kg CO₂e.
  - *General Online Order*: ~3.0 kg CO₂e (packaging and shipping).
- **Waste & Recycling**:
  - *Landfill Garbage*: ~1.2 kg per bag.
  - *Recycled Waste*: ~0.1 kg per bag.

### 2. Rule-Based Recommendation Engine
Every day, the recommendation engine scans the last 7 days of logs to detect optimization targets using a decision-tree model:
- **Transport Alternative**: If weekly petrol/diesel car travel exceeds a reasonable threshold (e.g., >30 km), the app estimates the savings of switching a percentage of these trips to public transit (saving ~70% emissions).
- **Diet Offset**: If the user logs multiple meat-heavy meals (e.g., >3 meals/week), the engine calculates the net emissions saved by switching 2 meals/week to vegetarian or vegan alternatives.
- **Energy Efficiency**: If electricity consumption exceeds static benchmarks, the system recommends specific appliances/lighting tips.
- **Positive Reinforcement**: If the current week's total emissions are lower than the previous week's aggregate, the user is awarded a positive reinforcement card and bonus XP points.

---

## How the Solution Works

The Carbonly user flow follows a logical, step-by-step cycle designed to guide the user from initial awareness to sustained daily habits:

### 1. Onboarding Flow
First-time users walk through a 3-step setup wizard where they input their name, select a default diet type, choose a default commute method, state their household size, and choose preferred measurement units (metric or imperial). This customizes the baseline benchmarks.
[Add screenshot here]

### 2. Logging Activities
Under the "Log Activity" tab, users can record daily actions in under five seconds. A visual tab layout covers the categories, and real-time range sliders display a live preview of the footprint *before* saving.
[Add screenshot here]

### 3. Dashboard Analytics
The primary Dashboard aggregates today's carbon expenditure and compares it to the IPCC's recommended daily sustainable target of **5.48 kg CO₂e** via an interactive, color-coded progress gauge. Stacked charts display the last 7 days of logs, and a donut chart shows the categories responsible for the most emissions.
[Add screenshot here]

### 4. Personalized Insights & Simulators
The "Insights" tab lists customized green recommendation cards based on logged data. Additionally, a "What-If" simulator lets users adjust sliders to preview how permanent shifts in diet or transport would affect their annual carbon footprint.
[Add screenshot here]

---

## Tech Stack
- **Core Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v3 (Curated dark theme featuring emerald, slate, and teal palettes)
- **Charts**: Recharts
- **Icons**: Lucide Icons
- **Test Runner & Environment**: Vitest + jsdom + React Testing Library
- **Database/Persistence**: Browser-only `localStorage`

---

## Setup & Run Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
Clone this repository and install the dependencies:
```bash
npm install
```

### Run Local Development Server
Start Vite's development server (typically runs at `http://localhost:5173/`):
```bash
npm run dev
```

### Run Production Build
Verify typescript types and compile the project into optimized, minified static files:
```bash
npm run build
```

### Preview Production Build
Spin up a local server to test the static production bundle locally (runs on port `4173`):
```bash
npm run preview
```

### Run Automated Tests
Execute the unit and component test suites with Vitest:
```bash
npm run test
```

---

## Assumptions & Limitations
- **Approximations**: Emission factors are based on global averages and lifecycle estimations (IPCC/UNEP models). Actual individual emissions depend heavily on specific vehicle fuel efficiencies, localized grid configurations, and product supply chains.
- **Client-Side Storage**: All user profiles and activity logs are stored entirely in the user's browser `localStorage`. Clearing the browser cache or switching to a different device or browser will reset the application data.
- **No Multi-Device Sync**: There is no database or user account server to synchronize logs across laptops, tablets, and phones. To transfer data, users must export their database as a JSON backup in Settings and import it manually on the target device.

---

## Accessibility & Security Notes

### Accessibility (a11y) Measures:
Carbonly is fully compliant with **WCAG 2.1 Level AA** standards:
- **Keyboard Navigation**: The entire app can be operated via keyboard. A visible, high-contrast emerald focus ring (`:focus-visible`) is active on all interactive elements.
- **Skip Navigation**: A visually hidden "Skip to Content" anchor is available at the start of the layout for screen readers and keyboard-only users.
- **Screen Reader Support**: All custom SVG graphics (e.g., Progress Rings, Stacked Bar charts) have explicit `role="img"` attributes and dynamic text alternatives (`aria-label`). Non-text Lucide icons are marked with `aria-hidden="true"`.
- **Contrast Check**: All text-to-background combinations meet or exceed the WCAG 4.5:1 minimum contrast ratio (replacing standard slate text with high-contrast slate-400 and slate-300).
- **Form Error Live Alerts**: Dynamic validation errors are marked with `aria-live="assertive"` so they are immediately announced by screen readers.

### Security Implementation:
- **XSS Prevention**: All text fields, profile names, and log details undergo a sanitization pass (`sanitizeText` tag-stripper) before being saved to or read from `localStorage` to prevent HTML injection attacks.
- **No Dangerous Directives**: The codebase completely avoids the use of `eval` or `dangerouslySetInnerHTML`.
- **Storage Protection**: All reads and writes to `localStorage` are wrapped in `try/catch` statements with fallback safety limits to prevent app crashes if storage is full or disabled (e.g., in Safari Private Browsing mode).

---

## Live Demo
Check out the fully interactive, static-deployed application here:
**https://carbon-footprint-trac.netlify.app/**

[main image dasboard](asses/main.png)