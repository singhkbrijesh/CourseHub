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
    },
    // New courses added below
    {
      id: 'Python-Data-Science',
      title: 'Python for Data Science',
      description: 'Learn Python programming for data analysis and machine learning with hands-on projects.',
      instructor: 'Dr. Sarah Chen',
      instructorId: 'instructor4',
      category: 'Data Science',
      level: 'Intermediate',
      duration: 60,
      price: 149.99,
      rating: 4.7,
      enrollmentCount: 280,
      thumbnail: 'assets/images/digital-marketing.jpeg',
      status: 'approved',
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-04'),
      lessons: [
        {
          id: '1',
          title: 'Python Fundamentals for Data Science',
          description: 'Learn Python basics and libraries essential for data science.',
          videoUrl: 'https://example.com/video1',
          duration: 45,
          order: 1
        },
        {
          id: '2',
          title: 'Data Manipulation with Pandas',
          description: 'Master data manipulation and analysis using Pandas library.',
          videoUrl: 'https://example.com/video2',
          duration: 50,
          order: 2
        },
        {
          id: '3',
          title: 'Data Visualization with Matplotlib & Seaborn',
          description: 'Create stunning visualizations for data insights.',
          videoUrl: 'https://example.com/video3',
          duration: 40,
          order: 3
        }
      ]
    },
    {
      id: 'Advanced-JavaScript',
      title: 'Advanced JavaScript ES6+',
      description: 'Master modern JavaScript features and advanced concepts for professional development.',
      instructor: 'Alex Rodriguez',
      instructorId: 'instructor5',
      category: 'Programming',
      level: 'Advanced',
      duration: 45,
      price: 179.99,
      rating: 4.8,
      enrollmentCount: 190,
      thumbnail: 'assets/images/digital-marketing.jpeg',
      status: 'approved',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
      lessons: [
        {
          id: '1',
          title: 'ES6+ Features Deep Dive',
          description: 'Explore arrow functions, destructuring, modules, and more.',
          videoUrl: 'https://example.com/video1',
          duration: 40,
          order: 1
        },
        {
          id: '2',
          title: 'Asynchronous JavaScript',
          description: 'Master Promises, async/await, and event loop concepts.',
          videoUrl: 'https://example.com/video2',
          duration: 45,
          order: 2
        }
      ]
    },
    {
      id: 'UX-UI-Design',
      title: 'UX/UI Design Fundamentals',
      description: 'Learn user experience and interface design principles with practical projects.',
      instructor: 'Maria Garcia',
      instructorId: 'instructor6',
      category: 'Design',
      level: 'Beginner',
      duration: 40,
      price: 119.99,
      rating: 4.5,
      enrollmentCount: 420,
      thumbnail: 'assets/images/digital-marketing.jpeg',
      status: 'approved',
      createdAt: new Date('2024-01-06'),
      updatedAt: new Date('2024-01-06'),
      lessons: [
        {
          id: '1',
          title: 'Introduction to UX Design',
          description: 'Understanding user experience design principles and methodologies.',
          videoUrl: 'https://example.com/video1',
          duration: 35,
          order: 1
        },
        {
          id: '2',
          title: 'UI Design Principles',
          description: 'Learn visual design, typography, and color theory.',
          videoUrl: 'https://example.com/video2',
          duration: 40,
          order: 2
        }
      ]
    },
    {
      id: 'Machine-Learning',
      title: 'Machine Learning with TensorFlow',
      description: 'Build and deploy machine learning models using TensorFlow and Python.',
      instructor: 'Dr. Michael Chen',
      instructorId: 'instructor7',
      category: 'Data Science',
      level: 'Advanced',
      duration: 80,
      price: 299.99,
      rating: 4.9,
      enrollmentCount: 150,
      thumbnail: 'assets/images/digital-marketing.jpeg',
      status: 'approved',
      createdAt: new Date('2024-01-07'),
      updatedAt: new Date('2024-01-07'),
      lessons: [
        {
          id: '1',
          title: 'Introduction to Machine Learning',
          description: 'Understanding ML concepts, algorithms, and applications.',
          videoUrl: 'https://example.com/video1',
          duration: 50,
          order: 1
        },
        {
          id: '2',
          title: 'Neural Networks with TensorFlow',
          description: 'Build your first neural network using TensorFlow.',
          videoUrl: 'https://example.com/video2',
          duration: 60,
          order: 2
        }
      ]
    },
    {
      id: 'Business-Strategy',
      title: 'Strategic Business Planning',
      description: 'Learn strategic planning, market analysis, and business development techniques.',
      instructor: 'Robert Williams',
      instructorId: 'instructor8',
      category: 'Business',
      level: 'Intermediate',
      duration: 35,
      price: 159.99,
      rating: 4.4,
      enrollmentCount: 240,
      thumbnail: 'assets/images/digital-marketing.jpeg',
      status: 'approved',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-08'),
      lessons: [
        {
          id: '1',
          title: 'Strategic Planning Fundamentals',
          description: 'Learn the basics of strategic business planning.',
          videoUrl: 'https://example.com/video1',
          duration: 40,
          order: 1
        },
        {
          id: '2',
          title: 'Market Analysis Techniques',
          description: 'Understand market research and competitive analysis.',
          videoUrl: 'https://example.com/video2',
          duration: 35,
          order: 2
        }
      ]
    },
    {
      id: 'Web-Development',
      title: 'Full Stack Web Development',
      description: 'Complete web development course covering front-end and back-end technologies.',
      instructor: 'Jennifer Lee',
      instructorId: 'instructor9',
      category: 'Programming',
      level: 'Beginner',
      duration: 70,
      price: 199.99,
      rating: 4.6,
      enrollmentCount: 380,
      thumbnail: 'assets/images/digital-marketing.jpeg',
      status: 'approved',
      createdAt: new Date('2024-01-09'),
      updatedAt: new Date('2024-01-09'),
      lessons: [
        {
          id: '1',
          title: 'HTML & CSS Fundamentals',
          description: 'Learn the building blocks of web development.',
          videoUrl: 'https://example.com/video1',
          duration: 45,
          order: 1
        },
        {
          id: '2',
          title: 'JavaScript for Web Development',
          description: 'Add interactivity to your websites with JavaScript.',
          videoUrl: 'https://example.com/video2',
          duration: 50,
          order: 2
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