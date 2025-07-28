import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../core/models/course.model';
import { CommonModule } from '@angular/common';
import { ConfirmDialogData, ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-course-approvals',
  templateUrl: './course-approvals.component.html',
  styleUrl: './course-approvals.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule
  ]
})
export class CourseApprovalsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['title', 'instructor', 'createdAt', 'status', 'actions'];
  dataSource = new MatTableDataSource<Course>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private courseService: CourseService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadPendingCourses();
  }

  ngAfterViewInit() {
    // Wait for view to be initialized, then assign sort and paginator
    setTimeout(() => {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.setSortingAccessor();
    });
  }

  loadPendingCourses() {
    this.courseService.getCourses().subscribe(courses => {
      const pending = courses.filter(c => c.status === 'pending');
      this.dataSource.data = pending;

      // Always re-assign after data changes and after paginator/sort are available
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.setSortingAccessor();
      });
    });
  }

  setSortingAccessor() {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'instructor':
          return item.instructor || item.instructorInfo?.name || '';
        case 'createdAt':
          return new Date(item.createdAt).getTime();
        default:
          return (item as any)[property];
      }
    };
  }

  approveCourse(course: Course) {
    const updated: Course = { ...course, status: 'approved' as 'approved' };
    this.courseService.updateCourse(updated).subscribe(() => {
      this.loadPendingCourses();
    });
  }

  rejectCourse(course: Course) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      data: {
        title: 'Reject Course',
        message: 'Please enter the reason for rejecting this course.',
        requireReason: true,
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe((reason: string) => {
      if (!reason) return;
      const updated: Course = { ...course, status: 'rejected', rejectionMessage: { rejectionReason: reason } };
      this.courseService.updateCourse(updated).subscribe(() => {
        this.loadPendingCourses();
      });
    });
  }
}