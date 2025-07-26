import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { Course, Enrollment } from '../../../core/models/course.model';
import { LoadingService } from '../../../services/loading.service';
import { LoginActivity } from '../../../core/models/course.model';
import { MatProgressBarModule } from "@angular/material/progress-bar";

@Component({
  selector: 'app-student-dashboard',
  imports: [CommonModule, RouterModule, MatProgressBarModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss'
})
export class StudentDashboardComponent implements OnInit {
  user: any = {};
  enrollments: Enrollment[] = [];
  enrolledCourses: Course[] = [];
  recentCourses: Course[] = [];
  overallProgress = 0;
  completedCourses = 0;
  inProgressCourses = 0;
  loading = false;

  recentLoginActivities: LoginActivity[] = [];

  constructor(private courseService: CourseService,private loadingService: LoadingService,
    private router: Router)
    {
    this.loadingService.loading$.subscribe(loading => {
      this.loading = loading;
    });
    }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadUserDashboard();
  }

  loadUserDashboard() {
    // Load student enrollments
    this.courseService.getStudentEnrollments(this.user.id || 'student1').subscribe(enrollments => {
      this.enrollments = enrollments;
      this.calculateProgress();
    });

    // Load recent login activities only
    this.courseService.getStudentLoginActivities(this.user.id || 'student1').subscribe(activities => {
      this.recentLoginActivities = activities
        .sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime())
        .slice(0, 5); // Show last 5 login sessions
    });

    // Load all courses to match with enrollments
    this.courseService.getCourses().subscribe(courses => {
      this.enrolledCourses = courses.filter(course => 
        this.enrollments.some(enrollment => enrollment.courseId === course.id)
      );
      this.recentCourses = courses.filter(c => c.status === 'approved').slice(0, 3);
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  calculateProgress() {
    if (this.enrollments.length === 0) {
      this.overallProgress = 0;
      return;
    }

    const totalProgress = this.enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0);
    this.overallProgress = Math.round(totalProgress / this.enrollments.length);
    
    this.completedCourses = this.enrollments.filter(e => e.status === 'completed').length;
    this.inProgressCourses = this.enrollments.filter(e => e.status === 'active').length;
  }

  continueCourse(courseId: string) {
  // Navigate with state indicating source is dashboard
  this.router.navigate(['/courses', courseId], {
    state: { fromDashboard: true }
  });
}
  
  getEnrollmentProgress(courseId: string): number {
    const enrollment = this.enrollments.find(e => e.courseId === courseId);
    return enrollment ? enrollment.progress : 0;
  }

  enrollInCourse(courseId: string) {
    this.courseService.enrollInCourse(courseId, this.user.id || 'student1').subscribe({
      next: () => {
        alert('Successfully enrolled in course!');
        this.loadUserDashboard(); // Refresh dashboard
      },
      error: (error) => {
        console.error('Enrollment failed:', error);
        alert('Failed to enroll in course. Please try again.');
      }
    });
  }

  getCourseButtonText(courseId: string): string {
  const progress = this.getEnrollmentProgress(courseId);
  if (progress === 100) {
    return 'Revisit';
  } else if (progress === 0) {
    return 'Start Course';
  } else {
    return 'Continue';
  }
  }
  
  onImageError(event: Event) {
  (event.target as HTMLImageElement).src = 'assets/images/default-course.jpeg';
}
}
