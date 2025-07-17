import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { LoadingService } from '../../../services/loading.service';
import { Course, Enrollment } from '../../../core/models/course.model';

@Component({
  selector: 'app-my-courses',
  imports: [CommonModule, RouterModule],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.scss'
})
export class MyCoursesComponent implements OnInit {
  user: any = {};
  enrollments: Enrollment[] = [];
  enrolledCourses: Course[] = [];
  loading = false;

  constructor(
    private courseService: CourseService, 
    private router: Router,
    private loadingService: LoadingService
  ) {
    // Subscribe to loading service
    this.loadingService.loading$.subscribe(loading => {
      this.loading = loading;
    });
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadMyCourses();
  }

  loadMyCourses() {
    if (this.user.id && this.user.role === 'student') {
      // Subscribe to user enrollments
      this.courseService.userEnrollments$.subscribe(enrollments => {
        this.enrollments = enrollments;
        this.loadEnrolledCourses();
      });
      
      // Trigger loading of student enrollments (this will show loader via LoadingService)
      this.courseService.getStudentEnrollments(this.user.id).subscribe();
    } else {
      // No loading needed for non-students
      this.loading = false;
    }
  }

  loadEnrolledCourses() {
    // Subscribe to courses state
    this.courseService.courses$.subscribe(courses => {
      this.enrolledCourses = courses.filter(course => 
        this.enrollments.some(enrollment => enrollment.courseId === course.id)
      );
    });
  }

  getEnrollmentProgress(courseId: string): number {
    const enrollment = this.enrollments.find(e => e.courseId === courseId);
    return enrollment ? enrollment.progress : 0;
  }

  getEnrollmentStatus(courseId: string): string {
    const enrollment = this.enrollments.find(e => e.courseId === courseId);
    return enrollment ? enrollment.status : 'unknown';
  }

  continueCourse(courseId: string) {
    this.router.navigate(['/courses', courseId]);
  }
}