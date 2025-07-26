import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil } from 'rxjs';

import { InstructorService } from '../../../services/instructor.service';
import { Course, InstructorStats } from '../../../core/models/course.model';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatProgressBarModule,
    MatBadgeModule
  ],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.scss'
})
export class InstructorDashboardComponent implements OnInit, OnDestroy {
  // Properties to store our data
  currentUser: any = {};
  instructorStats: InstructorStats | null = null;
  recentCourses: Course[] = [];
  // notifications: InstructorNotification[] = [];
  loading = true;
  
  // Subject for managing subscriptions
  private destroy$ = new Subject<void>();

  constructor(
    private instructorService: InstructorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    if (this.currentUser.id) {
      this.loadDashboardData();
    } else {
      console.error('No user found. Redirecting to login.');
      this.router.navigate(['/auth/login']);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Load user information from local storage
  loadCurrentUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      // console.log('Current user loaded:', this.currentUser);
    } else {
      console.error('No user data found in localStorage');
    }
  }

  // Load all dashboard data
  loadDashboardData() {
    if (!this.currentUser.id) {
      console.error('No user ID found');
      this.loading = false;
      return;
    }

    // console.log('Loading dashboard data for instructor:', this.currentUser.id);

    // Load instructor statistics
    this.instructorService.getInstructorStats(this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          console.log('Instructor stats loaded:', stats);
          this.instructorStats = stats;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading instructor stats:', error);
          this.loading = false;
        }
      });

    // Load instructor's courses (only show first 3)
    this.instructorService.getInstructorCourses(this.currentUser.id)
      // .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (courses) => {
          // console.log('Instructor courses loaded:', courses);
          // Sort by creation date and take the 3 most recent
          this.recentCourses = courses
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          console.log(this.recentCourses);
        },
        error: (error) => {
          console.error('Error loading instructor courses:', error);
        }
      });

  }

  // Navigate to course management page
  navigateToCourse(courseId: string) {
  // Navigate with state indicating source is instructor dashboard
  this.router.navigate(['/courses', courseId], {
    state: { fromInstructorDashboard: true, fromInstructor: true }
  });
}

  // Get color for course status badge
  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  }

  // Get icon for notification type
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'enrollment': return 'person_add';
      case 'completion': return 'check_circle';
      case 'approval': return 'verified';
      case 'review': return 'star';
      default: return 'notifications';
    }
  }

  // Format timestamp to show time ago
  formatTimeAgo(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return notificationDate.toLocaleDateString();
  }

  // Refresh dashboard data
  refreshDashboard() {
    this.loading = true;
    this.loadDashboardData();
  }

  // Helper method to get course count display
  getCoursesDisplay(): string {
    if (this.instructorStats) {
      return `${this.instructorStats.activeCourses} active, ${this.instructorStats.pendingApprovals} pending`;
    }
    return 'Loading...';
  }

  // Helper method to format numbers
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}