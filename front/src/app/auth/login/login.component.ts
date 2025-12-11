import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.redirectToDashboard(response.user.role);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message ||
            err.error?.email?.[0] ||
            'Login failed. Please check your credentials.'
        );
      },
    });
  }

  private redirectToDashboard(role?: string | null): void {
    // Redirect based on user role
    if (role === 'store_manager') {
      this.router.navigate(['/sm/dashboard']);
    } else if (role === 'store_representative') {
      this.router.navigate(['/sr/dashboard']);
    } else {
      // Default to admin if no role
      this.router.navigate(['/admin/stores']);
    }
  }
}
