import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AsyncValidatorsService } from '../../../services/async-validators.service';
import { InstructorService } from '../../../services/instructor.service';
import { Course } from '../../../core/models/course.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './create-course.component.html',
  styleUrl: './create-course.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CreateCourseComponent implements OnInit {
  // Form groups for each step
  basicInfoForm!: FormGroup;
  detailsForm!: FormGroup;
  lessonsForm!: FormGroup;
  
  // Available options
  categories = ['Programming', 'Design', 'Marketing', 'Business', 'Data Science', 'Web Development'];
  levels = ['Beginner', 'Intermediate', 'Advanced'];
  
  // File handling
  selectedThumbnail: File | null = null;
  thumbnailPreview: string | null = null;
  isUploading = false;

  isTitleChecking = false;
  
  // Current user data
  currentUser: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private instructorService: InstructorService,
    private asyncValidators: AsyncValidatorsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadCurrentUser();
  }

  // Initialize all form groups
  initializeForms() {
    // Step 1: Basic Information
    this.basicInfoForm = this.formBuilder.group({
      title: ['', 
        [Validators.required, Validators.minLength(5)],
        [this.asyncValidators.uniqueCourseTitle()]
      ],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['', Validators.required],
      level: ['', Validators.required],
      duration: [30, [Validators.required, Validators.min(10)]]
    });

    // Step 2: Course Details
    this.detailsForm = this.formBuilder.group({
      requirements: this.formBuilder.array([this.createRequirementControl()]),
      learningOutcomes: this.formBuilder.array([this.createLearningOutcomeControl()]),
      tags: ['']
    });

    // Step 3: Lessons
    this.lessonsForm = this.formBuilder.group({
      lessons: this.formBuilder.array([this.createLessonControl()])
    });

    // Subscribe to title field status changes
    this.basicInfoForm.get('title')?.statusChanges.subscribe(status => {
      this.isTitleChecking = status === 'PENDING';
    });
  }

  // Method for custom error messages
  getTitleErrorMessage(): string {
    const titleControl = this.basicInfoForm.get('title');
    
    if (titleControl?.hasError('required')) {
      return 'Course title is required';
    }
    if (titleControl?.hasError('minlength')) {
      return 'Title must be at least 5 characters long';
    }
    if (titleControl?.hasError('courseTitleExists')) {
      return 'This course title already exists. Please choose a different title.';
    }
    
    return '';
  }

  // Load current user from localStorage
  loadCurrentUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  // Helper methods for form arrays
  createRequirementControl(): FormGroup {
    return this.formBuilder.group({
      requirement: ['', Validators.required]
    });
  }

  createLearningOutcomeControl(): FormGroup {
    return this.formBuilder.group({
      outcome: ['', Validators.required]
    });
  }

  createLessonControl(): FormGroup {
    return this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      videoUrl: [''],
      duration: [15, [Validators.required, Validators.min(1)]],
      isPreview: [false],
      order: [1],
      pdf: [null]
    });
  }

  // Getters for form arrays
  get requirements(): FormArray {
    return this.detailsForm.get('requirements') as FormArray;
  }

  get learningOutcomes(): FormArray {
    return this.detailsForm.get('learningOutcomes') as FormArray;
  }

  get lessons(): FormArray {
    return this.lessonsForm.get('lessons') as FormArray;
  }

  // Add/Remove methods for form arrays
  addRequirement() {
    this.requirements.push(this.createRequirementControl());
  }

  removeRequirement(index: number) {
    if (this.requirements.length > 1) {
      this.requirements.removeAt(index);
    }
  }

  addLearningOutcome() {
    this.learningOutcomes.push(this.createLearningOutcomeControl());
  }

  removeLearningOutcome(index: number) {
    if (this.learningOutcomes.length > 1) {
      this.learningOutcomes.removeAt(index);
    }
  }

  addLesson() {
    const newLesson = this.createLessonControl();
    // Set the order for the new lesson
    newLesson.patchValue({ order: this.lessons.length + 1 });
    this.lessons.push(newLesson);
  }

  removeLesson(index: number) {
    if (this.lessons.length > 1) {
      this.lessons.removeAt(index);
      // Update order numbers
      this.updateLessonOrder();
    }
  }

  updateLessonOrder() {
    this.lessons.controls.forEach((lesson, index) => {
      lesson.patchValue({ order: index + 1 });
    });
  }

  // File upload methods
  onThumbnailSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select an image file', 'Close', { duration: 3000 });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 2MB', 'Close', { duration: 3000 });
        return;
      }

      this.selectedThumbnail = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.thumbnailPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeThumbnail() {
    this.selectedThumbnail = null;
    this.thumbnailPreview = null;
  }

  onPdfSelected(event: Event, lessonIndex: number) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      this.snackBar.open('Please select a PDF file', 'Close', { duration: 3000 });
      return;
    }
    this.lessons.controls[lessonIndex].get('pdf')?.setValue(file);
  }
}

