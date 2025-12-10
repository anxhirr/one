import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authService.isUserAuthenticated()) {
      this.redirectToDashboard();
    }
  }

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
          err.error?.message || err.error?.email?.[0] || 'Login failed. Please check your credentials.'
        );
      },
    });
  }

  private redirectToDashboard(role?: string | null): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || null;

    if (returnUrl) {
      this.router.navigate([returnUrl]);
      return;
    }

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

