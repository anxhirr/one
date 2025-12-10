import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
export class StoreRepresentativesComponent {
  private readonly srService = inject(StoreRepresentativeService);
  private readonly storeService = inject(StoreService);

  readonly representatives = this.srService.getAll();
  readonly stores = this.storeService.getAll();
  readonly searchTerm = signal<string>('');
  readonly selectedStoreId = signal<string>('');
  readonly showForm = signal<boolean>(false);
  readonly editingRepresentative = signal<StoreRepresentative | null>(null);
  readonly showDeleteDialog = signal<boolean>(false);
  readonly representativeToDelete = signal<StoreRepresentative | null>(null);

  readonly filteredRepresentatives = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const storeId = this.selectedStoreId();

    let filtered = this.representatives();

    if (storeId) {
      filtered = filtered.filter((rep) => rep.storeId === storeId);
    }

    if (term) {
      filtered = filtered.filter(
        (rep) =>
          rep.name.toLowerCase().includes(term) ||
          rep.email.toLowerCase().includes(term) ||
          rep.phone.toLowerCase().includes(term)
      );
    }

    return filtered;
  });

  readonly representativesWithStoreNames = computed(() => {
    return this.filteredRepresentatives().map((rep) => {
      const store = this.stores().find((s) => s.id === rep.storeId);
      return {
        representative: rep,
        storeName: store?.name || 'Unknown Store',
      };
    });
  });

  getStoreName(storeId: string): string {
    const store = this.stores().find((s) => s.id === storeId);
    return store?.name || 'Unknown Store';
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
  }

  onDeleteConfirm() {
    const rep = this.representativeToDelete();
    if (rep) {
      this.srService.delete(rep.id);
      this.showDeleteDialog.set(false);
      this.representativeToDelete.set(null);
    }
  }

  onDeleteCancel() {
    this.showDeleteDialog.set(false);
    this.representativeToDelete.set(null);
  }
}
