import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap, finalize } from 'rxjs/operators';
import { Course, Enrollment } from '../core/models/course.model';
import { LoadingService } from './loading.service';

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

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {}

  // Course CRUD operations
  getCourses(): Observable<Course[]> {
    this.loadingService.show();
    return this.http.get<Course[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<Course[]>('getCourses', [])),
        finalize(() => this.loadingService.hide())
      );
  }

  getCourseById(id: string): Observable<Course> {
    this.loadingService.show();
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Course>(url).pipe(
      catchError(this.handleError<Course>(`getCourse id=${id}`)),
      finalize(() => this.loadingService.hide())
    );
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    this.loadingService.show();
    const newCourse = {
      ...course,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      enrollmentCount: 0,
      rating: 0
    };

    return this.http.post<Course>(this.apiUrl, newCourse, this.httpOptions).pipe(
      catchError(this.handleError<Course>('addCourse')),
      finalize(() => this.loadingService.hide())
    );
  }

  updateCourse(course: Course): Observable<Course> {
    this.loadingService.show();
    const updatedCourse = { ...course, updatedAt: new Date() };
    return this.http.put<Course>(this.apiUrl, updatedCourse, this.httpOptions).pipe(
      catchError(this.handleError<Course>('updateCourse')),
      finalize(() => this.loadingService.hide())
    );
  }

  deleteCourse(id: string): Observable<Course> {
    this.loadingService.show();
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<Course>(url, this.httpOptions).pipe(
      catchError(this.handleError<Course>('deleteCourse')),
      finalize(() => this.loadingService.hide())
    );
  }

  // Search and filter operations
  searchCourses(term: string): Observable<Course[]> {
    this.loadingService.show();
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
      catchError(this.handleError<Course[]>('searchCourses', [])),
      finalize(() => this.loadingService.hide())
    );
  }

  getCoursesByCategory(category: string): Observable<Course[]> {
    this.loadingService.show();
    return this.getCourses().pipe(
      map(courses => courses.filter(course => 
        course.category === category && course.status === 'approved'
      )),
      finalize(() => this.loadingService.hide())
    );
  }

  getCoursesByLevel(level: string): Observable<Course[]> {
    this.loadingService.show();
    return this.getCourses().pipe(
      map(courses => courses.filter(course => 
        course.level === level && course.status === 'approved'
      )),
      finalize(() => this.loadingService.hide())
    );
  }

  // Enrollment operations
  enrollInCourse(courseId: string, studentId: string): Observable<Enrollment> {
    this.loadingService.show();
    
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
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  getEnrollments(): Observable<Enrollment[]> {
    this.loadingService.show();
    return this.http.get<Enrollment[]>(this.enrollmentsUrl)
      .pipe(
        catchError(this.handleError<Enrollment[]>('getEnrollments', [])),
        finalize(() => this.loadingService.hide())
      );
  }

  getStudentEnrollments(studentId: string): Observable<Enrollment[]> {
    this.loadingService.show();
    return this.getEnrollments().pipe(
      map(enrollments => enrollments.filter(e => e.studentId === studentId)),
      finalize(() => this.loadingService.hide())
    );
  }

  updateEnrollmentProgress(enrollmentId: string, progress: number, completedLessons: string[]): Observable<Enrollment> {
    this.loadingService.show();
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
      catchError(this.handleError<Enrollment>('updateEnrollmentProgress')),
      finalize(() => this.loadingService.hide())
    );
  }

  // Admin operations
  getPendingCourses(): Observable<Course[]> {
    this.loadingService.show();
    return this.getCourses().pipe(
      map(courses => courses.filter(course => course.status === 'pending')),
      finalize(() => this.loadingService.hide())
    );
  }

  approveCourse(courseId: string): Observable<Course> {
    this.loadingService.show();
    return this.getCourseById(courseId).pipe(
      map(course => ({ ...course, status: 'approved' as const })),
      tap(updatedCourse => this.updateCourse(updatedCourse).subscribe()),
      catchError(this.handleError<Course>('approveCourse')),
      finalize(() => this.loadingService.hide())
    );
  }

  rejectCourse(courseId: string): Observable<Course> {
    this.loadingService.show();
    return this.getCourseById(courseId).pipe(
      map(course => ({ ...course, status: 'rejected' as const })),
      tap(updatedCourse => this.updateCourse(updatedCourse).subscribe()),
      catchError(this.handleError<Course>('rejectCourse')),
      finalize(() => this.loadingService.hide())
    );
  }

  // Instructor operations
  getInstructorCourses(instructorId: string): Observable<Course[]> {
    this.loadingService.show();
    return this.getCourses().pipe(
      map(courses => courses.filter(course => course.instructorId === instructorId)),
      finalize(() => this.loadingService.hide())
    );
  }

  // Internal method without loading service for chained operations
  private getCourseByIdInternal(id: string): Observable<Course> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Course>(url).pipe(
      catchError(this.handleError<Course>(`getCourse id=${id}`))
    );
  }

  private updateCourseEnrollmentCount(courseId: string, increment: number): Observable<Course> {
    return this.getCourseByIdInternal(courseId).pipe(
      switchMap(course => {
        if (course) {
          const updatedCourse = {
            ...course,
            enrollmentCount: course.enrollmentCount + increment,
            updatedAt: new Date()
          };
          return this.http.put<Course>(this.apiUrl, updatedCourse, this.httpOptions);
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