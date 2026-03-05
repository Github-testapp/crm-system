"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Customer } from "@/types";
import { sampleCustomers } from "@/lib/sampleData";
import { generateId } from "@/lib/utils";
import { sanitizeObject } from "@/lib/sanitize";

interface CustomerState {
  customers: Customer[];
  initialized: boolean;
  initialize: () => void;
  addCustomer: (data: Omit<Customer, "id" | "createdAt" | "updatedAt">) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomer: (id: string) => Customer | undefined;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: [],
      initialized: false,
      initialize: () => {
        if (!get().initialized) {
          set({ customers: sampleCustomers, initialized: true });
        }
      },
      addCustomer: (data) => {
        const sanitized = sanitizeObject(data as Record<string, unknown>) as typeof data;
        const now = new Date().toISOString();
        const customer: Customer = {
          ...sanitized,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ customers: [customer, ...state.customers] }));
      },
      updateCustomer: (id, data) => {
        const sanitized = sanitizeObject(data as Record<string, unknown>);
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id
              ? { ...c, ...sanitized, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },
      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
      },
      getCustomer: (id) => get().customers.find((c) => c.id === id),
    }),
    { name: "crm-customers" }
  )
);