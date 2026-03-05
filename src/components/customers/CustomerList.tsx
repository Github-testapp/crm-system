"use client";
import { useState, useEffect, useMemo } from "react";
import { useCustomerStore } from "@/store/customerStore";
import { Customer } from "@/types";
import { CustomerCard } from "./CustomerCard";
import { CustomerForm } from "./CustomerForm";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

const filterOptions = [
  { value: "all", label: "全ステータス" },
  { value: "prospect", label: "見込み" },
  { value: "active", label: "アクティブ" },
  { value: "inactive", label: "非アクティブ" },
  { value: "churned", label: "解約" },
];

export function CustomerList() {
  const { customers, initialize, addCustomer, updateCustomer, deleteCustomer } =
    useCustomerStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        !search ||
        c.name.includes(search) ||
        c.company.includes(search) ||
        c.email.includes(search);
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customers, search, statusFilter]);

  const handleSubmit = (data: Omit<Customer, "id" | "createdAt" | "updatedAt">) => {
    if (editTarget) {
      updateCustomer(editTarget.id, data);
      toast.success("顧客情報を更新しました");
    } else {
      addCustomer(data);
      toast.success("顧客を登録しました");
    }
    setShowForm(false);
    setEditTarget(undefined);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteCustomer(deleteId);
      toast.success("顧客を削除しました");
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">顧客管理</h2>
          <p className="text-sm text-gray-500 mt-1">全 {customers.length} 件</p>
        </div>
        <Button onClick={() => { setEditTarget(undefined); setShowForm(true); }}>
          <Plus size={16} /> 新規顧客
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="氏名・会社名・メールで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={filterOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">顧客が見つかりません</p>
          <p className="text-sm mt-1">検索条件を変更するか、新規顧客を登録してください</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <CustomerCard
              key={c.id}
              customer={c}
              onEdit={(c) => { setEditTarget(c); setShowForm(true); }}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTarget(undefined); }}
        title={editTarget ? "顧客情報を編集" : "新規顧客登録"}
        size="lg"
      >
        <CustomerForm
          initialData={editTarget}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditTarget(undefined); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="顧客を削除"
        message="この顧客を削除しますか？関連する商談・活動履歴は削除されません。"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}