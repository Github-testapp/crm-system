"use client";
import { useMemo, useState } from "react";
import { Deal, DealStage } from "@/types";
import { useDealStore } from "@/store/dealStore";
import { DealCard } from "./DealCard";
import { formatCurrency } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

const stages: { key: DealStage; label: string; color: string }[] = [
  { key: "lead", label: "リード", color: "bg-gray-100 border-gray-300" },
  { key: "qualified", label: "ヒアリング済", color: "bg-blue-50 border-blue-200" },
  { key: "proposal", label: "提案中", color: "bg-yellow-50 border-yellow-200" },
  { key: "negotiation", label: "交渉中", color: "bg-orange-50 border-orange-200" },
  { key: "closed_won", label: "受注", color: "bg-green-50 border-green-200" },
  { key: "closed_lost", label: "失注", color: "bg-red-50 border-red-200" },
];

interface DealKanbanProps {
  deals: Deal[];
  onEdit: (deal: Deal) => void;
}

export function DealKanban({ deals, onEdit }: DealKanbanProps) {
  const { deleteDeal, updateStage } = useDealStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const stageDeals = useMemo(() => {
    const map: Record<DealStage, Deal[]> = {
      lead: [], qualified: [], proposal: [],
      negotiation: [], closed_won: [], closed_lost: [],
    };
    deals.forEach((d) => map[d.stage].push(d));
    return map;
  }, [deals]);

  const handleDrop = (stage: DealStage) => {
    if (draggingId) {
      updateStage(draggingId, stage);
      toast.success("ステージを更新しました");
      setDraggingId(null);
    }
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(({ key, label, color }) => {
          const columnDeals = stageDeals[key];
          const total = columnDeals.reduce((s, d) => s + d.amount, 0);
          return (
            <div
              key={key}
              className={`flex-none w-64 rounded-xl border-2 ${color} flex flex-col`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(key)}
            >
              <div className="px-3 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{columnDeals.length}件 · {formatCurrency(total)}</p>
                </div>
              </div>
              <div className="flex-1 px-2 pb-2 flex flex-col gap-2 min-h-[100px]">
                {columnDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => setDraggingId(deal.id)}
                    onDragEnd={() => setDraggingId(null)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <DealCard
                      deal={deal}
                      onEdit={onEdit}
                      onDelete={(id) => setDeleteId(id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="商談を削除"
        message="この商談を削除しますか？"
        onConfirm={() => {
          if (deleteId) {
            deleteDeal(deleteId);
            toast.success("商談を削除しました");
            setDeleteId(null);
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}