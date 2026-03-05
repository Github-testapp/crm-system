"use client";
import { Customer } from "@/types";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Mail, Phone, Edit, Trash2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

const statusConfig = {
  prospect: { label: "見込み", variant: "yellow" as const },
  active: { label: "アクティブ", variant: "green" as const },
  inactive: { label: "非アクティブ", variant: "gray" as const },
  churned: { label: "解約", variant: "red" as const },
};

const industryLabels: Record<string, string> = {
  IT: "IT", finance: "金融", manufacturing: "製造",
  retail: "小売", healthcare: "医療", education: "教育", other: "その他",
};

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  const router = useRouter();
  const status = statusConfig[customer.status];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div
            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
            onClick={() => router.push(`/customers/${customer.id}`)}
          >
            <Avatar name={customer.name} src={customer.avatar} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{customer.name}</p>
              <p className="text-xs text-gray-500 truncate">{customer.company}</p>
            </div>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <div className="flex flex-col gap-1.5 mb-3">
          <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600">
            <Mail size={13} className="shrink-0" />
            <span className="truncate">{customer.email}</span>
          </a>
          {customer.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone size={13} className="shrink-0" />
              <span>{customer.phone}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="blue">{industryLabels[customer.industry] ?? customer.industry}</Badge>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/customers/${customer.id}`)}>
              <ExternalLink size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(customer)}>
              <Edit size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(customer.id)}
              className="text-red-400 hover:text-red-600 hover:bg-red-50">
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}