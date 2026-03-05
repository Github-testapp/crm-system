export type UserRole = "sales" | "manager" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type CustomerStatus = "prospect" | "active" | "inactive" | "churned";
export type CustomerIndustry =
  | "IT"
  | "finance"
  | "manufacturing"
  | "retail"
  | "healthcare"
  | "education"
  | "other";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: CustomerIndustry;
  status: CustomerStatus;
  address: string;
  website: string;
  assignedTo: string;
  notes: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export interface Deal {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  amount: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ActivityType =
  | "call"
  | "email"
  | "meeting"
  | "note"
  | "task";

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description: string;
  customerId: string;
  customerName: string;
  dealId?: string;
  dealTitle?: string;
  assignedTo: string;
  scheduledAt: string;
  completedAt?: string;
  completed: boolean;
  createdAt: string;
}

export interface FunnelData {
  stage: string;
  label: string;
  count: number;
  amount: number;
}

export interface DashboardStats {
  totalCustomers: number;
  activeDeals: number;
  totalRevenue: number;
  winRate: number;
  monthlyRevenue: { month: string; revenue: number; deals: number }[];
  stageDistribution: FunnelData[];
  recentActivities: Activity[];
}