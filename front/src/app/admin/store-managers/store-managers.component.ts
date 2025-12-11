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
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { StoreManager } from '../../models/store-manager.model';
import { StoreManagerService } from '../../services/store-manager.service';
import { StoreService } from '../../services/store.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { StoreManagerFormComponent } from './store-manager-form/store-manager-form.component';

@Component({
  selector: 'app-store-managers',
  imports: [
    CommonModule,
    FormsModule,
    StoreManagerFormComponent,
    ConfirmDialogComponent,
    MatIconModule,
  ],
  templateUrl: './store-managers.component.html',
  styleUrl: './store-managers.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreManagersComponent implements OnInit, OnDestroy {
  private readonly smService = inject(StoreManagerService);
  private readonly storeService = inject(StoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  readonly managers = this.smService.getAll();
  readonly stores = this.storeService.getAll();
  readonly loading = this.smService.isLoading();
  readonly searchTerm = signal<string>('');
  readonly selectedStoreId = signal<string>('');
  readonly showForm = signal<boolean>(false);
  readonly editingManager = signal<StoreManager | null>(null);
  readonly showDeleteDialog = signal<boolean>(false);
  readonly managerToDelete = signal<StoreManager | null>(null);

  readonly managersWithStoreNames = computed(() => {
    return this.managers().map((manager) => {
      const store = this.stores().find((s) => s.id === manager.storeId);
      return {
        manager,
        storeName: store?.name || 'Unknown Store',
      };
    });
  });

  readonly hasActiveFilters = computed(() => {
    return !!(this.searchTerm() || this.selectedStoreId());
  });

  ngOnInit(): void {
    // Read query parameters from URL and initialize filters
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const searchParam = params['search'] || '';
      const storeIdParam = params['storeId'] || '';

      let searchChanged = false;
      let storeIdChanged = false;

      // Only update if values are different to avoid infinite loops
      if (this.searchTerm() !== searchParam) {
        this.searchTerm.set(searchParam);
        searchChanged = true;
      }
      if (this.selectedStoreId() !== storeIdParam) {
        this.selectedStoreId.set(storeIdParam);
        storeIdChanged = true;
      }

      // Only trigger search if values actually changed (prevents duplicate calls)
      if (searchChanged || storeIdChanged) {
        this.triggerSearch();
      }
    });

    // Debounce search term changes and update URL
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.triggerSearch();
        this.updateUrlParams();
      });

    // Always fetch fresh data on page load
    this.triggerSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private triggerSearch(): void {
    const searchTerm = this.searchTerm() || undefined;
    const storeId = this.selectedStoreId() || undefined;
    this.smService.search(searchTerm, storeId);
  }

  private updateUrlParams(): void {
    const queryParams: { [key: string]: string } = {};

    if (this.searchTerm()) {
      queryParams['search'] = this.searchTerm();
    }

    if (this.selectedStoreId()) {
      queryParams['storeId'] = this.selectedStoreId();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : {},
      queryParamsHandling: 'merge',
    });
  }

  getStoreName(storeId: string): string {
    const store = this.stores().find((s) => s.id === storeId);
    return store?.name || 'Unknown Store';
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.searchSubject.next(searchTerm);
  }

  onStoreFilterChange(storeId: string): void {
    this.selectedStoreId.set(storeId);
    this.triggerSearch();
    this.updateUrlParams();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStoreId.set('');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
    this.triggerSearch();
  }

  onAdd() {
    this.editingManager.set(null);
    this.showForm.set(true);
  }

  onEdit(manager: StoreManager) {
    this.editingManager.set(manager);
    this.showForm.set(true);
  }

  onDelete(manager: StoreManager) {
    this.managerToDelete.set(manager);
    this.showDeleteDialog.set(true);
  }

  onFormClose() {
    this.showForm.set(false);
    this.editingManager.set(null);
  }

  onFormSave() {
    this.showForm.set(false);
    this.editingManager.set(null);
    this.triggerSearch();
  }

  onDeleteConfirm() {
    const manager = this.managerToDelete();
    if (manager) {
      this.smService.delete(manager.id);
      this.showDeleteDialog.set(false);
      this.managerToDelete.set(null);
      this.triggerSearch();
    }
  }

  onDeleteCancel() {
    this.showDeleteDialog.set(false);
    this.managerToDelete.set(null);
  }
}
