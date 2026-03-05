"use client";
import { useMemo } from "react";
import { Deal } from "@/types";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ja } from "date-fns/locale";

interface RevenueChartProps {
  deals: Deal[];
}

export function RevenueChart({ deals }: RevenueChartProps) {
  const { data, totalRevenue, avgRevenue } = useMemo(() => {
    const wonDeals = deals.filter((d) => d.stage === "closed_won");

    // 常に現在日時を基準にする
    const baseDate = new Date();

    const rows = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(baseDate, 11 - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthDeals = wonDeals.filter((d) =>
        isWithinInterval(new Date(d.expectedCloseDate), { start, end })
      );
      const revenue = Math.round(
        monthDeals.reduce((s, d) => s + d.amount, 0) / 10000
      );
      return {
        month: format(date, "M月", { locale: ja }),
        revenue,
        count: monthDeals.length,
      };
    });

    const total = rows.reduce((s, r) => s + r.revenue, 0);
    const nonZero = rows.filter((r) => r.revenue > 0);
    const avg = nonZero.length > 0 ? Math.round(total / nonZero.length) : 0;

    return { data: rows, totalRevenue: total, avgRevenue: avg };
  }, [deals]);

  const hasData = data.some((d) => d.revenue > 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        <p className="text-blue-600">{payload[0].value.toLocaleString()}万円</p>
        <p className="text-gray-500">{payload[0].payload.count}件</p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-900">月次売上推移</p>
            <p className="text-xs text-gray-400 mt-0.5">直近12ヶ月（受注ベース）</p>
          </div>
          {hasData && (
            <div className="text-right">
              <p className="text-xs text-gray-400">12ヶ月合計</p>
              <p className="text-sm font-bold text-blue-600">
                {totalRevenue.toLocaleString()}万円
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                月平均 {avgRevenue.toLocaleString()}万円
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {!hasData ? (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            表示できるデータがありません
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit="万" />
              <Tooltip content={<CustomTooltip />} />
              {avgRevenue > 0 && (
                <ReferenceLine
                  y={avgRevenue}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{
                    value: `平均 ${avgRevenue}万`,
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "#94a3b8",
                  }}
                />
              )}
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}