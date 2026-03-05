"use client";
import { useState, useEffect } from "react";
import { Customer, CustomerStatus, CustomerIndustry } from "@/types";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { sampleUsers } from "@/lib/sampleData";

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: Omit<Customer, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const statusOptions = [
  { value: "prospect", label: "見込み" },
  { value: "active", label: "アクティブ" },
  { value: "inactive", label: "非アクティブ" },
  { value: "churned", label: "解約" },
];

const industryOptions = [
  { value: "IT", label: "IT" },
  { value: "finance", label: "金融" },
  { value: "manufacturing", label: "製造" },
  { value: "retail", label: "小売" },
  { value: "healthcare", label: "医療" },
  { value: "education", label: "教育" },
  { value: "other", label: "その他" },
];

const userOptions = sampleUsers.map((u) => ({ value: u.id, label: u.name }));

export function CustomerForm({ initialData, onSubmit, onCancel }: CustomerFormProps) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    industry: "IT" as CustomerIndustry,
    status: "prospect" as CustomerStatus,
    address: "",
    website: "",
    assignedTo: "u1",
    notes: "",
    avatar: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        company: initialData.company,
        email: initialData.email,
        phone: initialData.phone,
        industry: initialData.industry,
        status: initialData.status,
        address: initialData.address,
        website: initialData.website,
        assignedTo: initialData.assignedTo,
        notes: initialData.notes,
        avatar: initialData.avatar ?? "",
      });
    }
  }, [initialData]);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.name || !form.company || !form.email) return;
    onSubmit(form);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="氏名 *" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="山本 健一" />
        <Input label="会社名 *" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="株式会社〇〇" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="メールアドレス *" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="example@company.co.jp" />
        <Input label="電話番号" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="03-0000-0000" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="業種" value={form.industry} onChange={(e) => set("industry", e.target.value)} options={industryOptions} />
        <Select label="ステータス" value={form.status} onChange={(e) => set("status", e.target.value)} options={statusOptions} />
      </div>
      <Input label="住所" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="東京都渋谷区..." />
      <Input label="Webサイト" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://example.co.jp" />
      <Select label="担当者" value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} options={userOptions} />
      <Textarea label="メモ" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="顧客に関するメモを入力..." rows={3} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>キャンセル</Button>
        <Button onClick={handleSubmit}>{initialData ? "更新する" : "登録する"}</Button>
      </div>
    </div>
  );
}