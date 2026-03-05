"use client";
import { useMemo } from "react";
import { Activity } from "@/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Phone, Mail, Users, FileText, CheckSquare, CheckCircle, Clock } from "lucide-react";
import { sampleUsers } from "@/lib/sampleData";

interface ActivityStatsProps {
  activities: Activity[];
}

const TYPE_CONFIG = {
  call:    { label: "電話",       icon: Phone,       color: "text-blue-500",   bg: "bg-blue-50" },
  email:   { label: "メール",     icon: Mail,        color: "text-purple-500", bg: "bg-purple-50" },
  meeting: { label: "ミーティング", icon: Users,       color: "text-green-500",  bg: "bg-green-50" },
  note:    { label: "メモ",       icon: FileText,    color: "text-yellow-500", bg: "bg-yellow-50" },
  task:    { label: "タスク",     icon: CheckSquare, color: "text-orange-500", bg: "bg-orange-50" },
};

export function ActivityStats({ activities }: ActivityStatsProps) {
  const { typeStats, userStats, completedCount, totalCount } = useMemo(() => {
    const typeCounts: Record<string, { total: number; completed: number }> = {};
    const userCounts: Record<string, { total: number; completed: number }> = {};

    activities.forEach((a) => {
      // 種別集計
      if (!typeCounts[a.type]) typeCounts[a.type] = { total: 0, completed: 0 };
      typeCounts[a.type].total++;
      if (a.completed) typeCounts[a.type].completed++;

      // 担当者別集計
      if (!userCounts[a.assignedTo]) userCounts[a.assignedTo] = { total: 0, completed: 0 };
      userCounts[a.assignedTo].total++;
      if (a.completed) userCounts[a.assignedTo].completed++;
    });

    const typeStats = Object.entries(typeCounts)
      .map(([type, v]) => ({ type, ...v }))
      .sort((a, b) => b.total - a.total);

    const userStats = Object.entries(userCounts)
      .map(([userId, v]) => ({
        userId,
        name: sampleUsers.find((u) => u.id === userId)?.name ?? userId,
        ...v,
      }))
      .sort((a, b) => b.total - a.total);

    const completedCount = activities.filter((a) => a.completed).length;

    return { typeStats, userStats, completedCount, totalCount: activities.length };
  }, [activities]);

  const completionRate = totalCount > 0
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-900">活動サマリー</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle size={14} />
              完了 {completedCount}件
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <Clock size={14} />
              未完了 {totalCount - completedCount}件
            </span>
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <div className="grid grid-cols-2 gap-6">

          {/* 種別ごとの内訳 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              種別内訳
            </p>
            <div className="flex flex-col gap-2">
              {typeStats.map(({ type, total, completed }) => {
                const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
                if (!config) return null;
                const Icon = config.icon;
                const rate = Math.round((completed / total) * 100);
                return (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={13} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-gray-700">{config.label}</span>
                        <span className="text-xs text-gray-500">{completed}/{total}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 w-8 text-right shrink-0">
                      {rate}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 担当者別 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              担当者別
            </p>
            <div className="flex flex-col gap-2">
              {userStats.map(({ userId, name, total, completed }) => {
                const rate = Math.round((completed / total) * 100);
                const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
                return (
                  <div key={userId} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-gray-700 truncate">{name}</span>
                        <span className="text-xs text-gray-500">{completed}/{total}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 w-8 text-right shrink-0">
                      {rate}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 全体完了率バー */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-600">全体完了率</span>
            <span className="text-sm font-bold text-gray-800">{completionRate}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionRate}%`,
                background: completionRate >= 80
                  ? "#22c55e"
                  : completionRate >= 50
                  ? "#3b82f6"
                  : "#f97316",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">全 {totalCount} 件</span>
            <span className="text-xs text-gray-400">完了 {completedCount} 件</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}