"use client";
import { useEffect, useMemo } from "react";
import { useCustomerStore } from "@/store/customerStore";
import { useDealStore } from "@/store/dealStore";
import { useActivityStore } from "@/store/activityStore";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { Users, Briefcase, TrendingUp, Award, ArrowUpRight } from "lucide-react";
import { RevenueChart } from "./RevenueChart";
import { FunnelChart } from "./FunnelChart";
import { ActivityStats } from "./ActivityStats";
import { ActivityTimeline } from "@/components/activities/ActivityTimeline";
import { useRouter } from "next/navigation";

export function Dashboard() {
  const router = useRouter();
  const { customers, initialize: initC } = useCustomerStore();
  const { deals, initialize: initD } = useDealStore();
  const { activities, initialize: initA } = useActivityStore();

  useEffect(() => { initC(); initD(); initA(); }, [initC, initD, initA]);

  const stats = useMemo(() => {
    const activeDeals = deals.filter((d) => !["closed_won", "closed_lost"].includes(d.stage));
    const wonDeals = deals.filter((d) => d.stage === "closed_won");
    const closedDeals = deals.filter((d) => ["closed_won", "closed_lost"].includes(d.stage));
    const winRate = closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;
    const totalRevenue = wonDeals.reduce((s, d) => s + d.amount, 0);
    const pipelineValue = activeDeals.reduce((s, d) => s + d.amount, 0);
    const activeCustomers = customers.filter((c) => c.status === "active").length;
    return { activeDeals: activeDeals.length, winRate, totalRevenue, pipelineValue, activeCustomers };
  }, [deals, customers]);

  const recentActivities = useMemo(() =>
    [...activities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [activities]
  );

  const statCards = [
    {
      label: "総顧客数",
      value: customers.length.toString(),
      icon: Users,
      color: "bg-blue-500",
      sub: `アクティブ ${stats.activeCustomers}件`,
      href: "/customers",
      hoverColor: "hover:border-blue-300",
    },
    {
      label: "進行中の商談",
      value: stats.activeDeals.toString(),
      icon: Briefcase,
      color: "bg-orange-500",
      sub: `パイプライン ${formatCurrency(stats.pipelineValue)}`,
      href: "/deals",
      hoverColor: "hover:border-orange-300",
    },
    {
      label: "成約売上",
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: "bg-green-500",
      sub: `受注件数 ${deals.filter((d) => d.stage === "closed_won").length}件`,
      href: "/reports",
      hoverColor: "hover:border-green-300",
    },
    {
      label: "勝率",
      value: `${stats.winRate.toFixed(0)}%`,
      icon: Award,
      color: "bg-purple-500",
      sub: `クローズ済 ${deals.filter((d) => ["closed_won", "closed_lost"].includes(d.stage)).length}件`,
      href: "/reports",
      hoverColor: "hover:border-purple-300",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* KPI カード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, sub, href, hoverColor }) => (
          <div
            key={label}
            onClick={() => router.push(href)}
            className={`bg-white rounded-xl border-2 border-transparent shadow-sm cursor-pointer transition-all duration-200 ${hoverColor} hover:shadow-md group`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{sub}</p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-2">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="text-gray-300 group-hover:text-gray-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* チャート */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart deals={deals} />
        <FunnelChart deals={deals} />
      </div>

      {/* 下段 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityStats activities={activities} />
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">最近の活動</p>
              <button
                onClick={() => router.push("/activities")}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                すべて見る <ArrowUpRight size={12} />
              </button>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <ActivityTimeline activities={recentActivities} />
          </CardBody>
        </Card>
      </div>

      {/* 未完了タスク一覧 */}
      <PendingTasksCard activities={activities} onNavigate={() => router.push("/activities")} />
    </div>
  );
}

// 未完了タスクカード
function PendingTasksCard({
  activities,
  onNavigate,
}: {
  activities: import("@/types").Activity[];
  onNavigate: () => void;
}) {
  const router = useRouter();
  const pending = useMemo(
    () =>
      activities
        .filter((a) => !a.completed)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 6),
    [activities]
  );

  const typeIcons: Record<string, string> = {
    call: "電話", email: "メール", meeting: "MTG", note: "メモ", task: "タスク",
  };

  const isOverdue = (dateStr: string) => new Date(dateStr) < new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">未完了の活動</p>
            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {pending.length}件
            </span>
          </div>
          <button
            onClick={onNavigate}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            すべて見る <ArrowUpRight size={12} />
          </button>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        {pending.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">未完了の活動はありません</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {pending.map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded shrink-0">
                    {typeIcons[a.type]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.subject}</p>
                    <p className="text-xs text-gray-500 truncate">{a.customerName}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-xs font-medium ${isOverdue(a.scheduledAt) ? "text-red-500" : "text-gray-500"}`}>
                    {isOverdue(a.scheduledAt) ? "期限超過" : "予定"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(a.scheduledAt).toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}