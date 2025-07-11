import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Course, Enrollment } from '../core/models/course.model';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const courses: Course[] = [
      {
        id: '1',
        title: 'Angular Complete Course',
        description: 'Learn Angular from basics to advanced concepts including components, services, routing, and more.',
        instructor: 'John Doe',
        instructorId: 'instructor1',
        category: 'Programming',
        level: 'Intermediate',
        duration: 40,
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
        id: '2',
        title: 'React Complete Course',
        description: 'Master React with hands-on projects and real-world examples.',
        instructor: 'Jane Smith',
        instructorId: 'instructor2',
        category: 'Programming',
        level: 'Advanced',
        duration: 50,
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
        id: '3',
        title: 'Digital Marketing Mastery',
        description: 'Complete digital marketing course covering SEO, social media, email marketing, and analytics.',
        instructor: 'Sarah Johnson',
        instructorId: 'instructor3',
        category: 'Marketing',
        level: 'Beginner',
        duration: 35,
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
      {
        id: '4',
        title: 'Python for Data Science',
        description: 'Learn Python programming for data analysis and machine learning with hands-on projects.',
        instructor: 'Dr. Sarah Chen',
        instructorId: 'instructor4',
        category: 'Data Science',
        level: 'Intermediate',
        duration: 60,
        rating: 4.7,
        enrollmentCount: 280,
        thumbnail: 'assets/images/angular.jpeg',
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
        id: '5',
        title: 'Advanced JavaScript ES6+',
        description: 'Master modern JavaScript features and advanced concepts for professional development.',
        instructor: 'Alex Rodriguez',
        instructorId: 'instructor5',
        category: 'Programming',
        level: 'Advanced',
        duration: 45,
        rating: 4.8,
        enrollmentCount: 190,
        thumbnail: 'assets/images/angular.jpeg',
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
        id: '6',
        title: 'UX/UI Design Fundamentals',
        description: 'Learn user experience and interface design principles with practical projects.',
        instructor: 'Maria Garcia',
        instructorId: 'instructor6',
        category: 'Design',
        level: 'Beginner',
        duration: 40,
        rating: 4.5,
        enrollmentCount: 420,
        thumbnail: 'assets/images/angular.jpeg',
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
        id: '7',
        title: 'Machine Learning with TensorFlow',
        description: 'Build and deploy machine learning models using TensorFlow and Python.',
        instructor: 'Dr. Michael Chen',
        instructorId: 'instructor7',
        category: 'Data Science',
        level: 'Advanced',
        duration: 80,
        rating: 4.9,
        enrollmentCount: 150,
        thumbnail: 'assets/images/angular.jpeg',
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
        id: '8',
        title: 'Strategic Business Planning',
        description: 'Learn strategic planning, market analysis, and business development techniques.',
        instructor: 'Robert Williams',
        instructorId: 'instructor8',
        category: 'Business',
        level: 'Intermediate',
        duration: 35,
        rating: 4.4,
        enrollmentCount: 240,
        thumbnail: 'assets/images/angular.jpeg',
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
        id: '9',
        title: 'Full Stack Web Development',
        description: 'Complete web development course covering front-end and back-end technologies.',
        instructor: 'Jennifer Lee',
        instructorId: 'instructor9',
        category: 'Programming',
        level: 'Beginner',
        duration: 70,
        rating: 4.6,
        enrollmentCount: 380,
        thumbnail: 'assets/images/angular.jpeg',
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

    const enrollments: Enrollment[] = [
      {
        id: '1',
        studentId: 'student1',
        courseId: '1',
        enrolledAt: new Date('2024-01-10'),
        progress: 45,
        completedLessons: ['1'],
        status: 'active'
      },
      {
        id: '2',
        studentId: 'student1',
        courseId: '2',
        enrolledAt: new Date('2024-01-15'),
        progress: 100,
        completedLessons: ['1', '2', '3', '4'],
        status: 'completed'
      }
    ];

    const users = [
      {
        id: 'admin1',
        name: 'Admin User',
        email: 'admin@coursehub.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        id: 'instructor1',
        name: 'John Doe',
        email: 'john@coursehub.com',
        password: 'instructor123',
        role: 'instructor'
      },
      {
        id: 'student1',
        name: 'Student User',
        email: 'student@coursehub.com',
        password: 'student123',
        role: 'student'
      },
      {
        id: 'student2',
        name: 'Farhan',
        email: 'student2@coursehub.com',
        password: 'student@24',
        role: 'student'
      },
      {
        id: 'student3',
        name: 'Raju Rastogi',
        email: 'student3@coursehub.com',
        password: 'student@24',
        role: 'student'
      }
    ];

    return { courses, enrollments, users };
  }
}