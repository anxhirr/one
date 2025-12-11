import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { StoreManager } from '../models/store-manager.model';

@Injectable({
  providedIn: 'root',
})
export class StoreManagerService {
  private readonly http = inject(HttpClient);
  private readonly managers = signal<StoreManager[]>([]);
  private readonly loading = signal<boolean>(false);

  constructor() {
    this.loadManagers();
  }

  getAll() {
    return this.managers.asReadonly();
  }

  isLoading() {
    return this.loading.asReadonly();
  }

  private loadManagers(searchTerm?: string, storeId?: string) {
    this.loading.set(true);
    const apiUrl = 'http://localhost:8000/api/store-managers';
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    if (storeId) {
      params = params.set('storeId', storeId);
    }
    this.http.get<StoreManager[]>(apiUrl, { params }).subscribe({
      next: (managers) => {
        this.managers.set(managers);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading store managers:', error);
        this.loading.set(false);
      },
    });
  }

  refresh(): void {
    this.loadManagers();
  }

  search(searchTerm?: string, storeId?: string): void {
    this.loadManagers(searchTerm, storeId);
  }

  getById(id: string): StoreManager | undefined {
    return this.managers().find((manager) => manager.id === id);
  }

  getByStoreId(storeId: string): StoreManager[] {
    return this.managers().filter((manager) => manager.storeId === storeId);
  }

  create(manager: Omit<StoreManager, 'id'>): void {
    const apiUrl = 'http://localhost:8000/api/store-managers';
    this.http.post<StoreManager>(apiUrl, manager).subscribe({
      next: () => {
        this.refresh();
      },
      error: (error) => {
        console.error('Error creating store manager:', error);
      },
    });
  }

  update(id: string, updates: Partial<Omit<StoreManager, 'id'>>): void {
    const apiUrl = `http://localhost:8000/api/store-managers/${id}`;
    this.http.put<StoreManager>(apiUrl, updates).subscribe({
      next: () => {
        this.refresh();
      },
      error: (error) => {
        console.error('Error updating store manager:', error);
      },
    });
  }

  delete(id: string): void {
    const apiUrl = `http://localhost:8000/api/store-managers/${id}`;
    this.http.delete(apiUrl).subscribe({
      next: () => {
        this.refresh();
      },
      error: (error) => {
        console.error('Error deleting store manager:', error);
      },
    });
  }
}
