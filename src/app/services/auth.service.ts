import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, map, catchError, switchMap, finalize, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LoadingService } from './loading.service';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'instructor' | 'student';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersUrl = 'api/users';

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(email: string, password: string): Observable<any> {
    this.loadingService.show();
    
    return this.http.get<User[]>(this.usersUrl).pipe(
      tap(users => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user', JSON.stringify(user));
            window.dispatchEvent(new Event('userChanged'));
          }
        } else {
          throw new Error('Invalid credentials');
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed'));
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  register(userData: Partial<User> & { password: string }): Observable<User> {
    this.loadingService.show();
    // First check if email already exists
    return this.http.get<User[]>(this.usersUrl).pipe(
      switchMap(users => {
        const emailExists = users.some(u => u.email === userData.email);
        
        if (emailExists) {
          return throwError(() => new Error('Email already exists. Please use a different email.'));
        }
        
        // If email doesn't exist, create the user
        const newUser = {
          ...userData,
          id: `${userData.role}_${Date.now()}`
        };

        return this.http.post<User>(this.usersUrl, newUser).pipe(
          map(user => {
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('user', JSON.stringify(user));
              window.dispatchEvent(new Event('userChanged'));
            }
            return user;
          }),
          catchError(error => {
            console.error('Registration error:', error);
            if (error.message && error.message.includes('email')) {
              return throwError(() => new Error('Email already exists. Please use a different email.'));
            }
            return throwError(() => new Error('Registration failed. Please try again.'));
          })
        );
      }),
      catchError(error => {
        console.error('Registration validation error:', error);
        return throwError(() => error);
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  // Check if email exists (utility method)
  checkEmailExists(email: string): Observable<boolean> {
    this.loadingService.show();
    return this.http.get<User[]>(this.usersUrl).pipe(
      map(users => users.some(u => u.email === email)),
      catchError(error => {
        console.error('Email check error:', error);
        return of(false);
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('user');
    }
    return false;
  }

  getCurrentUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  getUserRole(): string {
    const user = this.getCurrentUser();
    return user ? user.role : '';
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('userChanged'));
    }
  }

  // Admin operations
  getAllUsers(): Observable<User[]> {
    this.loadingService.show();
    return this.http.get<User[]>(this.usersUrl).pipe(
      catchError(error => {
        console.error('Get users error:', error);
        return of([]);
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  updateUser(user: User): Observable<User> {
    this.loadingService.show();
    return this.http.put<User>(`${this.usersUrl}/${user.id}`, user).pipe(
      catchError(error => {
        console.error('Update user error:', error);
        return throwError(() => new Error('Update failed'));
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  deleteUser(userId: string): Observable<boolean> {
    this.loadingService.show();
    return this.http.delete(`${this.usersUrl}/${userId}`).pipe(
      map(() => true),
      catchError(error => {
        console.error('Delete user error:', error);
        return of(false);
      }),
      finalize(() => this.loadingService.hide())
    );
  }
}