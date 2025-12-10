import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { StoreRepresentative } from '../models/store-representative.model';

@Injectable({
  providedIn: 'root',
})
export class StoreRepresentativeService {
  private readonly http = inject(HttpClient);
  private readonly representatives = signal<StoreRepresentative[]>([]);
  private readonly loading = signal<boolean>(false);
  private loaded = false;

  constructor() {
    this.loadRepresentatives();
  }

  getAll() {
    return this.representatives.asReadonly();
  }

  isLoading() {
    return this.loading.asReadonly();
  }

  private loadRepresentatives(force = false) {
    if (this.loaded && !force) {
      return;
    }
    this.loading.set(true);
    const apiUrl = 'http://localhost:8000/api/store-representatives';
    this.http.get<StoreRepresentative[]>(apiUrl).subscribe({
      next: (representatives) => {
        this.representatives.set(representatives);
        this.loaded = true;
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading store representatives:', error);
        this.loading.set(false);
      },
    });
  }

  refresh(): void {
    this.loadRepresentatives(true);
  }

  getById(id: string): StoreRepresentative | undefined {
    return this.representatives().find((rep) => rep.id === id);
  }

  getByStoreId(storeId: string): StoreRepresentative[] {
    return this.representatives().filter((rep) => rep.storeId === storeId);
  }

  create(representative: Omit<StoreRepresentative, 'id'>): void {
    const apiUrl = 'http://localhost:8000/api/store-representatives';
    this.http.post<StoreRepresentative>(apiUrl, representative).subscribe({
      next: (newRepresentative) => {
        this.representatives.update((reps) => [...reps, newRepresentative]);
      },
      error: (error) => {
        console.error('Error creating store representative:', error);
      },
    });
  }

  update(id: string, updates: Partial<Omit<StoreRepresentative, 'id'>>): void {
    const apiUrl = `http://localhost:8000/api/store-representatives/${id}`;
    this.http.put<StoreRepresentative>(apiUrl, updates).subscribe({
      next: (updatedRepresentative) => {
        this.representatives.update((reps) =>
          reps.map((rep) => (rep.id === id ? updatedRepresentative : rep))
        );
      },
      error: (error) => {
        console.error('Error updating store representative:', error);
      },
    });
  }

  delete(id: string): void {
    const apiUrl = `http://localhost:8000/api/store-representatives/${id}`;
    this.http.delete(apiUrl).subscribe({
      next: () => {
        this.representatives.update((reps) => reps.filter((rep) => rep.id !== id));
      },
      error: (error) => {
        console.error('Error deleting store representative:', error);
      },
    });
  }
}
