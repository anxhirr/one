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
import { StoreRepresentative } from '../../../models/store-representative.model';
import { StoreRepresentativeService } from '../../../services/store-representative.service';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-store-representative-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './store-representative-form.component.html',
  styleUrl: './store-representative-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreRepresentativeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly srService = inject(StoreRepresentativeService);
  private readonly storeService = inject(StoreService);

  readonly representative = input<StoreRepresentative | null>(null);
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
      const rep = this.representative();
      if (rep) {
        this.isEditMode.set(true);
        this.form.patchValue({
          name: rep.name,
          email: rep.email,
          phone: rep.phone,
          storeId: rep.storeId,
          status: rep.status,
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
      const rep = this.representative();

      if (rep) {
        this.srService.update(rep.id, formValue);
      } else {
        this.srService.create(formValue);
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
