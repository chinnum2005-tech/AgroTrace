# 🎨 AgroTrace UI/UX Design Guide

## Professional Agri-Tech Platform Design

This guide documents the professional UI/UX implementation for AgroTrace, designed to look like a real startup platform.

---

## 🎨 Color Palette

### Primary Colors (Agri-Tech Theme)
```css
/* Green - Primary Brand Color */
--green-50: #f0fdf4
--green-600: #16a34a    /* Main green */
--green-700: #15803d    /* Dark green */

/* Amber/Orange - Accent Color */
--amber-500: #f59e0b    /* Warm accent */
--orange-600: #ea580c   /* CTA buttons */

/* Neutral Colors */
--slate-50: #f8fafc     /* Background */
--slate-900: #0f172a    /* Text */
```

### Usage Guidelines
- **Green**: Primary actions, success states, farm-related elements
- **Amber/Orange**: CTAs, highlights, important actions
- **Slate**: Backgrounds, text, neutral elements

---

## 🏠 1. Landing Page

### Hero Section
**Layout:**
```
┌─────────────────────────────────────────┐
│         NAVBAR (Sticky Top)             │
├─────────────────────────────────────────┤
│                                         │
│    [Badge: Powered by AI & Blockchain]  │
│                                         │
│    Track Your Food From                 │
│    Farm to Table                        │
│                                         │
│    [Scan Product QR] [Browse Products]  │
│                                         │
│    Stats: 500+ Farmers | 10K+ Products  │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Gradient background (green to emerald)
- Animated floating orbs
- Large, bold typography
- Two primary CTAs
- Social proof stats

**Design Elements:**
- Font sizes: H1 (5xl-7xl), Body (xl)
- Buttons: Rounded-xl, shadow-2xl
- Spacing: py-32 for hero

---

## 🛒 2. Marketplace Page

### Layout Structure
```
┌─────────────────────────────────────────┐
│            NAVBAR                       │
├─────────────────────────────────────────┤
│  HERO: Browse Fresh Products            │
│  [Search Bar] [Filters]                 │
├─────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │Product│ │Product│ │Product│          │
│  │ Card │ │ Card │ │ Card │            │
│  └──────┘ └──────┘ └──────┘            │
│                                         │
│  Grid: 3 columns (responsive)           │
└─────────────────────────────────────────┘
```

### Product Card Design
```
┌─────────────────────────┐
│   🌾 (Large Emoji)      │
│                         │
│ Organic Rice            │
│ Green Valley Farm       │
│ ⭐ 4.8 | Kerala         │
│                         │
│ ₹120 / 5kg              │
│                         │
│ [Add to Cart] [Buy Now] │
└─────────────────────────┘
```

**Card Features:**
- White background
- Rounded-2xl corners
- Shadow-lg → shadow-2xl on hover
- Hover: -translate-y-2
- Gradient border on hover

---

## 📦 3. Product Detail Page

### Layout
```
┌─────────────────────────────────────────┐
│  ← Back                                 │
├─────────────────────────────────────────┤
│  ┌─────────┐   Product Name             │
│  │         │   Farm Name                │
│  │  Image  │   ⭐ Rating | Location     │
│  │         │                            │
│  └─────────┘   Price: ₹120              │
│               Quantity: 500kg available  │
│               [Buy Now] [Add to Cart]    │
├─────────────────────────────────────────┤
│  Traceability Timeline                  │
│  🌱 → 📦 → 🚚 → 🏪                      │
└─────────────────────────────────────────┘
```

---

## 👨‍🌾 4. Farmer Dashboard

### Sidebar Navigation
```
┌─────────────┬───────────────────────────┐
│  👤 Profile │  Dashboard Overview       │
│             │                           │
│  📊 Dash    │  [Stats Cards Row]        │
│  🏡 Farms   │  Total: 12 | Active: 8    │
│  🌱 Crops   │                           │
│  📦 Products│  ┌─────────────────────┐  │
│  📈 Orders  │  │ Recent Orders       │  │
│  🔮 AI      │  │ Order #1 - ₹240     │  │
│  🏷️ QR      │  │ Order #2 - ₹480     │  │
│             │  └─────────────────────┘  │
│  [Logout]   │                           │
└─────────────┴───────────────────────────┘
```

### Dashboard Cards
```
┌──────────────────┐
│ 📊 Total Farms   │
│      12          │
│  ↑ 2 this month  │
└──────────────────┘

