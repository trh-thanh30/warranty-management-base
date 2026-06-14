"use client";

import { create } from "zustand";

type AdminUiState = {
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
};

export const useAdminUiStore = create<AdminUiState>((set) => ({
  commandOpen: false,
  setCommandOpen: (open) => set({ commandOpen: open }),
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
