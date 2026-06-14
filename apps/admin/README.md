# Reusable Admin Dashboard Boilerplate

This admin application is built as a highly customizable, configuration-driven boilerplate template. It is fully decoupled from any specific business domain and can be easily adapted to any new project by modifying a single configuration file.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Components**: Tailwind CSS v4, Radix UI primitives, Lucide Icons
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Interactions**: Command menu (`cmdk`) search & keyboard shortcuts

---

## Configuration Guide

The entire shell branding, sidebar navigation sections, header links, and user settings menus are governed by a central configuration located at:
👉 **`src/config/dashboard.config.ts`**

TypeScript schemas and interface typings are defined in:
👉 **`src/config/dashboard.types.ts`**

### 1. Brand Configuration

You can customize the logo icon, site title, and site sub-description at the top of the sidebar.

```typescript
brand: {
  name: "My Custom Admin",
  description: "Next + Tailwind Admin Panel",
  logo: LucideIconComponent, // Any Lucide icon component
}
```

### 2. Sidebar Navigation Sections

The sidebar renders dynamic groups (e.g., General, Pages, Other). Each group contains items that can either redirect to a route or trigger actions. You can also attach badge indicators (e.g., chat counters).

```typescript
sidebarSections: [
  {
    label: "Main Controls",
    items: [
      {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Products",
        href: "/products",
        icon: ShoppingBag,
      },
      {
        title: "Messages",
        badge: "5",
        icon: Mail,
      },
    ],
  },
];
```

### 3. Top Navigation links

The header topbar menu links can be added or removed:

```typescript
topNavigation: [
  {
    title: "Overview",
    href: "/dashboard",
  },
  {
    title: "Support",
    href: "/support",
  },
];
```

### 4. User Profile Settings

Customize the user profile metadata and dropdown menu links (such as Profile, Settings, and Log out actions):

```typescript
userMenu: {
  name: "Jane Doe",
  email: "jane.doe@company.com",
  avatarFallback: "JD",
  menuItems: [
    {
      label: "My Profile",
      href: "/profile",
      icon: User,
    },
    {
      label: "Logout",
      href: "/auth/logout",
      icon: LogOut,
      isDestructive: true,
    }
  ]
}
```

---

## UI/UX Best Practices (UI/UX Pro Max)

This boilerplate conforms strictly to the following design specifications:

1. **Interactive Keyboard Shortcuts**: The command/search menu is listening globally. Pressing `Ctrl + K` or `Cmd + K` toggles the page search immediately.
2. **Dynamic Route Gathering**: Searchable options in the command search are gathered and deduplicated automatically from the sidebar and top navigation configurations.
3. **Micro-Animations**: Uses spring-based Framer Motion entry animations to smoothly stagger and slide up layout grids, stats cards, and tabs on page mount.
4. **Stable Accessibility**: High contrast light/dark mode color tokens, visible focus rings, large touch targets, proper labels, and NO emoji icons (only unified SVG-based Lucide icons are used).
5. **No Layout Shift**: Reserves space with placeholders and skeleton screens for asynchronous resources (such as charts and tables) preventing layout shift.