┌──────────────────┐
│ 🌱 Active Crops  │
│       8          │
│  All healthy     │
└──────────────────┘

┌──────────────────┐
│ 💰 Revenue       │
│    ₹3.75L        │
│  ↑ 31% this month│
└──────────────────┘
```

---

## 🚚 5. Distributor Dashboard

### Shipment Card
```
┌─────────────────────────────┐
│ 🚚 Shipment #SHP001         │
│                             │
│ From: Green Valley Farm     │
│ To: Bangalore Warehouse     │
│                             │
│ Status: In Transit          │
│ ETA: Mar 15, 2026           │
│                             │
│ [Update Status] [View Map]  │
└─────────────────────────────┘
```

### Timeline View
```
📍 Picked Up    ✓ Completed
   In Transit   → Current
   Delivered    ○ Pending
```

---

## 🔍 6. QR Verification Page

### Verification Result
```
┌─────────────────────────────┐
│ ✅ Verified on Blockchain   │
├─────────────────────────────┤
│ Product: Organic Rice       │
│ Farm: Green Valley Farm     │
│ Harvested: Mar 1, 2026      │
│                             │
│ Journey Timeline:           │
│                             │
│ 🌱 Mar 1 - Harvested        │
│ 📦 Mar 2 - Packed           │
│ 🚚 Mar 3 - Shipped          │
│ 🏪 Mar 4 - At Retail        │
│                             │
│ Hash: 0x8c3a2f...           │
└─────────────────────────────┘
```

---

## 🤖 7. AI Prediction Page

### Input Form
```
┌─────────────────────────────┐
│ 🔮 AI Yield Prediction      │
├─────────────────────────────┤
│ Crop Type: [Rice ▼]         │
│ Farm Size: [5.5] hectares   │
│ Soil Quality: [Good ▼]      │
│ Weather: [Normal ▼]         │
│                             │
│ [Get Prediction]            │
└─────────────────────────────┘
```

### Prediction Result
```
┌─────────────────────────────┐
│ Predicted Yield             │
│    4,200 kg                 │
│                             │
│ Profit Estimate: ₹52,000    │
│ Harvest Date: 75 days       │
│ Confidence: 87%             │
│                             │
│ Recommendations:            │
│ • Increase irrigation       │
│ • Apply fertilizer in 2 weeks│
└─────────────────────────────┘
```

---

## 🎨 Component Library

### Buttons

#### Primary Button
```tsx
<button className="btn-primary">
  Primary Action
</button>
```
- Green background
- White text
- Rounded-xl
- Shadow-lg

#### Secondary Button
```tsx
<button className="btn-secondary">
  Secondary Action
</button>
```
- Amber/Orange background
- White text
- Rounded-xl

#### Outline Button
```tsx
<button className="border-2 border-green-600 text-green-600 hover:bg-green-50">
  Cancel
</button>
```

### Cards

#### Standard Card
```tsx
<div className="card p-6">
  Card Content
</div>
```
- White background
- Rounded-2xl
- Shadow-lg
- Hover: shadow-2xl

#### Gradient Card
```tsx
<div className="gradient-primary p-6 text-white rounded-2xl">
  Highlighted Content
</div>
```

### Inputs

#### Text Input
```tsx
<input 
  className="w-full px-4 py-3 border-2 border-slate-300 
             rounded-xl focus:outline-none focus:border-green-600"
/>
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
sm: 640px   /* Tablets */
md: 768px   /* Laptops */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large screens */
```

### Grid Layouts

#### Mobile (Default)
```tsx
<div className="grid grid-cols-1 gap-4">
```

#### Tablet
```tsx
<div className="grid grid-cols-2 gap-4">
```

#### Desktop
```tsx
<div className="grid grid-cols-3 lg:grid-cols-4 gap-6">
```

---

## ✨ Animation Guidelines

### Fade In
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

### Scale on Hover
```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

