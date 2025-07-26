import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { Course, Enrollment } from '../../../core/models/course.model';
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-manage-courses',
  templateUrl: './manage-courses.component.html',
  styleUrl: './manage-courses.component.scss',
  imports: [MatIconModule, MatProgressBarModule, MatTableModule]
})
export class ManageCoursesComponent implements OnInit {
  courses: Course[] = [];
  enrollments: Enrollment[] = [];
  displayedColumns: string[] = ['title', 'enrollments', 'progress', 'instructor', 'duration', 'actions'];

  constructor(private courseService: CourseService, private router: Router) {}

  ngOnInit() {
    this.loadCourses();
    this.loadEnrollments();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe(courses => {
      this.courses = courses;
    });
  }

  loadEnrollments() {
    this.courseService.getEnrollments().subscribe(enrollments => {
      this.enrollments = enrollments;
    });
  }

  getTotalDuration(course: Course): number {
    if (!course.lessons) return 0;
    return course.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  }

  getOverallProgress(course: Course): number {
    // Find all enrollments for this course
    const courseEnrollments = this.enrollments.filter(e => e.courseId === course.id);
    if (courseEnrollments.length === 0) return 0;
    const total = courseEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
    return Math.round(total / courseEnrollments.length);
  }

  editCourse(courseId: string) {
    this.router.navigate(['/admin/edit-course', courseId], { state: { from: 'admin-manage-courses' } });
  }

  deleteCourse(courseId: string) {
    if (confirm('Are you sure you want to delete this course?')) {
      this.courseService.deleteCourse(courseId).subscribe(() => {
        this.loadCourses();
      });
    }
  }

  downloadCSV() {
  const headers = [
    'Course Title',
    'Enrollments',
    'Overall Progress',
    'Instructor',
    'Duration (min)'
  ];
  const rows = this.courses.map(course => [
    `"${course.title}"`,
    course.enrollmentCount || 0,
    this.getOverallProgress(course) + '%',
    `"${course.instructor || (course.instructorInfo?.name || '')}"`,
    this.getTotalDuration(course)
  ]);
  const csvContent =
    headers.join(',') + '\n' +
    rows.map(e => e.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'courses.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
}