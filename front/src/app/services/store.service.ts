import { Injectable, signal } from '@angular/core';
import { Store } from '../models/store.model';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private readonly stores = signal<Store[]>([
    {
      id: '1',
      name: 'Downtown Store',
      address: '123 Main Street, City Center',
      phone: '+1-555-0101',
      email: 'downtown@store.com',
      status: 'active',
    },
    {
      id: '2',
      name: 'Mall Location',
      address: '456 Shopping Mall, North District',
      phone: '+1-555-0102',
      email: 'mall@store.com',
      status: 'active',
    },
    {
      id: '3',
      name: 'Airport Branch',
      address: '789 Airport Road, Terminal 2',
      phone: '+1-555-0103',
      email: 'airport@store.com',
      status: 'active',
    },
    {
      id: '4',
      name: 'Suburban Outlet',
      address: '321 Suburban Avenue, West Side',
      phone: '+1-555-0104',
      email: 'suburban@store.com',
      status: 'inactive',
    },
  ]);

  getAll() {
    return this.stores.asReadonly();
  }

  getById(id: string): Store | undefined {
    return this.stores().find((store) => store.id === id);
  }

  create(store: Omit<Store, 'id'>): Store {
    const newStore: Store = {
      ...store,
      id: this.generateId(),
    };
    this.stores.update((stores) => [...stores, newStore]);
    return newStore;
  }

  update(id: string, updates: Partial<Omit<Store, 'id'>>): Store | null {
    const existingStore = this.getById(id);
    if (!existingStore) {
      return null;
    }

    const updatedStore: Store = {
      ...existingStore,
      ...updates,
    };

    this.stores.update((stores) => stores.map((store) => (store.id === id ? updatedStore : store)));

    return updatedStore;
  }

  delete(id: string): boolean {
    const exists = this.getById(id);
    if (!exists) {
      return false;
    }

    this.stores.update((stores) => stores.filter((store) => store.id !== id));
    return true;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
