import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../services/course.service';
import { LoadingService } from '../../../services/loading.service';
import { Course, Enrollment } from '../../../core/models/course.model';
import { MatProgressBarModule } from "@angular/material/progress-bar";

@Component({
  selector: 'app-my-courses',
  imports: [CommonModule, RouterModule, FormsModule, MatProgressBarModule],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MyCoursesComponent implements OnInit {
  user: any = {};
  enrollments: Enrollment[] = [];
  enrolledCourses: Course[] = [];
  filteredCourses: Course[] = [];
  loading = false;

  selectedFilter: 'all' | 'enrolled' | 'in-progress' | 'completed' = 'all';

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
      // Apply initial filtering
      this.applyFilters();
    });
  }

  // Filter methods
  applyFilters() {
    let filtered = [...this.enrolledCourses];

    // Remove search filter logic entirely

    // Apply status filter only
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(course => {
        const progress = this.getEnrollmentProgress(course.id);
        const status = this.getEnrollmentStatus(course.id);
        
        switch (this.selectedFilter) {
          case 'enrolled':
            return progress === 0 && status === 'active';
          case 'in-progress':
            return progress > 0 && progress < 100 && status === 'active';
          case 'completed':
            return progress === 100 || status === 'completed';
          default:
            return true;
        }
      });
    }

    this.filteredCourses = filtered;
  }

  onFilterChange() {
    this.applyFilters();
  }

  // Get filter counts for display
  getFilterCount(filter: 'all' | 'enrolled' | 'in-progress' | 'completed'): number {
    switch (filter) {
      case 'all':
        return this.enrolledCourses.length;
      case 'enrolled':
        return this.enrolledCourses.filter(course => {
          const progress = this.getEnrollmentProgress(course.id);
          const status = this.getEnrollmentStatus(course.id);
          return progress === 0 && status === 'active';
        }).length;
      case 'in-progress':
        return this.enrolledCourses.filter(course => {
          const progress = this.getEnrollmentProgress(course.id);
          const status = this.getEnrollmentStatus(course.id);
          return progress > 0 && progress < 100 && status === 'active';
        }).length;
      case 'completed':
        return this.enrolledCourses.filter(course => {
          const progress = this.getEnrollmentProgress(course.id);
          const status = this.getEnrollmentStatus(course.id);
          return progress === 100 || status === 'completed';
        }).length;
      default:
        return 0;
    }
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
  // Navigate with state indicating source is my-courses
  this.router.navigate(['/courses', courseId], {
    state: { fromMyCourses: true }
  });
  }
  
  onImageError(event: any): void {
  event.target.src = 'assets/images/defaultc-ourse.jpeg';
}
}