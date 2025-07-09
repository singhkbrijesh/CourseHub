import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersUrl = 'assets/users.json';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(email: string, password: string): Observable<any> {
    return this.http.get<any[]>(this.usersUrl).pipe(
      map(users => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user', JSON.stringify(user));
            window.dispatchEvent(new Event('userChanged'));
          }
          return user;
        }
        throw new Error('Invalid credentials');
      })
    );
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('user');
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userChanged')); // Add this line
  }
}