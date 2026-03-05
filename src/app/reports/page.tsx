"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Dashboard } from "@/components/reports/Dashboard";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { FunnelChart } from "@/components/reports/FunnelChart";
import { ActivityStats } from "@/components/reports/ActivityStats";
import { useEffect } from "react";
import { useDealStore } from "@/store/dealStore";
import { useActivityStore } from "@/store/activityStore";

export default function ReportsPage() {
  const { deals, initialize: initD } = useDealStore();
  const { activities, initialize: initA } = useActivityStore();

  useEffect(() => { initD(); initA(); }, [initD, initA]);

  return (
    <MainLayout title="レポート">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart deals={deals} />
          <FunnelChart deals={deals} />
        </div>
        <ActivityStats activities={activities} />
      </div>
    </MainLayout>
  );
}