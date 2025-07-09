import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  totalCourses = 0;
  totalUsers = 0;
  totalEnrollments = 0;
  pendingApprovals = 0;
  recentCourses: Course[] = [];

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.courseService.getCourses().subscribe(courses => {
      this.totalCourses = courses.length;
      this.pendingApprovals = courses.filter(c => c.status === 'pending').length;
      this.recentCourses = courses.slice(0, 5);
    });

    // Mock data for now
    this.totalUsers = 25;
    this.totalEnrollments = 150;
  }
}