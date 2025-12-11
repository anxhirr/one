import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData } from '../../models/dashboard.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sr-dashboard',
  imports: [CommonModule],
  templateUrl: './sr-dashboard.component.html',
  styleUrl: './sr-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SrDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);

  readonly dashboardData = signal<DashboardData | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly loggingOut = signal<boolean>(false);
  readonly currentUser = computed(() => this.authService.getUser()());

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

  logout(): void {
    this.loggingOut.set(true);
    this.authService.logout().subscribe({
      next: () => {
        // Navigation is handled by AuthService
        this.loggingOut.set(false);
      },
      error: (err) => {
        console.error('Error during logout:', err);
        // Even if API call fails, clear local auth and navigate
        // AuthService handles this in the tap operator, but we ensure it happens
        this.loggingOut.set(false);
      },
    });
  }
}

