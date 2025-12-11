import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, tap } from 'rxjs';

const PASSCODE_VALIDATED_KEY = 'admin_passcode_validated';

@Injectable({
  providedIn: 'root',
})
export class PasscodeService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = 'http://localhost:8000/api';
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Verify passcode with backend
   */
  verifyPasscode(passcode: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(`${this.apiUrl}/admin/verify-passcode`, {
        passcode,
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            this.setPasscodeValidated();
          }
        })
      );
  }

  /**
   * Check if passcode is validated in current session
   */
  isPasscodeValid(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return sessionStorage.getItem(PASSCODE_VALIDATED_KEY) === 'true';
  }

  /**
   * Set passcode as validated in session storage
   */
  private setPasscodeValidated(): void {
    if (!this.isBrowser) {
      return;
    }
    sessionStorage.setItem(PASSCODE_VALIDATED_KEY, 'true');
  }

  /**
   * Clear passcode validation (on logout or session end)
   */
  clearPasscode(): void {
    if (!this.isBrowser) {
      return;
    }
    sessionStorage.removeItem(PASSCODE_VALIDATED_KEY);
  }
}
