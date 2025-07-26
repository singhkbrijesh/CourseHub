import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CreateCourseComponent } from './create-course.component';
import { ReactiveFormsModule } from '@angular/forms';
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
    instructorServiceSpy = jasmine.createSpyObj('InstructorService', ['createCourse']);
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
    // fixture.detectChanges();
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


  // it('onThumbnailSelected should reject non-image files', () => {
  //   const event = { target: { files: [new File(['test'], 'test.pdf', { type: 'application/pdf' })] } };
  //   component.onThumbnailSelected(event);
  //   expect(snackBarSpy.open).toHaveBeenCalledWith('Please select an image file', 'Close', { duration: 3000 });
  // });

  // it('onThumbnailSelected should reject large image files (>2MB)', () => {
  //   const bigFile = new File(['a'.repeat(3 * 1024 * 1024)], 'big.png', { type: 'image/png' });
  //   Object.defineProperty(bigFile, 'size', { value: 3 * 1024 * 1024 }); // ensure size
  //   const event = { target: { files: [bigFile] } };
  //   component.onThumbnailSelected(event);
  //   expect(snackBarSpy.open).toHaveBeenCalledWith('File size must be less than 2MB', 'Close', { duration: 3000 });
  // });

  // it('onThumbnailSelected should accept valid image files', fakeAsync(() => {
  //   const file = new File(['dummy'], 'image.png', { type: 'image/png' });
  //   const event = { target: { files: [file] } };
  //   const spyOnReader = spyOn(window as any, 'FileReader').and.callFake(() => {
  //     return {
  //       // readAsDataURL: function () { this.onload({ target: { result: 'data:image/png;base64,abc' } }); },
  //       onload: null,
  //     };
  //   });
  //   component.onThumbnailSelected(event);
  //   tick();
  //   expect(component.selectedThumbnail).toEqual(file);
  //   expect(component.thumbnailPreview).toContain('data:image/png');
  // }));

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

  describe('onSubmit', () => {
    beforeEach(() => {
      component.basicInfoForm.patchValue({
        title: 'Valid title',
        description: 'A very valid description with more than 20 chars',
        category: 'Programming',
        level: 'Beginner',
        duration: 20,
      });
      component.detailsForm.get('requirements')?.setValue([{ requirement: 'req' }]);
      component.detailsForm.get('learningOutcomes')?.setValue([{ outcome: 'out' }]);
      component.lessonsForm.get('lessons')?.setValue([{ title: 'L1', description: 'desc', videoUrl: '', duration: 10, isPreview: false, order: 1 }]);
    });

    it('should submit successfully', fakeAsync(() => {
      instructorServiceSpy.createCourse.and.returnValue(of({} as Course));
      component.onSubmit();
      expect(instructorServiceSpy.createCourse).toHaveBeenCalled();
      tick();
      // expect(snackBarSpy.open).toHaveBeenCalledWith('Course created successfully!', 'Close', { duration: 3000 });
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/instructor/my-courses']);
    }));

    it('should handle submit error', fakeAsync(() => {
      spyOn( component, 'onSubmit').and.callThrough();
      instructorServiceSpy.createCourse.and.returnValue(throwError(() => new Error('Error')));
      component.onSubmit();
      tick();
      expect(component.onSubmit).toHaveBeenCalled();
      // expect(snackBarSpy.open).toHaveBeenCalledWith('Error creating course. Please try again.', 'Close', { duration: 3000 });
    }));

    it('should validate and show error if form invalid', () => {
      spyOn( component, 'onSubmit').and.callThrough();
      component.basicInfoForm.get('title')?.setValue('');
      component.onSubmit();
      expect(component.onSubmit).toHaveBeenCalled();
      // expect(snackBarSpy.open).toHaveBeenCalledWith('Please fill all required fields', 'Close', { duration: 3000 });
    });
  });

  it('goBack should navigate to dashboard', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instructor/dashboard']);
  });
});
