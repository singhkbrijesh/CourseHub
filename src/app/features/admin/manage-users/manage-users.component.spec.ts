import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageUsersComponent } from './manage-users.component';
import { of, Subject } from 'rxjs';
import { CourseService } from '../../../services/course.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { User } from '../../../core/models/course.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';

fdescribe('ManageUsersComponent', () => {
  let component: ManageUsersComponent;
  let fixture: ComponentFixture<ManageUsersComponent>;
  let courseServiceSpy: jasmine.SpyObj<CourseService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockUsers: User[] = [
    { id: '1', name: 'Alice', email: 'alice@test.com', role: 'student' },
    { id: '2', name: 'Bob', email: 'bob@test.com', role: 'instructor' },
    { id: '3', name: 'Admin', email: 'admin@test.com', role: 'admin' }
  ] as User[];

  beforeEach(async () => {
    courseServiceSpy = jasmine.createSpyObj('CourseService', [
      'getAllUsers',
      'getInstructorCourses',
      'getEnrollments',
      'deleteEnrollments',
      'updateCourse',
      'deleteCourse',
      'deleteUser',
      'getStudentEnrollments',
      'getCourses'
    ]);

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [ManageUsersComponent, NoopAnimationsModule],
      providers: [
        { provide: CourseService, useValue: courseServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUsersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadUsers', () => {
    it('should filter out admin users', () => {
      courseServiceSpy.getAllUsers.and.returnValue(of(mockUsers));

      component.loadUsers();

      expect(courseServiceSpy.getAllUsers).toHaveBeenCalled();
      expect(component.users.length).toBe(2);
      expect(component.users.find(u => u.role === 'admin')).toBeUndefined();
      expect(component.dataSource instanceof MatTableDataSource).toBeTrue();
    });
  });

  describe('ngOnInit', () => {
    it('should call loadUsers on init', () => {
      const loadUsersSpy = spyOn(component, 'loadUsers');
      component.ngOnInit();
      expect(loadUsersSpy).toHaveBeenCalled();
    });
  });

  // describe('confirmDeleteUser', () => {
  //   it('should open dialog and call deleteUserAndRelatedData on confirm', () => {
  //     const user: User = mockUsers[0];
  //     const afterClosedSubject = new Subject<boolean>();
  //     dialogSpy.open.and.returnValue({
  //       afterClosed: () => afterClosedSubject.asObservable()
  //     } as any);
  //     const deleteSpy = spyOn(component, 'deleteUserAndRelatedData');

  //     component.confirmDeleteUser(user);

  //     expect(dialogSpy.open).toHaveBeenCalled();
  //     afterClosedSubject.next(true); // simulate confirm
  //     expect(deleteSpy).toHaveBeenCalledWith(user);
  //   });

  //   it('should not delete user if dialog result is falsy', () => {
  //     const user: User = mockUsers[0];
  //     dialogSpy.open.and.returnValue({
  //       afterClosed: () => of(false)
  //     } as any);
  //     const deleteSpy = spyOn(component, 'deleteUserAndRelatedData');

  //     component.confirmDeleteUser(user);

  //     expect(deleteSpy).not.toHaveBeenCalled();
  //   });
  // });

  describe('deleteUserAndRelatedData', () => {
    it('should handle instructor deletion flow', () => {
      const instructor: User = mockUsers[1];
      const mockCourses = [{ id: 'c1', enrollmentCount: 2 }];
      const mockEnrollments = [
        { id: 'e1', courseId: 'c1', studentId: 's1', progress: 50 }
      ];

      courseServiceSpy.getInstructorCourses.and.returnValue(of(mockCourses as any));
      courseServiceSpy.getEnrollments.and.returnValue(of(mockEnrollments as any));
      courseServiceSpy.deleteEnrollments.and.returnValue(of(null));
      courseServiceSpy.updateCourse.and.returnValue(of(null as any));
      courseServiceSpy.deleteCourse.and.returnValue(of(null as any));
      courseServiceSpy.deleteUser.and.returnValue(of(null));
      spyOn(component, 'loadUsers');

      component.deleteUserAndRelatedData(instructor);

      expect(courseServiceSpy.getInstructorCourses).toHaveBeenCalledWith(instructor.id);
    });

    it('should handle student deletion flow', () => {
      const student: User = mockUsers[0];
      const mockEnrollments = [
        { id: 'e1', courseId: 'c1', studentId: 's1', progress: 50 }
      ];
      const mockCourses = [{ id: 'c1', enrollmentCount: 1 }];

      courseServiceSpy.getStudentEnrollments.and.returnValue(of(mockEnrollments as any));
      courseServiceSpy.getCourses.and.returnValue(of(mockCourses as any));
      courseServiceSpy.deleteEnrollments.and.returnValue(of(null));
      courseServiceSpy.updateCourse.and.returnValue(of(null as any));
      courseServiceSpy.deleteUser.and.returnValue(of(null));
      spyOn(component, 'loadUsers');

      component.deleteUserAndRelatedData(student);

      expect(courseServiceSpy.getStudentEnrollments).toHaveBeenCalledWith(student.id);
    });
  });

  describe('confirmDeleteUser', () => {
  it('should open confirmation dialog and call deleteUserAndRelatedData if confirmed', () => {
    const user = { id: '1', name: 'John', role: 'student' } as any;

    const afterClosedSpy = jasmine.createSpyObj('afterClosed', ['subscribe']);
    const dialogRefSpy = { afterClosed: () => afterClosedSpy } as any;

    spyOn(component['dialog'], 'open').and.returnValue(dialogRefSpy);
    spyOn(component, 'deleteUserAndRelatedData');

    // Simulate subscription callback of afterClosed
    afterClosedSpy.subscribe.and.callFake((callback: any) => {
      callback(true); // simulate user clicked "Delete"
    });

    // Act
    component.confirmDeleteUser(user);

    // Assert
    expect(component['dialog'].open).toHaveBeenCalledWith(ConfirmationModalComponent, jasmine.objectContaining({
      width: '350px',
      data: jasmine.objectContaining({
        title: 'Delete User',
        confirmButtonText: 'Delete'
      })
    }));

    expect(component.deleteUserAndRelatedData).toHaveBeenCalledWith(user);
  });

  it('should not call deleteUserAndRelatedData if dialog result is false', () => {
    const user = { id: '2', name: 'Jane', role: 'student' } as any;

    const afterClosedSpy = jasmine.createSpyObj('afterClosed', ['subscribe']);
    const dialogRefSpy = { afterClosed: () => afterClosedSpy } as any;

    spyOn(component['dialog'], 'open').and.returnValue(dialogRefSpy);
    spyOn(component, 'deleteUserAndRelatedData');

    // Simulate dialog result as false (cancel)
    afterClosedSpy.subscribe.and.callFake((callback: any) => {
      callback(false);
    });

    component.confirmDeleteUser(user);

    expect(component.deleteUserAndRelatedData).not.toHaveBeenCalled();
  });
});

  it('should set paginator and sort after view init', () => {
    component.ngAfterViewInit();

    expect(component.dataSource.paginator).toBe(component.paginator);
    expect(component.dataSource.sort).toBe(component.sort);
  });

});
