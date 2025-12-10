import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, User } from '../models/auth.model';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = 'http://localhost:8000/api';
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly currentUser = signal<User | null>(this.isBrowser ? this.getStoredUser() : null);
  private readonly isAuthenticated = signal<boolean>(this.isBrowser ? !!this.getToken() : false);

  /**
   * Get current user signal
   */
  getUser() {
    return this.currentUser.asReadonly();
  }

  /**
   * Get authentication status signal
   */
  getAuthStatus() {
    return this.isAuthenticated.asReadonly();
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setUser(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  /**
   * Logout current user
   */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/login']);
      })
    );
  }

  /**
   * Get current authenticated user from API
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`).pipe(
      map((response) => response.user),
      tap((user) => {
        this.setUser(user);
        this.isAuthenticated.set(true);
      })
    );
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Set authentication token
   */
  private setToken(token: string): void {
    if (!this.isBrowser) {
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Set current user
   */
  private setUser(user: User): void {
    this.currentUser.set(user);
    if (!this.isBrowser) {
      return;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): User | null {
    if (!this.isBrowser) {
      return null;
    }
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  /**
   * Initialize auth state from stored token
   */
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      // Verify token is still valid by fetching current user
      this.getCurrentUser().subscribe({
        error: () => {
          // Token is invalid, clear auth
          this.clearAuth();
        },
      });
    } else {
      this.clearAuth();
    }
  }
}

