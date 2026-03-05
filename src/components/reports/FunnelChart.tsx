"use client";
import { useMemo } from "react";
import { Deal } from "@/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

interface FunnelChartProps {
  deals: Deal[];
}

const stages = [
  { key: "lead", label: "リード", color: "bg-gray-400" },
  { key: "qualified", label: "ヒアリング済", color: "bg-blue-400" },
  { key: "proposal", label: "提案中", color: "bg-yellow-400" },
  { key: "negotiation", label: "交渉中", color: "bg-orange-400" },
  { key: "closed_won", label: "受注", color: "bg-green-500" },
];

export function FunnelChart({ deals }: FunnelChartProps) {
  const data = useMemo(() =>
    stages.map((s) => {
      const stageDeals = deals.filter((d) => d.stage === s.key);
      return {
        ...s,
        count: stageDeals.length,
        amount: stageDeals.reduce((sum, d) => sum + d.amount, 0),
      };
    }),
    [deals]
  );

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader><p className="font-semibold text-gray-900">セールスファネル</p></CardHeader>
      <CardBody>
        <div className="flex flex-col gap-3">
          {data.map(({ key, label, color, count, amount }) => (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">{label}</span>
                <span className="text-gray-500">{count}件 · {formatCurrency(amount)}</span>
              </div>
              <div className="h-7 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${color} rounded-lg transition-all duration-500 flex items-center px-2`}
                  style={{ width: `${(count / maxCount) * 100}%` }}
                >
                  {count > 0 && (
                    <span className="text-white text-xs font-semibold">{count}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}