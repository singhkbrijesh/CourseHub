import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AsyncValidatorsService {
  private apiUrl = 'api';

  constructor(private http: HttpClient) { }

  // Async validator for unique course title
  uniqueCourseTitle(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length < 3) {
        return of(null);
      }

      return timer(500).pipe(
        switchMap(() => this.checkCourseTitleExists(control.value)),
        map(exists => exists ? { courseTitleExists: { value: control.value } } : null),
        catchError(() => of(null))
      );
    };
  }

  private checkCourseTitleExists(title: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}/courses`).pipe(
      map(courses => {
        const titleLower = title.toLowerCase().trim();
        return courses.some(course =>
          course.title.toLowerCase().trim() === titleLower
        );
      })
    );
  }
}