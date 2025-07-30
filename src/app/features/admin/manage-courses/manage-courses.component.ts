import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { Course, Enrollment } from '../../../core/models/course.model';
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';
import { MatMenuModule } from '@angular/material/menu';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-manage-courses',
  templateUrl: './manage-courses.component.html',
  styleUrl: './manage-courses.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [MatIconModule, MatProgressBarModule, MatTableModule, MatPaginatorModule, MatSortModule, MatMenuModule]
})
export class ManageCoursesComponent implements OnInit {
  courses: Course[] = [];
  enrollments: Enrollment[] = [];
  displayedColumns: string[] = ['title', 'enrollments', 'progress', 'instructor', 'duration', 'actions'];
  dataSource = new MatTableDataSource<Course>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private courseService: CourseService, private router: Router, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadCourses();
    this.loadEnrollments();
  }

  ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;

  this.dataSource.sortingDataAccessor = (item, property) => {
    switch (property) {
      case 'instructor':
        return item.instructor || item.instructorInfo?.name || '';
      case 'enrollments':
        return item.enrollmentCount || 0;
      case 'progress':
        return this.getOverallProgress(item); // Use your method for sorting
      case 'duration':
        return this.getTotalDuration(item);
      default:
        return (item as any)[property];
    }
  };
}

  loadCourses() {
    this.courseService.getCourses().subscribe(courses => {
      const approvedCourses = courses.filter(c => c.status === 'approved');
      this.dataSource.data = approvedCourses;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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
  const dialogRef = this.dialog.open(ConfirmationModalComponent, {
    width: '350px',
    data: {
      title: 'Delete Course',
      message: 'Are you sure you want to delete this course?',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.courseService.deleteCourse(courseId).subscribe(() => {
        this.loadCourses();
      });
    }
  });
}

  downloadCSV() {
  const headers = [
    'Course Title',
    'Enrollments',
    'Overall Progress',
    'Instructor',
    'Duration (min)'
  ];
  const rows = this.dataSource.data.map(course => [
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

  downloadExcel() {
  const headers = [
    'Course Title',
    'Enrollments',
    'Overall Progress',
    'Instructor',
    'Duration (min)'
  ];
  const rows = this.dataSource.data.map(course => [
    course.title,
    course.enrollmentCount || 0,
    this.getOverallProgress(course) + '%',
    course.instructor || (course.instructorInfo?.name || ''),
    this.getTotalDuration(course)
  ]);
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Courses');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'courses.xlsx');
}

downloadPDF() {
  const doc = new jsPDF();
  const headers = [
    'Course Title',
    'Enrollments',
    'Overall Progress',
    'Instructor',
    'Duration (min)'
  ];
  const rows = this.dataSource.data.map(course => [
    course.title,
    course.enrollmentCount || 0,
    this.getOverallProgress(course) + '%',
    course.instructor || (course.instructorInfo?.name || ''),
    this.getTotalDuration(course)
  ]);
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 20,
    styles: { fontSize: 8 }
  });
  doc.save('courses.pdf');
}
}