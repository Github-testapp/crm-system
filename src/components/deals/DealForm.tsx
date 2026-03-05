"use client";
import { useState, useEffect } from "react";
import { Deal, DealStage } from "@/types";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useCustomerStore } from "@/store/customerStore";
import { sampleUsers } from "@/lib/sampleData";

interface DealFormProps {
  initialData?: Deal;
  onSubmit: (data: Omit<Deal, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const stageOptions = [
  { value: "lead", label: "リード" },
  { value: "qualified", label: "ヒアリング済" },
  { value: "proposal", label: "提案中" },
  { value: "negotiation", label: "交渉中" },
  { value: "closed_won", label: "受注" },
  { value: "closed_lost", label: "失注" },
];

export function DealForm({ initialData, onSubmit, onCancel }: DealFormProps) {
  const { customers } = useCustomerStore();

  const [form, setForm] = useState({
    title: "",
    customerId: "",
    customerName: "",
    amount: 0,
    stage: "lead" as DealStage,
    probability: 20,
    expectedCloseDate: "",
    assignedTo: "u1",
    description: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        customerId: initialData.customerId,
        customerName: initialData.customerName,
        amount: initialData.amount,
        stage: initialData.stage,
        probability: initialData.probability,
        expectedCloseDate: initialData.expectedCloseDate.slice(0, 10),
        assignedTo: initialData.assignedTo,
        description: initialData.description,
        tags: initialData.tags,
      });
    }
  }, [initialData]);

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    set("customerId", customerId);
    set("customerName", customer?.company ?? "");
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      set("tags", [...form.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) =>
    set("tags", form.tags.filter((t) => t !== tag));

  const customerOptions = [
    { value: "", label: "-- 顧客を選択 --" },
    ...customers.map((c) => ({ value: c.id, label: `${c.name} (${c.company})` })),
  ];
  const userOptions = sampleUsers.map((u) => ({ value: u.id, label: u.name }));

  const handleSubmit = () => {
    if (!form.title || !form.customerId) return;
    onSubmit({ ...form, expectedCloseDate: new Date(form.expectedCloseDate).toISOString() });
  };

  return (
    <div className="flex flex-col gap-4">
      <Input label="商談タイトル *" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="クラウド移行プロジェクト" />
      <Select label="顧客 *" value={form.customerId} onChange={(e) => handleCustomerChange(e.target.value)} options={customerOptions} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="金額 (円)" type="number" value={form.amount} onChange={(e) => set("amount", Number(e.target.value))} />
        <Input label="確度 (%)" type="number" min={0} max={100} value={form.probability} onChange={(e) => set("probability", Number(e.target.value))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="ステージ" value={form.stage} onChange={(e) => set("stage", e.target.value)} options={stageOptions} />
        <Input label="クローズ予定日" type="date" value={form.expectedCloseDate} onChange={(e) => set("expectedCloseDate", e.target.value)} />
      </div>
      <Select label="担当者" value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} options={userOptions} />
      <Textarea label="概要" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
      <div>
        <label className="text-sm font-medium text-gray-700">タグ</label>
        <div className="flex gap-2 mt-1">
          <input
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="タグを入力してEnter"
          />
          <Button variant="outline" size="sm" onClick={addTag}>追加</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {form.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-600 ml-0.5">×</button>
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>キャンセル</Button>
        <Button onClick={handleSubmit}>{initialData ? "更新する" : "登録する"}</Button>
      </div>
    </div>
  );
}