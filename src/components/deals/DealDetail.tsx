"use client";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDealStore } from "@/store/dealStore";
import { useActivityStore } from "@/store/activityStore";
import { useCustomerStore } from "@/store/customerStore";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, TrendingUp, Calendar, User } from "lucide-react";
import { ActivityTimeline } from "@/components/activities/ActivityTimeline";
import { sampleUsers } from "@/lib/sampleData";

const stageConfig = {
  lead: { label: "リード", variant: "gray" as const },
  qualified: { label: "ヒアリング済", variant: "blue" as const },
  proposal: { label: "提案中", variant: "yellow" as const },
  negotiation: { label: "交渉中", variant: "orange" as const },
  closed_won: { label: "受注", variant: "green" as const },
  closed_lost: { label: "失注", variant: "red" as const },
};

export function DealDetail({ id }: { id: string }) {
  const router = useRouter();
  const { getDeal, initialize } = useDealStore();
  const { getActivitiesByDeal, initialize: initActivities } = useActivityStore();
  const { getCustomer, initialize: initCustomers } = useCustomerStore();

  useEffect(() => {
    initialize();
    initActivities();
    initCustomers();
  }, [initialize, initActivities, initCustomers]);

  const deal = getDeal(id);
  const activities = useMemo(() => getActivitiesByDeal(id), [id, getActivitiesByDeal]);
  const customer = deal ? getCustomer(deal.customerId) : undefined;
  const assignedUser = sampleUsers.find((u) => u.id === deal?.assignedTo);

  if (!deal) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">商談が見つかりません</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/deals")}>一覧に戻る</Button>
      </div>
    );
  }

  const stage = stageConfig[deal.stage];

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => router.push("/deals")} className="mb-4">
        <ArrowLeft size={16} /> 一覧に戻る
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardBody className="py-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">{deal.title}</h2>
              <p className="text-sm text-gray-500 mb-3">{deal.customerName}</p>
              <Badge variant={stage.variant} className="mb-4">{stage.label}</Badge>
              <div className="text-3xl font-bold text-blue-600 mb-4">{formatCurrency(deal.amount)}</div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><TrendingUp size={14} />確度</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${deal.probability}%` }} />
                    </div>
                    <span className="font-medium">{deal.probability}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><Calendar size={14} />クローズ予定</span>
                  <span className="font-medium">{formatDate(deal.expectedCloseDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><User size={14} />担当者</span>
                  <span className="font-medium">{assignedUser?.name ?? "-"}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {deal.description && (
            <Card>
              <CardHeader><p className="text-sm font-semibold text-gray-700">概要</p></CardHeader>
              <CardBody><p className="text-sm text-gray-700">{deal.description}</p></CardBody>
            </Card>
          )}

          {deal.tags.length > 0 && (
            <Card>
              <CardHeader><p className="text-sm font-semibold text-gray-700">タグ</p></CardHeader>
              <CardBody className="flex flex-wrap gap-2">
                {deal.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{tag}</span>
                ))}
              </CardBody>
            </Card>
          )}

          {customer && (
            <Card>
              <CardHeader><p className="text-sm font-semibold text-gray-700">顧客情報</p></CardHeader>
              <CardBody className="text-sm">
                <p className="font-medium">{customer.name}</p>
                <p className="text-gray-500">{customer.company}</p>
                <Button variant="ghost" size="sm" className="mt-2 -ml-2" onClick={() => router.push(`/customers/${customer.id}`)}>
                  詳細を見る →
                </Button>
              </CardBody>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-3">活動履歴 ({activities.length}件)</h3>
          <ActivityTimeline activities={activities} />
        </div>
      </div>
    </div>
  );
}