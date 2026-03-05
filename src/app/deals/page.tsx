"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { DealList } from "@/components/deals/DealList";

export default function DealsPage() {
  return (
    <MainLayout title="商談管理">
      <DealList />
    </MainLayout>
  );
}