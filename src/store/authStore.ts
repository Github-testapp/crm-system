"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, UserRole } from "@/types";
import { sampleUsers } from "@/lib/sampleData";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
  updateRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: sampleUsers[0],
      isAuthenticated: true,
      login: (userId) => {
        const user = sampleUsers.find((u) => u.id === userId);
        if (user) set({ currentUser: user, isAuthenticated: true });
      },
      logout: () => set({ currentUser: null, isAuthenticated: false }),
      updateRole: (role) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, role }
            : null,
        })),
    }),
    { name: "crm-auth" }
  )
);