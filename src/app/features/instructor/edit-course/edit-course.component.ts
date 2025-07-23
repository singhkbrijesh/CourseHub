import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// Angular Material Modules
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { InstructorService } from '../../../services/instructor.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-edit-course',
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
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.scss'
})
export class EditCourseComponent implements OnInit {
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
  loading = true;
  
  // Course data
  courseId: string = '';
  originalCourse: Course | null = null;
  currentUser: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private instructorService: InstructorService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadCourseForEdit();
  }

  // Initialize all form groups
  initializeForms() {
    // Step 1: Basic Information
    this.basicInfoForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
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
  }

  // Load current user from localStorage
  loadCurrentUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  // Load course data for editing
  loadCourseForEdit() {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.courseId) {
      this.snackBar.open('Invalid course ID', 'Close', { duration: 3000 });
      this.router.navigate(['/instructor/my-courses']);
      return;
    }

    this.instructorService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.originalCourse = course ?? null;
        if (course) {
          this.populateFormWithCourseData(course);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.snackBar.open('Error loading course data', 'Close', { duration: 3000 });
        this.router.navigate(['/instructor/my-courses']);
      }
    });
  }

  // Populate forms with existing course data
  populateFormWithCourseData(course: Course) {
  // Populate basic info form
  this.basicInfoForm.patchValue({
    title: course.title || '',
    description: course.description || '',
    category: course.category || '',
    level: course.level || '',
    duration: course.duration || 30
  });

  // Set thumbnail preview
  this.thumbnailPreview = course.thumbnail || null;

  // Populate requirements - handle empty or undefined arrays
  this.clearFormArray(this.requirements);
  if (course.requirements && course.requirements.length > 0) {
    course.requirements.forEach(req => {
      this.requirements.push(this.formBuilder.group({
        requirement: [req || '', Validators.required]
      }));
    });
  } else {
    // Add at least one empty requirement
    this.requirements.push(this.createRequirementControl());
  }

  // Populate learning outcomes - handle empty or undefined arrays
  this.clearFormArray(this.learningOutcomes);
  if (course.learningOutcomes && course.learningOutcomes.length > 0) {
    course.learningOutcomes.forEach(outcome => {
      this.learningOutcomes.push(this.formBuilder.group({
        outcome: [outcome || '', Validators.required]
      }));
    });
  } else {
    // Add at least one empty learning outcome
    this.learningOutcomes.push(this.createLearningOutcomeControl());
  }

  // Populate tags - handle undefined tags
  this.detailsForm.patchValue({
    tags: course.tags && course.tags.length > 0 ? course.tags.join(', ') : ''
  });

  // Populate lessons - handle empty or undefined lessons
  this.clearFormArray(this.lessons);
  if (course.lessons && course.lessons.length > 0) {
    course.lessons.forEach(lesson => {
      this.lessons.push(this.formBuilder.group({
        title: [lesson.title || '', Validators.required],
        description: [lesson.description || '', Validators.required],
        videoUrl: [lesson.videoUrl || ''],
        duration: [lesson.duration || 15, [Validators.required, Validators.min(1)]],
        isPreview: [lesson.isPreview || false],
        order: [lesson.order || 1]
      }));
    });
  } else {
    // Add at least one empty lesson
    this.lessons.push(this.createLessonControl());
  }
}

  // Helper method to clear form arrays
  clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
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
      order: [1]
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
    newLesson.patchValue({ order: this.lessons.length + 1 });
    this.lessons.push(newLesson);
  }

  removeLesson(index: number) {
    if (this.lessons.length > 1) {
      this.lessons.removeAt(index);
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
    this.thumbnailPreview = this.originalCourse?.thumbnail || null;
  }

  // Parse tags from comma-separated string
  parseTags(tagsString: string): string[] {
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  // Submit the updated course
  // Submit the updated course
onSubmit() {
  if (this.basicInfoForm.valid && this.detailsForm.valid && this.lessonsForm.valid) {
    this.isUploading = true;

    // Prepare complete updated course data - PRESERVE ALL FIELDS
    const updatedCourseData: Course = {
      // Keep ALL original course data first
      ...this.originalCourse!,
      
      // Then update only the specific fields
      id: this.courseId,
      title: this.basicInfoForm.value.title,
      description: this.basicInfoForm.value.description,
      category: this.basicInfoForm.value.category,
      level: this.basicInfoForm.value.level,
      duration: this.basicInfoForm.value.duration,
      
      // Update arrays with proper filtering
      requirements: this.requirements.controls
        .map(control => control.value.requirement)
        .filter(req => req && req.trim()),
        
      learningOutcomes: this.learningOutcomes.controls
        .map(control => control.value.outcome)
        .filter(outcome => outcome && outcome.trim()),
        
      tags: this.parseTags(this.detailsForm.value.tags || ''),
      
      // Update lessons with proper structure
      lessons: this.lessons.controls.map((control, index) => ({
        id: this.originalCourse?.lessons[index]?.id || `lesson_${Date.now()}_${index}`,
        title: control.value.title,
        description: control.value.description,
        videoUrl: control.value.videoUrl || '',
        duration: control.value.duration,
        order: index + 1,
        isPreview: control.value.isPreview || false
      })),
      
      // Preserve thumbnail - use new if uploaded, otherwise keep original
      thumbnail: this.thumbnailPreview || this.originalCourse?.thumbnail || 'assets/images/defaultcourse.jpeg',
      
      // Update timestamp
      updatedAt: new Date(),
      
      // Ensure all required fields are present
      instructor: this.originalCourse?.instructor || this.currentUser.name || 'Unknown Instructor',
      instructorId: this.originalCourse?.instructorId || this.currentUser.id || 'unknown',
      instructorInfo: this.originalCourse?.instructorInfo || {
        name: this.currentUser.name || 'Unknown Instructor',
        title: 'Course Instructor',
        rating: 0,
        totalReviews: 0,
        totalStudents: 0,
        totalCourses: 0,
        bio: 'Experienced instructor passionate about teaching.',
        avatar: 'assets/images/instructors/default-instructor.jpg'
      },
      rating: this.originalCourse?.rating || 0,
      enrollmentCount: this.originalCourse?.enrollmentCount || 0,
      status: this.originalCourse?.status || 'pending',
      createdAt: this.originalCourse?.createdAt || new Date()
    };

    // console.log('Sending complete updated course:', updatedCourseData);

    // Submit to service
    this.instructorService.updateCourse(this.courseId, updatedCourseData).subscribe({
      next: (response) => {
        // console.log('Course updated successfully:', response);
        this.isUploading = false;
        this.snackBar.open('Course updated successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/instructor/my-courses']);
      },
      error: (error) => {
        console.error('Error updating course:', error);
        this.isUploading = false;
        this.snackBar.open('Error updating course. Please try again.', 'Close', { duration: 3000 });
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
    this.router.navigate(['/instructor/my-courses']);
  }
}