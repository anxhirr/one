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
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { StoreRepresentative } from '../../models/store-representative.model';
import { StoreRepresentativeService } from '../../services/store-representative.service';
import { StoreService } from '../../services/store.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { StoreRepresentativeFormComponent } from './store-representative-form/store-representative-form.component';

@Component({
  selector: 'app-store-representatives',
  imports: [CommonModule, FormsModule, StoreRepresentativeFormComponent, ConfirmDialogComponent],
  templateUrl: './store-representatives.component.html',
  styleUrl: './store-representatives.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreRepresentativesComponent implements OnInit, OnDestroy {
  private readonly srService = inject(StoreRepresentativeService);
  private readonly storeService = inject(StoreService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  readonly representatives = this.srService.getAll();
  readonly stores = this.storeService.getAll();
  readonly loading = this.srService.isLoading();
  readonly searchTerm = signal<string>('');
  readonly selectedStoreId = signal<string>('');
  readonly showForm = signal<boolean>(false);
  readonly editingRepresentative = signal<StoreRepresentative | null>(null);
  readonly showDeleteDialog = signal<boolean>(false);
  readonly representativeToDelete = signal<StoreRepresentative | null>(null);

  readonly representativesWithStoreNames = computed(() => {
    return this.representatives().map((rep) => {
      const store = this.stores().find((s) => s.id === rep.storeId);
      return {
        representative: rep,
        storeName: store?.name || 'Unknown Store',
      };
    });
  });

  ngOnInit(): void {
    // Debounce search term changes and trigger search
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.triggerSearch();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private triggerSearch(): void {
    const searchTerm = this.searchTerm() || undefined;
    const storeId = this.selectedStoreId() || undefined;
    this.srService.search(searchTerm, storeId);
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
  }

  onAdd() {
    this.editingRepresentative.set(null);
    this.showForm.set(true);
  }

  onEdit(representative: StoreRepresentative) {
    this.editingRepresentative.set(representative);
    this.showForm.set(true);
  }

  onDelete(representative: StoreRepresentative) {
    this.representativeToDelete.set(representative);
    this.showDeleteDialog.set(true);
  }

  onFormClose() {
    this.showForm.set(false);
    this.editingRepresentative.set(null);
  }

  onFormSave() {
    this.showForm.set(false);
    this.editingRepresentative.set(null);
    this.triggerSearch();
  }

  onDeleteConfirm() {
    const rep = this.representativeToDelete();
    if (rep) {
      this.srService.delete(rep.id);
      this.showDeleteDialog.set(false);
      this.representativeToDelete.set(null);
      this.triggerSearch();
    }
  }

  onDeleteCancel() {
    this.showDeleteDialog.set(false);
    this.representativeToDelete.set(null);
  }
}
