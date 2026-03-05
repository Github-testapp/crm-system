"use client";
import { useState, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { useActivityStore } from "@/store/activityStore";
import { useDealStore } from "@/store/dealStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  Bell, X, AlertCircle, Calendar, TrendingUp,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

const roleLabels = {
  admin:   { label: "管理者",     variant: "red"   as const },
  manager: { label: "マネージャー", variant: "blue"  as const },
  sales:   { label: "営業担当",   variant: "green" as const },
};

interface Notification {
  id: string;
  type: "overdue" | "upcoming" | "deal_expiring";
  title: string;
  body: string;
  href: string;
  urgent: boolean;
}

export function Header({ title }: { title: string }) {
  const { currentUser } = useAuthStore();
  const { activities } = useActivityStore();
  const { deals } = useDealStore();
  const { readIds, markAsRead, markAllAsRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // 全通知を生成
  const allNotifications = useMemo<Notification[]>(() => {
    const now = new Date();
    const result: Notification[] = [];

    // 期限超過の未完了活動
    activities
      .filter((a) => !a.completed && new Date(a.scheduledAt) < now)
      .forEach((a) => {
        result.push({
          id: `overdue-${a.id}`,
          type: "overdue",
          title: "期限超過の活動",
          body: `【${a.customerName}】${a.subject}`,
          href: "/activities",
          urgent: true,
        });
      });

    // 3日以内の未完了活動
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    activities
      .filter(
        (a) =>
          !a.completed &&
          new Date(a.scheduledAt) >= now &&
          new Date(a.scheduledAt) <= threeDaysLater
      )
      .forEach((a) => {
        result.push({
          id: `upcoming-${a.id}`,
          type: "upcoming",
          title: "予定が近い活動",
          body: `【${a.customerName}】${a.subject} — ${formatDate(a.scheduledAt)}`,
          href: "/activities",
          urgent: false,
        });
      });

    // クローズ予定日が7日以内の進行中商談
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    deals
      .filter(
        (d) =>
          !["closed_won", "closed_lost"].includes(d.stage) &&
          new Date(d.expectedCloseDate) <= sevenDaysLater
      )
      .forEach((d) => {
        result.push({
          id: `deal-${d.id}`,
          type: "deal_expiring",
          title: "クローズ期日が迫る商談",
          body: `【${d.customerName}】${d.title} — ${formatDate(d.expectedCloseDate)}`,
          href: "/deals",
          urgent: new Date(d.expectedCloseDate) < now,
        });
      });

    return result;
  }, [activities, deals]);

  // 未読のみ
  const unreadNotifications = useMemo(
    () => allNotifications.filter((n) => !readIds.includes(n.id)),
    [allNotifications, readIds]
  );

  const urgentCount = unreadNotifications.filter((n) => n.urgent).length;
  const badgeCount = unreadNotifications.length;

  const handleOpen = () => setOpen((v) => !v);

  const handleClose = () => setOpen(false);

  // 1件クリック → その通知を既読にしてページ遷移
  const handleClickNotification = (n: Notification) => {
    markAsRead(n.id);
    setOpen(false);
    router.push(n.href);
  };

  // すべて既読
  const handleMarkAllRead = () => {
    markAllAsRead(allNotifications.map((n) => n.id));
  };

  const typeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "overdue":
        return <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />;
      case "upcoming":
        return <Calendar size={15} className="text-blue-500 shrink-0 mt-0.5" />;
      case "deal_expiring":
        return <TrendingUp size={15} className="text-orange-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <h1 className="text-xl font-semibold text-gray-900 ml-10 md:ml-0">{title}</h1>

      <div className="flex items-center gap-4">
        {/* ベルアイコン */}
        <div className="relative">
          <button
            onClick={handleOpen}
            className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} />
            {badgeCount > 0 && (
              <span
                className={`absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1 ${
                  urgentCount > 0 ? "bg-red-500" : "bg-blue-500"
                }`}
              >
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </button>

          {/* 通知パネル */}
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={handleClose} />
              <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                {/* パネルヘッダー */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900">通知</p>
                    {badgeCount > 0 && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        {badgeCount}件
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {badgeCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        すべて既読
                      </button>
                    )}
                    <button
                      onClick={handleClose}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* 通知リスト */}
                <div className="max-h-96 overflow-y-auto">
                  {unreadNotifications.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-gray-400">
                      <Bell size={28} className="mx-auto mb-2 opacity-30" />
                      新しい通知はありません
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {unreadNotifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleClickNotification(n)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                            n.urgent ? "bg-red-50 hover:bg-red-100" : ""
                          }`}
                        >
                          {typeIcon(n.type)}
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-semibold mb-0.5 ${
                                n.urgent ? "text-red-600" : "text-gray-500"
                              }`}
                            >
                              {n.title}
                            </p>
                            <p className="text-sm text-gray-800 leading-snug break-words">
                              {n.body}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* パネルフッター */}
                <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
                  <button
                    onClick={() => { handleClose(); router.push("/activities"); }}
                    className="w-full text-xs text-blue-600 hover:underline text-center py-1"
                  >
                    活動一覧をすべて見る
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ユーザー情報 */}
        {currentUser && (
          <div className="flex items-center gap-3">
            <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <Badge variant={roleLabels[currentUser.role].variant}>
                {roleLabels[currentUser.role].label}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}