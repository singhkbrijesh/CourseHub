import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HasRoleDirective } from './has-role.directive';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  template: `
    <div *hasRole="'admin'" id="admin-content">Admin Content</div>
    <div *hasRole="['student','instructor']" id="multi-content">Student or Instructor Content</div>
  `,
  imports: [HasRoleDirective]
})
class TestComponent {}

fdescribe('HasRoleDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
  localStorage.setItem('user', JSON.stringify({ role: 'admin' }));

  TestBed.configureTestingModule({
    imports: [TestComponent], // <-- FIXED
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
  fixture = TestBed.createComponent(TestComponent); // recreate
  fixture.detectChanges();
  const adminContent = fixture.debugElement.query(By.css('#admin-content'));
  expect(adminContent).toBeNull();
});

it('should display content for allowed roles in array', () => {
  localStorage.setItem('user', JSON.stringify({ role: 'student' }));
  fixture = TestBed.createComponent(TestComponent); // recreate
  fixture.detectChanges();
  const multiContent = fixture.debugElement.query(By.css('#multi-content'));
  expect(multiContent).toBeTruthy();
  expect(multiContent.nativeElement.textContent).toContain('Student or Instructor Content');
});

it('should not display content if user role is not in allowed roles', () => {
  localStorage.setItem('user', JSON.stringify({ role: 'guest' }));
  fixture = TestBed.createComponent(TestComponent); // recreate
  fixture.detectChanges();
  const multiContent = fixture.debugElement.query(By.css('#multi-content'));
  expect(multiContent).toBeNull();
});
});