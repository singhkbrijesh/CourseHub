import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Course, Enrollment } from '../core/models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  private enrollmentsSubject = new BehaviorSubject<Enrollment[]>([]);
  
  courses$ = this.coursesSubject.asObservable();
  enrollments$ = this.enrollmentsSubject.asObservable();

  constructor() {
    this.loadMockData();
    this.loadMockEnrollments();
  }

private loadMockData() {
  const mockCourses: Course[] = [
    {
      id: 'Angular',
      title: 'Angular Complete Course',
      description: 'Learn Angular from basics to advanced concepts including components, services, routing, and more.',
      instructor: 'John Doe',
      instructorId: 'instructor1',
      category: 'Programming',
      level: 'Intermediate',
      duration: 40,
      price: 99.99,
      rating: 4.5,
      enrollmentCount: 150,
      thumbnail: 'assets/images/angular.jpeg',
      status: 'approved',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      lessons: [
        {
          id: '1',
          title: 'Introduction to Angular',
          description: 'Getting started with Angular framework, understanding the architecture and core concepts.',
          videoUrl: 'https://example.com/video1',
          duration: 30,
          order: 1
        },
        {
          id: '2',
          title: 'Components and Templates',
          description: 'Understanding Angular components, templates, and data binding.',
          videoUrl: 'https://example.com/video2',
          duration: 45,
          order: 2
        },
        {
          id: '3',
          title: 'Services and Dependency Injection',
          description: 'Learn about services, dependency injection, and how to share data between components.',
          videoUrl: 'https://example.com/video3',
          duration: 35,
          order: 3
        },
        {
          id: '4',
          title: 'Routing and Navigation',
          description: 'Implementing routing, navigation, and route guards in Angular applications.',
          videoUrl: 'https://example.com/video4',
          duration: 40,
          order: 4
        }
      ]
    },
    {
      id: 'React',
      title: 'React Complete Course',
      description: 'Master React with hands-on projects and real-world examples.',
      instructor: 'Jane Smith',
      instructorId: 'instructor2',
      category: 'Programming',
      level: 'Advanced',
      duration: 50,
      price: 129.99,
      rating: 4.8,
      enrollmentCount: 200,
      thumbnail: 'assets/images/react.jpeg',
      status: 'approved',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      lessons: [
        {
          id: '1',
          title: 'Introduction to React',
          description: 'Getting started with React, JSX, and component-based architecture.',
          videoUrl: 'https://example.com/video1',
          duration: 30,
          order: 1
        },
        {
          id: '2',
          title: 'State Management with Redux',
          description: 'Learn how to manage state in React applications using Redux.',
          videoUrl: 'https://example.com/video2',
          duration: 45,
          order: 2
        },
        {
          id: '3',
          title: 'Routing in React',
          description: 'Implementing routing and navigation in React applications.',
          videoUrl: 'https://example.com/video3',
          duration: 35,
          order: 3
        },
        {
          id: '4',
          title: 'Testing React Applications',
          description: 'Learn how to write tests for React components and applications.',
          videoUrl: 'https://example.com/video4',
          duration: 40,
          order: 4
        }
      ]
    },
    {
      id: 'Digital Marketing',
      title: 'Digital Marketing Mastery',
      description: 'Complete digital marketing course covering SEO, social media, email marketing, and analytics.',
      instructor: 'Sarah Johnson',
      instructorId: 'instructor3',
      category: 'Marketing',
      level: 'Beginner',
      duration: 35,
      price: 79.99,
      rating: 4.6,
      enrollmentCount: 320,
      thumbnail: 'assets/images/digital-marketing.jpeg',
      status: 'approved',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      lessons: [
        {
          id: '1',
          title: 'Introduction to Digital Marketing',
          description: 'Understanding the digital marketing landscape and key concepts.',
          videoUrl: 'https://example.com/video1',
          duration: 25,
          order: 1
        },
        {
          id: '2',
          title: 'Search Engine Optimization (SEO)',
          description: 'Learn how to optimize websites for search engines and improve rankings.',
          videoUrl: 'https://example.com/video2',
          duration: 40,
          order: 2
        },
        {
          id: '3',
          title: 'Social Media Marketing',
          description: 'Master social media platforms and create engaging content strategies.',
          videoUrl: 'https://example.com/video3',
          duration: 35,
          order: 3
        },
        {
          id: '4',
          title: 'Email Marketing Campaigns',
          description: 'Design and execute effective email marketing campaigns.',
          videoUrl: 'https://example.com/video4',
          duration: 30,
          order: 4
        },
        {
          id: '5',
          title: 'Google Analytics & Performance Tracking',
          description: 'Track and analyze digital marketing performance using Google Analytics.',
          videoUrl: 'https://example.com/video5',
          duration: 45,
          order: 5
        }
      ]
    }
  ];
  
  this.coursesSubject.next(mockCourses);
}

  private loadMockEnrollments() {
    const mockEnrollments: Enrollment[] = [
      {
        id: 'Angular',
        studentId: 'student1',
        courseId: '1',
        enrolledAt: new Date('2024-01-10'),
        progress: 45,
        completedLessons: ['1'],
        status: 'active'
      },
      {
        id: 'React',
        studentId: 'student1',
        courseId: '2',
        enrolledAt: new Date('2024-01-15'),
        progress: 100,
        completedLessons: ['3'],
        status: 'completed'
      }
    ];
    
    this.enrollmentsSubject.next(mockEnrollments);
  }

  // Course CRUD operations
  getCourses(): Observable<Course[]> {
    return this.courses$;
  }

  getCourseById(id: string): Observable<Course | undefined> {
    return of(this.coursesSubject.value.find(course => course.id === id));
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    const newCourse: Course = {
      ...course,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      enrollmentCount: 0,
      rating: 0
    } as Course;
    
    const currentCourses = this.coursesSubject.value;
    this.coursesSubject.next([...currentCourses, newCourse]);
    
    return of(newCourse);
  }

  updateCourse(id: string, updates: Partial<Course>): Observable<Course | null> {
    const currentCourses = this.coursesSubject.value;
    const index = currentCourses.findIndex(c => c.id === id);
    
    if (index !== -1) {
      const updatedCourse = { ...currentCourses[index], ...updates, updatedAt: new Date() };
      currentCourses[index] = updatedCourse;
      this.coursesSubject.next([...currentCourses]);
      return of(updatedCourse);
    }
    
    return of(null);
  }

  deleteCourse(id: string): Observable<boolean> {
    const currentCourses = this.coursesSubject.value;
    const filteredCourses = currentCourses.filter(c => c.id !== id);
    this.coursesSubject.next(filteredCourses);
    return of(true);
  }

  // Enrollment operations
  enrollInCourse(courseId: string, studentId: string): Observable<Enrollment> {
    const newEnrollment: Enrollment = {
      id: Date.now().toString(),
      studentId,
      courseId,
      enrolledAt: new Date(),
      progress: 0,
      completedLessons: [],
      status: 'active'
    };
    
    const currentEnrollments = this.enrollmentsSubject.value;
    this.enrollmentsSubject.next([...currentEnrollments, newEnrollment]);
    
    // Update course enrollment count
    const courses = this.coursesSubject.value;
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      courses[courseIndex].enrollmentCount++;
      this.coursesSubject.next([...courses]);
    }
    
    return of(newEnrollment);
  }

  getStudentEnrollments(studentId: string): Observable<Enrollment[]> {
    const enrollments = this.enrollmentsSubject.value.filter(e => e.studentId === studentId);
    return of(enrollments);
  }

  updateEnrollmentProgress(enrollmentId: string, progress: number, completedLessons: string[]): Observable<Enrollment | null> {
    const currentEnrollments = this.enrollmentsSubject.value;
    const index = currentEnrollments.findIndex(e => e.id === enrollmentId);
    
    if (index !== -1) {
      const updatedEnrollment = { 
        ...currentEnrollments[index], 
        progress, 
        completedLessons,
        status: (progress === 100 ? 'completed' : 'active') as 'active' | 'completed' | 'dropped'
      };
      currentEnrollments[index] = updatedEnrollment;
      this.enrollmentsSubject.next([...currentEnrollments]);
      return of(updatedEnrollment);
    }
    
    return of(null);
  }

  // Filter and search operations
  getCoursesByCategory(category: string): Observable<Course[]> {
    const courses = this.coursesSubject.value.filter(c => c.category === category && c.status === 'approved');
    return of(courses);
  }

  getCoursesByLevel(level: string): Observable<Course[]> {
    const courses = this.coursesSubject.value.filter(c => c.level === level && c.status === 'approved');
    return of(courses);
  }

  searchCourses(searchTerm: string): Observable<Course[]> {
    const courses = this.coursesSubject.value.filter(c => 
      c.status === 'approved' && 
      (c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return of(courses);
  }

  // Admin operations
  getPendingCourses(): Observable<Course[]> {
    const courses = this.coursesSubject.value.filter(c => c.status === 'pending');
    return of(courses);
  }

  approveCourse(courseId: string): Observable<Course | null> {
    return this.updateCourse(courseId, { status: 'approved' });
  }

  rejectCourse(courseId: string): Observable<Course | null> {
    return this.updateCourse(courseId, { status: 'rejected' });
  }

  // Instructor operations
  getInstructorCourses(instructorId: string): Observable<Course[]> {
    const courses = this.coursesSubject.value.filter(c => c.instructorId === instructorId);
    return of(courses);
  }
}