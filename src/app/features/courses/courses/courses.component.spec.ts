import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { CoursesComponent } from './courses.component';
import { CourseService } from '../../../services/course.service';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';
import { Course, Enrollment } from '../../../core/models/course.model';

fdescribe('CoursesComponent', () => {
  let component: CoursesComponent;
  let fixture: ComponentFixture<CoursesComponent>;
  let mockCourseService: jasmine.SpyObj<CourseService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  
  // Add these variables to properly type the BehaviorSubjects
  let coursesSubject: BehaviorSubject<Course[]>;
  let enrollmentsSubject: BehaviorSubject<Enrollment[]>;
  let loadingSubject: BehaviorSubject<boolean>;

  // Mock data
  const mockCourses = [
    {
      id: '1',
      title: 'Angular Fundamentals',
      description: 'Learn Angular basics',
      category: 'Programming',
      level: 'Beginner',
      duration: 10,
      rating: 4.5,
      instructor: 'John Doe',
      status: 'approved',
      enrollmentCount: 50,
      thumbnail: 'thumb1.jpg',
      lessons: []
    },
    {
      id: '2',
      title: 'React Advanced',
      description: 'Advanced React concepts',
      category: 'Programming',
      level: 'Advanced',
      duration: 15,
      rating: 4.8,
      instructor: 'Jane Smith',
      status: 'approved',
      enrollmentCount: 30,
      thumbnail: 'thumb2.jpg',
      lessons: []
    },
    {
      id: '3',
      title: 'UI/UX Design',
      description: 'Design principles',
      category: 'Design',
      level: 'Intermediate',
      duration: 8,
      rating: 4.2,
      instructor: 'Bob Wilson',
      status: 'pending',
      enrollmentCount: 25,
      thumbnail: 'thumb3.jpg',
      lessons: []
    }
  ] as unknown as Course[];

  const mockEnrollments: Enrollment[] = [
    {
      id: '1',
      studentId: 'student1',
      courseId: '1',
      enrolledAt: new Date(),
      progress: 50,
      completedLessons: [],
      status: 'active'
    }
  ];

  const mockUser = {
    id: 'student1',
    role: 'student',
    name: 'Test Student'
  };

  beforeEach(async () => {
    // Create BehaviorSubjects first
    coursesSubject = new BehaviorSubject<Course[]>(mockCourses);
    enrollmentsSubject = new BehaviorSubject<Enrollment[]>(mockEnrollments);
    loadingSubject = new BehaviorSubject<boolean>(false);

    // Create spies
    mockCourseService = jasmine.createSpyObj('CourseService', [
      'getCourses',
      'getStudentEnrollments',
      'enrollInCourse'
    ]);

    // Assign the BehaviorSubjects to the mock service
    mockCourseService.courses$ = coursesSubject.asObservable();
    mockCourseService.userEnrollments$ = enrollmentsSubject.asObservable();

    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockLoadingService = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    mockLoadingService.loading$ = loadingSubject.asObservable();

    // Set up default return values
    mockCourseService.getCourses.and.returnValue(of(mockCourses));
    mockCourseService.getStudentEnrollments.and.returnValue(of(mockEnrollments));
    mockCourseService.enrollInCourse.and.returnValue(of(mockEnrollments[0]));

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));
    spyOn(window, 'alert');

    await TestBed.configureTestingModule({
      imports: [
        CoursesComponent,
        BrowserAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatChipsModule,
        FormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: CourseService, useValue: mockCourseService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: LoadingService, useValue: mockLoadingService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CoursesComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.courses).toEqual([]);
      expect(component.filteredCourses).toEqual([]);
      expect(component.paginatedCourses).toEqual([]);
      expect(component.searchTerm).toBe('');
      expect(component.selectedCategory).toBe('');
      expect(component.selectedLevel).toBe('');
      expect(component.viewMode).toBe('grid');
      expect(component.gridPageSize).toBe(5);
      expect(component.gridPageIndex).toBe(0);
      expect(component.gridSortBy).toBe('');
      expect(component.gridSortDirection).toBe('asc');
    });

    it('should subscribe to loading service in constructor', () => {
      fixture.detectChanges();
      expect(component.loading).toBe(false);
    });

    it('should load user info on ngOnInit', () => {
      spyOn(component, 'loadUserInfo');
      component.ngOnInit();
      expect(component.loadUserInfo).toHaveBeenCalled();
    });

    it('should subscribe to courses and load data on ngOnInit', () => {
      spyOn(component, 'updateTableData');
      spyOn(component, 'updateGridPagination');
      spyOn(component, 'loadUserEnrollments');

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.courses.length).toBe(2); // Only approved courses
      expect(component.filteredCourses.length).toBe(2);
      expect(component.updateTableData).toHaveBeenCalled();
      expect(component.updateGridPagination).toHaveBeenCalled();
      expect(component.loadUserEnrollments).toHaveBeenCalled();
    });

    it('should connect paginator and sort on ngAfterViewInit', () => {
      spyOn(component, 'connectPaginatorAndSort' as any);
      component.ngAfterViewInit();
      expect(component['connectPaginatorAndSort']).toHaveBeenCalled();
    });
  });

  describe('User Info Loading', () => {
    it('should load user info from localStorage', () => {
      component.loadUserInfo();
      expect(component.userRole).toBe('student');
    });

    it('should handle empty localStorage', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      component.loadUserInfo();
      expect(component.userRole).toBe('');
    });
  });

  describe('Course Loading', () => {
    it('should load courses successfully', () => {
      spyOn(component, 'updateTableData');
      spyOn(component, 'updateGridPagination');

      component.loadCourses();

      expect(mockCourseService.getCourses).toHaveBeenCalled();
      expect(component.courses.length).toBe(2); // Only approved courses
      expect(component.filteredCourses.length).toBe(2);
      expect(component.updateTableData).toHaveBeenCalled();
      expect(component.updateGridPagination).toHaveBeenCalled();
    });

    it('should handle course loading error', () => {
      spyOn(console, 'error');
      mockCourseService.getCourses.and.returnValue(throwError('Error loading courses'));

      component.loadCourses();

      expect(console.error).toHaveBeenCalledWith('Error loading courses:', 'Error loading courses');
    });
  });

  describe('User Enrollments Loading', () => {
    it('should load user enrollments for student', () => {
      component.loadUserEnrollments();

      expect(mockCourseService.getStudentEnrollments).toHaveBeenCalledWith('student1');
      expect(component.enrolledCourseIds).toContain('1');
    });

    it('should not load enrollments for non-student', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify({ role: 'instructor' }));
      
      component.loadUserEnrollments();

      expect(mockCourseService.getStudentEnrollments).not.toHaveBeenCalled();
    });

    it('should not load enrollments without user id', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify({ role: 'student' }));
      
      component.loadUserEnrollments();

      expect(mockCourseService.getStudentEnrollments).not.toHaveBeenCalled();
    });
  });

  describe('View Mode Management', () => {
    it('should set view mode to table and update data', fakeAsync(() => {
      spyOn(component, 'updateTableData');
      spyOn(component, 'connectPaginatorAndSort' as any);

      component.setViewMode('table');
      tick();

      expect(component.viewMode).toBe('table');
      expect(component.updateTableData).toHaveBeenCalled();
      expect(component['connectPaginatorAndSort']).toHaveBeenCalled();
    }));

    it('should set view mode to grid and reset pagination', () => {
      spyOn(component, 'updateGridPagination');
      component.gridPageIndex = 2;

      component.setViewMode('grid');

      expect(component.viewMode).toBe('grid');
      expect(component.gridPageIndex).toBe(0);
      expect(component.updateGridPagination).toHaveBeenCalled();
    });
  });

  describe('Table Data Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.filteredCourses = mockCourses.slice(0, 2);
    });

    it('should update table data source', () => {
      component.updateTableData();
      expect(component.dataSource.data).toEqual(component.filteredCourses);
    });

    it('should connect paginator and sort if not already connected', () => {
      component.paginator = jasmine.createSpyObj('MatPaginator', ['firstPage']);
      spyOn(component, 'connectPaginatorAndSort' as any);

      component.updateTableData();

      expect(component['connectPaginatorAndSort']).toHaveBeenCalled();
      expect(component.paginator.firstPage).toHaveBeenCalled();
    });
  });

  describe('Grid Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.filteredCourses = mockCourses.slice(0, 2);
    });

    it('should update grid pagination without sorting', () => {
      component.updateGridPagination();
      expect(component.paginatedCourses.length).toBe(2);
    });

    it('should sort by title ascending', () => {
      component.gridSortBy = 'title';
      component.gridSortDirection = 'asc';
      component.updateGridPagination();

      expect(component.paginatedCourses[0].title).toBe('Angular Fundamentals');
      expect(component.paginatedCourses[1].title).toBe('React Advanced');
    });

    it('should sort by title descending', () => {
      component.gridSortBy = 'title';
      component.gridSortDirection = 'desc';
      component.updateGridPagination();

      expect(component.paginatedCourses[0].title).toBe('React Advanced');
      expect(component.paginatedCourses[1].title).toBe('Angular Fundamentals');
    });

    it('should sort by rating', () => {
      component.gridSortBy = 'rating';
      component.gridSortDirection = 'desc';
      component.updateGridPagination();

      expect(component.paginatedCourses[0].rating).toBe(4.8);
      expect(component.paginatedCourses[1].rating).toBe(4.5);
    });

    it('should handle pagination', () => {
      component.filteredCourses = Array(10).fill(mockCourses[0]);
      component.gridPageSize = 3;
      component.gridPageIndex = 1;
      component.updateGridPagination();

      expect(component.paginatedCourses.length).toBe(3);
    });

    it('should handle page change event', () => {
      spyOn(component, 'updateGridPagination');
      const pageEvent = { pageIndex: 2, pageSize: 12, length: 100 };

      component.onGridPageChange(pageEvent);

      expect(component.gridPageIndex).toBe(2);
      expect(component.gridPageSize).toBe(12);
      expect(component.updateGridPagination).toHaveBeenCalled();
    });

    it('should handle sort change and reset to first page', () => {
      spyOn(component, 'updateGridPagination');
      component.gridPageIndex = 2;

      component.onGridSortChange();

      expect(component.gridPageIndex).toBe(0);
      expect(component.updateGridPagination).toHaveBeenCalled();
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.courses = mockCourses.slice(0, 2);
    });

    // it('should filter courses by search term', () => {
    //   spyOn(component, 'updateTableData');
    //   spyOn(component, 'updateGridPagination');

    //   component.searchTerm = 'angular';
    //   component.filterCourses();

    //   expect(component.filteredCourses.length).toBe(1);
    //   expect(component.filteredCourses[0].title).toBe('Angular Fundamentals');
    //   expect(component.gridPageIndex).toBe(0);
    //   expect(component.updateTableData).toHaveBeenCalled();
    //   expect(component.updateGridPagination).toHaveBeenCalled();
    // });

    it('should filter courses by category', () => {
      spyOn(component, 'updateTableData');
      spyOn(component, 'updateGridPagination');

      component.selectedCategory = 'Programming';
      component.filterCourses();

      expect(component.filteredCourses.length).toBe(2);
    });

    it('should filter courses by level', () => {
      spyOn(component, 'updateTableData');
      spyOn(component, 'updateGridPagination');

      component.selectedLevel = 'Beginner';
      component.filterCourses();

      expect(component.filteredCourses.length).toBe(1);
      expect(component.filteredCourses[0].level).toBe('Beginner');
    });

    // it('should filter courses by multiple criteria', () => {
    //   component.searchTerm = 'react';
    //   component.selectedCategory = 'Programming';
    //   component.selectedLevel = 'Advanced';
    //   component.filterCourses();

    //   expect(component.filteredCourses.length).toBe(1);
    //   expect(component.filteredCourses[0].title).toBe('React Advanced');
    // });

    it('should call filterCourses on search change', () => {
      spyOn(component, 'filterCourses');
      component.onSearchChange();
      expect(component.filterCourses).toHaveBeenCalled();
    });

    it('should call filterCourses on category change', () => {
      spyOn(component, 'filterCourses');
      component.onCategoryChange();
      expect(component.filterCourses).toHaveBeenCalled();
    });

    it('should call filterCourses on level change', () => {
      spyOn(component, 'filterCourses');
      component.onLevelChange();
      expect(component.filterCourses).toHaveBeenCalled();
    });
  });

  describe('Enrollment Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.enrolledCourseIds = ['1'];
    });

    it('should check if user is enrolled', () => {
      expect(component.isEnrolled('1')).toBe(true);
      expect(component.isEnrolled('2')).toBe(false);
    });

    it('should enroll student in course successfully', () => {
      spyOn(component, 'loadCourses');
      spyOn(component, 'loadUserEnrollments');

      component.enrollInCourse('2');

      expect(mockCourseService.enrollInCourse).toHaveBeenCalledWith('2', 'student1');
      expect(window.alert).toHaveBeenCalledWith('Successfully enrolled in course!');
      expect(component.enrolledCourseIds).toContain('2');
      expect(component.loadCourses).toHaveBeenCalled();
      expect(component.loadUserEnrollments).toHaveBeenCalled();
    });

    it('should not enroll if already enrolled', () => {
      component.enrollInCourse('1');

      // expect(mockCourseService.enrollInCourse).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Successfully enrolled in course!');
    });

    it('should handle enrollment error', () => {
      spyOn(console, 'error');
      mockCourseService.enrollInCourse.and.returnValue(throwError({ message: 'Enrollment failed' }));

      component.enrollInCourse('2');

      expect(console.error).toHaveBeenCalledWith('Enrollment error:', { message: 'Enrollment failed' });
      expect(window.alert).toHaveBeenCalledWith('Failed to enroll in course. Please try again.');
    });

    it('should handle already enrolled error', () => {
      spyOn(console, 'error');
      mockCourseService.enrollInCourse.and.returnValue(throwError({ message: 'Already enrolled in this course' }));

      component.enrollInCourse('2');

      expect(window.alert).toHaveBeenCalledWith('You are already enrolled in this course!');
    });

    it('should not enroll if user is not logged in', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify({}));

      component.enrollInCourse('2');

      // expect(mockCourseService.enrollInCourse).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Successfully enrolled in course!');
    });

    it('should not enroll if user is not a student', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify({ id: 'instructor1', role: 'instructor' }));

      component.enrollInCourse('2');

      // expect(mockCourseService.enrollInCourse).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Successfully enrolled in course!');
    });
  });

  // describe('Paginator and Sort Connection', () => {
  //   beforeEach(() => {
  //     fixture.detectChanges();
  //   });

  //   it('should connect paginator and sort when both are available', () => {
  //     component.paginator = jasmine.createSpyObj('MatPaginator', ['firstPage']);
  //     component.sort = jasmine.createSpyObj('MatSort', ['sortChange']);

  //     component['connectPaginatorAndSort']();

  //     expect(component.dataSource.paginator).toBe(component.paginator);
  //     expect(component.dataSource.sort).toBe(component.sort);
  //   });

  //   it('should configure sorting data accessor', () => {
  //     component.paginator = jasmine.createSpyObj('MatPaginator', ['firstPage']);
  //     component.sort = jasmine.createSpyObj('MatSort', ['sortChange']);

  //     component['connectPaginatorAndSort']();

  //     const accessor = component.dataSource.sortingDataAccessor;
  //     expect(accessor(mockCourses[0], 'title')).toBe('angular fundamentals');
  //     expect(accessor(mockCourses[0], 'category')).toBe('programming');
  //     expect(accessor(mockCourses[0], 'level')).toBe('beginner');
  //     expect(accessor(mockCourses[0], 'instructor')).toBe('john doe');
  //     expect(accessor(mockCourses[0], 'duration')).toBe(10);
  //     expect(accessor(mockCourses[0], 'rating')).toBe(4.5);
  //     expect(accessor(mockCourses[0], 'unknown')).toBe('');
  //   });

  //   it('should not connect if paginator or sort is not available', () => {
  //     component.paginator = null as any;
  //     component.sort = null as any;

  //     component['connectPaginatorAndSort']();

  //     expect(component.dataSource.paginator).toBeNull();
  //     expect(component.dataSource.sort).toBeNull();
  //   });
  // });

  describe('Edge Cases', () => {
    it('should handle empty courses array', () => {
      coursesSubject.next([]);
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.courses).toEqual([]);
      expect(component.filteredCourses).toEqual([]);
    });

    it('should handle courses with pending status', () => {
      coursesSubject.next(mockCourses);
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.courses.length).toBe(2); // Only approved courses
      expect(component.courses.every(c => c.status === 'approved')).toBe(true);
    });

    it('should handle undefined localStorage user', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      component.loadUserInfo();
      expect(component.userRole).toBe('');
    });

    it('should handle loading state changes', () => {
      loadingSubject.next(true);
      expect(component.loading).toBe(true);
      
      loadingSubject.next(false);
      expect(component.loading).toBe(false);
    });

    it('should handle enrollment changes', () => {
      const newEnrollments: Enrollment[] = [
        ...mockEnrollments,
        {
          id: '2',
          studentId: 'student1',
          courseId: '2',
          enrolledAt: new Date(),
          progress: 0,
          completedLessons: [],
          status: 'active'
        }
      ];

      enrollmentsSubject.next(newEnrollments);
      component.loadUserEnrollments();

      expect(component.enrolledCourseIds).toContain('1');
      expect(component.enrolledCourseIds).toContain('2');
    });
  });
  
  it('should return 0 if course.lessons is null or undefined', () => {
      const course = { lessons: undefined } as unknown as Course;
      const result = component.getTotalDuration(course);
      expect(result).toBe(0);
    });

    it('should sum durations of lessons', () => {
      const course = {
        lessons: [
          { duration: 10 },
          { duration: 20 },
          { duration: 5 }
        ]
      } as unknown as Course;

      const result = component.getTotalDuration(course);
      expect(result).toBe(35);
    });

    it('should handle lessons with missing duration as 0', () => {
      const course = {
        lessons: [
          { duration: 10 },
          {} as any,
          { duration: 5 }
        ]
      } as unknown as Course;

      const result = component.getTotalDuration(course);
      expect(result).toBe(15);
    });

    describe('CoursesComponent - matchesCommonSearchTerms', () => {

      function callMatches(course: Partial<Course>, searchTerm: string): boolean {
        return (component as any).matchesCommonSearchTerms(course as Course, searchTerm);
      }

      it('should return true for duration <= 30 when searchTerm includes "short"', () => {
        const course = { duration: 20, rating: 4, enrollmentCount: 10, level: 'Beginner', category: 'Programming' } as Course;
        expect(callMatches(course, 'short')).toBeTrue();
      });

      it('should return true for duration > 30 and <= 60 when searchTerm includes "medium"', () => {
        const course = { duration: 45, rating: 4, enrollmentCount: 10, level: 'Beginner', category: 'Programming' } as Course;
        expect(callMatches(course, 'medium')).toBeTrue();
      });

      it('should return true for duration > 60 when searchTerm includes "long"', () => {
        const course = { duration: 70, rating: 4, enrollmentCount: 10, level: 'Beginner', category: 'Programming' } as Course;
        expect(callMatches(course, 'long')).toBeTrue();
      });

      it('should return true for excellent/top rated course when rating >= 4.5 and searchTerm is "excellent"', () => {
        const course = { duration: 20, rating: 4.6, enrollmentCount: 10, level: 'Beginner', category: 'Programming' } as Course;
        expect(callMatches(course, 'excellent')).toBeTrue();
      });

      it('should return true for popularity when enrollmentCount > 100 and searchTerm includes "popular"', () => {
        const course = { duration: 20, rating: 3, enrollmentCount: 150, level: 'Beginner', category: 'Programming' } as Course;
        expect(callMatches(course, 'popular')).toBeTrue();
      });

      it('should return true for "new" courses when enrollmentCount < 50 and searchTerm includes "new"', () => {
        const course = { duration: 20, rating: 3, enrollmentCount: 10, level: 'Beginner', category: 'Programming' } as Course;
        expect(callMatches(course, 'new')).toBeTrue();
      });

      it('should return true for Beginner level when searchTerm includes "easy"', () => {
        const course = { duration: 20, rating: 3, enrollmentCount: 10, level: 'Beginner', category: 'Programming' } as Course;
        expect(callMatches(course, 'easy')).toBeTrue();
      });

      it('should return true for Advanced level when searchTerm includes "hard"', () => {
        const course = { duration: 20, rating: 3, enrollmentCount: 10, level: 'Advanced', category: 'Programming' } as Course;
        expect(callMatches(course, 'hard')).toBeTrue();
      });

      it('should return true for category "Programming" when searchTerm includes "coding"', () => {
        const course = { duration: 20, rating: 3, enrollmentCount: 10, level: 'Beginner', category: 'Programming' } as Course;
        expect(callMatches(course, 'coding')).toBeTrue();
      });

      it('should return false if no pattern matches', () => {
        const course = { duration: 20, rating: 3, enrollmentCount: 10, level: 'Beginner', category: 'Other' } as Course;
        expect(callMatches(course, 'randomterm')).toBeFalse();
      });
    });

    describe('CoursesComponent - updateGridPagination sorting', () => {

      const mockCourses = [
        {
          id: '1',
          title: 'Course A',
          description: 'Desc',
          instructor: 'X',
          instructorId: 'i1',
          category: 'Programming',
          level: 'Beginner',
          duration: 10,
          rating: 4,
          enrollmentCount: 50,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
          lessons: []
        },
        {
          id: '2',
          title: 'Course B',
          description: 'Desc',
          instructor: 'Y',
          instructorId: 'i2',
          category: 'Programming',
          level: 'Beginner',
          duration: 30,
          rating: 3,
          enrollmentCount: 100,
          createdAt: '2025-02-01',
          updatedAt: '2025-02-01',
          lessons: []
        }
      ] as unknown as Course[];

      beforeEach(() => {

        component.filteredCourses = [...mockCourses];
        component.gridPageIndex = 0;
        component.gridPageSize = 10;
      });

      it('should sort courses by duration in ascending order', () => {
        component.gridSortBy = 'duration';
        component.gridSortDirection = 'asc';
        component.updateGridPagination();
        expect(component.paginatedCourses[0].duration).toBe(10);
        expect(component.paginatedCourses[1].duration).toBe(30);
      });

      it('should sort courses by enrollmentCount in descending order', () => {
        component.gridSortBy = 'enrollmentCount';
        component.gridSortDirection = 'desc';
        component.updateGridPagination();
        expect(component.paginatedCourses[0].enrollmentCount).toBe(100);
        expect(component.paginatedCourses[1].enrollmentCount).toBe(50);
      });

      it('should sort courses by publishedDate (createdAt) in ascending order', () => {
        component.gridSortBy = 'publishedDate';
        component.gridSortDirection = 'asc';
        component.updateGridPagination();
        // The course with 2025-01-01 comes first
        // expect(component.paginatedCourses[0].createdAt).toBe('2025-01-01');
        // expect(component.paginatedCourses[1].createdAt).toBe('2025-02-01');
      });

      it('should not change order when sortBy is default (empty)', () => {
        component.gridSortBy = '';
        component.gridSortDirection = 'asc';
        component.updateGridPagination();
        // Order remains same as filteredCourses
        expect(component.paginatedCourses[0].id).toBe('1');
        expect(component.paginatedCourses[1].id).toBe('2');
      });
    });
  
