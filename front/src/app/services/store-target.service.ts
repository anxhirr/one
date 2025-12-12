import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateStoreTarget, StoreTarget, UpdateStoreTarget } from '../models/store-target.model';

export interface TargetFilters {
  period_type?: string;
  metric_type?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StoreTargetService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';

  getTargets(storeId: string, filters?: TargetFilters): Observable<StoreTarget[]> {
    let params = new HttpParams();
    if (filters?.period_type) {
      params = params.set('period_type', filters.period_type);
    }
    if (filters?.metric_type) {
      params = params.set('metric_type', filters.metric_type);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    return this.http.get<StoreTarget[]>(`${this.apiUrl}/stores/${storeId}/targets`, { params });
  }

  createTarget(storeId: string, target: CreateStoreTarget): Observable<StoreTarget> {
    return this.http.post<StoreTarget>(`${this.apiUrl}/stores/${storeId}/targets`, target);
  }

  updateTarget(
    storeId: string,
    targetId: string,
    target: UpdateStoreTarget
  ): Observable<StoreTarget> {
    return this.http.put<StoreTarget>(
      `${this.apiUrl}/stores/${storeId}/targets/${targetId}`,
      target
    );
  }

  deleteTarget(storeId: string, targetId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/stores/${storeId}/targets/${targetId}`);
  }
}
