import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreManager } from '../../models/store-manager.model';
import { StoreManagerService } from '../../services/store-manager.service';
import { StoreService } from '../../services/store.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { StoreManagerFormComponent } from './store-manager-form/store-manager-form.component';

@Component({
  selector: 'app-store-managers',
  imports: [CommonModule, FormsModule, StoreManagerFormComponent, ConfirmDialogComponent],
  templateUrl: './store-managers.component.html',
  styleUrl: './store-managers.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreManagersComponent {
  private readonly smService = inject(StoreManagerService);
  private readonly storeService = inject(StoreService);

  readonly managers = this.smService.getAll();
  readonly stores = this.storeService.getAll();
  readonly searchTerm = signal<string>('');
  readonly selectedStoreId = signal<string>('');
  readonly showForm = signal<boolean>(false);
  readonly editingManager = signal<StoreManager | null>(null);
  readonly showDeleteDialog = signal<boolean>(false);
  readonly managerToDelete = signal<StoreManager | null>(null);

  readonly filteredManagers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const storeId = this.selectedStoreId();

    let filtered = this.managers();

    if (storeId) {
      filtered = filtered.filter((manager) => manager.storeId === storeId);
    }

    if (term) {
      filtered = filtered.filter(
        (manager) =>
          manager.name.toLowerCase().includes(term) ||
          manager.email.toLowerCase().includes(term) ||
          manager.phone.toLowerCase().includes(term)
      );
    }

    return filtered;
  });

  readonly managersWithStoreNames = computed(() => {
    return this.filteredManagers().map((manager) => {
      const store = this.stores().find((s) => s.id === manager.storeId);
      return {
        manager,
        storeName: store?.name || 'Unknown Store',
      };
    });
  });

  getStoreName(storeId: string): string {
    const store = this.stores().find((s) => s.id === storeId);
    return store?.name || 'Unknown Store';
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
  }

  onDeleteConfirm() {
    const manager = this.managerToDelete();
    if (manager) {
      this.smService.delete(manager.id);
      this.showDeleteDialog.set(false);
      this.managerToDelete.set(null);
    }
  }

  onDeleteCancel() {
    this.showDeleteDialog.set(false);
    this.managerToDelete.set(null);
  }
}
