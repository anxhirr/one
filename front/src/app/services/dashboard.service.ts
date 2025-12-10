import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardData } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';

  /**
   * Get store details for authenticated Store Manager
   */
  getStoreManagerStore(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/store-managers/my-store`);
  }

  /**
   * Get store details for authenticated Store Representative
   */
  getStoreRepresentativeStore(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/store-representatives/my-store`);
  }
}
