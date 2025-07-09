import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { CourseService } from '../../../services/course.service';
import { AuthService } from '../../../services/auth.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent implements OnInit, AfterViewInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  paginatedCourses: Course[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedLevel = '';
  userRole = '';
  enrolledCourseIds: string[] = [];
  
  // View mode and Material table properties
  viewMode: 'grid' | 'table' = 'grid';
  dataSource = new MatTableDataSource<Course>();
  displayedColumns: string[] = ['title', 'category', 'level', 'duration', 'rating', 'instructor', 'price', 'actions'];
  
  // Grid view pagination and sorting properties
  gridPageSize = 6;
  gridPageIndex = 0;
  gridSortBy = '';
  gridSortDirection: 'asc' | 'desc' = 'asc';
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('gridPaginator') gridPaginator!: MatPaginator;
  
  categories = ['Programming', 'Design', 'Business', 'Marketing', 'Data Science'];
  levels = ['Beginner', 'Intermediate', 'Advanced'];

  constructor(
    private courseService: CourseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadCourses();
    this.loadUserEnrollments();
  }

  ngAfterViewInit() {
    // This will be called after the template has been initialized
    // We'll connect the paginator and sort here, but the actual connection
    // needs to happen in updateTableData after data is loaded
    this.connectPaginatorAndSort();
  }

  private connectPaginatorAndSort() {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      
      // Configure sort
      this.dataSource.sortingDataAccessor = (data: Course, sortHeaderId: string) => {
        switch (sortHeaderId) {
          case 'title': return data.title.toLowerCase();
          case 'category': return data.category.toLowerCase();
          case 'level': return data.level.toLowerCase();
          case 'instructor': return data.instructor.toLowerCase();
          case 'duration': return data.duration;
          case 'rating': return data.rating;
          case 'price': return data.price;
          default: return '';
        }
      };
    }
  }

  loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userRole = user.role || '';
  }

  loadCourses() {
    this.courseService.getCourses().subscribe(courses => {
      this.courses = courses.filter(c => c.status === 'approved');
      this.filteredCourses = [...this.courses];
      this.updateTableData();
      this.updateGridPagination(); // Add this for grid pagination
    });
  }

  loadUserEnrollments() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id && user.role === 'student') {
      this.courseService.getStudentEnrollments(user.id).subscribe(enrollments => {
        this.enrolledCourseIds = enrollments.map(e => e.courseId);
      });
    }
  }

  setViewMode(mode: 'grid' | 'table') {
    this.viewMode = mode;
    if (mode === 'table') {
      // Small delay to ensure the table is rendered before connecting paginator
      setTimeout(() => {
        this.updateTableData();
        this.connectPaginatorAndSort();
      }, 0);
    } else {
      // Reset grid pagination when switching to grid view
      this.gridPageIndex = 0;
      this.updateGridPagination();
    }
  }

  updateTableData() {
    // Update the data source with filtered courses
    this.dataSource.data = this.filteredCourses;
    
    // Ensure paginator and sort are connected after data update
    if (!this.dataSource.paginator && this.paginator) {
      this.connectPaginatorAndSort();
    }
    
    // Reset to first page when data changes
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // New method for grid pagination
  updateGridPagination() {
    let sortedCourses = [...this.filteredCourses];
    
    // Apply sorting if selected
    if (this.gridSortBy) {
      sortedCourses.sort((a, b) => {
        let valueA: any, valueB: any;
        
        switch (this.gridSortBy) {
          case 'title':
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
            break;
          case 'rating':
            valueA = a.rating;
            valueB = b.rating;
            break;
          case 'price':
            valueA = a.price;
            valueB = b.price;
            break;
          case 'duration':
            valueA = a.duration;
            valueB = b.duration;
            break;
          case 'enrollmentCount':
            valueA = a.enrollmentCount;
            valueB = b.enrollmentCount;
            break;
          default:
            return 0;
        }
        
        if (this.gridSortDirection === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
      });
    }
    
    // Apply pagination
    const startIndex = this.gridPageIndex * this.gridPageSize;
    const endIndex = startIndex + this.gridPageSize;
    this.paginatedCourses = sortedCourses.slice(startIndex, endIndex);
  }

  // New method for grid page change
  onGridPageChange(event: PageEvent) {
    this.gridPageIndex = event.pageIndex;
    this.gridPageSize = event.pageSize;
    this.updateGridPagination();
  }

  // New method for grid sorting
  onGridSortChange() {
    this.gridPageIndex = 0; // Reset to first page when sorting changes
    this.updateGridPagination();
  }

  filterCourses() {
    // Apply filters manually for grid view and then update table
    this.filteredCourses = this.courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || course.category === this.selectedCategory;
      const matchesLevel = !this.selectedLevel || course.level === this.selectedLevel;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
    
    // Reset pagination when filtering
    this.gridPageIndex = 0;
    
    // Update both table and grid
    this.updateTableData();
    this.updateGridPagination();
  }

  onSearchChange() {
    this.filterCourses();
  }

  onCategoryChange() {
    this.filterCourses();
  }

  onLevelChange() {
    this.filterCourses();
  }

  isEnrolled(courseId: string): boolean {
    return this.enrolledCourseIds.includes(courseId);
  }

  enrollInCourse(courseId: string) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'student') {
      this.courseService.enrollInCourse(courseId, user.id).subscribe(() => {
        alert('Successfully enrolled in course!');
        this.loadUserEnrollments(); // Refresh enrollments
      });
    } else {
      alert('Only students can enroll in courses. Please login as a student.');
    }
  }
}