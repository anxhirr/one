import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Store } from '../models/store.model';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private readonly http = inject(HttpClient);
  private readonly stores = signal<Store[]>([]);
  private readonly loading = signal<boolean>(false);
  private loaded = false;

  constructor() {
    this.loadStores();
  }

  getAll() {
    return this.stores.asReadonly();
  }

  isLoading() {
    return this.loading.asReadonly();
  }

  private loadStores() {
    if (this.loaded) {
      return;
    }
    this.loading.set(true);
    // Update this URL if your backend runs on a different port or domain
    const apiUrl = 'http://localhost:8000/api/stores';
    this.http.get<Store[]>(apiUrl).subscribe({
      next: (stores) => {
        this.stores.set(stores);
        this.loaded = true;
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading stores:', error);
        this.loading.set(false);
      },
    });
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
