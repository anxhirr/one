import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PasscodeService } from '../../services/passcode.service';

@Component({
  selector: 'app-passcode-prompt',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './passcode-prompt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasscodePromptComponent {
  private readonly passcodeService = inject(PasscodeService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly passcodeForm: FormGroup = this.fb.group({
    passcode: ['', [Validators.required]],
  });

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  onSubmit(): void {
    if (this.passcodeForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const passcode = this.passcodeForm.get('passcode')?.value;

    this.passcodeService.verifyPasscode(passcode).subscribe({
      next: () => {
        this.loading.set(false);
        // Redirect to admin stores page after successful verification
        this.router.navigate(['/admin/stores']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Invalid passcode. Please try again.');
        // Clear the passcode field on error
        this.passcodeForm.get('passcode')?.setValue('');
      },
    });
  }
}
