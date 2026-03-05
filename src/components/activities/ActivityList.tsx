"use client";
import { useState, useEffect, useMemo } from "react";
import { useActivityStore } from "@/store/activityStore";
import { useCustomerStore } from "@/store/customerStore";
import { useDealStore } from "@/store/dealStore";
import { Activity } from "@/types";
import { ActivityForm } from "./ActivityForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Card, CardBody } from "@/components/ui/Card";
import { Phone, Mail, Users, FileText, CheckSquare, Edit, Trash2, Check, Plus, Search } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const typeConfig = {
  call: { icon: Phone, label: "電話", color: "text-blue-600 bg-blue-100" },
  email: { icon: Mail, label: "メール", color: "text-purple-600 bg-purple-100" },
  meeting: { icon: Users, label: "MTG", color: "text-green-600 bg-green-100" },
  note: { icon: FileText, label: "メモ", color: "text-yellow-600 bg-yellow-100" },
  task: { icon: CheckSquare, label: "タスク", color: "text-orange-600 bg-orange-100" },
};

const typeOptions = [
  { value: "all", label: "全種別" },
  { value: "call", label: "電話" },
  { value: "email", label: "メール" },
  { value: "meeting", label: "ミーティング" },
  { value: "note", label: "メモ" },
  { value: "task", label: "タスク" },
];

const statusOptions = [
  { value: "all", label: "全ステータス" },
  { value: "incomplete", label: "未完了" },
  { value: "complete", label: "完了" },
];

export function ActivityList() {
  const { activities, initialize, addActivity, updateActivity, completeActivity, deleteActivity } = useActivityStore();
  const { initialize: initCustomers } = useCustomerStore();
  const { initialize: initDeals } = useDealStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Activity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    initialize();
    initCustomers();
    initDeals();
  }, [initialize, initCustomers, initDeals]);

  const filtered = useMemo(() => {
    return activities
      .filter((a) => {
        const matchSearch = !search || a.subject.includes(search) || a.customerName.includes(search);
        const matchType = typeFilter === "all" || a.type === typeFilter;
        const matchStatus =
          statusFilter === "all" ||
          (statusFilter === "complete" && a.completed) ||
          (statusFilter === "incomplete" && !a.completed);
        return matchSearch && matchType && matchStatus;
      })
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }, [activities, search, typeFilter, statusFilter]);

  const handleSubmit = (data: Omit<Activity, "id" | "createdAt">) => {
    if (editTarget) {
      updateActivity(editTarget.id, data);
      toast.success("活動を更新しました");
    } else {
      addActivity(data);
      toast.success("活動を登録しました");
    }
    setShowForm(false);
    setEditTarget(undefined);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">活動履歴</h2>
          <p className="text-sm text-gray-500 mt-1">全 {activities.length} 件</p>
        </div>
        <Button onClick={() => { setEditTarget(undefined); setShowForm(true); }}>
          <Plus size={16} /> 新規活動
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="件名・顧客名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select options={typeOptions} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-32" />
        <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36" />
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((activity) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;
          return (
            <Card key={activity.id}>
              <CardBody className="p-4">
                <div className="flex items-start gap-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", config.color)}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={cn("font-medium text-sm", activity.completed && "line-through text-gray-400")}>
                          {activity.subject}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {activity.customerName} · {formatDateTime(activity.scheduledAt)}
                        </p>
                        {activity.dealTitle && (
                          <p className="text-xs text-blue-600 mt-0.5">商談: {activity.dealTitle}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!activity.completed && (
                          <Button variant="ghost" size="sm" onClick={() => { completeActivity(activity.id); toast.success("完了にしました"); }}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50">
                            <Check size={14} />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => { setEditTarget(activity); setShowForm(true); }}>
                          <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(activity.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-gray-600 mt-2 truncate">{activity.description}</p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">活動が見つかりません</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTarget(undefined); }}
        title={editTarget ? "活動を編集" : "新規活動登録"}
        size="lg"
      >
        <ActivityForm
          initialData={editTarget}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditTarget(undefined); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="活動を削除"
        message="この活動を削除しますか？"
        onConfirm={() => { if (deleteId) { deleteActivity(deleteId); toast.success("活動を削除しました"); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}