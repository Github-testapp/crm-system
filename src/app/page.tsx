"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Dashboard } from "@/components/reports/Dashboard";

export default function HomePage() {
  return (
    <MainLayout title="ダッシュボード">
      <Dashboard />
    </MainLayout>
  );
}