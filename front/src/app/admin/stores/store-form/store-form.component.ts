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
import { Store } from '../../../models/store.model';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-store-form',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './store-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly storeService = inject(StoreService);

  readonly store = input<Store | null>(null);
  readonly close = output<void>();
  readonly saved = output<void>();

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    status: ['active', [Validators.required]],
  });

  readonly isEditMode = signal<boolean>(false);

  constructor() {
    effect(() => {
      const store = this.store();
      if (store) {
        this.isEditMode.set(true);
        this.form.patchValue({
          name: store.name,
          address: store.address,
          phone: store.phone,
          email: store.email,
          status: store.status,
        });
      } else {
        this.isEditMode.set(false);
        this.form.reset({
          name: '',
          address: '',
          phone: '',
          email: '',
          status: 'active',
        });
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const store = this.store();

      if (store) {
        this.storeService.update(store.id, formValue);
      } else {
        this.storeService.create(formValue);
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
