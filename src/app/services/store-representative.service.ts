import { Injectable, signal } from '@angular/core';
import { StoreRepresentative } from '../models/store-representative.model';

@Injectable({
  providedIn: 'root',
})
export class StoreRepresentativeService {
  private readonly representatives = signal<StoreRepresentative[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@store.com',
      phone: '+1-555-1001',
      storeId: '1',
      status: 'active',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@store.com',
      phone: '+1-555-1002',
      storeId: '1',
      status: 'active',
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.brown@store.com',
      phone: '+1-555-1003',
      storeId: '2',
      status: 'active',
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@store.com',
      phone: '+1-555-1004',
      storeId: '2',
      status: 'active',
    },
    {
      id: '5',
      name: 'David Wilson',
      email: 'david.wilson@store.com',
      phone: '+1-555-1005',
      storeId: '3',
      status: 'active',
    },
    {
      id: '6',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@store.com',
      phone: '+1-555-1006',
      storeId: '4',
      status: 'inactive',
    },
  ]);

  getAll() {
    return this.representatives.asReadonly();
  }

  getById(id: string): StoreRepresentative | undefined {
    return this.representatives().find((rep) => rep.id === id);
  }

  getByStoreId(storeId: string): StoreRepresentative[] {
    return this.representatives().filter((rep) => rep.storeId === storeId);
  }

  create(representative: Omit<StoreRepresentative, 'id'>): StoreRepresentative {
    const newRepresentative: StoreRepresentative = {
      ...representative,
      id: this.generateId(),
    };
    this.representatives.update((reps) => [...reps, newRepresentative]);
    return newRepresentative;
  }

  update(
    id: string,
    updates: Partial<Omit<StoreRepresentative, 'id'>>
  ): StoreRepresentative | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    const updated: StoreRepresentative = {
      ...existing,
      ...updates,
    };

    this.representatives.update((reps) => reps.map((rep) => (rep.id === id ? updated : rep)));

    return updated;
  }

  delete(id: string): boolean {
    const exists = this.getById(id);
    if (!exists) {
      return false;
    }

    this.representatives.update((reps) => reps.filter((rep) => rep.id !== id));
    return true;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
