import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
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
import { LoadingService } from '../../../services/loading.service';
import { Course } from '../../../core/models/course.model';
import { HasRoleDirective } from '../../../shared/has-role.directive';

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
    MatChipsModule,
    HasRoleDirective
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
  encapsulation: ViewEncapsulation.None,
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
  loading = false;
  
  // View mode and Material table properties
  viewMode: 'grid' | 'table' = 'grid';
  dataSource = new MatTableDataSource<Course>();
  displayedColumns: string[] = ['title', 'category', 'level', 'duration', 'rating', 'instructor', 'publishedDate', 'actions'];
  
  // Grid view pagination and sorting properties
  gridPageSize = 5;
  gridPageIndex = 0;
  gridSortBy = '';
  gridSortDirection: 'asc' | 'desc' = 'asc';
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('gridPaginator') gridPaginator!: MatPaginator;
  
  availableCategories: string[] = [];
  availableLevels: string[] = [];

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {
    // Subscribe to loading service
    this.loadingService.loading$.subscribe(loading => {
      this.loading = loading;
    });
  }

  ngOnInit() {
  this.loadUserInfo();
  
  // Subscribe to courses state
  this.courseService.courses$.subscribe(courses => {
    this.courses = courses.filter(c => c.status === 'approved');
    this.filteredCourses = [...this.courses];
    
    // Initialize available categories
    this.updateAvailableFilters();
    
    this.updateTableData();
    this.updateGridPagination();
  });
  
  // Trigger data loading
  this.courseService.getCourses().subscribe();
  this.loadUserEnrollments();
}

  ngAfterViewInit() {
    // This will be called after the template has been initialized
    // We'll connect the paginator and sort here, but the actual connection
    // needs to happen in updateTableData after data is loaded
    this.connectPaginatorAndSort();
  }

  getTotalDuration(course: Course): number {
  if (!course || !course.lessons) return 0;
  return course.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
}

  private updateAvailableFilters() {
  // Get unique categories and levels from currently filtered courses (excluding current category/level filters)
  const coursesToCheck = this.courses.filter(course => {
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    
    // Apply search filter
    if (searchTermLower) {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchTermLower) ||
        course.description.toLowerCase().includes(searchTermLower) ||
        course.instructor.toLowerCase().includes(searchTermLower) ||
        course.category.toLowerCase().includes(searchTermLower) ||
        course.level.toLowerCase().includes(searchTermLower) ||
        course.duration.toString().includes(searchTermLower) ||
        `${course.duration}h`.includes(searchTermLower) ||
        `${course.duration} hours`.includes(searchTermLower) ||
        `${course.duration} hour`.includes(searchTermLower) ||
        course.rating.toString().includes(searchTermLower) ||
        `${course.rating}/5`.includes(searchTermLower) ||
        `${course.rating} stars`.includes(searchTermLower) ||
        `${course.rating} star`.includes(searchTermLower) ||
        course.enrollmentCount.toString().includes(searchTermLower) ||
        `${course.enrollmentCount} enrolled`.includes(searchTermLower) ||
        `${course.enrollmentCount} students`.includes(searchTermLower) ||
        (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchTermLower))) ||
        (course.requirements && course.requirements.some(req => req.toLowerCase().includes(searchTermLower))) ||
        (course.learningOutcomes && course.learningOutcomes.some(outcome => outcome.toLowerCase().includes(searchTermLower))) ||
        this.matchesCommonSearchTerms(course, searchTermLower);
      
      if (!matchesSearch) return false;
    }
    
    // For categories: Apply only level filter (not category filter)
    // For levels: Apply only category filter (not level filter)
    return true; // We'll handle this separately for each filter
  });

  // Extract unique categories (excluding level filter)
  const coursesForCategories = coursesToCheck.filter(course => {
    const matchesLevel = !this.selectedLevel || course.level === this.selectedLevel;
    return matchesLevel;
  });
  this.availableCategories = [...new Set(coursesForCategories.map(course => course.category))].sort();

  // Extract unique levels (excluding category filter)
  const coursesForLevels = coursesToCheck.filter(course => {
    const matchesCategory = !this.selectedCategory || course.category === this.selectedCategory;
    return matchesCategory;
  });
  this.availableLevels = [...new Set(coursesForLevels.map(course => course.level))].sort();
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
          case 'publishedDate': return new Date(data.createdAt).getTime();
          case 'duration': return data.duration;
          case 'rating': return data.rating;
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
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses.filter(c => c.status === 'approved');
        this.filteredCourses = [...this.courses];
        
        // Update both table and grid views
        this.updateTableData();
        this.updateGridPagination();
      },
      error: (error) => {
        console.error('Error loading courses:', error);
      }
    });
  }

  loadUserEnrollments() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.id && user.role === 'student') {
      // Subscribe to user enrollments
      this.courseService.userEnrollments$.subscribe(enrollments => {
        this.enrolledCourseIds = enrollments.map(e => e.courseId);
      });
      
      // Trigger loading
      this.courseService.getStudentEnrollments(user.id).subscribe();
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
    // Updating the data source with filtered courses
    this.dataSource.data = this.filteredCourses;
    
    // Connecting paginator and sort after data update
    if (!this.dataSource.paginator && this.paginator) {
      this.connectPaginatorAndSort();
    }
    
    // Resetting to first page when data changes
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  // Method for grid pagination
  updateGridPagination() {
    let sortedCourses = [...this.filteredCourses];
    
    // Applying sorting if selected
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
          case 'duration':
            valueA = a.duration;
            valueB = b.duration;
            break;
          case 'enrollmentCount':
            valueA = a.enrollmentCount;
            valueB = b.enrollmentCount;
            break;
          case 'publishedDate':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
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
    
    // Applying pagination
    const startIndex = this.gridPageIndex * this.gridPageSize;
    const endIndex = startIndex + this.gridPageSize;
    this.paginatedCourses = sortedCourses.slice(startIndex, endIndex);
  }

  // Method for grid page change
  onGridPageChange(event: PageEvent) {
    this.gridPageIndex = event.pageIndex;
    this.gridPageSize = event.pageSize;
    this.updateGridPagination();
  }

  // Method for grid sorting
  onGridSortChange() {
    this.gridPageIndex = 0; // Reset to first page when sorting changes
    this.updateGridPagination();
  }

  filterCourses() {
  // First update available categories based on current search and level filter
  this.updateAvailableFilters();

  // Then apply all filters including category
  this.filteredCourses = this.courses.filter(course => {
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    
    // If no search term, only apply category and level filters
    if (!searchTermLower) {
      const matchesCategory = !this.selectedCategory || course.category === this.selectedCategory;
      const matchesLevel = !this.selectedLevel || course.level === this.selectedLevel;
      return matchesCategory && matchesLevel;
    }
    
    // Comprehensive search across all course fields
    const matchesSearch = 
      // Title and description (original)
      course.title.toLowerCase().includes(searchTermLower) ||
      course.description.toLowerCase().includes(searchTermLower) ||
      
      // Instructor name
      course.instructor.toLowerCase().includes(searchTermLower) ||
      
      // Category
      course.category.toLowerCase().includes(searchTermLower) ||
      
      // Level
      course.level.toLowerCase().includes(searchTermLower) ||
      
      // Duration (search for "40h", "40 hours", "40", etc.)
      course.duration.toString().includes(searchTermLower) ||
      `${course.duration}h`.includes(searchTermLower) ||
      `${course.duration} hours`.includes(searchTermLower) ||
      `${course.duration} hour`.includes(searchTermLower) ||
      
      // Rating (search for "4.5", "4.5/5", "4.5 stars", etc.)
      course.rating.toString().includes(searchTermLower) ||
      `${course.rating}/5`.includes(searchTermLower) ||
      `${course.rating} stars`.includes(searchTermLower) ||
      `${course.rating} star`.includes(searchTermLower) ||
      
      // Enrollment count
      course.enrollmentCount.toString().includes(searchTermLower) ||
      `${course.enrollmentCount} enrolled`.includes(searchTermLower) ||
      `${course.enrollmentCount} students`.includes(searchTermLower) ||

      // Published date search
      course.createdAt.toLocaleDateString().includes(searchTermLower) ||
      course.createdAt.getFullYear().toString().includes(searchTermLower) ||
      
      // Tags (if available)
      (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchTermLower))) ||
      
      // Requirements (if available)
      (course.requirements && course.requirements.some(req => req.toLowerCase().includes(searchTermLower))) ||
      
      // Learning outcomes (if available)
      (course.learningOutcomes && course.learningOutcomes.some(outcome => outcome.toLowerCase().includes(searchTermLower))) ||
      
      // Search by common terms
      this.matchesCommonSearchTerms(course, searchTermLower);
    
    // Apply category and level filters
    const matchesCategory = !this.selectedCategory || course.category === this.selectedCategory;
    const matchesLevel = !this.selectedLevel || course.level === this.selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });
  
  // Reset selected category if it's no longer available
  if (this.selectedCategory && !this.availableCategories.includes(this.selectedCategory)) {
    this.selectedCategory = '';
  }
  
  // Resetting pagination when filtering
  this.gridPageIndex = 0;

  // Updating both table and grid
  this.updateTableData();
  this.updateGridPagination();
}

