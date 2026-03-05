"use client";
import { use } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { CustomerDetail } from "@/components/customers/CustomerDetail";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <MainLayout title="顧客詳細">
      <CustomerDetail id={id} />
    </MainLayout>
  );
}