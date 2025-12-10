export interface StoreDetails {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface StoreMetrics {
  totalManagers: number;
  totalRepresentatives: number;
  storeAgeDays: number;
}

export interface DashboardData {
  store: StoreDetails;
  metrics: StoreMetrics;
}

