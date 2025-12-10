import { Injectable, signal } from '@angular/core';
import { StoreManager } from '../models/store-manager.model';

@Injectable({
  providedIn: 'root',
})
export class StoreManagerService {
  private readonly managers = signal<StoreManager[]>([
    {
      id: '1',
      name: 'Robert Taylor',
      email: 'robert.taylor@store.com',
      phone: '+1-555-2001',
      storeId: '1',
      status: 'active',
    },
    {
      id: '2',
      name: 'Jennifer Martinez',
      email: 'jennifer.martinez@store.com',
      phone: '+1-555-2002',
      storeId: '2',
      status: 'active',
    },
    {
      id: '3',
      name: 'William Garcia',
      email: 'william.garcia@store.com',
      phone: '+1-555-2003',
      storeId: '3',
      status: 'active',
    },
    {
      id: '4',
      name: 'Amanda Rodriguez',
      email: 'amanda.rodriguez@store.com',
      phone: '+1-555-2004',
      storeId: '4',
      status: 'inactive',
    },
  ]);

  getAll() {
    return this.managers.asReadonly();
  }

  getById(id: string): StoreManager | undefined {
    return this.managers().find((manager) => manager.id === id);
  }

  getByStoreId(storeId: string): StoreManager[] {
    return this.managers().filter((manager) => manager.storeId === storeId);
  }

  create(manager: Omit<StoreManager, 'id'>): StoreManager {
    const newManager: StoreManager = {
      ...manager,
      id: this.generateId(),
    };
    this.managers.update((managers) => [...managers, newManager]);
    return newManager;
  }

  update(id: string, updates: Partial<Omit<StoreManager, 'id'>>): StoreManager | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    const updated: StoreManager = {
      ...existing,
      ...updates,
    };

    this.managers.update((managers) =>
      managers.map((manager) => (manager.id === id ? updated : manager))
    );

    return updated;
  }

  delete(id: string): boolean {
    const exists = this.getById(id);
    if (!exists) {
      return false;
    }

    this.managers.update((managers) => managers.filter((manager) => manager.id !== id));
    return true;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
