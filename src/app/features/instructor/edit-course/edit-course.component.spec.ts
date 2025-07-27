import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EditCourseComponent } from './edit-course.component';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InstructorService } from '../../../services/instructor.service';

fdescribe('EditCourseComponent', () => {
  let component: EditCourseComponent;
  let fixture: ComponentFixture<EditCourseComponent>;

  let instructorServiceSpy: any;
  // let routerSpy: any;
  // let snackBarSpy: any;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockCourse = {
    id: '1',
    title: 'Test Course',
    description: 'Some description here that is long enough',
    category: 'Programming',
    level: 'Beginner',
    duration: 45,
    requirements: ['req1'],
    learningOutcomes: ['outcome1'],
    lessons: [
      { title: 'Lesson 1', description: 'Desc', duration: 10, order: 1 }
    ]
  };

  beforeEach(async () => {
    instructorServiceSpy = jasmine.createSpyObj('InstructorService', [
      'getCourseById',
      'updateCourse'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/instructor/my-courses' });
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, EditCourseComponent, BrowserAnimationsModule],
      providers: [
        { provide: InstructorService, useValue: instructorServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditCourseComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should load course successfully', () => {
    instructorServiceSpy.getCourseById.and.returnValue(of(mockCourse));

    component.loadCourseForEdit();

    expect(instructorServiceSpy.getCourseById).toHaveBeenCalledWith('1');
  });

  it('should handle error when loading course', () => {
    instructorServiceSpy.getCourseById.and.returnValue(throwError(() => new Error('Failed')));

    component.loadCourseForEdit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instructor/my-courses']);
  });

  it('should submit form successfully', () => {
    instructorServiceSpy.getCourseById.and.returnValue(of(mockCourse));
    instructorServiceSpy.updateCourse.and.returnValue(of({}));

    // Load course to populate originalCourse
    component.loadCourseForEdit();

    // Fill forms to make them valid
    component.basicInfoForm.setValue({
      title: 'Updated Course',
      description: 'Updated description with sufficient length',
      category: 'Programming',
      level: 'Beginner',
      duration: 30
    });

    component.detailsForm.setValue({
      requirements: [{ requirement: 'req1' }],
      learningOutcomes: [{ outcome: 'outcome1' }],
      tags: ''
    });

    component.lessonsForm.setValue({
      lessons: [
        {
          title: 'Lesson 1',
          description: 'Description',
          videoUrl: '',
          duration: 10,
          isPreview: false,
          order: 1
        }
      ]
    });

    component.originalCourse = mockCourse as any;

    component.onSubmit();

    expect(instructorServiceSpy.updateCourse).toHaveBeenCalled();
  });

  it('should show error when submit fails', () => {
    spyOn(component, 'onSubmit').and.callThrough();
    instructorServiceSpy.getCourseById.and.returnValue(of(mockCourse));
    instructorServiceSpy.updateCourse.and.returnValue(throwError(() => new Error('Failed')));

    component.originalCourse = mockCourse as any;

    component.basicInfoForm.patchValue({
      title: 'Course',
      description: 'Some description that is long enough',
      category: 'Programming',
      level: 'Beginner',
      duration: 30
    });

    component.onSubmit();
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should show validation error if form invalid', () => {
    spyOn(component, 'onSubmit').and.callThrough();
    component.basicInfoForm.patchValue({ title: '' }); // invalid title
    component.originalCourse = mockCourse as any;

    component.onSubmit();

    component.onSubmit();
    expect(component.onSubmit).toHaveBeenCalled();
  });

  describe('EditCourseComponent goBack()', () => {
  

  it('should navigate to /admin/manage-courses when from is admin-manage-courses', () => {
    spyOnProperty(window, 'history').and.returnValue({ state: { from: 'admin-manage-courses' } } as any);

    component.goBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/manage-courses']);
  });

  it('should navigate to /instructor/my-courses when from is instructor-my-courses', () => {
    spyOnProperty(window, 'history').and.returnValue({ state: { from: 'instructor-my-courses' } } as any);

    component.goBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instructor/my-courses']);
  });

  it('should navigate to /instructor/my-courses for other cases (fallback)', () => {
    spyOnProperty(window, 'history').and.returnValue({ state: { from: 'something-else' } } as any);

    component.goBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instructor/my-courses']);
  });
  });
  
  it('should add a new requirement control to the requirements FormArray', () => {
    const initialLength = component.requirements.length;

    component.addRequirement();

    expect(component.requirements.length).toBe(initialLength + 1);
    expect(component.requirements.at(initialLength).get('requirement')).toBeTruthy();
  });

  it('should remove a requirement if there is more than one control', () => {
    // Add an extra control so we have > 1
    const mockFormArray = new FormArray([new FormControl('req1'), new FormControl('req2')]);

  // Spy on the getter and return mockFormArray
  spyOnProperty(component, 'requirements', 'get').and.returnValue(mockFormArray);
    // component.requirements.length = 2;
    
    component.addRequirement();
    const initialLength = component.requirements.length;

    component.removeRequirement(0);

    expect(component.requirements.length).toBe(initialLength - 1);
  });

  it('should add a new control to learningOutcomes FormArray', () => {
    const initialLength = component.learningOutcomes.length;

    component.addLearningOutcome();

    expect(component.learningOutcomes.length).toBe(initialLength + 1);
  });

  it('should remove a learning outcome when length > 1', () => {
    // Add an extra control so length > 1
    component.addLearningOutcome();
    const initialLength = component.learningOutcomes.length;

    component.removeLearningOutcome(0);

    expect(component.learningOutcomes.length).toBe(initialLength - 1);
  });

  it('should not remove a learning outcome when length = 1', () => {
    // Ensure only one control exists
    while (component.learningOutcomes.length > 1) {
      component.learningOutcomes.removeAt(0);
    }
    const initialLength = component.learningOutcomes.length;

    component.removeLearningOutcome(0);

    expect(component.learningOutcomes.length).toBe(initialLength);
  });

  it('should add a lesson with correct order', () => {
    const initialLength = component.lessons.length;

    // Add a new lesson
    component.addLesson();

    // Verify the lessons array increased
    expect(component.lessons.length).toBe(initialLength + 1);

    // Get the newly added lesson
    const newLessonGroup = component.lessons.at(component.lessons.length - 1);

    // Verify the order field
    expect(newLessonGroup.get('order')?.value).toBe(component.lessons.length);
  });

  it('should remove a lesson and call updateLessonOrder when lessons.length > 1', () => {
    // Add extra lessons to ensure length > 1
    component.addLesson();
    const initialLength = component.lessons.length;

    // Spy on updateLessonOrder
    const spyUpdateOrder = spyOn(component, 'updateLessonOrder');

    // Call removeLesson
    component.removeLesson(0);

    // Expect lessons length decreased
    expect(component.lessons.length).toBe(initialLength - 1);

    // updateLessonOrder should be called
    expect(spyUpdateOrder).toHaveBeenCalled();
  });

  it('should not remove a lesson when there is only 1 lesson', () => {
    // Ensure only 1 lesson
    component.initializeForms();
    const initialLength = component.lessons.length;

    const spyUpdateOrder = spyOn(component, 'updateLessonOrder');

    // Attempt to remove the only lesson
    component.removeLesson(0);

    // No change in lessons length
    expect(component.lessons.length).toBe(initialLength);

    // updateLessonOrder should NOT be called
    expect(spyUpdateOrder).not.toHaveBeenCalled();
  });

  it('should update order for all lessons based on their index', () => {
    // Arrange: Add 3 lessons with dummy data
    const fb = new FormBuilder();
    const lesson1: FormGroup = fb.group({ title: 'Lesson 1', order: 0 });
    const lesson2: FormGroup = fb.group({ title: 'Lesson 2', order: 0 });
    const lesson3: FormGroup = fb.group({ title: 'Lesson 3', order: 0 });

    component.lessons.push(lesson1);
    component.lessons.push(lesson2);
    component.lessons.push(lesson3);

    // Act
    component.updateLessonOrder();

    // Assert
    expect(component.lessons.at(0).value.order).toBe(1);
    expect(component.lessons.at(1).value.order).toBe(2);
    expect(component.lessons.at(2).value.order).toBe(3);
  });

  describe('onThumbnailSelected', () => {

  it('should show error if file is not an image', () => {
    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file] } };

    component.onThumbnailSelected(event);
    expect(component.selectedThumbnail).toBeNull();
  });

  it('should show error if file size exceeds 2MB', () => {
    const bigFile = new File(['a'.repeat(2 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
    const event = { target: { files: [bigFile] } };

    component.onThumbnailSelected(event);
    expect(component.selectedThumbnail).toBeNull();
  });

  it('should set selectedThumbnail and generate thumbnailPreview for valid image', fakeAsync(() => {
    const file = new File(['dummy'], 'image.png', { type: 'image/png' });
    const event = { target: { files: [file] } };

    // Spy on FileReader and trigger onload manually
    const mockReader = {
      readAsDataURL: jasmine.createSpy('readAsDataURL').and.callFake(function () {
        // Simulate async onload
        setTimeout(() => {
          mockReader.onload?.({ target: { result: 'data:image/png;base64,xxx' } } as any);
        }, 0);
      }),
    } as unknown as FileReader;
    spyOn(window as any, 'FileReader').and.returnValue(mockReader);

    component.onThumbnailSelected(event);

    tick(); // flush the setTimeout

    expect(component.selectedThumbnail).toBe(file);
    expect(component.thumbnailPreview).toBe('data:image/png;base64,xxx');
  }));
});

it('should reset selectedThumbnail to null', () => {
    component.removeThumbnail();
    expect(component.selectedThumbnail).toBeNull();
  });

  it('should reset thumbnailPreview to originalCourse.thumbnail if available', () => {
    component.removeThumbnail();
    expect(component.thumbnailPreview).toBeNull();
  });

  it('should set thumbnailPreview to null if originalCourse is not defined', () => {
    component.originalCourse = null;
    component.removeThumbnail();
    expect(component.thumbnailPreview).toBeNull();
  });

  it('should set currentUser when user data exists in localStorage', () => {
    const mockUser = { id: 1, name: 'John' };
    localStorage.setItem('user', JSON.stringify(mockUser));

    component.loadCurrentUser();

    expect(component.currentUser).toEqual(mockUser);
  });
});