### Slide In
```tsx
<motion.div
  initial={{ x: -100 }}
  animate={{ x: 0 }}
  transition={{ delay: 0.2 }}
>
```

---

## 🎯 Typography

### Headings
```css
h1: text-5xl md:text-7xl font-extrabold
h2: text-4xl md:text-5xl font-bold
h3: text-2xl md:text-3xl font-bold
h4: text-xl font-semibold
```

### Body Text
```css
Large: text-xl leading-relaxed
Normal: text-base leading-normal
Small: text-sm
```

### Colors
```css
Primary: text-slate-900
Secondary: text-slate-600
Muted: text-slate-400
Accent: text-green-600
```

---

## 📏 Spacing System

```css
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
3xl: 4rem (64px)
```

### Section Padding
```css
py-20 md:py-24 lg:py-32  /* Vertical */
px-4 sm:px-6 lg:px-8     /* Horizontal */
```

---

## 🌟 Best Practices

### DO ✅
- Use consistent color palette
- Maintain proper spacing
- Add hover effects
- Use gradients sparingly
- Keep typography readable
- Make buttons large enough (min 44px height)

### DON'T ❌
- Mix too many colors
- Use tiny fonts (<14px)
- Overuse animations
- Create cluttered layouts
- Ignore mobile responsiveness
- Use low contrast text

---

## 🎨 Quick Start Templates

### Hero Section Template
```tsx
<section className="gradient-primary py-32">
  <div className="max-w-7xl mx-auto px-4">
    <h1 className="text-6xl font-bold text-white mb-6">
      Your Headline
    </h1>
    <p className="text-xl text-white/90 mb-8">
      Your subtitle
    </p>
    <div className="flex gap-4">
      <button className="btn-primary">CTA 1</button>
      <button className="btn-secondary">CTA 2</button>
    </div>
  </div>
</section>
```

### Card Grid Template
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {items.map((item) => (
    <div key={item.id} className="card p-6">
      <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
      <p className="text-slate-600">{item.description}</p>
    </div>
  ))}
</div>
```

### Stats Section Template
```tsx
<div className="grid grid-cols-3 gap-8">
  {[
    { value: '500+', label: 'Farmers' },
    { value: '10K+', label: 'Products' }
  ].map((stat) => (
    <div key={stat.label} className="text-center">
      <div className="text-4xl font-bold text-green-600">
        {stat.value}
      </div>
      <div className="text-slate-600 mt-1">{stat.label}</div>
    </div>
  ))}
</div>
```

---

## 📱 Mobile App Screens

### Flutter Equivalent Designs

#### Login Screen
```dart
Container(
  decoration: gradientPrimary,
  child: Column(
    children: [
      LogoWidget(),
      TextField(hintText: 'Email'),
      TextField(hintText: 'Password', obscureText: true),
      ElevatedButton(onPressed: login, child: Text('Login')),
    ],
  ),
)
```

#### Product Card (Mobile)
```dart
Card(
  elevation: 4,
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(16),
  ),
  child: Column(
    children: [
      Image.asset('product.png'),
      Text('Product Name', style: headline6),
      Text('₹120', style: subtitle1),
      Row(
        children: [
          IconButton(icon: Icon(Icons.shopping_cart), onPressed: addToCart),
          IconButton(icon: Icon(Icons.visibility), onPressed: viewDetails),
        ],
      ),
    ],
  ),
)
```

---

## 🎯 Final Checklist

Before deploying, ensure:

✅ Consistent color usage  
✅ Proper spacing throughout  
✅ All buttons have hover states  
✅ Cards cast appropriate shadows  
✅ Typography hierarchy is clear  
✅ Responsive on all devices  
✅ Animations are smooth (60fps)  
✅ Accessibility standards met  
✅ Loading states implemented  
✅ Error states styled  

---

**Your AgroTrace platform now has a professional, modern UI that rivals real agri-tech startups! 🚀**

Use this guide to maintain design consistency across all pages and components.
