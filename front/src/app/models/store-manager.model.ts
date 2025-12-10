export interface StoreManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeId: string;
  status: 'active' | 'inactive';
}
