"use client";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCustomerStore } from "@/store/customerStore";
import { useDealStore } from "@/store/dealStore";
import { useActivityStore } from "@/store/activityStore";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft, Mail, Phone, Globe, MapPin, Building2 } from "lucide-react";
import { ActivityTimeline } from "@/components/activities/ActivityTimeline";
import { DealCard } from "@/components/deals/DealCard";
import { sampleUsers } from "@/lib/sampleData";

const statusConfig = {
  prospect: { label: "見込み", variant: "yellow" as const },
  active: { label: "アクティブ", variant: "green" as const },
  inactive: { label: "非アクティブ", variant: "gray" as const },
  churned: { label: "解約", variant: "red" as const },
};

export function CustomerDetail({ id }: { id: string }) {
  const router = useRouter();
  const { getCustomer, initialize } = useCustomerStore();
  const { getDealsByCustomer, initialize: initDeals } = useDealStore();
  const { getActivitiesByCustomer, initialize: initActivities } = useActivityStore();

  useEffect(() => {
    initialize();
    initDeals();
    initActivities();
  }, [initialize, initDeals, initActivities]);

  const customer = getCustomer(id);
  const deals = useMemo(() => getDealsByCustomer(id), [id, getDealsByCustomer]);
  const activities = useMemo(() => getActivitiesByCustomer(id), [id, getActivitiesByCustomer]);
  const assignedUser = sampleUsers.find((u) => u.id === customer?.assignedTo);

  if (!customer) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">顧客が見つかりません</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/customers")}>
          一覧に戻る
        </Button>
      </div>
    );
  }

  const status = statusConfig[customer.status];

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => router.push("/customers")} className="mb-4">
        <ArrowLeft size={16} /> 一覧に戻る
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 顧客情報 */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardBody className="text-center py-8">
              <Avatar name={customer.name} src={customer.avatar} size="lg" className="mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
              <p className="text-gray-500 text-sm">{customer.company}</p>
              <Badge variant={status.variant} className="mt-2">{status.label}</Badge>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-semibold text-gray-700">連絡先情報</p></CardHeader>
            <CardBody className="flex flex-col gap-3">
              <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <Mail size={15} />{customer.email}
              </a>
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone size={15} />{customer.phone}
                </div>
              )}
              {customer.website && (
                <a href={customer.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <Globe size={15} />{customer.website}
                </a>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin size={15} />{customer.address}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-semibold text-gray-700">詳細情報</p></CardHeader>
            <CardBody className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">業種</span>
                <span className="font-medium">{customer.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">担当者</span>
                <span className="font-medium">{assignedUser?.name ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">登録日</span>
                <span>{formatDate(customer.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">更新日</span>
                <span>{formatDate(customer.updatedAt)}</span>
              </div>
              {customer.notes && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-gray-500 mb-1">メモ</p>
                  <p className="text-gray-700">{customer.notes}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* 商談・活動 */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">商談 ({deals.length}件)</h3>
              <p className="text-sm text-gray-500">
                合計: {formatCurrency(deals.reduce((s, d) => s + d.amount, 0))}
              </p>
            </div>
            {deals.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">商談はありません</p>
            ) : (
              <div className="flex flex-col gap-3">
                {deals.map((d) => (
                  <DealCard key={d.id} deal={d} onEdit={() => {}} onDelete={() => {}} compact />
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">活動履歴 ({activities.length}件)</h3>
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}