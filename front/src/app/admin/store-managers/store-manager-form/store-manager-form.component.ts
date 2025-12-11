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
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StoreManager } from '../../../models/store-manager.model';
import { StoreManagerService } from '../../../services/store-manager.service';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-store-manager-form',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './store-manager-form.component.html',
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

  readonly form: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      storeId: ['', [Validators.required]],
      status: ['active', [Validators.required]],
      password: ['', []],
      confirmPassword: ['', []],
    },
    { validators: this.passwordMatchValidator() }
  );

  readonly isEditMode = signal<boolean>(false);

  constructor() {
    effect(() => {
      const manager = this.manager();
      if (manager) {
        this.isEditMode.set(true);
        // Password not required for edit
        this.form.get('password')?.clearValidators();
        this.form.get('confirmPassword')?.clearValidators();
        this.form.patchValue({
          name: manager.name,
          email: manager.email,
          phone: manager.phone,
          storeId: manager.storeId,
          status: manager.status,
          password: '',
          confirmPassword: '',
        });
      } else {
        this.isEditMode.set(false);
        // Password required for new records
        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.form.get('confirmPassword')?.setValidators([Validators.required]);
        this.form.reset({
          name: '',
          email: '',
          phone: '',
          storeId: '',
          status: 'active',
          password: '',
          confirmPassword: '',
        });
      }
      this.form.get('password')?.updateValueAndValidity();
      this.form.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');

      if (!password || !confirmPassword) {
        return null;
      }

      // Only validate if password has a value
      if (!password.value) {
        return null;
      }

      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = { ...this.form.value };
      const manager = this.manager();

      // Remove confirmPassword before sending
      delete formValue.confirmPassword;

      // Only include password if it has a value (for edit mode)
      if (!formValue.password) {
        delete formValue.password;
      }

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

  getFormError(): string {
    if (this.form.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }
}
