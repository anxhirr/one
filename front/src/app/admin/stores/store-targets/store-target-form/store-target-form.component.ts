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
import { StoreTarget } from '../../../../models/store-target.model';
import { StoreTargetService } from '../../../../services/store-target.service';

@Component({
  selector: 'app-store-target-form',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './store-target-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreTargetFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly targetService = inject(StoreTargetService);

  readonly storeId = input.required<string>();
  readonly target = input<StoreTarget | null>(null);
  readonly close = output<void>();
  readonly saved = output<void>();

  readonly form: FormGroup = this.fb.group({
    metric_type: ['', [Validators.required]],
    period_type: ['', [Validators.required]],
    target_value: ['', [Validators.required, Validators.min(0)]],
    period_start: ['', [Validators.required]],
    period_end: [''],
    status: ['active', [Validators.required]],
  });

  readonly isEditMode = signal<boolean>(false);

  constructor() {
    effect(() => {
      const target = this.target();
      if (target) {
        this.isEditMode.set(true);
        this.form.patchValue({
          metric_type: target.metric_type,
          period_type: target.period_type,
          target_value: target.target_value,
          period_start: target.period_start,
          period_end: target.period_end || '',
          status: target.status,
        });
      } else {
        this.isEditMode.set(false);
        this.form.reset({
          metric_type: '',
          period_type: '',
          target_value: '',
          period_start: '',
          period_end: '',
          status: 'active',
        });
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = { ...this.form.value };
      const target = this.target();
      const storeId = this.storeId();

      // Convert target_value to number
      formValue.target_value = parseFloat(formValue.target_value);

      // Remove period_end if empty
      if (!formValue.period_end) {
        formValue.period_end = null;
      }

      if (target) {
        this.targetService.updateTarget(storeId, target.id, formValue).subscribe({
          next: () => {
            this.saved.emit();
          },
          error: (error) => {
            console.error('Error updating target:', error);
          },
        });
      } else {
        this.targetService.createTarget(storeId, formValue).subscribe({
          next: () => {
            this.saved.emit();
          },
          error: (error) => {
            console.error('Error creating target:', error);
          },
        });
      }
    }
  }

  onCancel() {
    this.close.emit();
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.hasError('required')) {
      return `${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace('_', ' ')
      } is required`;
    }
    if (field?.hasError('min')) {
      return 'Value must be greater than or equal to 0';
    }
    return '';
  }
}