removePdf(lessonIndex: number) {
  this.lessons.controls[lessonIndex].get('pdf')?.setValue(null);
}

  // Parse tags from comma-separated string
  parseTags(tagsString: string): string[] {
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  // Submit the complete course
  onSubmit() {
  if (this.basicInfoForm.valid && this.detailsForm.valid && this.lessonsForm.valid) {
    this.isUploading = true;

    // Generate a unique ID for the new course
    const courseId = 'course_' + Date.now();

    // Prepare course data with all required fields
    const courseData: Course = {
      id: courseId,
      title: this.basicInfoForm.value.title,
      description: this.basicInfoForm.value.description,
      category: this.basicInfoForm.value.category,
      level: this.basicInfoForm.value.level,
      duration: this.basicInfoForm.value.duration,
      instructor: this.currentUser.name || 'Unknown Instructor',
      instructorId: this.currentUser.id || 'unknown',
      instructorInfo: {
        name: this.currentUser.name || 'Unknown Instructor',
        title: 'Course Instructor',
        rating: 0,
        totalReviews: 0,
        totalStudents: 0,
        totalCourses: 0,
        bio: 'Experienced instructor passionate about teaching.',
      },
      requirements: this.requirements.controls.map(control => control.value.requirement).filter(req => req.trim()),
      learningOutcomes: this.learningOutcomes.controls.map(control => control.value.outcome).filter(outcome => outcome.trim()),
      tags: this.parseTags(this.detailsForm.value.tags || ''),
      lessons: this.lessons.controls.map((control, index) => {
        const pdfFile = control.value.pdf;
        let pdfUrl = '';
        if (pdfFile instanceof File) {
          // creating a URL (will not persist after reload)
          pdfUrl = URL.createObjectURL(pdfFile);
        }
        return {
          id: `lesson_${Date.now()}_${index}`,
          title: control.value.title,
          description: control.value.description,
          videoUrl: control.value.videoUrl || '',
          duration: control.value.duration,
          order: index + 1,
          isPreview: control.value.isPreview || false,
          pdfUrl // <-- add this property
        };
      }),
      rating: 0,
      enrollmentCount: 0,
      thumbnail: this.selectedThumbnail ? 
        `assets/images/${this.selectedThumbnail.name}` : 
        'assets/images/default-course.jpeg',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // console.log('Creating course with data:', courseData);

    // Submit to service
    this.instructorService.createCourse(courseData).subscribe({
      next: (response) => {
        // console.log('Course created successfully:', response);
        this.isUploading = false;
        this.snackBar.open('Course created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/instructor/my-courses']);
      },
      error: (error) => {
        console.error('Error creating course:', error);
        this.isUploading = false;
        this.snackBar.open('Error creating course. Please try again.', 'Close', { duration: 3000 });
      }
    });
  } else {
    this.markFormGroupTouched(this.basicInfoForm);
    this.markFormGroupTouched(this.detailsForm);
    this.markFormGroupTouched(this.lessonsForm);
    this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
  }
  }
  
  private markFormGroupTouched(formGroup: any) {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    control?.markAsTouched();
    
    if (control && control.controls) {
      this.markFormGroupTouched(control);
    }
  });
}

  // Navigation methods
  goBack() {
    this.router.navigate(['/instructor/dashboard']);
  }
}