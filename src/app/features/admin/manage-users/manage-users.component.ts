import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { User, Course, Enrollment } from '../../../core/models/course.model';
import { CourseService } from '../../../services/course.service';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [MatPaginatorModule, MatSortModule, MatIconModule, MatTableModule, MatDialogModule, TitleCasePipe, MatTooltipModule, CommonModule]
})
export class ManageUsersComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'role', 'active', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  users: User[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private courseService: CourseService,
    private dialog: MatDialog,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers() {
  this.loadingService.show();
  this.courseService.getAllUsers().subscribe({
    next: users => {
      const filtered = users
        .filter(u => u.role !== 'admin')
        .map(u => ({ ...u, active: u.active !== false }));
      this.users = filtered;
      this.dataSource.data = filtered;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loadingService.hide();
    },
    error: () => {
      this.loadingService.hide();
    }
  });
}

  confirmDeleteUser(user: User) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete user "${user.name}" and all related data?`,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUserAndRelatedData(user);
      }
    });
  }

  deleteUserAndRelatedData(user: User) {
  if (user.role === 'instructor') {
    // Fetch all courses for this instructor
    this.courseService.getInstructorCourses(user.id).subscribe(courses => {
      const courseIds = courses.map(course => course.id);

      // Fetch all enrollments for these courses
      this.courseService.getEnrollments().subscribe(enrollments => {
        const enrollmentsToDelete = enrollments.filter(e => courseIds.includes(e.courseId));
        const enrollmentDeleteRequests = enrollmentsToDelete.map(e => this.courseService.deleteEnrollments(e.id));

        // After deleting enrollments, decrease enrollmentCount for each course
        const updateCourseRequests = courseIds.map(courseId => {
          const course = courses.find(c => c.id === courseId);
          if (course && course.enrollmentCount > 0) {
            return this.courseService.updateCourse({ ...course, enrollmentCount: course.enrollmentCount - enrollmentsToDelete.filter(e => e.courseId === courseId).length });
          }
          return null;
        }).filter(Boolean);

        // Delete enrollments, update courses, then delete courses and user
        forkJoin([
          ...enrollmentDeleteRequests,
          ...updateCourseRequests,
          ...courseIds.map(id => this.courseService.deleteCourse(id)),
          this.courseService.deleteUser(user.id)
        ]).subscribe({
          next: () => this.loadUsers(),
          error: () => this.loadUsers()
        });
      });
    });
  } else if (user.role === 'student') {
    // Fetch all enrollments for this student
    this.courseService.getStudentEnrollments(user.id).subscribe(enrollments => {
      const enrollmentDeleteRequests = enrollments.map(e => this.courseService.deleteEnrollments(e.id));

      // After deleting enrollments, decrease enrollmentCount for each course
      this.courseService.getCourses().subscribe(courses => {
        const updateCourseRequests = enrollments.map(enrollment => {
          const course = courses.find(c => c.id === enrollment.courseId);
          if (course && course.enrollmentCount > 0) {
            return this.courseService.updateCourse({ ...course, enrollmentCount: course.enrollmentCount - 1 });
          }
          return null;
        }).filter(Boolean);

        forkJoin([
          ...enrollmentDeleteRequests,
          ...updateCourseRequests,
          this.courseService.deleteUser(user.id)
        ]).subscribe({
          next: () => this.loadUsers(),
          error: () => this.loadUsers()
        });
      });
    });
  }
  }
  
  toggleUserActive(user: User) {
  const updatedUser = { ...user, active: !user.active };
  this.courseService.updateUserStatus(updatedUser).subscribe({
    next: (savedUser) => {
      if (savedUser && typeof savedUser.active !== 'undefined') {
        user.active = savedUser.active;
      } else {
        user.active = updatedUser.active; // fallback if API returns null
      }
      this.dataSource.data = [...this.users];
    },
    error: () => {
      alert('Failed to update user status.');
    }
  });
}
}