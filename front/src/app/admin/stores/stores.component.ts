import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '../../models/store.model';
import { StoreManagerService } from '../../services/store-manager.service';
import { StoreRepresentativeService } from '../../services/store-representative.service';
import { StoreService } from '../../services/store.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { StoreFormComponent } from './store-form/store-form.component';

@Component({
  selector: 'app-stores',
  imports: [CommonModule, FormsModule, StoreFormComponent, ConfirmDialogComponent],
  templateUrl: './stores.component.html',
  styleUrl: './stores.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoresComponent {
  private readonly storeService = inject(StoreService);
  private readonly srService = inject(StoreRepresentativeService);
  private readonly smService = inject(StoreManagerService);

  readonly stores = this.storeService.getAll();
  readonly loading = this.storeService.isLoading();
  readonly searchTerm = signal<string>('');
  readonly showForm = signal<boolean>(false);
  readonly editingStore = signal<Store | null>(null);
  readonly showDeleteDialog = signal<boolean>(false);
  readonly storeToDelete = signal<Store | null>(null);

  readonly filteredStores = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.stores();
    }
    return this.stores().filter(
      (store) =>
        store.name.toLowerCase().includes(term) ||
        store.address.toLowerCase().includes(term) ||
        store.email.toLowerCase().includes(term)
    );
  });

  readonly storeCounts = computed(() => {
    const filtered = this.filteredStores();
    return filtered.map((store) => ({
      store,
      srCount: this.srService.getByStoreId(store.id).length,
      smCount: this.smService.getByStoreId(store.id).length,
    }));
  });

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
