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
import { Store } from '../../models/store.model';
import { StoreService } from '../../services/store.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { StoreFormComponent } from './store-form/store-form.component';

@Component({
  selector: 'app-stores',
  imports: [CommonModule, FormsModule, StoreFormComponent, ConfirmDialogComponent, MatIconModule],
  templateUrl: './stores.component.html',
  styleUrl: './stores.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoresComponent implements OnInit, OnDestroy {
  private readonly storeService = inject(StoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  readonly stores = this.storeService.getAll();
  readonly loading = this.storeService.isLoading();
  readonly searchTerm = signal<string>('');
  readonly statusFilter = signal<string>('');
  readonly showForm = signal<boolean>(false);
  readonly editingStore = signal<Store | null>(null);
  readonly showDeleteDialog = signal<boolean>(false);
  readonly storeToDelete = signal<Store | null>(null);

  readonly hasActiveFilters = computed(() => {
    return !!(this.searchTerm() || this.statusFilter());
  });

  ngOnInit(): void {
    // Read query parameters from URL and initialize filters
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const searchParam = params['search'] || '';
      const statusParam = params['status'] || '';

      let searchChanged = false;
      let statusChanged = false;

      // Only update if values are different to avoid infinite loops
      if (this.searchTerm() !== searchParam) {
        this.searchTerm.set(searchParam);
        searchChanged = true;
      }
      if (this.statusFilter() !== statusParam) {
        this.statusFilter.set(statusParam);
        statusChanged = true;
      }

      // Only trigger search if values actually changed (prevents duplicate calls)
      if (searchChanged || statusChanged) {
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
    const searchTerm = this.searchTerm();
    const status = this.statusFilter() || undefined;
    this.storeService.search(searchTerm, status);
  }

  private updateUrlParams(): void {
    const queryParams: { [key: string]: string } = {};

    if (this.searchTerm()) {
      queryParams['search'] = this.searchTerm();
    }

    if (this.statusFilter()) {
      queryParams['status'] = this.statusFilter();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : {},
      queryParamsHandling: 'merge',
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.searchSubject.next(searchTerm);
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter.set(status);
    this.triggerSearch();
    this.updateUrlParams();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
    this.triggerSearch();
  }

  onAdd() {
    this.editingStore.set(null);
    this.showForm.set(true);
  }

  onEdit(store: Store) {
    this.editingStore.set(store);
    this.showForm.set(true);
  }

  onDelete(store: Store) {
    this.storeToDelete.set(store);
    this.showDeleteDialog.set(true);
  }

  onFormClose() {
    this.showForm.set(false);
    this.editingStore.set(null);
  }

  onFormSave() {
    this.showForm.set(false);
    this.editingStore.set(null);
  }

  onDeleteConfirm() {
    const store = this.storeToDelete();
    if (store) {
      this.storeService.delete(store.id);
      this.showDeleteDialog.set(false);
      this.storeToDelete.set(null);
    }
  }

  onDeleteCancel() {
    this.showDeleteDialog.set(false);
    this.storeToDelete.set(null);
  }
}
