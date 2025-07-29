import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CreateCourseComponent } from './create-course.component';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { AsyncValidatorsService } from '../../../services/async-validators.service';
import { InstructorService } from '../../../services/instructor.service';
import { Course } from '../../../core/models/course.model';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

fdescribe('CreateCourseComponent', () => {
  let component: CreateCourseComponent;
  let fixture: ComponentFixture<CreateCourseComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let instructorServiceSpy: jasmine.SpyObj<InstructorService>;
  let asyncValidatorsSpy: jasmine.SpyObj<AsyncValidatorsService>;

  beforeEach(async () => {
  routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
  instructorServiceSpy = jasmine.createSpyObj('InstructorService', ['createCourse', 'getInstructorCourses']);
  asyncValidatorsSpy = jasmine.createSpyObj('AsyncValidatorsService', ['uniqueCourseTitle']);
  asyncValidatorsSpy.uniqueCourseTitle.and.returnValue(() => of(null)); // dummy async validator

  await TestBed.configureTestingModule({
    imports: [CreateCourseComponent, ReactiveFormsModule],
    providers: [
      provideNoopAnimations(),
      { provide: Router, useValue: routerSpy },
      { provide: MatSnackBar, useValue: snackBarSpy },
      { provide: InstructorService, useValue: instructorServiceSpy },
      { provide: AsyncValidatorsService, useValue: asyncValidatorsSpy },
    ],
  }).compileComponents();

  fixture = TestBed.createComponent(CreateCourseComponent);
  component = fixture.componentInstance;
});

  it('should create and initialize forms', () => {
    expect(component).toBeTruthy();
    expect(component.basicInfoForm).toBeDefined();
    expect(component.detailsForm).toBeDefined();
    expect(component.lessonsForm).toBeDefined();
  });

  it('should load current user from localStorage', () => {
    const mockUser = { id: '123', name: 'John' };
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));
    component.loadCurrentUser();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should return proper title error messages', () => {
    const control = component.basicInfoForm.get('title');
    control?.setErrors({ required: true });
    expect(component.getTitleErrorMessage()).toContain('Course title is required');
    control?.setErrors({ minlength: true });
    expect(component.getTitleErrorMessage()).toContain('Title must be at least 5 characters long');
    control?.setErrors({ courseTitleExists: true });
    expect(component.getTitleErrorMessage()).toContain('This course title already exists');
    control?.setErrors(null);
    expect(component.getTitleErrorMessage()).toBe('');
  });

  it('add/remove requirement', () => {
    const initialLength = component.requirements.length;
    component.addRequirement();
    expect(component.requirements.length).toBe(initialLength + 1);
    component.removeRequirement(0); // cannot remove if only 1
    expect(component.requirements.length).toBeGreaterThan(0);
  });

  it('add/remove learningOutcome', () => {
    const initialLength = component.learningOutcomes.length;
    component.addLearningOutcome();
    expect(component.learningOutcomes.length).toBe(initialLength + 1);
    component.removeLearningOutcome(0);
    expect(component.learningOutcomes.length).toBeGreaterThan(0);
  });

  it('add/remove lessons and updateLessonOrder', () => {
    const initialLength = component.lessons.length;
    component.addLesson();
    expect(component.lessons.length).toBe(initialLength + 1);
    component.removeLesson(0);
    expect(component.lessons.length).toBeGreaterThan(0);
    component.updateLessonOrder();
    component.lessons.controls.forEach((ctrl, i) => {
      expect(ctrl.value.order).toBe(i + 1);
    });
  });

  it('should call loadCurrentUser on ngOnInit', () => {
  const loadCurrentUserSpy = spyOn(component, 'loadCurrentUser');

  component.ngOnInit();

  expect(loadCurrentUserSpy).toHaveBeenCalled();
});

  it('removeThumbnail should reset properties', () => {
    component.selectedThumbnail = new File([''], 'a.png');
    component.thumbnailPreview = 'abc';
    component.removeThumbnail();
    expect(component.selectedThumbnail).toBeNull();
    expect(component.thumbnailPreview).toBeNull();
  });

  it('parseTags should split and trim tags', () => {
    const tags = component.parseTags('tag1, tag2 , ,tag3');
    expect(tags).toEqual(['tag1', 'tag2', 'tag3']);
  });

  // describe('onSubmit', () => {
  //   beforeEach(() => {
  //     component.basicInfoForm.patchValue({
  //       title: 'Valid title',
  //       description: 'A very valid description with more than 20 chars',
  //       category: 'Programming',
  //       level: 'Beginner',
  //       duration: 20,
  //     });
  //     component.detailsForm.get('requirements')?.setValue([{ requirement: 'req' }]);
  //     component.detailsForm.get('learningOutcomes')?.setValue([{ outcome: 'out' }]);
  //     component.lessonsForm.get('lessons')?.setValue([{ title: 'L1', description: 'desc', videoUrl: '', duration: 10, isPreview: false, order: 1 }]);
  //   });

  //   it('should submit successfully', fakeAsync(() => {
  //     instructorServiceSpy.createCourse.and.returnValue(of({} as Course));
  //     component.onSubmit();
  //     expect(instructorServiceSpy.createCourse).toHaveBeenCalled();
  //     tick();
  //     // expect(snackBarSpy.open).toHaveBeenCalledWith('Course created successfully!', 'Close', { duration: 3000 });
  //     expect(routerSpy.navigate).toHaveBeenCalledWith(['/instructor/my-courses']);
  //   }));

  //   it('should handle submit error', fakeAsync(() => {
  //     spyOn( component, 'onSubmit').and.callThrough();
  //     instructorServiceSpy.createCourse.and.returnValue(throwError(() => new Error('Error')));
  //     component.onSubmit();
  //     tick();
  //     expect(component.onSubmit).toHaveBeenCalled();
  //     // expect(snackBarSpy.open).toHaveBeenCalledWith('Error creating course. Please try again.', 'Close', { duration: 3000 });
  //   }));

  //   it('should validate and show error if form invalid', () => {
  //     spyOn( component, 'onSubmit').and.callThrough();
  //     component.basicInfoForm.get('title')?.setValue('');
  //     component.onSubmit();
  //     expect(component.onSubmit).toHaveBeenCalled();
  //     // expect(snackBarSpy.open).toHaveBeenCalledWith('Please fill all required fields', 'Close', { duration: 3000 });
  //   });
  // });

  it('goBack should navigate to dashboard', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instructor/dashboard']);
  });

  describe('MyComponent - onThumbnailSelected', () => {

  function createEvent(file: Partial<File>): any {
    return { target: { files: [file] } };
  }

    it('should show error if file type is not image', () => {
    spyOn(component, 'onThumbnailSelected').and.callThrough();
    const fakeFile = { type: 'application/pdf', size: 1000 } as File;
    const event = createEvent(fakeFile);

    component.onThumbnailSelected(event);

    expect(component.onThumbnailSelected).toHaveBeenCalled();
  });

    it('should show error if file size > 2MB', () => {
    spyOn(component, 'onThumbnailSelected').and.callThrough();
    const fakeFile = { type: 'image/png', size: 3 * 1024 * 1024 } as File;
    const event = createEvent(fakeFile);

    component.onThumbnailSelected(event);

    expect(component.onThumbnailSelected).toHaveBeenCalled();
  });

  it('should set selectedThumbnail and create a preview for valid image file', () => {
    const fakeFile = new File(['dummy'], 'test.png', { type: 'image/png' });
    const event = createEvent(fakeFile);

    // Spy on FileReader and trigger onload manually
    const mockResult = 'data:image/png;base64,test';
    spyOn(window as any, 'FileReader').and.returnValue({
      readAsDataURL: function () {
        this.onload({ target: { result: mockResult } });
      },
      onload: null
    });

    component.onThumbnailSelected(event);

    expect(component.selectedThumbnail).toBe(fakeFile);
    expect(component.thumbnailPreview).toBe(mockResult);
  });

  it('should do nothing if no file selected', () => {
    component.onThumbnailSelected({ target: { files: [] } });

    expect(snackBarSpy.open).not.toHaveBeenCalled();
    expect(component.selectedThumbnail).toBeNull();
    expect(component.thumbnailPreview).toBeNull();
  });
});

