"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Deal, DealStage } from "@/types";
import { sampleDeals } from "@/lib/sampleData";
import { generateId } from "@/lib/utils";
import { sanitizeObject } from "@/lib/sanitize";

interface DealState {
  deals: Deal[];
  initialized: boolean;
  initialize: () => void;
  addDeal: (data: Omit<Deal, "id" | "createdAt" | "updatedAt">) => void;
  updateDeal: (id: string, data: Partial<Deal>) => void;
  updateStage: (id: string, stage: DealStage) => void;
  deleteDeal: (id: string) => void;
  getDeal: (id: string) => Deal | undefined;
  getDealsByCustomer: (customerId: string) => Deal[];
}

export const useDealStore = create<DealState>()(
  persist(
    (set, get) => ({
      deals: [],
      initialized: false,
      initialize: () => {
        if (!get().initialized) {
          set({ deals: sampleDeals, initialized: true });
        }
      },
      addDeal: (data) => {
        const sanitized = sanitizeObject(data as Record<string, unknown>) as typeof data;
        const now = new Date().toISOString();
        const deal: Deal = {
          ...sanitized,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ deals: [deal, ...state.deals] }));
      },
      updateDeal: (id, data) => {
        const sanitized = sanitizeObject(data as Record<string, unknown>);
        set((state) => ({
          deals: state.deals.map((d) =>
            d.id === id
              ? { ...d, ...sanitized, updatedAt: new Date().toISOString() }
              : d
          ),
        }));
      },
      updateStage: (id, stage) => {
        set((state) => ({
          deals: state.deals.map((d) =>
            d.id === id
              ? { ...d, stage, updatedAt: new Date().toISOString() }
              : d
          ),
        }));
      },
      deleteDeal: (id) => {
        set((state) => ({ deals: state.deals.filter((d) => d.id !== id) }));
      },
      getDeal: (id) => get().deals.find((d) => d.id === id),
      getDealsByCustomer: (customerId) =>
        get().deals.filter((d) => d.customerId === customerId),
    }),
    { name: "crm-deals" }
  )
);