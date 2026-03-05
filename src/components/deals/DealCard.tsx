"use client";
import { Deal } from "@/types";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, TrendingUp, Edit, Trash2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

const stageConfig = {
  lead: { label: "リード", variant: "gray" as const },
  qualified: { label: "ヒアリング済", variant: "blue" as const },
  proposal: { label: "提案中", variant: "yellow" as const },
  negotiation: { label: "交渉中", variant: "orange" as const },
  closed_won: { label: "受注", variant: "green" as const },
  closed_lost: { label: "失注", variant: "red" as const },
};

interface DealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

export function DealCard({ deal, onEdit, onDelete, compact }: DealCardProps) {
  const router = useRouter();
  const stage = stageConfig[deal.stage];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-2">
          <p
            className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-blue-600 flex-1 min-w-0 pr-2 truncate"
            onClick={() => router.push(`/deals/${deal.id}`)}
          >
            {deal.title}
          </p>
          <Badge variant={stage.variant}>{stage.label}</Badge>
        </div>
        <p className="text-xs text-gray-500 mb-3">{deal.customerName}</p>
        <div className="text-lg font-bold text-gray-900 mb-2">
          {formatCurrency(deal.amount)}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <TrendingUp size={12} />確度 {deal.probability}%
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />{formatDate(deal.expectedCloseDate)}
          </span>
        </div>
        {deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {deal.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
            ))}
          </div>
        )}
        {!compact && (
          <div className="flex justify-end gap-1 pt-2 border-t border-gray-100">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/deals/${deal.id}`)}>
              <ExternalLink size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(deal)}>
              <Edit size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(deal.id)}
              className="text-red-400 hover:text-red-600 hover:bg-red-50">
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}