import { Component } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

export interface BreadcrumbItem {
  label: string;
  path: string;
  isClickable: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  imports: [CommonModule]
})
export class BreadcrumbComponent {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setBreadcrumbs();
    });
    this.setBreadcrumbs();
  }

  setBreadcrumbs() {
  const path = this.router.url.split('?')[0]; // Remove query params
  const segments = path.split('/').filter(x => x);

  // Filter out auth-related segments
  const filteredSegments = segments.filter(segment =>
    segment.toLowerCase() !== 'auth' &&
    segment.toLowerCase() !== 'login' &&
    segment.toLowerCase() !== 'register'
  );

  this.breadcrumbs = [];

  // Special handling for admin routes
  if (filteredSegments[0] === 'admin') {
    this.buildAdminBreadcrumbs(filteredSegments);
  }
  // Special handling for instructor routes
  else if (filteredSegments[0] === 'instructor') {
    this.buildInstructorBreadcrumbs(filteredSegments);
  }
  // Special handling for user routes
  else if (filteredSegments[0] === 'users') {
    this.buildUserBreadcrumbs(filteredSegments);
  }
  // Special handling for course detail pages accessed from user context
  else if (filteredSegments[0] === 'courses' && filteredSegments.length === 2) {
    this.buildCourseDetailBreadcrumbs(filteredSegments);
  } else {
    // Default breadcrumb building for other routes
    this.buildDefaultBreadcrumbs(filteredSegments);
  }
}

private buildUserBreadcrumbs(segments: string[]) {
  // Always add Dashboard as first breadcrumb (clickable)
  this.breadcrumbs.push({
    label: 'Dashboard',
    path: '/users/dashboard',
    isClickable: true
  });

  if (segments.length > 1) {
    const secondSegment = segments[1];

    // Skip adding dashboard breadcrumb if we're currently on dashboard page
    if (secondSegment === 'dashboard') {
      // Don't add anything more - we're on the dashboard page itself
      // Make the dashboard breadcrumb non-clickable since it's the current page
      this.breadcrumbs[0].isClickable = false;
      return;
    }

    // Handle user routes (excluding dashboard)
    const routeMap: { [key: string]: string } = {
      'my-courses': 'My Courses',
      'profile': 'Profile',
      'settings': 'Settings',
      'achievements': 'Achievements',
      'progress': 'Progress'
    };

    const routeLabel = routeMap[secondSegment] || this.formatLabel(secondSegment);
    const isLast = segments.length === 2;

    this.breadcrumbs.push({
      label: routeLabel,
      path: `/users/${secondSegment}`,
      isClickable: !isLast
    });

    // Handle additional segments if any (like course IDs, etc.)
    if (segments.length > 2) {
      for (let i = 2; i < segments.length; i++) {
        const isLastSegment = i === segments.length - 1;
        const segmentPath = '/' + segments.slice(0, i + 1).join('/');
        
        this.breadcrumbs.push({
          label: this.formatLabel(segments[i]),
          path: segmentPath,
          isClickable: !isLastSegment
        });
      }
    }
  } else {
    // If we're on /users (without dashboard), make it non-clickable
    this.breadcrumbs[0].isClickable = false;
  }
}

