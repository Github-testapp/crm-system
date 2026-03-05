"use client";
import { use } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DealDetail } from "@/components/deals/DealDetail";

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <MainLayout title="商談詳細">
      <DealDetail id={id} />
    </MainLayout>
  );
}