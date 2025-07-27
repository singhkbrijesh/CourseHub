import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { InstructorDashboardComponent } from './instructor-dashboard.component';
import { InstructorService } from '../../../services/instructor.service';

fdescribe('InstructorDashboardComponent', () => {
  let component: InstructorDashboardComponent;
  let fixture: ComponentFixture<InstructorDashboardComponent>;
  let instructorServiceSpy: jasmine.SpyObj<InstructorService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    instructorServiceSpy = jasmine.createSpyObj('InstructorService', [
      'getInstructorStats',
      'getInstructorCourses'
    ]);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [InstructorDashboardComponent],
      providers: [
        { provide: InstructorService, useValue: instructorServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InstructorDashboardComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should redirect to login if user is missing', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      component.ngOnInit();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should load dashboard data if user exists', () => {
      const user = { id: 'instructor1' };
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(user));
      spyOn(component, 'loadDashboardData');

      component.ngOnInit();

      expect(component.loadDashboardData).toHaveBeenCalled();
    });
  });

  describe('loadDashboardData', () => {
    beforeEach(() => {
      component.currentUser = { id: 'instructor1' };
    });

    it('should set instructorStats and recentCourses on success', () => {
      const stats = { activeCourses: 5, pendingApprovals: 2 } as any;
      const courses = [
        { id: 'c1', createdAt: '2023-10-01' },
        { id: 'c2', createdAt: '2023-10-05' }
      ] as any;

      instructorServiceSpy.getInstructorStats.and.returnValue(of(stats));
      instructorServiceSpy.getInstructorCourses.and.returnValue(of(courses));

      component.loadDashboardData();

      expect(component.instructorStats).toEqual(stats);
      expect(component.recentCourses.length).toBe(2);
      expect(component.loading).toBeFalse();
    });

    it('should handle error from getInstructorStats', () => {
      instructorServiceSpy.getInstructorStats.and.returnValue(throwError(() => new Error('Error')));
      instructorServiceSpy.getInstructorCourses.and.returnValue(of([]));

      component.loadDashboardData();

      expect(component.loading).toBeFalse();
    });
  });

  describe('helper methods', () => {
    it('getStatusColor should return correct values', () => {
      expect(component.getStatusColor('approved')).toBe('success');
      expect(component.getStatusColor('pending')).toBe('warning');
      expect(component.getStatusColor('rejected')).toBe('error');
      expect(component.getStatusColor('other')).toBe('default');
    });

    it('getNotificationIcon should return correct icons', () => {
      expect(component.getNotificationIcon('enrollment')).toBe('person_add');
      expect(component.getNotificationIcon('completion')).toBe('check_circle');
      expect(component.getNotificationIcon('approval')).toBe('verified');
      expect(component.getNotificationIcon('review')).toBe('star');
      expect(component.getNotificationIcon('other')).toBe('notifications');
    });

    it('formatTimeAgo should format recent dates', () => {
      const now = new Date();
      expect(component.formatTimeAgo(now)).toBe('Just now');
    });

    it('getCoursesDisplay should return stats if available', () => {
      component.instructorStats = { activeCourses: 3, pendingApprovals: 1 } as any;
      expect(component.getCoursesDisplay()).toBe('3 active, 1 pending');

      component.instructorStats = null;
      expect(component.getCoursesDisplay()).toBe('Loading...');
    });

    it('formatNumber should format large numbers', () => {
      expect(component.formatNumber(1500000)).toBe('1.5M');
      expect(component.formatNumber(2000)).toBe('2.0K');
      expect(component.formatNumber(500)).toBe('500');
    });
  });

  describe('refreshDashboard', () => {
    it('should set loading and reload dashboard', () => {
      spyOn(component, 'loadDashboardData');
      component.refreshDashboard();
      expect(component.loading).toBeTrue();
      expect(component.loadDashboardData).toHaveBeenCalled();
    });
  });

  describe('navigateToCourse', () => {
    it('should navigate to course details', () => {
      component.navigateToCourse('c1');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/courses', 'c1'], jasmine.any(Object));
    });
  });

  it('should not load dashboard data if user is not found', () => {
    component.currentUser.id = 0;
    component.loadDashboardData();
    expect(component.instructorStats).toBeNull();
    expect(component.recentCourses).toEqual([]);
  });
  
  describe('InstructorDashboardComponent - formatTimeAgo', () => {
  let component: InstructorDashboardComponent;

  beforeEach(() => {
    component = new InstructorDashboardComponent({} as any, {} as any);
  });

  it('should return "xh ago" when diffInHours < 24 and >= 1', () => {
    // Arrange: create a date 5 hours ago
    const fiveHoursAgo = new Date();
    fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 5);

    // Act
    const result = component.formatTimeAgo(fiveHoursAgo);

    // Assert
    expect(result).toBe('5h ago');
  });

  it('should return "xd ago" when diffInDays < 7 and diffInHours >= 24', () => {
    // Arrange: create a date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Act
    const result = component.formatTimeAgo(threeDaysAgo);

    // Assert
    expect(result).toBe('3d ago');
  });

  it('should return a formatted date string when diffInDays >= 7', () => {
    // Arrange: create a date 10 days ago
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    // Act
    const result = component.formatTimeAgo(tenDaysAgo);

    // Assert: since result is locale dependent, just check it's a date string
    expect(result).toContain((tenDaysAgo.getMonth() + 1).toString()); // loose check
  });
});
});