private buildCourseDetailBreadcrumbs(segments: string[]) {
  const navigationState = history.state;
  const userData = localStorage.getItem('user');
  const currentUser = userData ? JSON.parse(userData) : null;
  
  // Determine the appropriate dashboard based on user role
  let dashboardPath = '/courses';
  let dashboardLabel = 'Courses';
  let myCoursesPath = '';
  let myCoursesLabel = '';
  
  if (currentUser) {
    switch (currentUser.role) {
      case 'instructor':
        dashboardPath = '/instructor/dashboard';
        dashboardLabel = 'Dashboard';
        myCoursesPath = '/instructor/my-courses';
        myCoursesLabel = 'My Courses';
        break;
      case 'student':
        dashboardPath = '/users/dashboard';
        dashboardLabel = 'Dashboard';
        myCoursesPath = '/users/my-courses';
        myCoursesLabel = 'My Courses';
        break;
      case 'admin':
        dashboardPath = '/admin/dashboard';
        dashboardLabel = 'Dashboard';
        break;
      default:
        dashboardPath = '/courses';
        dashboardLabel = 'Courses';
    }
  }
  
  // Always add the appropriate dashboard as home
  this.breadcrumbs.push({
    label: dashboardLabel,
    path: dashboardPath,
    isClickable: true
  });

  // Only add "My Courses" if user specifically came from My Courses page
  if (navigationState?.fromMyCourses && myCoursesPath) {
    this.breadcrumbs.push({
      label: myCoursesLabel,
      path: myCoursesPath,
      isClickable: true
    });
  }

  // Add current course (not clickable as it's current page)
  if (segments[1]) {
    this.breadcrumbs.push({
      label: this.formatCourseLabel(segments[1]),
      path: `/courses/${segments[1]}`,
      isClickable: false
    });
  }
}

