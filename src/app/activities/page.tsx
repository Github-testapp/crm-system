"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { ActivityList } from "@/components/activities/ActivityList";

export default function ActivitiesPage() {
  return (
    <MainLayout title="活動履歴">
      <ActivityList />
    </MainLayout>
  );
}