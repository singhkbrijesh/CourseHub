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
        description: 'Learn Angular from basics to advanced concepts including components, services, routing, and more. This comprehensive course covers everything you need to become a professional Angular developer.',
        instructor: 'Jose Portilla',
        instructorId: 'instructor1',
        instructorInfo: {
        name: 'Jose Portilla',
        title: 'Head of Data Science at Pierian Training',
        rating: 4.6,
        totalReviews: 1281420,
        totalStudents: 4300671,
        totalCourses: 87,
        bio: 'Jose Marcial Portilla has a BS and MS in Mechanical Engineering from Santa Clara University and years of experience as a professional instructor and trainer for Data Science, Machine Learning and Python Programming. He has publications and patents in various fields such as microfluidics, materials science, and data science.',
        avatar: 'assets/images/instructors/jose-portilla.jpg'
      },
        category: 'Programming',
        level: 'Intermediate',
        duration: 40,
        rating: 4.5,
        enrollmentCount: 2,
        thumbnail: 'assets/images/angular.jpeg',
        status: 'approved',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        requirements: [
          'Basic knowledge of HTML, CSS, and JavaScript',
          'Familiarity with TypeScript is helpful but not required',
          'A computer with internet connection',
          'Code editor (VS Code recommended)',
          'Node.js and npm installed on your machine'
        ],
        learningOutcomes: [
          'Build complete Angular applications from scratch',
          'Understand Angular components, services, and modules',
          'Master Angular routing and navigation',
          'Work with HTTP client and APIs',
          'Implement reactive forms and validation',
          'Deploy Angular applications to production',
          'Use Angular CLI for project management',
          'Implement state management with NgRx'
        ],
        tags: ['Angular', 'TypeScript', 'Web Development', 'Frontend', 'SPA'],
        lessons: [
          {
            id: '1',
            title: 'Introduction to Angular',
            description: 'Getting started with Angular framework, understanding the architecture and core concepts.',
            videoUrl: 'https://www.youtube.com/watch?v=xAT0lHYhHMY',
            duration: 30,
            order: 1,
            isPreview: true
          },
          {
            id: '2',
            title: 'Components and Templates',
            description: 'Understanding Angular components, templates, and data binding.',
            videoUrl: 'https://www.youtube.com/watch?v=R0nRX8jD2D0',
            duration: 45,
            order: 2,
            isPreview: false
          },
          {
            id: '3',
            title: 'Services and Dependency Injection',
            description: 'Learn about services, dependency injection, and how to share data between components.',
            videoUrl: 'https://www.youtube.com/watch?v=-jRxG84AzCI',
            duration: 35,
            order: 3,
            isPreview: false
          },
          {
            id: '4',
            title: 'Routing and Navigation',
            description: 'Implementing routing, navigation, and route guards in Angular applications.',
            videoUrl: 'https://www.youtube.com/watch?v=Nehk4tBxD4o',
            duration: 40,
            order: 4,
            isPreview: false
          },
          {
            id: '5',
            title: 'Forms and Validation',
            description: 'Working with template-driven and reactive forms in Angular.',
            videoUrl: 'https://www.youtube.com/watch?v=a2fGh8wqHmo',
            duration: 50,
            order: 5,
            isPreview: false
          }
        ]
      },
      {
        id: '2',
        title: 'React Complete Course',
        description: 'Master React with hands-on projects and real-world examples. Learn modern React development with hooks, context, and advanced patterns.',
        instructor: 'Jane Smith',
        instructorId: 'instructor2',
        instructorInfo: {
        name: 'Jane Smith',
        title: 'Senior React Developer at Meta',
        rating: 4.8,
        totalReviews: 890000,
        totalStudents: 2500000,
        totalCourses: 45,
        bio: 'Jane Smith is a Senior React Developer at Meta with over 8 years of experience in frontend development. She has contributed to major React projects and is passionate about teaching modern web development.',
        avatar: 'assets/images/instructors/jane-smith.jpg'
      },
        category: 'Programming',
        level: 'Advanced',
        duration: 50,
        rating: 4.8,
        enrollmentCount: 200,
        thumbnail: 'assets/images/react.jpeg',
        status: 'approved',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        requirements: [
          'Strong knowledge of JavaScript (ES6+)',
          'Basic understanding of HTML and CSS',
          'Experience with npm and package management',
          'Familiarity with modern web development concepts',
          'Code editor with React support'
        ],
        learningOutcomes: [
          'Build modern React applications from scratch',
          'Master React hooks and functional components',
          'Implement state management with Redux and Context API',
          'Create responsive and interactive user interfaces',
          'Work with React Router for navigation',
          'Test React applications effectively',
          'Deploy React apps to production',
          'Optimize React performance'
        ],
        tags: ['React', 'JavaScript', 'Web Development', 'Frontend', 'Redux'],
        lessons: [
          {
            id: '6',
            title: 'Introduction to React',
            description: 'Getting started with React, JSX, and component-based architecture.',
            videoUrl: 'https://www.youtube.com/watch?v=nhSZ4LhIii8',
            duration: 30,
            order: 1,
            isPreview: true
          },
          {
            id: '7',
            title: 'State Management with Redux',
            description: 'Learn how to manage state in React applications using Redux.',
            videoUrl: 'https://www.youtube.com/watch?v=DnRY5yG67u8',
            duration: 45,
            order: 2,
            isPreview: false
          },
          {
            id: '8',
            title: 'Routing in React',
            description: 'Implementing routing and navigation in React applications.',
            videoUrl: 'https://www.youtube.com/watch?v=ZP8QyCIUeIA&t=3s',
            duration: 35,
            order: 3,
            isPreview: true
          },
          {
            id: '9',
            title: 'Testing React Applications',
            description: 'Learn how to write tests for React components and applications.',
            videoUrl: 'https://www.youtube.com/watch?v=8Xwq35cPwYg',
            duration: 40,
            order: 4,
            isPreview: false
          }
        ]
      },
      {
        id: '3',
        title: 'Digital Marketing Mastery',
        description: 'Complete digital marketing course covering SEO, social media, email marketing, and analytics. Learn to create effective marketing strategies and measure their success.',
        instructor: 'Mike Johnson',
        instructorId: 'instructor4',
        instructorInfo: {
          name: 'Mike Johnson',
          title: 'Full Stack Developer at Google',
          rating: 4.7,
          totalReviews: 420000,
          totalStudents: 1200000,
          totalCourses: 28,
          bio: 'Mike Johnson is a Full Stack Developer at Google with expertise in Node.js, MongoDB, and cloud technologies. He has been developing web applications for over 10 years and loves sharing his knowledge.',
          avatar: 'assets/images/instructors/mike-johnson.jpg'
        },
        category: 'Marketing',
        level: 'Beginner',
        duration: 35,
        rating: 4.6,
        enrollmentCount: 1,
        thumbnail: 'assets/images/digital-marketing.jpeg',
        status: 'approved',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        requirements: [
          'Basic understanding of business concepts',
          'Access to a computer and internet',
          'Willingness to learn and practice',
          'Basic knowledge of social media platforms',
          'No prior marketing experience required'
        ],
        learningOutcomes: [
          'Develop comprehensive digital marketing strategies',
          'Master search engine optimization (SEO) techniques',
          'Create engaging social media campaigns',
          'Design and execute email marketing campaigns',
          'Use Google Analytics to track performance',
          'Understand paid advertising (Google Ads, Facebook Ads)',
          'Create compelling content for different platforms',
          'Measure and optimize marketing ROI'
        ],
        tags: ['Digital Marketing', 'SEO', 'Social Media', 'Email Marketing', 'Analytics'],
        lessons: [
          {
            id: '10',
            title: 'Introduction to Digital Marketing',
            description: 'Understanding the digital marketing landscape and key concepts.',
            videoUrl: 'https://www.youtube.com/watch?v=aC-DwwgqG6A',
            duration: 25,
            order: 1,
            isPreview: true
          },
          {
            id: '11',
            title: 'Search Engine Optimization (SEO)',
            description: 'Learn how to optimize websites for search engines and improve rankings.',
            videoUrl: 'https://www.youtube.com/watch?v=4Y0Mc0IbX_0',
            duration: 40,
            order: 2,
            isPreview: false
          },
          {
            id: '12',
            title: 'Social Media Marketing',
            description: 'Master social media platforms and create engaging content strategies.',
            videoUrl: 'https://www.youtube.com/watch?v=0UY-PZB6oGA',
            duration: 35,
            order: 3,
            isPreview: false
          },
          {
            id: '13',
            title: 'Email Marketing Campaigns',
            description: 'Design and execute effective email marketing campaigns.',
            videoUrl: 'https://www.youtube.com/watch?v=tCL1Xuo06qw',
            duration: 30,
            order: 4,
            isPreview: false
          },
          {
            id: '14',
            title: 'Google Analytics & Performance Tracking',
            description: 'Track and analyze digital marketing performance using Google Analytics.',
            videoUrl: 'https://www.youtube.com/watch?v=hsIP4iH25Wg',
            duration: 45,
            order: 5,
            isPreview: false
          }
        ]
      },
      {
        id: '4',
        title: 'Python for Data Science',
        description: 'Learn Python programming for data analysis and machine learning with hands-on projects. Master the most popular tools and libraries in the data science ecosystem.',
        instructor: 'Dr. Alan Kumar',
        instructorId: 'instructor8',
        instructorInfo: {
          name: 'Dr. Alan Kumar',
          title: 'Data Science Professor at Stanford',
          rating: 4.9,
          totalReviews: 650000,
          totalStudents: 1800000,
          totalCourses: 32,
          bio: 'Dr. Alan Kumar is a Professor of Data Science at Stanford University with over 15 years of experience in machine learning and data analytics. He has published numerous research papers and worked with top tech companies.',
          avatar: 'assets/images/instructors/alan-kumar.jpg'
        },
        category: 'Data Science',
        level: 'Intermediate',
        duration: 60,
        rating: 4.7,
        enrollmentCount: 280,
        thumbnail: 'assets/images/python.jpeg',
        status: 'approved',
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04'),
        requirements: [
          'Basic programming knowledge (any language)',
          'High school level mathematics',
          'Python 3.x installed on your computer',
          'Jupyter Notebook or similar environment',
          'Curiosity about data and analytics'
        ],
        learningOutcomes: [
          'Master Python programming for data science',
          'Work with NumPy and Pandas for data manipulation',
          'Create visualizations with Matplotlib and Seaborn',
          'Implement machine learning algorithms with Scikit-learn',
          'Handle real-world datasets and data cleaning',
          'Build predictive models and evaluate their performance',
          'Use Jupyter Notebooks for data analysis',
          'Apply statistical concepts to data problems'
        ],
        tags: ['Python', 'Data Science', 'Machine Learning', 'Pandas', 'NumPy'],
        lessons: [
          {
            id: '15',
            title: 'Python Fundamentals for Data Science',
            description: 'Learn Python basics and libraries essential for data science.',
            videoUrl: 'https://www.youtube.com/watch?v=mkv5mxYu0Wk',
            duration: 45,
            order: 1,
            isPreview: true
          },
          {
            id: '16',
            title: 'Data Manipulation with Pandas',
            description: 'Master data manipulation and analysis using Pandas library.',
            videoUrl: 'https://www.youtube.com/watch?v=3qdzsvlOlS4',
            duration: 50,
            order: 2,
            isPreview: false
          },
          {
            id: '17',
            title: 'Data Visualization with Matplotlib & Seaborn',
            description: 'Create stunning visualizations for data insights.',
            videoUrl: 'https://www.youtube.com/watch?v=FN78JowwpSY',
            duration: 40,
            order: 3,
            isPreview: false
          },
          {
            id: '18',
            title: 'Machine Learning with Scikit-learn',
            description: 'Introduction to machine learning algorithms and implementation.',
            videoUrl: 'https://www.youtube.com/watch?v=7z8-QWlbmoo',
            duration: 55,
            order: 4,
            isPreview: false
          }
        ]
      },
      {
        id: '5',
        title: 'Advanced JavaScript ES6+',
        description: 'Master modern JavaScript features and advanced concepts for professional development. Learn the latest ECMAScript features and best practices.',
        instructor: 'Dr. Sarah Chen',
        instructorId: 'instructor5',
        instructorInfo: {
          name: 'Dr. Sarah Chen',
          title: 'AI Research Scientist at OpenAI',
          rating: 4.8,
          totalReviews: 380000,
          totalStudents: 950000,
          totalCourses: 18,
          bio: 'Dr. Sarah Chen is an AI Research Scientist at OpenAI with a PhD in Computer Science from MIT. She specializes in deep learning and has contributed to several breakthrough AI models.',
          avatar: 'assets/images/instructors/sarah-chen.jpg'
        },
        category: 'Programming',
        level: 'Advanced',
        duration: 45,
        rating: 4.8,
        enrollmentCount: 190,
        thumbnail: 'assets/images/advancedjs.jpeg',
        status: 'approved',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
        requirements: [
          'Strong knowledge of basic JavaScript',
          'Experience with web development',
          'Understanding of HTML and CSS',
          'Familiarity with browser developer tools',
          'Basic knowledge of Node.js is helpful'
        ],
        learningOutcomes: [
          'Master ES6+ features and modern JavaScript syntax',
          'Understand asynchronous programming with Promises and async/await',
          'Work with modules and modern development tools',
          'Implement advanced JavaScript patterns',
          'Build scalable and maintainable JavaScript applications',
          'Understand JavaScript engine internals',
          'Use modern development tools and bundlers',
          'Apply functional programming concepts'
        ],
        tags: ['JavaScript', 'ES6+', 'Async Programming', 'Web Development', 'Node.js'],
        lessons: [
          {
            id: '19',
            title: 'ES6+ Features Deep Dive',
            description: 'Explore arrow functions, destructuring, modules, and more.',
            videoUrl: 'ES6+ Features Deep Dive',
            duration: 40,
            order: 1,
            isPreview: true
          },
          {
            id: '20',
            title: 'Asynchronous JavaScript',
            description: 'Master Promises, async/await, and event loop concepts.',
            videoUrl: 'https://www.youtube.com/watch?v=QSqc6MMS6Fk',
            duration: 45,
            order: 2,
            isPreview: false
          },
          {
            id: '21',
            title: 'Advanced JavaScript Patterns',
            description: 'Learn design patterns and advanced programming techniques.',
            videoUrl: 'https://www.youtube.com/watch?v=tJCSxhm3Cc0',
            duration: 50,
            order: 3,
            isPreview: false
          }
        ]
      },
      {
        id: '6',
        title: 'Introduction to TypeScript',
        description: 'Learn the basics of TypeScript, a typed superset of JavaScript.',
        instructor: 'Alex Rodriguez',
        instructorId: 'instructor6',
        instructorInfo: {
          name: 'Alex Rodriguez',
          title: 'Mobile App Developer at Spotify',
          rating: 4.5,
          totalReviews: 280000,
          totalStudents: 750000,
          totalCourses: 22,
          bio: 'Alex Rodriguez is a Mobile App Developer at Spotify with 7 years of experience in mobile development. He has built several successful mobile apps and is passionate about Flutter development.',
          avatar: 'assets/images/instructors/alex-rodriguez.jpg'
        },
        category: 'Programming',
        level: 'Beginner',
        duration: 30,
        rating: 4.5,
        enrollmentCount: 120,
        thumbnail: 'assets/images/typescript.jpeg',
        status: 'approved',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
        requirements: [
          'Basic knowledge of JavaScript',
          'Familiarity with web development concepts'
        ],
        learningOutcomes: [
          'Understand TypeScript syntax and features',
          'Work with types, interfaces, and classes',
          'Implement TypeScript in existing JavaScript projects'
        ],
        tags: ['TypeScript', 'JavaScript', 'Web Development'],
        lessons: [
          {
            id: '22',
            title: 'Getting Started with TypeScript',
            description: 'Introduction to TypeScript and its benefits.',
            videoUrl: 'https://www.youtube.com/watch?v=v1-u2zFEN9I',
            duration: 30,
            order: 1,
            isPreview: true
          },
          {
            id: '23',
            title: 'TypeScript Basics',
            description: 'Learn about types, interfaces, and functions in TypeScript.',
            videoUrl: 'https://www.youtube.com/watch?v=ahCwqrYpIuM',
            duration: 40,
            order: 2,
            isPreview: false
          },
          {
            id: '24',
            title: 'Advanced TypeScript',
            description: 'Explore advanced TypeScript features and best practices.',
            videoUrl: 'https://www.youtube.com/watch?v=5woZK_3z25U',
            duration: 50,
            order: 3,
            isPreview: false
          }
        ]
      },
      {
        id: '7',
        title: 'Machine Learning Basics',
        description: 'An introductory course on machine learning concepts and algorithms.',
        instructor: 'Dr. Sarah Chen',
        instructorId: 'instructor5',
        instructorInfo: {
          name: 'Dr. Sarah Chen',
          title: 'AI Research Scientist at OpenAI',
          rating: 4.8,
          totalReviews: 380000,
          totalStudents: 950000,
          totalCourses: 18,
          bio: 'Dr. Sarah Chen is an AI Research Scientist at OpenAI with a PhD in Computer Science from MIT. She specializes in deep learning and has contributed to several breakthrough AI models.',
          avatar: 'assets/images/instructors/sarah-chen.jpg'
        },
        category: 'Data Science',
        level: 'Beginner',
        duration: 55,
        rating: 4.6,
        enrollmentCount: 150,
        thumbnail: 'assets/images/machinelearning.jpeg',
        status: 'approved',
        createdAt: new Date('2024-01-06'),
        updatedAt: new Date('2024-01-06'),
        requirements: [
          'Basic understanding of programming concepts',
          'Familiarity with Python is helpful but not required'
        ],
        learningOutcomes: [
          'Understand the fundamentals of machine learning',
          'Learn about supervised and unsupervised learning',
          'Implement basic machine learning algorithms'
        ],
        tags: ['Machine Learning', 'Data Science', 'Python'],
        lessons: [
          {
            id: '25',
            title: 'Introduction to Machine Learning',
            description: 'Understanding the basics of machine learning and its applications.',
            videoUrl: 'https://www.youtube.com/watch?v=h0e2HAPTGF4',
            duration: 30,
            order: 1,
            isPreview: true
          },
          {
            id: '26',
            title: 'Supervised Learning Algorithms',
            description: 'Learn about regression and classification algorithms.',
            videoUrl: 'https://www.youtube.com/watch?v=LKlOH8OLLcw',
            duration: 40,
            order: 2,
            isPreview: false
          },
          {
            id: '27',
            title: 'Unsupervised Learning Techniques',
            description: 'Explore clustering and dimensionality reduction techniques.',
            videoUrl: 'https://www.youtube.com/watch?v=D6gtZrsYi6c',
            duration: 45,
            order: 3,
            isPreview: false
          }
        ]
      },
      {
        id: '8',
        title: 'Deep Learning Fundamentals',
        description: 'An introductory course on deep learning concepts and techniques.',
        instructor: 'Dr. Alex Rodriguez',
        instructorId: 'instructor6',
        instructorInfo: {
          name: 'Alex Rodriguez',
          title: 'Mobile App Developer at Spotify',
          rating: 4.5,
          totalReviews: 280000,
          totalStudents: 750000,
          totalCourses: 22,
          bio: 'Alex Rodriguez is a Mobile App Developer at Spotify with 7 years of experience in mobile development. He has built several successful mobile apps and is passionate about Flutter development.',
          avatar: 'assets/images/instructors/alex-rodriguez.jpg'
        },
        category: 'Data Science',
        level: 'Intermediate',
        duration: 60,
        rating: 4.8,
        enrollmentCount: 200,
        thumbnail: 'assets/images/deeplearning.jpeg',
        status: 'approved',
        createdAt: new Date('2024-01-07'),
        updatedAt: new Date('2024-01-07'),
        requirements: [
          'Basic understanding of machine learning concepts',
          'Familiarity with Python and TensorFlow'
        ],
        learningOutcomes: [
          'Understand the fundamentals of deep learning',
          'Learn about neural networks and their architectures',
          'Implement deep learning models using TensorFlow'
        ],
        tags: ['Deep Learning', 'Data Science', 'TensorFlow'],
        lessons: [
          {
            id: '28',
            title: 'Introduction to Deep Learning',
            description: 'Understanding the basics of deep learning and its applications.',
            videoUrl: 'https://www.youtube.com/watch?v=FbxTVRfQFuI',
            duration: 35,
            order: 1,
            isPreview: true
          },
          {
            id: '29',
            title: 'Building Neural Networks',
            description: 'Learn about the architecture of neural networks and how to build them.',
            videoUrl: 'https://www.youtube.com/watch?v=2AhiHV7QGVk',
            duration: 50,
            order: 2,
            isPreview: false
          },
          {
            id: '30',
            title: 'Advanced Deep Learning Techniques',
            description: 'Explore advanced techniques in deep learning, including CNNs and RNNs.',
            videoUrl: 'https://www.youtube.com/watch?v=mGSAKjnNu6g',
            duration: 55,
            order: 3,
            isPreview: false
          }
        ]
      },
      {
        id: '9',
        title: 'Web Development Bootcamp',
        description: 'A comprehensive bootcamp covering HTML, CSS, JavaScript, and modern web development frameworks.',
        instructor: 'Jose Portilla',
        instructorId: 'instructor1',
        instructorInfo: {
        name: 'Jose Portilla',
        title: 'Head of Data Science at Pierian Training',
        rating: 4.6,
        totalReviews: 1281420,
        totalStudents: 4300671,
        totalCourses: 87,
        bio: 'Jose Marcial Portilla has a BS and MS in Mechanical Engineering from Santa Clara University and years of experience as a professional instructor and trainer for Data Science, Machine Learning and Python Programming. He has publications and patents in various fields such as microfluidics, materials science, and data science.',
        avatar: 'assets/images/instructors/jose-portilla.jpg'
      },
        category: 'Web Development',
        level: 'Beginner',
        duration: 70,
        rating: 4.7,
        enrollmentCount: 0,
        thumbnail: 'assets/images/webdevbootcamp.jpeg',
        status: 'approved',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08'),
        requirements: [
          'No prior programming experience required',
          'A computer with internet access',
          'Basic understanding of how the web works'
        ],
        learningOutcomes: [
          'Build responsive websites using HTML, CSS, and JavaScript',
          'Understand the fundamentals of web development',
          'Learn about modern web frameworks like React and Angular'
        ],
        tags: ['Web Development', 'HTML', 'CSS', 'JavaScript', 'React'],
        lessons: [
          {
            id: '31',
            title: 'Introduction to Web Development',
            description: 'Understanding the basics of web development and its technologies.',
            videoUrl: 'https://www.youtube.com/watch?v=HfTXHrWMGVY',
            duration: 30,
            order: 1,
            isPreview: true
          },
          {
            id: '32',
            title: 'HTML & CSS Fundamentals',
            description: 'Learn the structure and styling of web pages using HTML and CSS.',
            videoUrl: 'https://www.youtube.com/watch?v=G3e-cpL7ofc',
            duration: 45,
            order: 2,
            isPreview: false
          },
          {
            id: '33',
            title: 'JavaScript for Web Development',
            description: 'Master JavaScript programming for interactive web applications.',
            videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
            duration: 50,
            order: 3,
            isPreview: false
          },
          {
            id: '34',
            title: 'Building Single Page Applications with React',
            description: 'Learn how to build dynamic single-page applications using React.',
            videoUrl: 'https://www.youtube.com/watch?v=VVa7GKEx7c0',
            duration: 60,
            order: 4,
            isPreview: false
          }
        ]
      },
      {
        id: '10',
        title: 'Cloud Computing Essentials',
        description: 'An introductory course on cloud computing concepts, services, and deployment models.',
        instructor: 'Jane Smith',
        instructorId: 'instructor2',
        instructorInfo: {
        name: 'Jane Smith',
        title: 'Senior React Developer at Meta',
        rating: 4.8,
        totalReviews: 890000,
        totalStudents: 2500000,
        totalCourses: 45,
        bio: 'Jane Smith is a Senior React Developer at Meta with over 8 years of experience in frontend development. She has contributed to major React projects and is passionate about teaching modern web development.',
        avatar: 'assets/images/instructors/jane-smith.jpg'
      },
        category: 'Cloud Computing',
        level: 'Beginner',
        duration: 40,
        rating: 4.5,
        enrollmentCount: 180,
        thumbnail: 'assets/images/cloudcomputing.jpeg',
        status: 'approved',
        createdAt: new Date('2024-01-09'),
        updatedAt: new Date('2024-01-09'),
        requirements: [
          'Basic understanding of IT concepts',
          'Familiarity with web technologies'
        ],
        learningOutcomes: [
          'Understand cloud computing fundamentals',
          'Learn about different cloud service models (IaaS, PaaS, SaaS)',
          'Explore major cloud providers and their services'
        ],
        tags: ['Cloud Computing', 'AWS', 'Azure', 'Google Cloud'],
        lessons: [
          {
            id: '35',
            title: 'Introduction to Cloud Computing',
            description: 'Understanding the basics of cloud computing and its benefits.',
            videoUrl: 'https://www.youtube.com/watch?v=RWgW-CgdIk0',
            duration: 30,
            order: 1,
            isPreview: true
          },
          {
            id: '36',
            title: 'Cloud Service Models Explained',
            description: 'Learn about Infrastructure as a Service (IaaS), Platform as a Service (PaaS), and Software as a Service (SaaS).',
            videoUrl: 'https://www.youtube.com/watch?v=1BMO7YkwR6Y',
            duration: 40,
            order: 2,
            isPreview: false
          },
          {
            id: '37',
            title: 'Exploring Major Cloud Providers',
            description: 'Overview of AWS, Azure, and Google Cloud services.',
            videoUrl: 'https://www.youtube.com/watch?v=KPVWqKqAS_Q',
            duration: 45,
            order: 3,
            isPreview: false
          }
        ]
      },
      {
        id: '11',
        title: 'Data Science and Machine Learning',
        description: 'An introductory course on data science concepts and machine learning techniques.',
        instructor: 'Michael Brown',
        instructorId: 'instructor3',
        instructorInfo: {
        name: 'Michael Brown',
        title: 'Senior Data Scientist & Machine Learning Engineer',
        rating: 4.7,
        totalReviews: 485000,
        totalStudents: 1650000,
        totalCourses: 42,
        bio: 'Michael Brown is a Senior Data Scientist and Machine Learning Engineer with over 10 years of experience in data analytics and AI. He has worked at leading tech companies including Microsoft and Amazon, where he developed predictive models and data-driven solutions. Michael holds a PhD in Statistics from MIT and is passionate about making complex data science concepts accessible to everyone.',
        avatar: 'assets/images/instructors/michael-brown.jpg'
      },
        category: 'Data Science',
        level: 'Intermediate',
        duration: 50,
        rating: 4.8,
        enrollmentCount: 220,
        thumbnail: 'assets/images/datascienceandml.jpeg',
        status: 'approved',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
        requirements: [
          'Basic understanding of statistics',
          'Familiarity with Python programming'
        ],
        learningOutcomes: [
          'Understand data analysis techniques',
          'Learn about machine learning algorithms',
          'Explore real-world data science applications'
        ],
        tags: ['Data Science', 'Machine Learning', 'Python'],
        lessons: [
          {
            id: '38',
            title: 'Introduction to Data Science',
            description: 'Understanding the basics of data science and its importance.',
            videoUrl: 'https://www.youtube.com/watch?v=KxryzSO1Fjs',
            duration: 30,
            order: 1,
            isPreview: true
          },
          {
            id: '39',
            title: 'Data Analysis with Python',
            description: 'Learn how to analyze data using Python libraries.',
            videoUrl: 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
            duration: 45,
            order: 2,
            isPreview: false
          },
          {
            id: '40',
            title: 'Machine Learning Fundamentals',
            description: 'Overview of key machine learning concepts and algorithms.',
            videoUrl: 'https://www.youtube.com/watch?v=EuBBz3bI-aA',
            duration: 50,
            order: 3,
            isPreview: false
          }
        ]
      },
      {
        id: '12',
        title: 'Cybersecurity Essentials',
        description: 'An introductory course on cybersecurity principles, threats, and defense mechanisms.',
        instructor: 'Emily Davis',
        instructorId: 'instructor7',
        instructorInfo: {
        name: 'Emily Davis',
        title: 'Cybersecurity Expert & CISSP Certified Professional',
        rating: 4.6,
        totalReviews: 520000,
        totalStudents: 1350000,
        totalCourses: 35,
        bio: 'Emily Davis is a Cybersecurity Expert with over 12 years of experience in information security and risk management. She holds multiple certifications including CISSP, CISM, and CEH. Emily has worked with Fortune 500 companies to implement robust security frameworks and has been instrumental in preventing numerous cyber attacks. She is passionate about educating the next generation of cybersecurity professionals.',
        avatar: 'assets/images/instructors/emily-davis.jpg'
      },
        category: 'Cybersecurity',
        level: 'Beginner',
        duration: 45,
        rating: 4.6,
        enrollmentCount: 170,
        thumbnail: 'assets/images/cybersec.jpeg',
        status: 'approved',
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-13'),
        requirements: [
          'Basic understanding of computer networks',
          'Familiarity with operating systems'
        ],
        learningOutcomes: [
          'Understand cybersecurity fundamentals',
          'Learn about common cyber threats and attacks',
          'Explore defense strategies and best practices'
        ],
        tags: ['Cybersecurity', 'Network Security', 'Information Security'],
        lessons: [
          {
            id: '41',
            title: 'Introduction to Cybersecurity',
            description: 'Understanding the basics of cybersecurity and its significance.',
            videoUrl: 'https://www.youtube.com/watch?v=z5nc9MDbvkw',
            duration: 30,
            order: 1,
            isPreview: true
          },
          {
            id: '42',
            title: 'Common Cyber Threats and Attacks',
            description: 'Learn about various types of cyber threats and how they operate.',
            videoUrl: 'https://www.youtube.com/watch?v=Dk-ZqQ-bfy4',
            duration: 40,
            order: 2,
            isPreview: false
          },
          {
            id: '43',
            title: 'Defending Against Cyber Attacks',
            description: 'Explore defense mechanisms and best practices for cybersecurity.',
            videoUrl: 'https://www.youtube.com/watch?v=7oJlt4iRv0s',
            duration: 50,
            order: 3,
            isPreview: false
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
        completedLessons: ['6', '7', '8', '9'],
        status: 'completed'
      },
      {
        id: '3',
        studentId: 'student2',
        courseId: '3',
        enrolledAt: new Date('2024-01-20'),
        progress: 60,
        completedLessons: ['10', '11', '12'],
        status: 'active'
      },
      {
        id: '4',
        studentId: 'student3',
        courseId: '1',
        enrolledAt: new Date('2024-01-25'),
        progress: 20,
        completedLessons: ['1'],
        status: 'active'
      }
    ];

    const users = [
      {
        id: 'admin1',
        name: 'John Doe',
        email: 'John@coursehub.com',
        password: 'admin@24',
        role: 'admin'
      },
      {
        id: 'instructor1',
        name: 'Jose Portilla',
        email: 'jose@coursehub.com',
        password: 'instructor@24',
        role: 'instructor'
      },
      {
        id: 'instructor2',
        name: 'Jane Smith',
        email: 'jane@coursehub.com',
        password: 'instructor@24',
        role: 'instructor'
      },
      {
        id: 'instructor3',
        name: 'Michael Brown',
        email: 'michael@coursehub.com',
        password: 'instructor@24',
        role: 'instructor'
      },
      {
        id: 'instructor4',
        name: 'Mike Johnson',
        email: 'mike@coursehub.com',
        password: 'instructor@24',
        role: 'instructor'
      },
      {
        id: 'instructor5',
        name: 'Dr. Sarah Chen',
        email: 'sarah.chen@coursehub.com',
        password: 'instructor@24',
        role: 'instructor'
      },
      {
        id: 'instructor6',
        name: 'Alex Rodriguez',
        email: 'alex@coursehub.com',
        password: 'instructor@24',
        role: 'instructor'
      },
      {
        id: 'instructor7',
        name: 'Emily Davis',
        email: 'emily@coursehub.com',
        password: 'instructor@24',
        role: 'instructor'
      },
      {
        id: 'instructor8',
        name: 'Dr. Alan Kumar',
        email: 'alan@coursehub.com',
        password: 'instructor@24',
        role: 'instructor'
      },
      {
        id: 'student1',
        name: 'Student User',
        email: 'student@coursehub.com',
        password: 'student@24',
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

    const instructorStats = [
    {
      id: 'stats1',
      instructorId: 'instructor1',
      totalCourses: 3,
      totalStudents: 570,
      averageRating: 4.6,
      pendingApprovals: 1,
      activeCourses: 2,
      totalEnrollments: 650,
      completionRate: 75
    },
    {
      id: 'stats2',
      instructorId: 'instructor2',
      totalCourses: 2,
      totalStudents: 380,
      averageRating: 4.7,
      pendingApprovals: 0,
      activeCourses: 2,
      totalEnrollments: 380,
      completionRate: 80
    },
    {
      id: 'stats3',
      instructorId: 'instructor3',
      totalCourses: 1,
      totalStudents: 220,
      averageRating: 4.8,
      pendingApprovals: 0,
      activeCourses: 1,
      totalEnrollments: 220,
      completionRate: 85
    },
    {
      id: 'stats4',
      instructorId: 'instructor4',
      totalCourses: 1,
      totalStudents: 320,
      averageRating: 4.6,
      pendingApprovals: 0,
      activeCourses: 1,
      totalEnrollments: 320,
      completionRate: 70
    },
    {
      id: 'stats5',
      instructorId: 'instructor5',
      totalCourses: 2,
      totalStudents: 340,
      averageRating: 4.8,
      pendingApprovals: 1,
      activeCourses: 2,
      totalEnrollments: 340,
      completionRate: 88
    }
  ];

  const instructorNotifications = [
    {
      id: 'notif1',
      instructorId: 'instructor1',
      type: 'enrollment',
      message: 'New student enrolled in Angular Complete Course',
      courseId: '1',
      studentId: 'student1',
      timestamp: new Date(),
      isRead: false
    },
    {
      id: 'notif2',
      instructorId: 'instructor1',
      type: 'completion',
      message: 'Student completed Web Development Bootcamp',
      courseId: '9',
      studentId: 'student2',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true
    },
    {
      id: 'notif3',
      instructorId: 'instructor1',
      type: 'review',
      message: 'New 5-star review received for Angular Complete Course',
      courseId: '1',
      studentId: 'student3',
      timestamp: new Date(Date.now() - 7200000),
      isRead: false
    },
    {
      id: 'notif4',
      instructorId: 'instructor2',
      type: 'enrollment',
      message: 'New student enrolled in React Complete Course',
      courseId: '2',
      studentId: 'student1',
      timestamp: new Date(Date.now() - 1800000),
      isRead: false
    },
    {
      id: 'notif5',
      instructorId: 'instructor2',
      type: 'approval',
      message: 'Your course "Cloud Computing Essentials" has been approved',
      courseId: '10',
      timestamp: new Date(Date.now() - 86400000),
      isRead: true
    },
    {
      id: 'notif6',
      instructorId: 'instructor3',
      type: 'enrollment',
      message: 'New student enrolled in Data Science and Machine Learning',
      courseId: '11',
      studentId: 'student2',
      timestamp: new Date(Date.now() - 10800000),
      isRead: false
    }
  ];

  const loginActivities = [
    {
      id: 'login_1',
      studentId: 'student1',
      loginTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000) // 6 days ago, 9:00 AM
    },
    {
      id: 'login_2',
      studentId: 'student1',
      loginTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000) // 5 days ago, 2:00 PM
    },
    {
      id: 'login_3',
      studentId: 'student1',
      loginTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000) // 4 days ago, 10:00 AM
    },
    {
      id: 'login_4',
      studentId: 'student1',
      loginTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000) // 4 days ago, 7:00 PM
    },
    {
      id: 'login_5',
      studentId: 'student1',
      loginTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000) // 3 days ago, 8:00 AM
    },
    {
      id: 'login_6',
      studentId: 'student1',
      loginTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000) // 1 day ago, 3:00 PM
    },
    {
      id: 'login_7',
      studentId: 'student1',
      loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000) // Today, 2 hours ago
    },
    {
      id: 'login_8',
      studentId: 'student2',
      loginTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000) // 5 days ago, 10:00 AM
    },
    {
      id: 'login_9',
      studentId: 'student2',
      loginTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000) // 3 days ago, 4:00 PM
    },
    {
      id: 'login_10',
      studentId: 'student3',
      loginTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000) // 6 days ago, 11:00 AM
    }
  ];

  return { 
    courses, 
    enrollments, 
    users, 
    instructorStats, 
    instructorNotifications,
    loginActivities
  };
  }

  put(reqInfo: any): any {
  if (reqInfo.collectionName === 'courses') {
    const courses = reqInfo.collection;
    const courseIndex = courses.findIndex((course: any) => course.id === reqInfo.id);
    
    if (courseIndex !== -1) {
      // Replace the course with updated data
      courses[courseIndex] = { ...reqInfo.req.body };
      console.log('In-memory DB: Course updated successfully');
      
      return reqInfo.utils.createResponse$(() => ({
        body: courses[courseIndex],
        status: 200
      }));
    }
  }
  
  return undefined; // Let default handling occur for other collections
}
}