private formatCourseLabel(courseId: string): string {
  // For now, format the course ID nicely
  if (courseId.startsWith('course_')) {
    return `Course ${courseId.replace('course_', '').toUpperCase()}`;
  }
  return `Course ${courseId}`;
}

  private buildInstructorBreadcrumbs(segments: string[]) {
  // Always add Instructor Dashboard as first breadcrumb (clickable)
  this.breadcrumbs.push({
    label: 'Dashboard',
    path: '/instructor/dashboard',
    isClickable: true
  });

  if (segments.length > 1) {
    const secondSegment = segments[1];

    // Skip adding dashboard breadcrumb if we're currently on dashboard page
    if (secondSegment === 'dashboard') {
      // Don't add anything more - we're on the dashboard page itself
      // Make the dashboard breadcrumb non-clickable since it's the current page
      this.breadcrumbs[0].isClickable = false;
      return;
    }

    // Handle edit-course route specially
    if (secondSegment === 'edit-course') {
      // Add "My Courses" breadcrumb
      this.breadcrumbs.push({
        label: 'My Courses',
        path: '/instructor/my-courses',
        isClickable: true
      });

      // Add "Edit Course" breadcrumb (not clickable as it's current page context)
      this.breadcrumbs.push({
        label: 'Edit Course',
        path: `/instructor/edit-course/${segments[2] || ''}`,
        isClickable: false
      });

      // Add Course ID if it exists
      if (segments[2]) {
        this.breadcrumbs.push({
          label: `Course ${segments[2]}`,
          path: `/instructor/edit-course/${segments[2]}`,
          isClickable: false // This is the current page
        });
      }
    } else {
      // Handle other instructor routes (excluding dashboard)
      const routeMap: { [key: string]: string } = {
        'my-courses': 'My Courses',
        'create-course': 'Create Course',
        'analytics': 'Analytics',
        'manage-resources': 'Manage Resources',
        'approval-status': 'Approval Status'
      };

      const routeLabel = routeMap[secondSegment] || this.formatLabel(secondSegment);
      const isLast = segments.length === 2;

      this.breadcrumbs.push({
        label: routeLabel,
        path: `/instructor/${secondSegment}`,
        isClickable: !isLast
      });

      // Handle additional segments if any
      if (segments.length > 2) {
        for (let i = 2; i < segments.length; i++) {
          const isLastSegment = i === segments.length - 1;
          const segmentPath = '/' + segments.slice(0, i + 1).join('/');
          
          this.breadcrumbs.push({
            label: this.formatLabel(segments[i]),
            path: segmentPath,
            isClickable: !isLastSegment
          });
        }
      }
    }
  } else {
    // If we're on /instructor (without dashboard), make it non-clickable
    this.breadcrumbs[0].isClickable = false;
  }
  }
  
  private buildAdminBreadcrumbs(segments: string[]) {
  // Always add Admin Dashboard as first breadcrumb (clickable)
  this.breadcrumbs.push({
    label: 'Dashboard',
    path: '/admin/dashboard',
    isClickable: true
  });

  // If on /admin or /admin/dashboard, show only one crumb and return
  // This check MUST be before any other logic!
  if (
    segments.length === 1 || // /admin
    (segments.length === 2 && segments[1] === 'dashboard') // /admin/dashboard
  ) {
    this.breadcrumbs[0].isClickable = false;
    return;
  }

  // Now safe to process other routes
  const secondSegment = segments[1];

  // Special handling for edit-course route
  if (secondSegment === 'edit-course' && segments.length > 2) {
    this.breadcrumbs.push({
      label: 'Manage Courses',
      path: '/admin/manage-courses',
      isClickable: true
    });
    this.breadcrumbs.push({
      label: 'Edit Course',
      path: `/admin/edit-course/${segments[2]}`,
      isClickable: false
    });
    this.breadcrumbs.push({
      label: `Course ${segments[2]}`,
      path: `/admin/edit-course/${segments[2]}`,
      isClickable: false
    });
    return;
  }

  // If route is /admin/manage-courses/edit-course/:id
  if (secondSegment === 'manage-courses' && segments[2] === 'edit-course' && segments.length > 3) {
    this.breadcrumbs.push({
      label: 'Manage Courses',
      path: '/admin/manage-courses',
      isClickable: true
    });
    this.breadcrumbs.push({
      label: 'Edit Course',
      path: `/admin/manage-courses/edit-course/${segments[3]}`,
      isClickable: false
    });
    this.breadcrumbs.push({
      label: `Course ${segments[3]}`,
      path: `/admin/manage-courses/edit-course/${segments[3]}`,
      isClickable: false
    });
    return;
  }

  // Default: Use route map for other admin routes
  const routeMap: { [key: string]: string } = {
    'admin-dashboard': 'Dashboard',
    'course-approvals': 'Course Approvals',
    'manage-courses': 'Manage Courses',
    'reports': 'Reports',
    'edit-course': 'Edit Course'
  };

  const routeLabel = routeMap[secondSegment] || this.formatLabel(secondSegment);
  const isLast = segments.length === 2;

  this.breadcrumbs.push({
    label: routeLabel,
    path: `/admin/${secondSegment}`,
    isClickable: !isLast
  });

  // Handle additional segments (like course IDs) for other admin routes
  if (segments.length > 2) {
    for (let i = 2; i < segments.length; i++) {
      const isLastSegment = i === segments.length - 1;
      const segmentPath = '/' + segments.slice(0, i + 1).join('/');

      this.breadcrumbs.push({
        label: this.formatLabel(segments[i]),
        path: segmentPath,
        isClickable: !isLastSegment
      });
    }
  }
}

  private buildDefaultBreadcrumbs(segments: string[]) {
    this.breadcrumbs = segments.map((segment, index) => {
      const routePath = '/' + segments.slice(0, index + 1).join('/');
      const isLast = index === segments.length - 1;
      
      return {
        label: this.formatLabel(segment),
        path: routePath,
        isClickable: !isLast
      };
    });
  }

  private formatLabel(segment: string): string {
  // Handle special cases
  const specialCases: { [key: string]: string } = {
    'my-courses': 'My Courses',
    'create-course': 'Create Course',
    'edit-course': 'Edit Course',
    'manage-resources': 'Manage Resources',
    'approval-status': 'Approval Status',
    'users': 'Student Dashboard', // For users root
    'dashboard': 'Dashboard',
    'profile': 'Profile',
    'settings': 'Settings',
    'achievements': 'Achievements',
    'progress': 'Progress'
  };

  if (specialCases[segment]) {
    return specialCases[segment];
  }

  // Check if it's a course ID (starts with 'course_')
  if (segment.startsWith('course_')) {
    return `Course ${segment.replace('course_', '')}`;
  }

  // Check if it's a student ID (starts with 'student')
  if (segment.startsWith('student')) {
    return `Student ${segment.replace('student', '')}`;
  }

  // Default formatting: capitalize first letter and replace hyphens with spaces
  return segment.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

  navigateTo(breadcrumb: BreadcrumbItem) {
    if (breadcrumb.isClickable) {
      this.router.navigate([breadcrumb.path]);
    }
  }
}