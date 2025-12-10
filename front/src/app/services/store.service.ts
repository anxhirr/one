import { HttpClient, HttpParams } from '@angular/common/http';
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

  private loadStores(force = false) {
    if (this.loaded && !force) {
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

  refresh(): void {
    this.loadStores(true);
  }

  search(searchTerm: string, status?: string): void {
    this.loading.set(true);
    const apiUrl = 'http://localhost:8000/api/stores';
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    if (status) {
      params = params.set('status', status);
    }
    this.http.get<Store[]>(apiUrl, { params }).subscribe({
      next: (stores) => {
        this.stores.set(stores);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error searching stores:', error);
        this.loading.set(false);
      },
    });
  }

  getById(id: string): Store | undefined {
    return this.stores().find((store) => store.id === id);
  }

  create(store: Omit<Store, 'id'>): void {
    const apiUrl = 'http://localhost:8000/api/stores';
    this.http.post<Store>(apiUrl, store).subscribe({
      next: (newStore) => {
        this.stores.update((stores) => [...stores, newStore]);
      },
      error: (error) => {
        console.error('Error creating store:', error);
      },
    });
  }

  update(id: string, updates: Partial<Omit<Store, 'id'>>): void {
    const apiUrl = `http://localhost:8000/api/stores/${id}`;
    this.http.put<Store>(apiUrl, updates).subscribe({
      next: (updatedStore) => {
        this.stores.update((stores) =>
          stores.map((store) => (store.id === id ? updatedStore : store))
        );
      },
      error: (error) => {
        console.error('Error updating store:', error);
      },
    });
  }

  delete(id: string): void {
    const apiUrl = `http://localhost:8000/api/stores/${id}`;
    this.http.delete(apiUrl).subscribe({
      next: () => {
        this.stores.update((stores) => stores.filter((store) => store.id !== id));
      },
      error: (error) => {
        console.error('Error deleting store:', error);
      },
    });
  }
}
