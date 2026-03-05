"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationState {
  readIds: string[];
  markAsRead: (id: string) => void;
  markAllAsRead: (ids: string[]) => void;
  clearRead: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      readIds: [],
      markAsRead: (id) =>
        set((state) => ({
          readIds: state.readIds.includes(id)
            ? state.readIds
            : [...state.readIds, id],
        })),
      markAllAsRead: (ids) =>
        set((state) => ({
          readIds: [...new Set([...state.readIds, ...ids])],
        })),
      clearRead: () => set({ readIds: [] }),
    }),
    { name: "crm-notifications" }
  )
);