import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, switchMap, tap, finalize } from 'rxjs/operators';
import { Course, Enrollment } from '../core/models/course.model';
import { LoadingService } from './loading.service';
import { LoginActivity } from '../core/models/course.model';

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

  // BehaviorSubjects for state management
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  private enrollmentsSubject = new BehaviorSubject<Enrollment[]>([]);
  private userEnrollmentsSubject = new BehaviorSubject<Enrollment[]>([]);

  // Public observables
  public courses$ = this.coursesSubject.asObservable();
  public enrollments$ = this.enrollmentsSubject.asObservable();
  public userEnrollments$ = this.userEnrollmentsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) {
    // Initialize data on service creation
    this.loadInitialData();
  }

  private loadInitialData() {
    // Load courses and enrollments silently on service initialization
    this.http.get<Course[]>(this.apiUrl).pipe(
      catchError(this.handleError<Course[]>('loadInitialCourses', []))
    ).subscribe(courses => this.coursesSubject.next(courses));

    this.http.get<Enrollment[]>(this.enrollmentsUrl).pipe(
      catchError(this.handleError<Enrollment[]>('loadInitialEnrollments', []))
    ).subscribe(enrollments => this.enrollmentsSubject.next(enrollments));
  }

  // Course CRUD operations with state updates
  getCourses(): Observable<Course[]> {
    this.loadingService.show();
    return this.http.get<Course[]>(this.apiUrl)
      .pipe(
        tap(courses => this.coursesSubject.next(courses)),
        catchError(this.handleError<Course[]>('getCourses', [])),
        finalize(() => this.loadingService.hide())
      );
  }

  getCourseById(id: string): Observable<Course> {
    this.loadingService.show();
    // First try to get from current state
    const currentCourses = this.coursesSubject.value;
    const existingCourse = currentCourses.find(c => c.id === id);
    
    if (existingCourse) {
      this.loadingService.hide();
      return of(existingCourse);
    }

    // If not found, fetch from API
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
      tap(createdCourse => {
        // Add to current state
        const currentCourses = this.coursesSubject.value;
        this.coursesSubject.next([...currentCourses, createdCourse]);
      }),
      catchError(this.handleError<Course>('addCourse')),
      finalize(() => this.loadingService.hide())
    );
  }

  updateCourse(course: Course): Observable<Course> {
    this.loadingService.show();
    const updatedCourse = { ...course, updatedAt: new Date() };
    return this.http.put<Course>(this.apiUrl, updatedCourse, this.httpOptions).pipe(
      tap(updated => {
        // Update in current state
        const currentCourses = this.coursesSubject.value;
        const index = currentCourses.findIndex(c => c.id === updated.id);
        if (index !== -1) {
          currentCourses[index] = updated;
          this.coursesSubject.next([...currentCourses]);
        }
      }),
      catchError(this.handleError<Course>('updateCourse')),
      finalize(() => this.loadingService.hide())
    );
  }

  // Enrollment operations with state updates
  enrollInCourse(courseId: string, studentId: string): Observable<Enrollment> {
    this.loadingService.show();
    
    // Check from current state first
    const currentEnrollments = this.enrollmentsSubject.value;
    const alreadyEnrolled = currentEnrollments.find(e => e.courseId === courseId && e.studentId === studentId);
    
    if (alreadyEnrolled) {
      this.loadingService.hide();
      return throwError(() => new Error('Already enrolled in this course'));
    }

    const enrollmentCount = currentEnrollments.filter(e => e.studentId === studentId).length;
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
        // Update enrollments state
        const currentEnrollments = this.enrollmentsSubject.value;
        this.enrollmentsSubject.next([...currentEnrollments, enrollment]);
        
        // Update user enrollments if it's for current user
        this.updateUserEnrollments(studentId);
        
        // Update course enrollment count
        return this.updateCourseEnrollmentCount(courseId, 1).pipe(
          map(() => enrollment)
        );
      }),
      catchError(error => {
        console.error('Enrollment failed:', error);
        return this.handleError<Enrollment>('enrollInCourse')(error);
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  getEnrollments(): Observable<Enrollment[]> {
    this.loadingService.show();
    return this.http.get<Enrollment[]>(this.enrollmentsUrl)
      .pipe(
        tap(enrollments => this.enrollmentsSubject.next(enrollments)), // Update state
        catchError(this.handleError<Enrollment[]>('getEnrollments', [])),
        finalize(() => this.loadingService.hide())
      );
  }

  getStudentEnrollments(studentId: string): Observable<Enrollment[]> {
    this.loadingService.show();
    
    // First checking current state
    const currentEnrollments = this.enrollmentsSubject.value;
    if (currentEnrollments.length > 0) {
      const userEnrollments = currentEnrollments.filter(e => e.studentId === studentId);
      this.userEnrollmentsSubject.next(userEnrollments);
      this.loadingService.hide();
      return of(userEnrollments);
    }

    // If no data in state, fetch from API
    return this.getEnrollments().pipe(
      map(enrollments => {
        const userEnrollments = enrollments.filter(e => e.studentId === studentId);
        this.userEnrollmentsSubject.next(userEnrollments);
        return userEnrollments;
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  // Helper method to update user enrollments
  private updateUserEnrollments(studentId: string) {
    const currentEnrollments = this.enrollmentsSubject.value;
    const userEnrollments = currentEnrollments.filter(e => e.studentId === studentId);
    this.userEnrollmentsSubject.next(userEnrollments);
  }

  // Method to get current state without API call
  getCurrentCourses(): Course[] {
    return this.coursesSubject.value;
  }

  getCurrentEnrollments(): Enrollment[] {
    return this.enrollmentsSubject.value;
  }

  getCurrentUserEnrollments(): Enrollment[] {
    return this.userEnrollmentsSubject.value;
  }

  // Search and filter operations using current state
  searchCourses(term: string): Observable<Course[]> {
    if (!term.trim()) {
      return this.courses$;
    }
    
    return this.courses$.pipe(
      map(courses => courses.filter(course => 
        course.title.toLowerCase().includes(term.toLowerCase()) ||
        course.description.toLowerCase().includes(term.toLowerCase())
      ))
    );
  }

  getCoursesByCategory(category: string): Observable<Course[]> {
    return this.courses$.pipe(
      map(courses => courses.filter(course => 
        course.category === category && course.status === 'approved'
      ))
    );
  }

  getCoursesByLevel(level: string): Observable<Course[]> {
    return this.courses$.pipe(
      map(courses => courses.filter(course => 
        course.level === level && course.status === 'approved'
      ))
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
      tap(updatedEnrollment => {
        // Update in state
        const currentEnrollments = this.enrollmentsSubject.value;
        const index = currentEnrollments.findIndex(e => e.id === enrollmentId);
        if (index !== -1) {
          currentEnrollments[index] = updatedEnrollment;
          this.enrollmentsSubject.next([...currentEnrollments]);
          // Update user enrollments
          this.updateUserEnrollments(updatedEnrollment.studentId);
        }
        
        this.http.put<Enrollment>(this.enrollmentsUrl, updatedEnrollment, this.httpOptions).subscribe();
      }),
      catchError(this.handleError<Enrollment>('updateEnrollmentProgress')),
    );
  }

  getPendingCourses(): Observable<Course[]> {
    return this.courses$.pipe(
      map(courses => courses.filter(course => course.status === 'pending'))
    );
  }

  getInstructorCourses(instructorId: string): Observable<Course[]> {
    return this.courses$.pipe(
      map(courses => courses.filter(course => course.instructorId === instructorId))
    );
  }

  private updateCourseEnrollmentCount(courseId: string, increment: number): Observable<Course> {
    const currentCourses = this.coursesSubject.value;
    const courseIndex = currentCourses.findIndex(c => c.id === courseId);
    
    if (courseIndex !== -1) {
      const updatedCourse = {
        ...currentCourses[courseIndex],
        enrollmentCount: currentCourses[courseIndex].enrollmentCount + increment,
        updatedAt: new Date()
      };
      
      // Update in state immediately
      currentCourses[courseIndex] = updatedCourse;
      this.coursesSubject.next([...currentCourses]);
      
      // Update in API
      return this.http.put<Course>(this.apiUrl, updatedCourse, this.httpOptions).pipe(
        catchError(error => {
          console.error('Error updating enrollment count:', error);
          return throwError(() => error);
        })
      );
    }
    
    return throwError(() => new Error('Course not found'));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  // Get student login activities
getStudentLoginActivities(studentId: string): Observable<LoginActivity[]> {
  return this.http.get<LoginActivity[]>('api/loginActivities')
    .pipe(
      map(activities => activities.filter(activity => activity.studentId === studentId)),
      catchError(this.handleError<LoginActivity[]>('getStudentLoginActivities', []))
    );
}
}