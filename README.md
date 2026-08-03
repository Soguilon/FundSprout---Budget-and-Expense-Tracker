# FundSprout — Know Your Flow. Watch It Grow.

A fully offline student finance web app. Open `index.html` directly in any
modern browser — no install, no build step, no backend, no internet
connection required (the CDN links for Bootstrap, Font Awesome, Chart.js and
the Inter font enhance the experience if you're online, but the app's core
functionality — data entry, balance tracking, the garden, activity log —
works entirely offline via localStorage).

## Getting started
Just double-click `index.html`. That's it.

## Folder structure
```
FundSprout/
├── index.html                 # App shell + all 7 pages + all modals
├── README.md
└── assets/
    ├── css/
    │   └── style.css          # Full design system (dark/light themes, components)
    └── js/
        ├── storage.js         # localStorage data layer (single source of truth)
        ├── utils.js           # Formatting, dates, validation helpers
        ├── ui-kit.js          # Toasts, modals, custom dropdown, ripple buttons
        ├── plant.js           # SVG plant/tree growth-stage rendering engine
        ├── app.js             # Router / navigation / theme / global actions
        └── pages/
            ├── dashboard.js
            ├── allowance.js
            ├── expenses.js
            ├── garden.js
            ├── analytics.js
            ├── activity.js
            └── settings.js
```

## What's implemented
- **Dashboard** — balance, today's allowance/expenses, budget remaining,
  money saved, Life Tree (financial health visualization), recent activity.
- **Allowance** — full CRUD, search, sort (newest/oldest/highest/lowest),
  custom source dropdown, validation.
- **Expenses** — full CRUD, categories, search, category filter, sort,
  overspend confirmation (see note below).
- **My Garden** — create unlimited savings-goal plants across 8 plant types,
  water them from your balance, per-plant watering history with edit/delete,
  7 visible growth stages driven by savings percentage (not time).
- **Analytics** — allowance vs. expense trend chart, expense distribution
  doughnut chart, daily/weekly/monthly/yearly filters, 8 summary stats.
- **Activity Log** — unified feed of every allowance, expense, and watering
  event, with search, category filter, and 6 sort modes (including A–Z).
- **Settings** — dark/light theme, animation toggle, JSON backup export/
  import (with confirmation + error handling for bad files), full data reset.
- Custom dropdown component used everywhere (no native `<select>`), fully
  keyboard-accessible, repositions on scroll/resize, closes on outside click.
- Toast notifications, confirm dialogs, empty states, and responsive layout
  from 320px up to large desktop, with a sidebar on desktop and bottom nav +
  FAB on mobile.

## Design decision: overspending
The spec asked me to state clearly how overspending is handled. FundSprout
**allows** an expense or watering action to push the balance below zero, but
always shows a confirmation dialog first, explaining what the resulting
balance will be. This was chosen over a hard block because real spending
sometimes happens before the matching allowance is logged, and blocking it
outright would force users to fight the app instead of just tracking reality.

## About the logo
`FundSproutLogo.png` was referenced in the brief but no image file was
actually attached to the conversation, so I built an inline SVG leaf-mark
wordmark in its place (used in the sidebar brand area and as the favicon).
It's a single `<svg>` block near the top of `index.html`'s sidebar — swap it
out for your real logo file whenever you have it; just replace that block
with an `<img src="assets/img/FundSproutLogo.png">` tag.

## Data & privacy
All data lives only in this browser's localStorage under the key
`fundsprout.v1`. Nothing is transmitted anywhere. Use Settings → Export
Backup regularly if you want a portable copy of your data.
