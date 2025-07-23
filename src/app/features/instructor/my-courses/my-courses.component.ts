import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { InstructorService } from '../../../services/instructor.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.scss'
})
export class MyCoursesComponent implements OnInit {
  courses: Course[] = [];
  loading = true;
  currentUser: any = {};

  constructor(
    private instructorService: InstructorService,
    private router: Router
  ) {}

  ngOnInit() {
  this.loadCurrentUser();
  
  // Subscribe to course updates FIRST
  this.instructorService.instructorCourses$.subscribe(courses => {
    // console.log('MyCoursesComponent: Courses updated via subscription:', courses);
    this.courses = courses;
    if (courses.length > 0 || !this.loading) {
      this.loading = false;
    }
  });
  
  // Then load the initial courses
  this.loadInstructorCourses();
}

  loadCurrentUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  loadInstructorCourses() {
  if (this.currentUser.id) {
    this.loading = true;
    this.instructorService.getInstructorCourses(this.currentUser.id).subscribe({
      next: (courses) => {
        // console.log('MyCoursesComponent: Loaded instructor courses:', courses);
        this.courses = courses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
      }
    });
  }
}

  createNewCourse() {
    this.router.navigate(['/instructor/create-course']);
  }

  editCourse(courseId: string) {
    this.router.navigate(['/instructor/edit-course', courseId]);
  }

  viewCourse(courseId: string) {
    this.router.navigate(['/courses', courseId]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'primary';
      case 'pending': return 'accent';
      case 'rejected': return 'warn';
      default: return '';
    }
  }
}