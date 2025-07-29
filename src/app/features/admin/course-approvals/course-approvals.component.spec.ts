import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { CourseApprovalsComponent } from './course-approvals.component';
import { CourseService } from '../../../services/course.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';
import { Course } from '../../../core/models/course.model';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

fdescribe('CourseApprovalsComponent', () => {
  let component: CourseApprovalsComponent;
  let fixture: ComponentFixture<CourseApprovalsComponent>;
  let courseServiceSpy: jasmine.SpyObj<CourseService>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;

  const mockCourses: Course[] = [
    { id: '1', title: 'C1', status: 'pending' } as Course,
    { id: '2', title: 'C2', status: 'approved' } as Course
  ];

  beforeEach(async () => {
    courseServiceSpy = jasmine.createSpyObj('CourseService', ['getCourses', 'updateCourse']);
    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [CourseApprovalsComponent],
      providers: [ HttpClient, HttpHandler,
        { provide: CourseService, useValue: courseServiceSpy },
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: MatPaginator, useValue: {} },
        { provide: MatSort, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CourseApprovalsComponent);
    component = fixture.componentInstance;
  });

  it('should load pending courses on init', () => {
    courseServiceSpy.getCourses.and.returnValue(of(mockCourses));

    component.ngOnInit();

    expect(courseServiceSpy.getCourses).toHaveBeenCalled();
  });

  it('should call updateCourse and reload when approving a course', () => {
    const pendingCourse = { id: '1', title: 'C1', status: 'pending' } as Course;
    courseServiceSpy.updateCourse.and.returnValue(of({} as Course));
    courseServiceSpy.getCourses.and.returnValue(of([])); // For reload

    component.approveCourse(pendingCourse);

    expect(courseServiceSpy.updateCourse).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 'approved' })
    );
    expect(courseServiceSpy.getCourses).toHaveBeenCalled();
  });

  it('should open dialog and handle rejection confirmation', () => {
    const pendingCourse = { id: '1', title: 'C1', status: 'pending' } as Course;
    const afterClosedSubject = new Subject<string>();
    matDialogSpy.open.and.returnValue({ afterClosed: () => afterClosedSubject.asObservable() } as any);
    courseServiceSpy.updateCourse.and.returnValue(of({} as Course));
    courseServiceSpy.getCourses.and.returnValue(of([])); // For reload

    component.rejectCourse(pendingCourse);
    expect(matDialogSpy.open).toHaveBeenCalledWith(ConfirmationModalComponent, jasmine.any(Object));

    // Simulate user confirming with reason
    afterClosedSubject.next('Not good');
    afterClosedSubject.complete();

    expect(courseServiceSpy.updateCourse).toHaveBeenCalledWith(
      jasmine.objectContaining({
        status: 'rejected',
        rejectionMessage: { rejectionReason: 'Not good' }
      })
    );
  });

  it('should not update course if rejection reason is empty', () => {
    const pendingCourse = { id: '1', title: 'C1', status: 'pending' } as Course;
    const afterClosedSubject = new Subject<string>();
    matDialogSpy.open.and.returnValue({ afterClosed: () => afterClosedSubject.asObservable() } as any);

    component.rejectCourse(pendingCourse);

    // Simulate user closing dialog without reason
    afterClosedSubject.next('');
    afterClosedSubject.complete();

    expect(courseServiceSpy.updateCourse).not.toHaveBeenCalled();
  });

  describe('MyComponent', () => {

  beforeEach( () => {

    // Mock dataSource, paginator, and sort
    component.dataSource = {} as any;
    component.sort = {} as MatSort;
    component.paginator = {} as MatPaginator;

    // spyOn(component, 'setSortingAccessor'); // Spy on method
  });

  it('should assign sort, paginator and call setSortingAccessor after view init', fakeAsync(() => {
    component.ngAfterViewInit();

    // Fast-forward the setTimeout
    tick();

    expect(component.dataSource.sort).toBe(component.sort);
    expect(component.dataSource.paginator).toBe(component.paginator);
    // expect(component.setSortingAccessor).toHaveBeenCalled();
  }));
});

  describe('MyComponent - setSortingAccessor', () => {

  beforeEach( () => {

    // Provide a mock datasource object
    component.dataSource = {} as any;
  });

  it('should set sortingDataAccessor and return instructor directly if present', () => {
    // component.setSortingAccessor();
    const accessor = component.dataSource.sortingDataAccessor;

    const result = accessor({ instructor: 'John' } as Course, 'instructor');
    expect(result).toBe('John');
  });

  it('should set sortingDataAccessor and fallback to instructorInfo.name if instructor is missing', () => {
    // component.setSortingAccessor();
    const accessor = component.dataSource.sortingDataAccessor;

    const result = accessor({ instructorInfo: { name: 'Jane' } } as Course, 'instructor');
    expect(result).toBe('Jane');
  });

  it('should return empty string if instructor and instructorInfo are missing', () => {
    // component.setSortingAccessor();
    const accessor = component.dataSource.sortingDataAccessor;

    const result = accessor({} as Course, 'instructor');
    expect(result).toBe('');
  });

  it('should return timestamp for createdAt property', () => {
    const dateStr = '2024-01-01T00:00:00Z';
    // component.setSortingAccessor();
    const accessor = component.dataSource.sortingDataAccessor;

    const result = accessor({ createdAt: new Date(dateStr) as Date } as Course, 'createdAt');
    expect(result).toBe(new Date(dateStr).getTime());
  });

  it('should return property value for other properties', () => {
    // component.setSortingAccessor();
    const accessor = component.dataSource.sortingDataAccessor;

    const result = accessor({ title: 'Angular Basics' } as Course, 'title');
    expect(result).toBe('Angular Basics');
  });
});
});
