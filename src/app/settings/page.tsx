"use client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuthStore } from "@/store/authStore";
import { useCustomerStore } from "@/store/customerStore";
import { useDealStore } from "@/store/dealStore";
import { useActivityStore } from "@/store/activityStore";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { UserRole } from "@/types";
import { toast } from "sonner";
import { sampleUsers } from "@/lib/sampleData";

const roleOptions = [
  { value: "sales", label: "営業担当者" },
  { value: "manager", label: "マネージャー" },
  { value: "admin", label: "管理者" },
];

const userOptions = sampleUsers.map((u) => ({ value: u.id, label: `${u.name} (${u.role})` }));

export default function SettingsPage() {
  const { currentUser, login, updateRole } = useAuthStore();
  const { customers } = useCustomerStore();
  const { deals } = useDealStore();
  const { activities } = useActivityStore();

  const handleClearData = () => {
    if (confirm("全データを初期化しますか？この操作は取り消せません。")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <MainLayout title="設定">
      <div className="max-w-2xl flex flex-col gap-6">
        <Card>
          <CardHeader><p className="font-semibold text-gray-900">ユーザー切替（デモ用）</p></CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Select
              label="ログインユーザー"
              value={currentUser?.id ?? ""}
              onChange={(e) => login(e.target.value)}
              options={userOptions}
            />
            <Select
              label="ロール変更"
              value={currentUser?.role ?? "sales"}
              onChange={(e) => updateRole(e.target.value as UserRole)}
              options={roleOptions}
            />
            {currentUser && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                現在: {currentUser.name} / {currentUser.email} / {currentUser.role}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><p className="font-semibold text-gray-900">データ概要</p></CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "顧客", count: customers.length },
                { label: "商談", count: deals.length },
                { label: "活動", count: activities.length },
              ].map(({ label, count }) => (
                <div key={label} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><p className="font-semibold text-gray-900">データ管理</p></CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600 mb-4">
              LocalStorageに保存されたすべてのデータを初期化します。初期サンプルデータに戻ります。
            </p>
            <Button variant="danger" onClick={handleClearData}>
              全データを初期化
            </Button>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
}