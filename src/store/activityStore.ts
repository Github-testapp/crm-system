"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Activity } from "@/types";
import { sampleActivities } from "@/lib/sampleData";
import { generateId } from "@/lib/utils";
import { sanitizeObject } from "@/lib/sanitize";

interface ActivityState {
  activities: Activity[];
  initialized: boolean;
  initialize: () => void;
  addActivity: (data: Omit<Activity, "id" | "createdAt">) => void;
  updateActivity: (id: string, data: Partial<Activity>) => void;
  completeActivity: (id: string) => void;
  deleteActivity: (id: string) => void;
  getActivitiesByCustomer: (customerId: string) => Activity[];
  getActivitiesByDeal: (dealId: string) => Activity[];
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      initialized: false,
      initialize: () => {
        if (!get().initialized) {
          set({ activities: sampleActivities, initialized: true });
        }
      },
      addActivity: (data) => {
        const sanitized = sanitizeObject(data as Record<string, unknown>) as typeof data;
        const activity: Activity = {
          ...sanitized,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ activities: [activity, ...state.activities] }));
      },
      updateActivity: (id, data) => {
        const sanitized = sanitizeObject(data as Record<string, unknown>);
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === id ? { ...a, ...sanitized } : a
          ),
        }));
      },
      completeActivity: (id) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === id
              ? { ...a, completed: true, completedAt: new Date().toISOString() }
              : a
          ),
        }));
      },
      deleteActivity: (id) => {
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
        }));
      },
      getActivitiesByCustomer: (customerId) =>
        get().activities.filter((a) => a.customerId === customerId),
      getActivitiesByDeal: (dealId) =>
        get().activities.filter((a) => a.dealId === dealId),
    }),
    { name: "crm-activities" }
  )
);