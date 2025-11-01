# Servora AI Dashboard - Visual Guide

## 🎨 What You'll See

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  [S] Servora AI                    [Search Bar]    [Bell] [?]│  ← Top Header
├─────────────────────────────────────────────────────────────┤
│         │                                                     │
│  SIDE   │               MAIN CONTENT AREA                    │
│  BAR    │                                                     │
│         │  Welcome back!                                      │
│  [🏠]   │  Here's what's happening with your waste today     │
│Overview │                                                     │
│         │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  [📉]   │  │Waste │ │Money │ │Inven │ │Staff │             │
│  Waste  │  │32.4% │ │18.4k │ │45.2k │ │94.2% │             │
│         │  └──────┘ └──────┘ └──────┘ └──────┘             │
│  [📦]   │                                                     │
│Inventory│  ┌─────────────────────┐ ┌──────────┐            │
│         │  │  Waste Trend Chart  │ │  Quick   │            │
│  [🎯]   │  │  (Area Chart)       │ │  Actions │            │
│Forecast │  │                     │ │  [Log]   │            │
│         │  └─────────────────────┘ │  [Update]│            │
│  [👥]   │                           │  [View]  │            │
│  Staff  │  ┌──────────┐ ┌─────────┐│  [Report]│            │
│         │  │Category  │ │ Alerts  ││          │            │
│  [📊]   │  │Progress  │ │ & News  │└──────────┘            │
│Reports  │  └──────────┘ └─────────┘                        │
│         │                                                     │
│  [🏪]   │                                                     │
│Supplier │                                                     │
│         │                                                     │
│ ─────── │                                                     │
│         │                                                     │
│  [⚙️]   │                                                     │
│Settings │                                                     │
│         │                                                     │
│  [👤]   │                                                     │
│  User   │                                                     │
└─────────┴─────────────────────────────────────────────────────┘
```

---

## 🎨 Color Palette in Action

### Sidebar
```
Background: White (#FFFFFF)
Active Item: Teal background (#E6F7F7) + Teal text (#007878)
Inactive: Gray text (#525252)
Hover: Light gray background (#F5F5F5)
```

### Metric Cards
```
┌────────────────────────────┐
│  [🟢] Waste Reduced        │  ← Green icon in light green bg
│                            │
│  32.4%          ↑ +8.2%   │  ← Large number + green trend
│  vs last period            │  ← Helper text
│  Target: 30-40%            │  ← Teal target
└────────────────────────────┘
```

### Charts
```
Line Color: Teal (#00A7A7)
Target Line: Orange dashed (#FF6B35)
Success: Green (#2D9F4B)
Grid Lines: Light gray (#E5E5E5)
```

---

## 📊 Dashboard Home - Section by Section

### 1. Hero Section
```
┌──────────────────────────────────────────────────────────────┐
│  Welcome back!                           [Time Range ▼] [📅] │
│  Here's what's happening with your waste management today.   │
└──────────────────────────────────────────────────────────────┘
```

### 2. Key Metrics (4 Cards)
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 📉           │  │ 💰           │  │ 📦           │  │ 👥           │
│ ↑ +8.2%     │  │ ↑ +RM 2.1k  │  │ ↓ -5.3%     │  │ ↑ +3.1%     │
│              │  │              │  │              │  │              │
│ Waste        │  │ Monthly      │  │ Inventory    │  │ Staff        │
│ Reduced      │  │ Savings      │  │ Value        │  │ Efficiency   │
│              │  │              │  │              │  │              │
│ 32.4%        │  │ RM 18,450    │  │ RM 45,200    │  │ 94.2%        │
│              │  │              │  │              │  │              │
│ vs last      │  │ vs last      │  │ optimization │  │ waste        │
│ period       │  │ month        │  │              │  │ logging      │
│              │  │              │  │              │  │              │
│ Target:      │  │ Target:      │  │ Optimal      │  │ Target:      │
│ 30-40%       │  │ RM 15-25k    │  │ level        │  │ >90%         │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

### 3. Waste Trend Chart (Large)
```
┌────────────────────────────────────────────────┐  ┌─────────────┐
│  Waste Reduction Trend         View Details → │  │ Quick       │
│  Daily waste percentage & savings              │  │ Actions     │
│                                                 │  │             │
│  15% ┐                                         │  │ ┌─────────┐ │
│      │ ●                                       │  │ │📉 Log   │ │
│  12% ┼───●─┐                                   │  │ │  Waste  │ │
│      │     └─●─●─●─┬─●  ← Actual Waste        │  │ └─────────┘ │
│   9% ┤─ ─ ─ ─ ─ ─ ─ ─  ← Target (dashed)     │  │             │
│      │                                         │  │ ┌─────────┐ │
│   6% └─────────────────────────────            │  │ │📦Update │ │
│      Mon Tue Wed Thu Fri Sat Sun               │  │ │Inventory│ │
│                                                 │  │ └─────────┘ │
│  ─ Actual Waste  ─ ─ Target (12%)             │  │             │
└────────────────────────────────────────────────┘  │ ┌─────────┐ │
                                                     │ │🎯 View  │ │
                                                     │ │Forecast │ │
                                                     │ └─────────┘ │
                                                     │             │
                                                     │ ┌─────────┐ │
                                                     │ │📊Report │ │
                                                     │ └─────────┘ │
                                                     └─────────────┘
```

### 4. Category Performance & Alerts (Side by Side)
```
┌───────────────────────────────┐  ┌───────────────────────────────┐
│  Category Performance         │  │  Recent Alerts                │
│                         [All] │  │                        [All]  │
│                               │  │                               │
│  Coffee Beans         ✓ 8.2% │  │  ┌─────────────────────────┐  │
│  ███████████████──── 10%     │  │  │ ✓ Success               │  │
│  Current: 8.2%   Target: 10% │  │  │ Waste reduction target  │  │
│                               │  │  │ achieved                │  │
│  Milk Products        ⚠ 12.5%│  │  │ 2 hours ago   Details → │  │
│  █████████████████── 10%     │  │  └─────────────────────────┘  │
│  Current: 12.5%  Target: 10% │  │                               │
│                               │  │  ┌─────────────────────────┐  │
│  Pastries             ✓ 6.8% │  │  │ ⚠ Warning               │  │
│  ████████████────── 8%       │  │  │ Milk waste increasing   │  │
│  Current: 6.8%   Target: 8%  │  │  │ Consider adjusting      │  │
│                               │  │  │ 5 hours ago   Adjust → │  │
│  Syrups               ✓ 4.2% │  │  └─────────────────────────┘  │
│  ████████────── 5%           │  │                               │
│  Current: 4.2%   Target: 5%  │  │  ┌─────────────────────────┐  │
│                               │  │  │ ℹ Info                  │  │
│  Packaging            ✓ 3.1% │  │  │ Staff training          │  │
│  ██████────── 5%             │  │  │ completed               │  │
│  Current: 3.1%   Target: 5%  │  │  │ 1 day ago     View →   │  │
└───────────────────────────────┘  └───────────────────────────────┘
```

---

## 📊 Waste Analytics Page

### Header
```
┌──────────────────────────────────────────────────────────────┐
│  Waste Analytics                  [Week ▼] [Filter] [Export] │
│  Track, analyze, and reduce waste across all categories       │
└──────────────────────────────────────────────────────────────┘
```

### Summary Cards
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 📉           │  │ 💰           │  │ ✓            │  │ 📦           │
│ ↓ -8.2%     │  │ ↓ -RM 890   │  │ ↑ +RM 2.6k  │  │ 260 items    │
│              │  │              │  │              │  │              │
│ Total        │  │ Waste        │  │ Money        │  │ Items        │
│ Waste        │  │ Cost         │  │ Saved        │  │ Tracked      │
│              │  │              │  │              │  │              │
│ 16.7%        │  │ RM 15,000    │  │ RM 18,450    │  │ 2,847        │
│              │  │              │  │              │  │              │
│ vs last      │  │ this period  │  │ this month   │  │ this period  │
│ period       │  │              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

### Charts
```
┌──────────────────────────────────────────┐  ┌──────────────────┐
│  Daily Waste Trend                       │  │  Waste by        │
│                                          │  │  Category        │
│  16% ┐                                   │  │                  │
│      │ ●                                 │  │     ●●●          │
│  14% ┼───●───●                           │  │   ●●   ●●        │
│      │         ●─●─●─●                   │  │  ●       ●●      │
│  12% ┤                                   │  │ ●         ●●     │
│      │                                   │  │              ●   │
│  10% └───────────────────                │  │                  │
│      Mon Tue Wed Thu Fri Sat Sun         │  │  Coffee  28%     │
│                                          │  │  Milk    22%     │
│  ─ Waste %  ─ Cost (RM)                 │  │  Pastries 18%    │
└──────────────────────────────────────────┘  └──────────────────┘
```

### Data Tables
```
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│  Top Waste Items                │  │  Reduction Opportunities        │
│                                 │  │                                 │
│  ┌────────────────────────────┐ │  │  ┌────────────────────────────┐ │
│  │ Croissants • Pastries      │ │  │  │ Coffee Beans         [HIGH] │ │
│  │ 4.2 kg        RM 420  ↑12% │ │  │  │ Adjust grinding portions    │ │
│  └────────────────────────────┘ │  │  │                             │ │
│                                 │  │  │ Current: 8.2%   Target: 5.0%│ │
│  ┌────────────────────────────┐ │  │  │ Potential: RM 1,200/month   │ │
│  │ Whole Milk • Dairy         │ │  │  │                             │ │
│  │ 8.5 L         RM 340  ↓5%  │ │  │  │ [Create Action Plan]        │ │
│  └────────────────────────────┘ │  │  └────────────────────────────┘ │
│                                 │  │                                 │
│  ┌────────────────────────────┐ │  │  ┌────────────────────────────┐ │
│  │ Arabica Beans • Coffee     │ │  │  │ Milk Products       [HIGH]  │ │
│  │ 2.1 kg        RM 315  ↑8%  │ │  │  │ Review expiry management    │ │
│  └────────────────────────────┘ │  │  │                             │ │
│                                 │  │  │ Current: 12.5%  Target: 8.0%│ │
│  ┌────────────────────────────┐ │  │  │ Potential: RM 980/month     │ │
│  │ Caramel Syrup • Syrups     │ │  │  │                             │ │
│  │ 1.8 L         RM 270  ↓3%  │ │  │  │ [Create Action Plan]        │ │
│  └────────────────────────────┘ │  │  └────────────────────────────┘ │
└─────────────────────────────────┘  └─────────────────────────────────┘
```

---

## 🎨 Color Coding System

### Metrics/Trends
- ✅ **Green** - Good performance, on target
- ⚠️ **Yellow** - Warning, needs attention
- ❌ **Red** - Critical, immediate action needed
- 📘 **Blue** - Informational, neutral

### Trend Arrows
- ↑ **Green** - Positive increase (savings, efficiency)
- ↓ **Green** - Positive decrease (waste, costs)
- ↑ **Red** - Negative increase (waste, costs)
- ↓ **Red** - Negative decrease (savings, efficiency)

### Priority Levels
- 🔴 **HIGH** - Red badge, urgent
- 🟡 **MEDIUM** - Yellow badge, important
- 🔵 **LOW** - Blue badge, optional

---

## 📱 Responsive Behavior

### Desktop (>1024px)
- Sidebar: Fixed left (always visible)
- Charts: Full width 2-column layouts
- Metrics: 4-column grid
- All features visible

### Tablet (768px - 1024px)
- Sidebar: Collapsible
- Charts: 2-column, may stack
- Metrics: 2-column grid
- Compact spacing

### Mobile (<768px)
- Sidebar: Hamburger menu
- Charts: Single column
- Metrics: Single column
- Touch-optimized buttons

---

## 🎯 Interactive Elements

### Hover States
```
Card:
Normal: border-neutral-200
Hover: border-primary-500 + shadow

Button:
Normal: bg-primary-500
Hover: bg-primary-600

Sidebar Item:
Normal: text-neutral-700
Hover: bg-neutral-100
Active: bg-primary-50 text-primary-700
```

### Click Actions
- **Metric Cards** → Navigate to detail page
- **Chart Points** → Show tooltip
- **Quick Actions** → Navigate to feature
- **Alerts** → Show action menu
- **Sidebar Items** → Navigate to page

---

## 🎨 Typography Examples

```
Page Title:
text-2xl font-bold text-neutral-900
"Welcome back!"

Section Header:
text-lg font-bold text-neutral-900
"Waste Reduction Trend"

Metric Value:
text-3xl font-bold text-neutral-900
"32.4%"

Metric Change:
text-xs font-medium bg-success-50 text-success-700
"+8.2%"

Helper Text:
text-xs text-neutral-500
"vs last period"

Target:
text-xs text-primary-600 font-medium
"Target: 30-40%"
```

---

## ✨ Animation & Transitions

All transitions use: `transition-all duration-200`

- Hover effects: 200ms
- Page transitions: Instant
- Chart animations: 300ms
- Modal fades: 200ms

---

**View the actual dashboard:** http://localhost:5173/dashboard

This visual guide shows the exact layout, colors, and components you'll see in the live application!

