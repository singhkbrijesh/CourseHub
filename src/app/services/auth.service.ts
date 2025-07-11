import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, map, catchError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(email: string, password: string): Observable<User> {
    return this.http.get<User[]>(this.usersUrl).pipe(
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
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Invalid credentials'));
      })
    );
  }

  register(userData: Partial<User> & { password: string }): Observable<User> {
    const newUser = {
      ...userData,
      id: Date.now().toString()
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
        return throwError(() => new Error('Registration failed'));
      })
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

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('userChanged'));
    }
  }

  // Admin operations
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl).pipe(
      catchError(error => {
        console.error('Get users error:', error);
        return of([]);
      })
    );
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.usersUrl}/${user.id}`, user).pipe(
      catchError(error => {
        console.error('Update user error:', error);
        return throwError(() => new Error('Update failed'));
      })
    );
  }

  deleteUser(userId: string): Observable<boolean> {
    return this.http.delete(`${this.usersUrl}/${userId}`).pipe(
      map(() => true),
      catchError(error => {
        console.error('Delete user error:', error);
        return of(false);
      })
    );
  }
}