"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { CustomerList } from "@/components/customers/CustomerList";

export default function CustomersPage() {
  return (
    <MainLayout title="顧客管理">
      <CustomerList />
    </MainLayout>
  );
}