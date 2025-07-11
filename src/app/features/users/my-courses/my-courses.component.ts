import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../../services/course.service';
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

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadMyCourses();
  }

  loadMyCourses() {
    this.loading = true;
    
    if (this.user.id && this.user.role === 'student') {
      // Load student enrollments
      this.courseService.getStudentEnrollments(this.user.id).subscribe({
        next: (enrollments) => {
          this.enrollments = enrollments;
          this.loadEnrolledCourses();
        },
        error: (error) => {
          console.error('Error loading enrollments:', error);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  loadEnrolledCourses() {
    // Load all courses and filter by enrolled ones
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.enrolledCourses = courses.filter(course => 
          this.enrollments.some(enrollment => enrollment.courseId === course.id)
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
      }
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
    // Navigate to course detail page
    window.location.href = `/courses/${courseId}`;
  }
}