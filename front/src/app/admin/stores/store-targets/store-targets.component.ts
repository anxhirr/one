import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { StoreTarget } from '../../../models/store-target.model';
import { Store } from '../../../models/store.model';
import { StoreTargetService } from '../../../services/store-target.service';
import { StoreService } from '../../../services/store.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StoreTargetFormComponent } from './store-target-form/store-target-form.component';

@Component({
  selector: 'app-store-targets',
  imports: [
    CommonModule,
    FormsModule,
    StoreTargetFormComponent,
    ConfirmDialogComponent,
    MatIconModule,
  ],
  templateUrl: './store-targets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreTargetsComponent implements OnInit, OnDestroy {
  private readonly targetService = inject(StoreTargetService);
  private readonly storeService = inject(StoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  readonly targets = signal<StoreTarget[]>([]);
  readonly loading = signal<boolean>(false);
  readonly store = signal<Store | null>(null);
  readonly storeId = signal<string>('');
  readonly periodTypeFilter = signal<string>('');
  readonly metricTypeFilter = signal<string>('');
  readonly statusFilter = signal<string>('');
  readonly showForm = signal<boolean>(false);
  readonly editingTarget = signal<StoreTarget | null>(null);
  readonly showDeleteDialog = signal<boolean>(false);
  readonly targetToDelete = signal<StoreTarget | null>(null);

  readonly hasActiveFilters = computed(() => {
    return !!(this.periodTypeFilter() || this.metricTypeFilter() || this.statusFilter());
  });

  ngOnInit(): void {
    const storeId = this.route.snapshot.paramMap.get('storeId');
    if (storeId) {
      this.storeId.set(storeId);
      this.loadStore(storeId);
      this.loadTargets(storeId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStore(storeId: string): void {
    const store = this.storeService.getById(storeId);
    if (store) {
      this.store.set(store);
    }
  }

  private loadTargets(storeId: string): void {
    this.loading.set(true);
    const filters: any = {};
    if (this.periodTypeFilter()) {
      filters.period_type = this.periodTypeFilter();
    }
    if (this.metricTypeFilter()) {
      filters.metric_type = this.metricTypeFilter();
    }
    if (this.statusFilter()) {
      filters.status = this.statusFilter();
    }

    this.targetService
      .getTargets(storeId, filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (targets) => {
          this.targets.set(targets);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading targets:', error);
          this.loading.set(false);
        },
      });
  }

  onPeriodTypeFilterChange(periodType: string): void {
    this.periodTypeFilter.set(periodType);
    const storeId = this.route.snapshot.paramMap.get('storeId');
    if (storeId) {
      this.loadTargets(storeId);
    }
  }

  onMetricTypeFilterChange(metricType: string): void {
    this.metricTypeFilter.set(metricType);
    const storeId = this.route.snapshot.paramMap.get('storeId');
    if (storeId) {
      this.loadTargets(storeId);
    }
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter.set(status);
    const storeId = this.route.snapshot.paramMap.get('storeId');
    if (storeId) {
      this.loadTargets(storeId);
    }
  }

  clearFilters(): void {
    this.periodTypeFilter.set('');
    this.metricTypeFilter.set('');
    this.statusFilter.set('');
    const storeId = this.route.snapshot.paramMap.get('storeId');
    if (storeId) {
      this.loadTargets(storeId);
    }
  }

  onAdd(): void {
    this.editingTarget.set(null);
    this.showForm.set(true);
  }

  onEdit(target: StoreTarget): void {
    this.editingTarget.set(target);
    this.showForm.set(true);
  }

  onDelete(target: StoreTarget): void {
    this.targetToDelete.set(target);
    this.showDeleteDialog.set(true);
  }

  onFormClose(): void {
    this.showForm.set(false);
    this.editingTarget.set(null);
  }

  onFormSave(): void {
    this.showForm.set(false);
    this.editingTarget.set(null);
    const storeId = this.route.snapshot.paramMap.get('storeId');
    if (storeId) {
      this.loadTargets(storeId);
    }
  }

  onDeleteConfirm(): void {
    const target = this.targetToDelete();
    const storeId = this.route.snapshot.paramMap.get('storeId');
    if (target && storeId) {
      this.targetService
        .deleteTarget(storeId, target.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadTargets(storeId);
            this.showDeleteDialog.set(false);
            this.targetToDelete.set(null);
          },
          error: (error) => {
            console.error('Error deleting target:', error);
          },
        });
    }
  }

  onDeleteCancel(): void {
    this.showDeleteDialog.set(false);
    this.targetToDelete.set(null);
  }

  onBack(): void {
    this.router.navigate(['/admin/stores']);
  }

  getMetricTypeLabel(metricType: string): string {
    const labels: { [key: string]: string } = {
      customer_visits: 'Customer Visits',
      orders: 'Orders',
      revenue: 'Revenue',
    };
    return labels[metricType] || metricType;
  }

  getPeriodTypeLabel(periodType: string): string {
    const labels: { [key: string]: string } = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    };
    return labels[periodType] || periodType;
  }
}
