import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StoreManager } from '../../../models/store-manager.model';
import { StoreManagerService } from '../../../services/store-manager.service';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-store-manager-form',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './store-manager-form.component.html',
  styleUrl: './store-manager-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreManagerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly smService = inject(StoreManagerService);
  private readonly storeService = inject(StoreService);

  readonly manager = input<StoreManager | null>(null);
  readonly close = output<void>();
  readonly saved = output<void>();

  readonly stores = this.storeService.getAll();

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    storeId: ['', [Validators.required]],
    status: ['active', [Validators.required]],
  });

  readonly isEditMode = signal<boolean>(false);

  constructor() {
    effect(() => {
      const manager = this.manager();
      if (manager) {
        this.isEditMode.set(true);
        this.form.patchValue({
          name: manager.name,
          email: manager.email,
          phone: manager.phone,
          storeId: manager.storeId,
          status: manager.status,
        });
      } else {
        this.isEditMode.set(false);
        this.form.reset({
          name: '',
          email: '',
          phone: '',
          storeId: '',
          status: 'active',
        });
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const manager = this.manager();

      if (manager) {
        this.smService.update(manager.id, formValue);
      } else {
        this.smService.create(formValue);
      }

      this.saved.emit();
    }
  }

  onCancel() {
    this.close.emit();
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Invalid email format';
    }
    if (field?.hasError('minlength')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${
        field.errors?.['minlength'].requiredLength
      } characters`;
    }
    return '';
  }
}
