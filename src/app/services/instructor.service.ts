import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map, of, forkJoin, catchError, throwError, switchMap } from 'rxjs';
import { Course, InstructorStats, Enrollment } from '../core/models/course.model';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private apiUrl = 'api'; // This will be handled by in-memory-data.service

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  
  // State management - these help keep track of data in the app
  private instructorStatsSubject = new BehaviorSubject<InstructorStats | null>(null);
  public instructorStats$ = this.instructorStatsSubject.asObservable();

  private instructorCoursesSubject = new BehaviorSubject<Course[]>([]);
  public instructorCourses$ = this.instructorCoursesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get instructor dashboard statistics
  getInstructorStats(instructorId: string): Observable<InstructorStats> {
    // Get all courses and enrollments to calculate real stats
    return forkJoin({
      courses: this.http.get<Course[]>(`${this.apiUrl}/courses`),
      enrollments: this.http.get<Enrollment[]>(`${this.apiUrl}/enrollments`),
    }).pipe(
      map(({ courses, enrollments }) => {
        // Filter courses by instructor
        const instructorCourses = courses.filter(course => course.instructorId === instructorId);
        
        // Filter enrollments for instructor's courses
        const courseIds = instructorCourses.map(course => course.id);
        const instructorEnrollments = enrollments.filter(enrollment => 
          courseIds.includes(enrollment.courseId)
        );
        
        // Calculate dynamic statistics
        const totalCourses = instructorCourses.length;
        const totalStudents = new Set(instructorEnrollments.map(e => e.studentId)).size;
        const totalEnrollments = instructorEnrollments.length;
        
        // Calculate average rating from courses
        const ratingsSum = instructorCourses.reduce((sum, course) => sum + course.rating, 0);
        const averageRating = totalCourses > 0 ? Number((ratingsSum / totalCourses).toFixed(1)) : 0;
        
        // Calculate completion rate
        const completedEnrollments = instructorEnrollments.filter(e => e.status === 'completed').length;
        const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
        
        // Count pending approvals
        const pendingApprovals = instructorCourses.filter(course => course.status === 'pending').length;
        const rejectedCourses = instructorCourses.filter(c => c.status === 'rejected').length;

        // Count active courses
        const activeCourses = instructorCourses.filter(course => course.status === 'approved').length;
        
        const stats: InstructorStats = {
          totalCourses,
          totalStudents,
          averageRating,
          pendingApprovals,
          rejectedCourses,
          activeCourses,
          totalEnrollments,
          completionRate
        };
        
        this.instructorStatsSubject.next(stats);
        return stats;
      })
    );
  }

  // Get courses created by this instructor
  getInstructorCourses(instructorId: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses`)
      .pipe(
        map(allCourses => {
          // Filter courses to only show ones created by this instructor
          const instructorCourses = allCourses.filter(course => course.instructorId === instructorId);
          this.instructorCoursesSubject.next(instructorCourses);
          return instructorCourses;
        })
      );
  }

  // Create new course
  createCourse(courseData: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/courses`, courseData, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

updateCourse(courseId: string, courseData: Course): Observable<Course> {
  // console.log('InstructorService: Updating course', courseId, courseData);
  
  // Use PUT request to actually update the course in the database
  return this.http.put<Course>(`${this.apiUrl}/courses/${courseId}`, courseData, this.httpOptions)
    .pipe(
      map(updatedCourse => {
        // console.log('InstructorService: Received updated course from API:', updatedCourse);
        
        // Update the local courses array immediately
        const currentCourses = this.instructorCoursesSubject.value;
        const updatedCourses = currentCourses.map(course => 
          course.id === courseId ? updatedCourse : course
        );
        
        // console.log('InstructorService: Broadcasting updated courses:', updatedCourses);
        this.instructorCoursesSubject.next(updatedCourses);
        
        return updatedCourse;
      }),
      catchError(error => {
        console.error('InstructorService: Error updating course:', error);
        
        // If PUT fails, fall back to simulation method
        return this.http.get<Course[]>(`${this.apiUrl}/courses`)
          .pipe(
            switchMap(courses => {
              const courseIndex = courses.findIndex(c => c.id === courseId);
              if (courseIndex !== -1) {
                courses[courseIndex] = courseData;
                
                // Update the local courses list immediately
                const currentCourses = this.instructorCoursesSubject.value;
                const updatedCourses = currentCourses.map(course => 
                  course.id === courseId ? courseData : course
                );
                
                this.instructorCoursesSubject.next(updatedCourses);
                
                return of(courseData);
              } else {
                return throwError(() => new Error('Course not found'));
              }
            })
          );
      })
    );
}

  // Delete course
  deleteCourse(courseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courses/${courseId}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Submit course for approval
  submitCourseForApproval(courseId: string): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}/courses/${courseId}`, { status: 'pending' });
  }

  // Get courses by instructor ID
  getCoursesByInstructor(instructorId: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses`)
      .pipe(
        map(courses => courses.filter(course => course.instructorId === instructorId)),
        catchError(this.handleError)
      );
  }

  // Get course by ID
  getCourseById(courseId: string): Observable<Course | undefined> {
  return this.http.get<Course[]>(`${this.apiUrl}/courses`)
    .pipe(
      map(courses => courses.find(course => course.id === courseId)),
      catchError(error => {
        console.error('Error fetching course:', error);
        return throwError(() => error);
      })
    );
}

  // Error handling
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}