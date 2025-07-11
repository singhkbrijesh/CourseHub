import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Course, Enrollment } from '../core/models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'api/courses';
  private enrollmentsUrl = 'api/enrollments';
  private usersUrl = 'api/users';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {}

  // Course CRUD operations
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<Course[]>('getCourses', []))
      );
  }

  getCourseById(id: string): Observable<Course> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Course>(url).pipe(
      catchError(this.handleError<Course>(`getCourse id=${id}`))
    );
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    const newCourse = {
      ...course,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      enrollmentCount: 0,
      rating: 0
    };

    return this.http.post<Course>(this.apiUrl, newCourse, this.httpOptions).pipe(
      catchError(this.handleError<Course>('addCourse'))
    );
  }

  updateCourse(course: Course): Observable<Course> {
    const updatedCourse = { ...course, updatedAt: new Date() };
    return this.http.put<Course>(this.apiUrl, updatedCourse, this.httpOptions).pipe(
      catchError(this.handleError<Course>('updateCourse'))
    );
  }

  deleteCourse(id: string): Observable<Course> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Course>(url, this.httpOptions).pipe(
      catchError(this.handleError<Course>('deleteCourse'))
    );
  }

  // Search and filter operations
  searchCourses(term: string): Observable<Course[]> {
    if (!term.trim()) {
      return this.getCourses();
    }
    
    // Use query parameters for search
    const params = new HttpParams().set('title', term);
    return this.http.get<Course[]>(`${this.apiUrl}`, { params }).pipe(
      map(courses => courses.filter(course => 
        course.title.toLowerCase().includes(term.toLowerCase()) ||
        course.description.toLowerCase().includes(term.toLowerCase())
      )),
      catchError(this.handleError<Course[]>('searchCourses', []))
    );
  }

  getCoursesByCategory(category: string): Observable<Course[]> {
    return this.getCourses().pipe(
      map(courses => courses.filter(course => 
        course.category === category && course.status === 'approved'
      ))
    );
  }

  getCoursesByLevel(level: string): Observable<Course[]> {
    return this.getCourses().pipe(
      map(courses => courses.filter(course => 
        course.level === level && course.status === 'approved'
      ))
    );
  }

  // Enrollment operations
  enrollInCourse(courseId: string, studentId: string): Observable<Enrollment> {
  
  // First check if already enrolled
  return this.getStudentEnrollments(studentId).pipe(
    switchMap(existingEnrollments => {
      const alreadyEnrolled = existingEnrollments.find(e => e.courseId === courseId);       
      if (alreadyEnrolled) {
        return throwError(() => new Error('Already enrolled in this course'));
      }
      const enrollmentCount = existingEnrollments.length;

      const newEnrollment: Enrollment = {
        id: `${studentId}_${enrollmentCount + 1}`, 
        studentId,
        courseId,
        enrolledAt: new Date(),
        progress: 0,
        completedLessons: [],
        status: 'active'
      };

      return this.http.post<Enrollment>(this.enrollmentsUrl, newEnrollment, this.httpOptions).pipe(
        switchMap((enrollment: Enrollment) => {
          
          // Update course enrollment count and wait for completion
          return this.updateCourseEnrollmentCount(courseId, 1).pipe(
            map(() => enrollment), // Return the enrollment after course update
          );
        }),
        catchError(error => {
          console.error('Enrollment failed:', error);
          return this.handleError<Enrollment>('enrollInCourse')(error);
        })
      );
    })
  );
}

  getEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.enrollmentsUrl)
      .pipe(
        catchError(this.handleError<Enrollment[]>('getEnrollments', []))
      );
  }

  getStudentEnrollments(studentId: string): Observable<Enrollment[]> {
    return this.getEnrollments().pipe(
      map(enrollments => enrollments.filter(e => e.studentId === studentId))
    );
  }

  updateEnrollmentProgress(enrollmentId: string, progress: number, completedLessons: string[]): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.enrollmentsUrl}/${enrollmentId}`).pipe(
      map(enrollment => ({
        ...enrollment,
        progress,
        completedLessons,
        status: (progress === 100 ? 'completed' : 'active') as 'active' | 'completed' | 'dropped'
      })),
      tap(updatedEnrollment => 
        this.http.put<Enrollment>(this.enrollmentsUrl, updatedEnrollment, this.httpOptions).subscribe()
      ),
      catchError(this.handleError<Enrollment>('updateEnrollmentProgress'))
    );
  }

  // Admin operations
  getPendingCourses(): Observable<Course[]> {
    return this.getCourses().pipe(
      map(courses => courses.filter(course => course.status === 'pending'))
    );
  }

  approveCourse(courseId: string): Observable<Course> {
    return this.getCourseById(courseId).pipe(
      map(course => ({ ...course, status: 'approved' as const })),
      tap(updatedCourse => this.updateCourse(updatedCourse).subscribe()),
      catchError(this.handleError<Course>('approveCourse'))
    );
  }

  rejectCourse(courseId: string): Observable<Course> {
    return this.getCourseById(courseId).pipe(
      map(course => ({ ...course, status: 'rejected' as const })),
      tap(updatedCourse => this.updateCourse(updatedCourse).subscribe()),
      catchError(this.handleError<Course>('rejectCourse'))
    );
  }

  // Instructor operations
  getInstructorCourses(instructorId: string): Observable<Course[]> {
    return this.getCourses().pipe(
      map(courses => courses.filter(course => course.instructorId === instructorId))
    );
  }

  // Update the updateCourseEnrollmentCount method:

// Replace the existing updateCourseEnrollmentCount method:

private updateCourseEnrollmentCount(courseId: string, increment: number): Observable<Course> {
  return this.getCourseById(courseId).pipe(
    switchMap(course => {
      if (course) {
        const updatedCourse = {
          ...course,
          enrollmentCount: course.enrollmentCount + increment,
          updatedAt: new Date()
        };
        return this.updateCourse(updatedCourse);
      }
      return throwError(() => new Error('Course not found'));
    }),
    catchError(error => {
      console.error('Error updating enrollment count:', error);
      return throwError(() => error);
    })
  );
}

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}