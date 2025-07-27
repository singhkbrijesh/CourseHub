import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { CourseApprovalsComponent } from './course-approvals.component';
import { CourseService } from '../../../services/course.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';
import { Course } from '../../../core/models/course.model';
import { HttpClient, HttpHandler } from '@angular/common/http';

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
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CourseApprovalsComponent);
    component = fixture.componentInstance;
  });

  it('should load pending courses on init', () => {
    courseServiceSpy.getCourses.and.returnValue(of(mockCourses));

    component.ngOnInit();

    expect(courseServiceSpy.getCourses).toHaveBeenCalled();
    expect(component.pendingCourses.length).toBe(1);
    expect(component.pendingCourses[0].status).toBe('pending');
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
});
