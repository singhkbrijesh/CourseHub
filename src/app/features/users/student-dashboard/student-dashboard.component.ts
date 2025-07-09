import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { Course, Enrollment } from '../../../core/models/course.model';

@Component({
  selector: 'app-student-dashboard',
  imports: [CommonModule, RouterModule],
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

  constructor(private courseService: CourseService) {}

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

    // Load all courses to match with enrollments
    this.courseService.getCourses().subscribe(courses => {
      this.enrolledCourses = courses.filter(course => 
        this.enrollments.some(enrollment => enrollment.courseId === course.id)
      );
      this.recentCourses = courses.filter(c => c.status === 'approved').slice(0, 3);
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
    // Navigate to course detail or lesson
    console.log('Continue course:', courseId);
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
}
