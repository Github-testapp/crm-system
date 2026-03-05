"use client";
import { Activity } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { Phone, Mail, Users, FileText, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig = {
  call: { icon: Phone, label: "電話", color: "bg-blue-100 text-blue-600" },
  email: { icon: Mail, label: "メール", color: "bg-purple-100 text-purple-600" },
  meeting: { icon: Users, label: "ミーティング", color: "bg-green-100 text-green-600" },
  note: { icon: FileText, label: "メモ", color: "bg-yellow-100 text-yellow-600" },
  task: { icon: CheckSquare, label: "タスク", color: "bg-orange-100 text-orange-600" },
};

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return <p className="text-sm text-gray-500 py-4">活動履歴はありません</p>;
  }

  const sorted = [...activities].sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gray-200" />
      <div className="flex flex-col gap-4">
        {sorted.map((activity) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;
          return (
            <div key={activity.id} className="flex gap-4 relative">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10", config.color)}>
                <Icon size={16} />
              </div>
              <div className="flex-1 bg-white rounded-lg border border-gray-200 p-3 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{activity.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(activity.scheduledAt)}</p>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full shrink-0",
                    activity.completed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {activity.completed ? "完了" : "未完了"}
                  </span>
                </div>
                {activity.description && (
                  <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
                )}
                {activity.dealTitle && (
                  <p className="text-xs text-blue-600 mt-1">商談: {activity.dealTitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}