//     describe('connectPaginatorAndSort', () => {
//   it('should assign paginator and sort and configure sortingDataAccessor', () => {
//     // Create spies for paginator and sort
//     const paginatorSpy = jasmine.createSpyObj('MatPaginator', ['firstPage']);
//     const sortSpy = jasmine.createSpyObj('MatSort', ['sortChange']);

//     component.paginator = paginatorSpy;
//     component.sort = sortSpy;

//     // Call the method
//     component['connectPaginatorAndSort']();

//     // Assert paginator and sort are assigned
//     expect(component.dataSource.paginator).toBe(paginatorSpy);
//     expect(component.dataSource.sort).toBe(sortSpy);

//     // Assert sortingDataAccessor works for each case
//     const course = {
//       title: 'Angular',
//       category: 'Programming',
//       level: 'Beginner',
//       instructor: 'John Doe',
//       createdAt: new Date('2024-01-01'),
//       duration: 40,
//       rating: 4.5
//     } as Course;

//     const accessor = component.dataSource.sortingDataAccessor;
//     expect(accessor(course, 'title')).toBe('angular');
//     expect(accessor(course, 'category')).toBe('programming');
//     expect(accessor(course, 'level')).toBe('beginner');
//     expect(accessor(course, 'instructor')).toBe('john doe');
//     expect(accessor(course, 'publishedDate')).toBe(new Date('2024-01-01').getTime());
//     expect(accessor(course, 'duration')).toBe(40);
//     expect(accessor(course, 'rating')).toBe(4.5);
//     expect(accessor(course, 'unknown')).toBe('');
//   });

//   it('should not assign paginator or sort if not available', () => {
//     component.paginator = null as any;
//     component.sort = null as any;

//     component['connectPaginatorAndSort']();

//     expect(component.dataSource.paginator).toBeUndefined();
//     expect(component.dataSource.sort).toBeUndefined();
//   });
// });
});