// Helper method for common search terms
private matchesCommonSearchTerms(course: Course, searchTerm: string): boolean {
  // Common search patterns
  const commonTerms = [
    // Duration patterns
    { patterns: ['short', 'quick', 'brief'], condition: () => course.duration <= 30 },
    { patterns: ['medium', 'moderate'], condition: () => course.duration > 30 && course.duration <= 60 },
    { patterns: ['long', 'extensive', 'comprehensive'], condition: () => course.duration > 60 },
    
    // Rating patterns
    { patterns: ['excellent', 'best', 'top rated'], condition: () => course.rating >= 4.5 },
    { patterns: ['good', 'quality'], condition: () => course.rating >= 4.0 },
    { patterns: ['average'], condition: () => course.rating >= 3.0 && course.rating < 4.0 },
    
    // Popularity patterns
    { patterns: ['popular', 'trending'], condition: () => course.enrollmentCount > 100 },
    { patterns: ['new', 'latest'], condition: () => course.enrollmentCount < 50 },
    
    // Level patterns
    { patterns: ['easy', 'simple', 'basic'], condition: () => course.level === 'Beginner' },
    { patterns: ['hard', 'difficult', 'complex'], condition: () => course.level === 'Advanced' },
    
    // Category patterns
    { patterns: ['coding', 'programming', 'development'], condition: () => course.category === 'Programming' },
    { patterns: ['creative', 'visual'], condition: () => course.category === 'Design' },
    { patterns: ['data', 'analytics', 'statistics'], condition: () => course.category === 'Data Science' },
    { patterns: ['sales', 'promotion'], condition: () => course.category === 'Marketing' },
    { patterns: ['management', 'entrepreneur'], condition: () => course.category === 'Business' }
  ];
  
  return commonTerms.some(term => 
    term.patterns.some(pattern => searchTerm.includes(pattern)) && term.condition()
  );
}

  onSearchChange() {
  // Reset both filters when search changes to avoid conflicts
  this.selectedCategory = '';
  this.selectedLevel = '';
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

      this.courseService.enrollInCourse(courseId, user.id).subscribe({
        next: (enrollment) => {
          alert('Successfully enrolled in course!');
          
          // Update the local enrolledCourseIds array immediately
          this.enrolledCourseIds.push(courseId);
          
          // Reload courses to get updated enrollment counts
          this.loadCourses();
          
          // Reload enrollments to get fresh data from API
          this.loadUserEnrollments();
        },
        error: (error) => {
          console.error('Enrollment error:', error);
          if (error.message === 'Already enrolled in this course') {
            alert('You are already enrolled in this course!');
          } else {
            alert('Failed to enroll in course. Please try again.');
          }
        }
      });
  }
}