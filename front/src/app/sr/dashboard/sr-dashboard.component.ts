import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData } from '../../models/dashboard.model';

@Component({
  selector: 'app-sr-dashboard',
  imports: [CommonModule],
  templateUrl: './sr-dashboard.component.html',
  styleUrl: './sr-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SrDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly dashboardData = signal<DashboardData | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getStoreRepresentativeStore().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.error.set(err.error?.message || 'Failed to load store data');
        this.loading.set(false);
      },
    });
  }

  refresh(): void {
    this.loadDashboardData();
  }
}

