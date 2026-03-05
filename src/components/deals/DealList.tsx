"use client";
import { useState, useEffect, useMemo } from "react";
import { useDealStore } from "@/store/dealStore";
import { useCustomerStore } from "@/store/customerStore";
import { Deal } from "@/types";
import { DealCard } from "./DealCard";
import { DealKanban } from "./DealKanban";
import { DealForm } from "./DealForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Plus, LayoutGrid, List, Search } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatCurrency } from "@/lib/utils";

const stageOptions = [
  { value: "all", label: "全ステージ" },
  { value: "lead", label: "リード" },
  { value: "qualified", label: "ヒアリング済" },
  { value: "proposal", label: "提案中" },
  { value: "negotiation", label: "交渉中" },
  { value: "closed_won", label: "受注" },
  { value: "closed_lost", label: "失注" },
];

export function DealList() {
  const { deals, initialize, addDeal, updateDeal, deleteDeal } = useDealStore();
  const { initialize: initCustomers } = useCustomerStore();
  const [view, setView] = useState<"grid" | "kanban">("kanban");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Deal | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    initialize();
    initCustomers();
  }, [initialize, initCustomers]);

  const filtered = useMemo(() => {
    return deals.filter((d) => {
      const matchSearch = !search || d.title.includes(search) || d.customerName.includes(search);
      const matchStage = stageFilter === "all" || d.stage === stageFilter;
      return matchSearch && matchStage;
    });
  }, [deals, search, stageFilter]);

  const totalPipeline = filtered.filter((d) => !["closed_won", "closed_lost"].includes(d.stage))
    .reduce((s, d) => s + d.amount, 0);

  const handleSubmit = (data: Omit<Deal, "id" | "createdAt" | "updatedAt">) => {
    if (editTarget) {
      updateDeal(editTarget.id, data);
      toast.success("商談を更新しました");
    } else {
      addDeal(data);
      toast.success("商談を登録しました");
    }
    setShowForm(false);
    setEditTarget(undefined);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">商談管理</h2>
          <p className="text-sm text-gray-500 mt-1">
            パイプライン合計: {formatCurrency(totalPipeline)} ({filtered.length}件)
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              className={`px-3 py-2 text-sm ${view === "kanban" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`px-3 py-2 text-sm ${view === "grid" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setView("grid")}
            >
              <List size={16} />
            </button>
          </div>
          <Button onClick={() => { setEditTarget(undefined); setShowForm(true); }}>
            <Plus size={16} /> 新規商談
          </Button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="商談名・顧客名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select options={stageOptions} value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-40" />
      </div>

      {view === "kanban" ? (
        <DealKanban deals={filtered} onEdit={(d) => { setEditTarget(d); setShowForm(true); }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <DealCard
              key={d.id}
              deal={d}
              onEdit={(d) => { setEditTarget(d); setShowForm(true); }}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTarget(undefined); }}
        title={editTarget ? "商談を編集" : "新規商談登録"}
        size="lg"
      >
        <DealForm
          initialData={editTarget}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditTarget(undefined); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="商談を削除"
        message="この商談を削除しますか？"
        onConfirm={() => {
          if (deleteId) { deleteDeal(deleteId); toast.success("商談を削除しました"); setDeleteId(null); }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}