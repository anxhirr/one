export interface StoreTarget {
  id: string;
  store_id: string;
  metric_type: 'customer_visits' | 'orders' | 'revenue';
  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  target_value: string;
  period_start: string;
  period_end: string | null;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateStoreTarget {
  metric_type: 'customer_visits' | 'orders' | 'revenue';
  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  target_value: number;
  period_start: string;
  period_end?: string | null;
  status: 'active' | 'completed' | 'cancelled';
}

export interface UpdateStoreTarget extends Partial<CreateStoreTarget> {}