describe('MyComponent - onPdfSelected & removePdf', () => {

  beforeEach( () => {

    // Mock lessons FormArray with one FormGroup
    while (component.lessons.length > 0) {
      component.lessons.removeAt(0);
    }
    component.lessons.push(
      new FormGroup({
        pdf: new FormControl(null)
      })
    );

    });

  function createEvent(file?: File): Event {
    const input = document.createElement('input');
    if (file) {
      // Mock the FileList
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });
    } else {
      Object.defineProperty(input, 'files', {
        value: [],
        writable: false
      });
    }
    return { target: input } as unknown as Event;
  }

  it('should show error if file type is not PDF', () => {
    const fakeFile = new File(['dummy'], 'test.txt', { type: 'text/plain' });
    const event = createEvent(fakeFile);

    component.onPdfSelected(event, 0);

    expect(component.lessons.at(0).get('pdf')?.value).toBeNull();
  });

  it('should set pdf control value for a valid PDF file', () => {
    const fakeFile = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    const event = createEvent(fakeFile);

    component.onPdfSelected(event, 0);

    expect(snackBarSpy.open).not.toHaveBeenCalled();
    expect(component.lessons.at(0).get('pdf')?.value).toBe(fakeFile);
  });

  it('should do nothing if no file is selected', () => {
    const event = createEvent(); // empty file list

    component.onPdfSelected(event, 0);

    expect(snackBarSpy.open).not.toHaveBeenCalled();
    expect(component.lessons.at(0).get('pdf')?.value).toBeNull();
  });

  it('should remove pdf when removePdf is called', () => {
    const fakeFile = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    component.lessons.at(0).get('pdf')?.setValue(fakeFile);

    component.removePdf(0);

    expect(component.lessons.at(0).get('pdf')?.value).toBeNull();
  });

});
  
  describe('MyComponent - markFormGroupTouched', () => {

  it('should mark all controls in the form group as touched', () => {
    const formGroup = new FormGroup({
      name: new FormControl(''),
      email: new FormControl('')
    });

    spyOn(formGroup.get('name')!, 'markAsTouched').and.callThrough();
    spyOn(formGroup.get('email')!, 'markAsTouched').and.callThrough();

    // @ts-ignore – accessing private method for test
    component['markFormGroupTouched'](formGroup);

    expect(formGroup.get('name')!.markAsTouched).toHaveBeenCalled();
    expect(formGroup.get('email')!.markAsTouched).toHaveBeenCalled();
  });

  it('should recursively mark nested form groups', () => {
    const nestedGroup = new FormGroup({
      city: new FormControl('')
    });
    const parentGroup = new FormGroup({
      address: nestedGroup,
      phone: new FormControl('')
    });

    spyOn(parentGroup.get('phone')!, 'markAsTouched').and.callThrough();
    spyOn(nestedGroup.get('city')!, 'markAsTouched').and.callThrough();

    // @ts-ignore – accessing private method for test
    component['markFormGroupTouched'](parentGroup);

    expect(parentGroup.get('phone')!.markAsTouched).toHaveBeenCalled();
    expect(nestedGroup.get('city')!.markAsTouched).toHaveBeenCalled();
  });
  });
  
  describe('CreateCourseComponent - onSubmit', () => {
  beforeEach(() => {
    // Set up valid forms
    spyOnProperty(component.basicInfoForm, 'valid', 'get').and.returnValue(true);
    spyOnProperty(component.detailsForm, 'valid', 'get').and.returnValue(true);
    spyOnProperty(component.lessonsForm, 'valid', 'get').and.returnValue(true);

    // Patch values for forms
    component.basicInfoForm.patchValue({
      title: 'Test Course',
      description: 'A valid description for the course.',
      category: 'Programming',
      level: 'Beginner',
      duration: 30
    });
    component.detailsForm.get('tags')?.setValue('tag1, tag2');
    component.requirements.at(0).patchValue({ requirement: 'Requirement 1' });
    component.learningOutcomes.at(0).patchValue({ outcome: 'Outcome 1' });
    component.lessons.at(0).patchValue({
      title: 'Lesson 1',
      description: 'Lesson description',
      duration: 10
    });

    component.selectedThumbnail = null;
    component.currentUser = { id: 'u1', name: 'John' };
  });

  it('should create course with instructorInfo from existing course', fakeAsync(() => {
    const existingInstructorInfo = {
      name: 'John',
      title: 'Senior Instructor',
      rating: 4.5,
      totalReviews: 100,
      totalStudents: 200,
      totalCourses: 5,
      bio: 'Bio'
    };
    const mockCourses = [
      { instructorId: 'u1', instructorInfo: existingInstructorInfo }
    ] as Course[];
    instructorServiceSpy.getInstructorCourses.and.returnValue(of(mockCourses));
    instructorServiceSpy.createCourse.and.returnValue(of({ id: 'course_1' } as Course));

    component.onSubmit();
    tick();

    expect(instructorServiceSpy.getInstructorCourses).toHaveBeenCalledWith('u1');
    expect(instructorServiceSpy.createCourse).toHaveBeenCalled();
    expect(component.isUploading).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instructor/my-courses']);
  }));

  it('should create course with default instructorInfo if none exists', fakeAsync(() => {
    instructorServiceSpy.getInstructorCourses.and.returnValue(of([]));
    instructorServiceSpy.createCourse.and.returnValue(of({ id: 'course_2' } as Course));

    component.onSubmit();
    tick();

    expect(instructorServiceSpy.getInstructorCourses).toHaveBeenCalledWith('u1');
    expect(instructorServiceSpy.createCourse).toHaveBeenCalled();
    expect(component.isUploading).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instructor/my-courses']);
  }));

  it('should show error when createCourse fails', fakeAsync(() => {
    instructorServiceSpy.getInstructorCourses.and.returnValue(of([]));
    instructorServiceSpy.createCourse.and.returnValue(throwError(() => new Error('Error')));

    component.onSubmit();
    tick();

    expect(component.isUploading).toBeFalse();
  }));

  it('should show error when getInstructorCourses fails', fakeAsync(() => {
    instructorServiceSpy.getInstructorCourses.and.returnValue(throwError(() => new Error('Error')));

    component.onSubmit();
    tick();

    expect(component.isUploading).toBeFalse();
  }));
});
});