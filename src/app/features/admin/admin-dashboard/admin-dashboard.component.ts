import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../core/models/course.model';
import { HttpClient } from '@angular/common/http';
import { ChartComponent, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexTitleSubtitle, ApexStroke, ApexLegend, ApexResponsive, ApexFill } from "ng-apexcharts";
import { NgApexchartsModule } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  stroke: ApexStroke;
  legend: ApexLegend;
  responsive: ApexResponsive[];
  fill: ApexFill;
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  totalCourses = 0;
  totalUsers = 0;
  totalEnrollments = 0;
  pendingApprovals = 0;
  recentCourses: Course[] = [];
  courseStatusData: { [status: string]: number } = {};
  enrollmentsByCategory: { [category: string]: number } = {};
  usersByRole: { [role: string]: number } = {};

  public statusChartOptions: any = {
  series: [],
  chart: { type: 'donut', height: 300 },
  labels: [],
  title: { text: '' },
  legend: { position: 'bottom' },
  responsive: [],
};

public enrollmentChartOptions: any = {
  series: [],
  chart: { type: 'bar', height: 300 },
  xaxis: { categories: [] },
  title: { text: '' },
  dataLabels: { enabled: false },
};

public userChartOptions: any = {
  series: [],
  chart: { type: 'pie', height: 300 },
  labels: [],
  title: { text: '' },
  legend: { position: 'bottom' },
  responsive: [],
};

  // Chart options
  @ViewChild("statusChart") statusChart!: ChartComponent;
@ViewChild("enrollmentChart") enrollmentChart!: ChartComponent;
@ViewChild("userChart") userChart!: ChartComponent;

  constructor(private courseService: CourseService, private http: HttpClient) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.courseService.getCourses().subscribe(courses => {
      this.totalCourses = courses.length;
      this.pendingApprovals = courses.filter(c => c.status === 'pending').length;
      this.recentCourses = courses.slice(0, 5);
      this.totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);

      // Course status analytics
      this.courseStatusData = {};
      courses.forEach(c => {
        this.courseStatusData[c.status] = (this.courseStatusData[c.status] || 0) + 1;
      });

      // Enrollment by category
      this.enrollmentsByCategory = {};
      courses.forEach(c => {
        this.enrollmentsByCategory[c.category] = (this.enrollmentsByCategory[c.category] || 0) + (c.enrollmentCount || 0);
      });

      this.initStatusChart();
      this.initEnrollmentChart();
    });

    // Users analytics (mocked, replace with real user service if available)
    this.http.get<any[]>('/api/users').subscribe(users => {
      users = users.filter(u => u.role !== 'admin');
      this.totalUsers = users.length;
      this.usersByRole = {};
      users.forEach(u => {
        this.usersByRole[u.role] = (this.usersByRole[u.role] || 0) + 1;
      });
      this.initUserChart();
    });
  }

  initStatusChart() {
    this.statusChartOptions = {
      series: Object.values(this.courseStatusData),
      chart: { type: "donut", height: 300 },
      labels: Object.keys(this.courseStatusData),
      title: { text: "Courses by Status" },
      legend: { position: "bottom" },
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } }]
    };
  }

  initEnrollmentChart() {
    this.enrollmentChartOptions = {
      series: [{ name: "Enrollments", data: Object.values(this.enrollmentsByCategory) }],
      chart: { type: "bar", height: 300 },
      xaxis: { categories: Object.keys(this.enrollmentsByCategory) },
      title: { text: "Enrollments by Category" },
      dataLabels: { enabled: false }
    };
  }

  initUserChart() {
    this.userChartOptions = {
      series: Object.values(this.usersByRole),
      chart: { type: "pie", height: 300 },
      labels: Object.keys(this.usersByRole),
      title: { text: "Users by Role" },
      legend: { position: "bottom" },
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } }]
    };
  }
}