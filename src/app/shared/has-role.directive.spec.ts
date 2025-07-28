import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HasRoleDirective } from './has-role.directive';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <div *hasRole="'admin'" id="admin-content">Admin Content</div>
    <div *hasRole="['student','instructor']" id="multi-content">Student or Instructor Content</div>
  `
})
class TestComponent {}

describe('HasRoleDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    // Set up a mock user in localStorage
    localStorage.setItem('user', JSON.stringify({ role: 'admin' }));

    TestBed.configureTestingModule({
      declarations: [],
      imports: [TestComponent, HasRoleDirective],
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('user');
  });

  it('should display content for allowed single role', () => {
    const adminContent = fixture.debugElement.query(By.css('#admin-content'));
    expect(adminContent).toBeTruthy();
    expect(adminContent.nativeElement.textContent).toContain('Admin Content');
  });

  it('should not display content for disallowed roles', () => {
    localStorage.setItem('user', JSON.stringify({ role: 'student' }));
    fixture.detectChanges();
    const adminContent = fixture.debugElement.query(By.css('#admin-content'));
    expect(adminContent).toBeNull();
  });

  it('should display content for allowed roles in array', () => {
    localStorage.setItem('user', JSON.stringify({ role: 'student' }));
    fixture.detectChanges();
    const multiContent = fixture.debugElement.query(By.css('#multi-content'));
    expect(multiContent).toBeTruthy();
    expect(multiContent.nativeElement.textContent).toContain('Student or Instructor Content');
  });

  it('should not display content if user role is not in allowed roles', () => {
    localStorage.setItem('user', JSON.stringify({ role: 'guest' }));
    fixture.detectChanges();
    const multiContent = fixture.debugElement.query(By.css('#multi-content'));
    expect(multiContent).toBeNull();
  });
});