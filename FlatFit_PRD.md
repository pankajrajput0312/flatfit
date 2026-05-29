# 🏠 FlatFit — Product Requirements Document

| | |
|---|---|
| **Version** | 1.0 |
| **Date** | May 2026 |
| **Platform** | React Native (iOS, Android, Web — mobile-first) |
| **Group Size** | 5 flat members (fixed) |
| **Status** | Draft — v1 MVP |

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Users & Personas](#2-users--personas)
3. [Tech Stack](#3-tech-stack)
4. [App Architecture & Navigation](#4-app-architecture--navigation)
5. [Feature Specifications](#5-feature-specifications)
6. [Points System](#6-points-system)
7. [Data Model](#7-data-model)
8. [Screen Inventory](#8-screen-inventory)
9. [UI / UX Design Guidelines](#9-ui--ux-design-guidelines)
10. [States & Edge Cases](#10-states--edge-cases)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Development Milestones](#12-development-milestones)
13. [Open Questions](#13-open-questions)

---

## 1. Product Overview

FlatFit is a mobile-first fitness tracking app for a group of 5 flatmates. It lets each member set their own daily targets for gym sessions, water intake, and protein consumption — log their progress throughout the day — and compete on a shared leaderboard scored purely on percentage completion.

The web version renders identically to the mobile app — constrained to a phone-width viewport (max 390px), centered on desktop with a neutral background, with no desktop-specific layouts or navigation.

### 1.1 Problem Statement

Flatmates want shared accountability for their fitness habits but lack a lightweight, group-native tool. Existing apps (MyFitnessPal, Strava) are either individual-only or require complex team setups with social overhead.

### 1.2 Goals

- Each member independently sets personal daily targets.
- Daily logging takes under 30 seconds per metric.
- Leaderboard updates in real-time and drives friendly competition.
- Works identically on Android, iOS, and in a browser (mobile view only).

### 1.3 Non-Goals (Out of Scope v1)

- No calorie or macro tracking beyond protein.
- No social feed, comments, or chat.
- No wearable / HealthKit / Google Fit integration.
- No push notifications (v2 feature).
- No admin panel or invite flow — group is hardcoded to 5 members.
- No weekly historical charts or trends view (v2).

---

## 2. Users & Personas

The app serves exactly 5 users sharing a flat. No registration flow is required for v1 — members are pre-configured with names and targets on first launch.

| Attribute | Detail |
|---|---|
| User count | 5 (fixed) |
| Age range | 18–35 |
| Fitness level | Beginner to intermediate |
| Primary device | Android / iOS; occasional browser access on laptop |
| Tech comfort | High — daily smartphone users |
| Motivation | Accountability, friendly competition, habit tracking |

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React Native (Expo managed workflow) |
| **Web renderer** | React Native Web — renders app UI in browser at mobile viewport |
| **Navigation** | React Navigation v6 — Bottom Tab Navigator + Stack |
| **State management** | Zustand — lightweight global store, no Redux |
| **Backend / DB** | Supabase — Postgres DB + Realtime subscriptions |
| **Auth** | Supabase Auth — magic link email or Google OAuth |
| **Hosting (web)** | Vercel — auto-deploys from `main` branch |
| **Styling** | React Native StyleSheet API + custom theme tokens |
| **Animations** | React Native Reanimated v3 |
| **Charts / progress** | React Native SVG (custom progress bars, no chart lib needed for v1) |

### 3.1 Web Mobile-Only Constraint

On web, the app **must always** render inside a `maxWidth: 390` container, centred horizontally on a neutral `#F1F5F9` background. No responsive breakpoints. No desktop nav or sidebars. A desktop browser must feel like viewing the app on a phone.

> **Implementation note:** Wrap the root `<App />` in a `View` with `{ maxWidth: 390, width: '100%', alignSelf: 'center', minHeight: '100vh', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.12 }`. Apply `background-color: #F1F5F9` to `<body>` via a global CSS injection.

---

## 4. App Architecture & Navigation

### Navigation Structure

```
Root
├── Splash (loading screen — resolves auth, < 1s)
├── Onboarding Stack (first launch only)
│   ├── Step 1 — Name
│   ├── Step 2 — Gym Days
│   └── Step 3 — Water & Protein Targets
└── Main App (Bottom Tab Navigator)
    ├── Tab 1 — Today (Home) 🏠
    ├── Tab 2 — Leaderboard 🏆
    └── Tab 3 — Profile ⚙️
```

### Bottom Tab Bar

- 3 tabs only. No hamburger menu. No drawer.
- Active tab: filled icon + blue label.
- Inactive tab: outline icon + grey label.
- Height: 64px + bottom safe area inset.
- Background: white with a top border shadow.

### Member Switcher

A horizontal scrollable pill-tab row at the top of both the **Today** and **Leaderboard** screens. Allows any device user to view another member's data — useful when one phone is shared at home.

---

## 5. Feature Specifications

### 5.1 Onboarding & Profile Setup

Shown only on first launch. After completion, the user lands on the Today tab. Accessible again from the Profile tab at any time.

**Fields:**

| Field | Input Type | Constraints |
|---|---|---|
| Name | Text input | Max 20 chars. Shown in leaderboard and member tabs. |
| Gym days | Multi-select day pills (Mon–Sun) | Select specific days. If none selected, every day is treated as a rest day and 5 gym pts are auto-awarded daily. |
| Water target | Horizontal slider | Range: 1L–5L, step 0.5L. Default: 2.0L. |
| Protein target | Horizontal slider | Range: 50g–300g, step 5g. Default: 120g. |

**Behaviour:**
- Data persisted to Supabase under the member's user ID.
- Targets can be updated any time from the Profile tab.
- Changing targets does NOT retroactively adjust past log scores.

---

### 5.2 Today — Daily Log Screen

The core screen. Members log their gym session, water intake, and protein for the current calendar day. All logs reset at midnight (next calendar day).

#### 5.2.1 Member Selector

- Horizontal scrollable pill tabs at the top showing all 5 member names.
- Active member: blue pill background, white text.
- Switching tabs loads that member's log for today.

#### 5.2.2 Score Banner

- Displays the member's current total points in large text (e.g. **8.5 / 10**).
- Animated horizontal progress bar fills proportionally to score.
- Below bar: mini breakdown row — `🏋️ 5.0 | 🥩 2.3 | 💧 1.2`.
- Background: blue-to-indigo gradient (`#3B82F6 → #6366F1`).

#### 5.2.3 Gym Card

- **Gym day:** Shows "Today is gym day 💪" tag. Displays a full-width button `Mark as Done`. On tap: toggles to `✅ Completed!` with green background fill and spring animation.
- **Rest day:** Shows "Rest day ✓" tag. Auto-displays `Rest day — 5 pts awarded` message. No button required.
- Day comparison is against today's ISO weekday (Monday = 0, Sunday = 6).

#### 5.2.4 Water Card

Visual water intake logger using 8 droplet icons.

- **Each droplet represents `waterTarget / 8` litres.**
- Display: 8 droplets in a horizontal flex-wrap grid (4 per row on 390px width).
- **Filled droplet:** full-colour 💧, scale-bounce animation (1.0 → 1.3 → 1.0) on fill using `withSequence`.
- **Empty droplet:** same icon at 25% opacity.
- **Tap behaviour:** tapping droplet N fills droplets 1 through N (cumulative). Tapping the last filled droplet un-fills it (one-step undo).
- Below grid: text label — `X.XL / Y.YL · N/8 glasses`.

#### 5.2.5 Protein Card

- Large numeric input field. Keyboard type: `numeric`. Placeholder: `0`. Font size: 32sp bold.
- Inline unit label: `grams` in grey.
- Orange animated progress bar fills proportionally (`actual / target × 100%`), capped at 100%.
- Percentage shown at the right end of the bar row.
- Below bar: `Xg / Yg` label in grey.

---

### 5.3 Leaderboard

Live ranked view of all 5 members sorted by today's total points descending. Updates in real-time.

#### 5.3.1 Rank Cards

| Rank | Visual Treatment |
|---|---|
| 1st | Gold gradient background (`#FEF3C7 → #FDE68A`) |
| 2nd | Default card background |
| 3rd | Default card background |
| 4th–5th | Default card background |

Each card contains:
- Medal emoji (🥇 🥈 🥉 4️⃣ 5️⃣) on the left.
- Member name (bold, 16sp).
- Breakdown chips row: `🏋️ X.X  🥩 X.X  💧 X.X`.
- Segmented progress bar: **blue** (gym pts/10) + **orange** (protein pts/10) + **cyan** (water pts/10).
- Total score on the right: `X.X` large + `/10` small grey.

#### 5.3.2 Real-Time Updates

- Subscribe to Supabase Realtime on `daily_logs` table, filtered to `log_date = today`.
- When any member updates their log, leaderboard re-ranks automatically without page refresh.
- Animate rank position changes with a layout transition (Reanimated `Layout`).

---

## 6. Points System

Each member can earn up to **10 points per day**. Points always scale proportionally to percentage completion — partial effort is always rewarded.

| Metric | Max Points | Calculation |
|---|---|---|
| **Gym** | 5 pts | If today is a gym day: `gymDone ? 5 : 0`. If today is a rest day (not in gymDays): `5` auto. |
| **Protein** | 3 pts | `(actual_g / target_g) × 3`, capped at 3.0. |
| **Water** | 2 pts | `(droplets_filled / 8) × 2`, capped at 2.0. |
| **TOTAL** | **10 pts** | Sum of all three. Displayed to 1 decimal place. |

**Example:**
> Member ate 90g protein (target 120g) → `90/120 × 3 = 2.25 pts`.
> Drank 5/8 glasses → `5/8 × 2 = 1.25 pts`.
> Rest day → `5 pts` auto.
> **Total = 8.5 / 10**

---

## 7. Data Model

### Table: `members`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `name` | `text` | Max 20 chars |
| `gym_days` | `int[]` | Day indices: 0 = Mon, 6 = Sun |
| `water_target_l` | `numeric(3,1)` | e.g. `2.5` |
| `protein_target_g` | `integer` | e.g. `120` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | Auto-updated via trigger |

### Table: `daily_logs`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `member_id` | `uuid` | FK → `members.id` |
| `log_date` | `date` | `YYYY-MM-DD`, no timezone offset |
| `gym_done` | `boolean` | Default `false` |
| `water_droplets` | `smallint` | Range 0–8. Default `0`. |
| `protein_g` | `integer` | Default `0` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | Auto-updated via trigger |
| **UNIQUE** | | `(member_id, log_date)` — one row per member per day |

**Upsert strategy:** Use `INSERT ... ON CONFLICT (member_id, log_date) DO UPDATE SET ...` so partial field updates (e.g. only protein changes) don't create duplicate rows.

### Supabase RLS Policy

```sql
-- Members can only read/write their own logs
CREATE POLICY "own_logs" ON daily_logs
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);
```

---

## 8. Screen Inventory

| Screen | Route Name | Tab |
|---|---|---|
| Splash / Loading | `Splash` | — |
| Onboarding — Name | `Onboarding/Name` | — |
| Onboarding — Gym Days | `Onboarding/GymDays` | — |
| Onboarding — Targets | `Onboarding/Targets` | — |
| Today (Home) | `Home` | Tab 1 |
| Leaderboard | `Leaderboard` | Tab 2 |
| Profile / Settings | `Profile` | Tab 3 |

---

## 9. UI / UX Design Guidelines

### 9.1 Viewport & Layout

- **Max width:** 390px (iPhone 14 base width). No element exceeds this.
- **On web desktop:** outer body `background: #F1F5F9`. App container centred with a soft drop shadow to simulate a phone shell.
- Safe area insets handled via `react-native-safe-area-context` on all screens.
- Bottom Tab Bar: `height: 64` + `paddingBottom: safeAreaBottom`.

### 9.2 Colour Tokens

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#3B82F6` | CTAs, active states, links |
| `primary-dark` | `#1D4ED8` | Pressed / focus state |
| `accent-gym` | `#3B82F6` | Gym segment in bars |
| `accent-protein` | `#F97316` | Protein segment in bars |
| `accent-water` | `#06B6D4` | Water segment in bars |
| `surface` | `#F7F7F7` | Card backgrounds |
| `background` | `#FFFFFF` | Screen backgrounds |
| `text-primary` | `#111827` | Headings, values |
| `text-secondary` | `#6B7280` | Labels, captions |
| `border` | `#E5E7EB` | Card borders, dividers |

### 9.3 Typography

| Style | Size | Weight |
|---|---|---|
| Score display | 40sp | 800 (ExtraBold) |
| Section header | 16sp | 700 (Bold) |
| Body / input | 14sp | 400 (Regular) |
| Chip / tag label | 11sp | 700 (Bold), UPPERCASE |
| Footer / caption | 12sp | 400 (Regular) |

### 9.4 Key Animations

| Element | Animation |
|---|---|
| Score banner progress bar | `withSpring` on value change (Reanimated) |
| Water droplet fill | `withSequence(scale 1→1.3→1)` on tap |
| Protein bar fill | `withTiming(300ms, ease)` |
| Leaderboard rank change | `Layout` animation (Reanimated v3) |
| Gym button state change | `backgroundColor` transition 200ms |

### 9.5 Card Structure

All cards (Gym, Water, Protein, Leaderboard entries) follow the same pattern:

```
┌─────────────────────────────────┐
│  🏷 ICON  Title          badge  │  ← Header row
│─────────────────────────────────│
│  Primary interactive content    │
│  Secondary text / progress      │
└─────────────────────────────────┘
```

Border radius: `16px`. Padding: `14px`. Shadow: `0 1px 4px rgba(0,0,0,0.08)`.

---

## 10. States & Edge Cases

| Scenario | Expected Behaviour |
|---|---|
| No gym days set | Every day = rest day. Gym card shows rest message, 5 pts auto-awarded. |
| Protein input > target | Progress bar caps at 100%. Points cap at 3.0. Input value still accepted as entered. |
| Log not yet started (all zeros, gym day) | Score shows `0.0 / 10`. |
| Log not yet started (all zeros, rest day) | Score shows `5.0 / 10` (gym auto-awarded). |
| Midnight log reset | New `daily_logs` row created on first interaction after midnight. Previous day's data preserved read-only. |
| App opened offline | Show last-known cached state. Inputs disabled with a `No connection` banner. Writes queued and replayed on reconnect. |
| Two members sharing one device | Member tab switcher handles this — each member has independent auth + data. |
| Tie score in leaderboard | Members with equal `total` sorted alphabetically by name. |
| Protein or water target changed mid-day | New target applies to today's score immediately. Old logged values remain unchanged. |

---

## 11. Non-Functional Requirements

| Requirement | Target |
|---|---|
| App launch to interactive | < 2 seconds on mid-range Android (Snapdragon 665+) |
| Log save latency (UX) | < 500ms optimistic update; Supabase write in background |
| Leaderboard real-time lag | < 2 seconds from log save to other members seeing update |
| Web bundle size | < 2MB gzipped |
| Offline support | Today's data readable offline; writes queued via AsyncStorage |
| Data retention | Logs kept indefinitely. No purge policy in v1. |
| Security | Supabase Row-Level Security — members can only write their own `daily_logs` rows |
| Accessibility | Min contrast ratio 4.5:1 (WCAG AA). All touch targets min 44×44pt. |
| Max frames drop | No frame drops below 60fps during animations on target devices |

---

## 12. Development Milestones

| Sprint | Deliverable | Duration |
|---|---|---|
| Sprint 1 | Project setup: Expo + Supabase + React Navigation shell + bottom tabs | 1 week |
| Sprint 2 | Onboarding flow + Profile screen + Zustand member store | 1 week |
| Sprint 3 | Today screen — gym card, water droplets, protein input, score banner | 1 week |
| Sprint 4 | Supabase integration — upsert logs, fetch on load, Realtime subscription | 1 week |
| Sprint 5 | Leaderboard screen — live ranking, segmented bars, rank animations | 1 week |
| Sprint 6 | Web build — mobile viewport constraint, Vercel deploy, cross-browser QA | 1 week |
| Sprint 7 | Polish, edge cases, offline support, performance testing, final QA | 1 week |

**Total estimated duration: 7 weeks**

---

## 13. Open Questions

1. Should gym points be `0` if a scheduled day is missed, or allow a "late mark" until 11:59pm the same day?
2. Do we need weekly aggregate leaderboard scores (best week, total streak) in v1 or defer to v2?
3. How should the app handle a member permanently leaving the flat — archive their data or hard delete?
4. Should water droplet count be fixed at 8, or scale dynamically with the target (e.g. 10 droplets for a 2.5L target)?
5. Authentication approach: magic link email, Google OAuth, or no-auth local-only sessions for v1?

---

*End of Document — FlatFit PRD v1.0*
