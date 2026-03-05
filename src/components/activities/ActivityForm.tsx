"use client";
import { useState, useEffect } from "react";
import { Activity, ActivityType } from "@/types";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useCustomerStore } from "@/store/customerStore";
import { useDealStore } from "@/store/dealStore";
import { sampleUsers } from "@/lib/sampleData";
import { format } from "date-fns";

interface ActivityFormProps {
  initialData?: Activity;
  onSubmit: (data: Omit<Activity, "id" | "createdAt">) => void;
  onCancel: () => void;
}

const typeOptions = [
  { value: "call", label: "電話" },
  { value: "email", label: "メール" },
  { value: "meeting", label: "ミーティング" },
  { value: "note", label: "メモ" },
  { value: "task", label: "タスク" },
];

export function ActivityForm({ initialData, onSubmit, onCancel }: ActivityFormProps) {
  const { customers } = useCustomerStore();
  const { deals } = useDealStore();

  const [form, setForm] = useState({
    type: "call" as ActivityType,
    subject: "",
    description: "",
    customerId: "",
    customerName: "",
    dealId: "",
    dealTitle: "",
    assignedTo: "u1",
    scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    completed: false,
    completedAt: undefined as string | undefined,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        type: initialData.type,
        subject: initialData.subject,
        description: initialData.description,
        customerId: initialData.customerId,
        customerName: initialData.customerName,
        dealId: initialData.dealId ?? "",
        dealTitle: initialData.dealTitle ?? "",
        assignedTo: initialData.assignedTo,
        scheduledAt: initialData.scheduledAt.slice(0, 16),
        completed: initialData.completed,
        completedAt: initialData.completedAt,
      });
    }
  }, [initialData]);

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    set("customerId", customerId);
    set("customerName", customer?.company ?? "");
    set("dealId", "");
    set("dealTitle", "");
  };

  const handleDealChange = (dealId: string) => {
    const deal = deals.find((d) => d.id === dealId);
    set("dealId", dealId);
    set("dealTitle", deal?.title ?? "");
  };

  const customerDeals = deals.filter((d) => d.customerId === form.customerId);
  const customerOptions = [
    { value: "", label: "-- 顧客を選択 --" },
    ...customers.map((c) => ({ value: c.id, label: `${c.name} (${c.company})` })),
  ];
  const dealOptions = [
    { value: "", label: "-- 商談を選択（任意）--" },
    ...customerDeals.map((d) => ({ value: d.id, label: d.title })),
  ];
  const userOptions = sampleUsers.map((u) => ({ value: u.id, label: u.name }));

  const handleSubmit = () => {
    if (!form.subject || !form.customerId) return;
    onSubmit({
      ...form,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      dealId: form.dealId || undefined,
      dealTitle: form.dealTitle || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Select label="活動種別" value={form.type} onChange={(e) => set("type", e.target.value)} options={typeOptions} />
        <Select label="担当者" value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} options={userOptions} />
      </div>
      <Input label="件名 *" value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="初回提案ミーティング" />
      <Select label="顧客 *" value={form.customerId} onChange={(e) => handleCustomerChange(e.target.value)} options={customerOptions} />
      {form.customerId && (
        <Select label="関連商談（任意）" value={form.dealId} onChange={(e) => handleDealChange(e.target.value)} options={dealOptions} />
      )}
      <Input label="予定日時" type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} />
      <Textarea label="詳細" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="活動の詳細を入力..." />
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.completed}
          onChange={(e) => set("completed", e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600"
        />
        <span className="text-sm text-gray-700">完了済み</span>
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>キャンセル</Button>
        <Button onClick={handleSubmit}>{initialData ? "更新する" : "登録する"}</Button>
      </div>
    </div>
  );
}