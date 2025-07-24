import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../core/models/course.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-approvals',
  templateUrl: './course-approvals.component.html',
  styleUrl: './course-approvals.component.scss',
  imports: [CommonModule]
})
export class CourseApprovalsComponent implements OnInit {
  pendingCourses: Course[] = [];

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    this.loadPendingCourses();
  }

  loadPendingCourses() {
    this.courseService.getCourses().subscribe(courses => {
      this.pendingCourses = courses.filter(c => c.status === 'pending');
    });
  }

  approveCourse(course: Course) {
    const updated: Course = { ...course, status: 'approved' as 'approved' };
    this.courseService.updateCourse(updated).subscribe(() => {
      this.loadPendingCourses();
    });
  }

  rejectCourse(course: Course) {
    const updated: Course = { ...course, status: 'rejected' as 'rejected' };
    this.courseService.updateCourse(updated).subscribe(() => {
      this.loadPendingCourses();
    });
  }
}