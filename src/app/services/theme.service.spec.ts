import { TestBed } from '@angular/core/testing';
import { ThemeService, Theme } from './theme.service';
import { PLATFORM_ID } from '@angular/core';

fdescribe('ThemeService', () => {
  let service: ThemeService;
  let testClasses: string[];

  beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      ThemeService,
      { provide: PLATFORM_ID, useValue: 'browser' }
    ]
  });
  service = TestBed.inject(ThemeService);

  // Patch document.body.classList methods
  testClasses = [];
  spyOn(document.body.classList, 'add').and.callFake((cls: string) => {
    testClasses.push(cls);
  });
  spyOn(document.body.classList, 'remove').and.callFake((cls: string) => {
    const idx = testClasses.indexOf(cls);
    if (idx > -1) testClasses.splice(idx, 1);
  });

  // Spy on localStorage methods
  const store: { [key: string]: string } = {};
  spyOn(window.localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
  spyOn(window.localStorage, 'setItem').and.callFake((key: string, value: string) => { store[key] = value; });
  spyOn(window.localStorage, 'removeItem').and.callFake((key: string) => { delete store[key]; });
});

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return default theme initially', () => {
    expect(service.getCurrentTheme().name).toBe('light');
  });

  it('should set and get theme', () => {
    const theme: Theme = service.themes.find(t => t.name === 'dark')!;
    service.setTheme(theme);
    expect(service.getCurrentTheme().name).toBe('dark');
    expect((globalThis as any).localStorage.getItem('selectedTheme')).toBe('dark');
  });

  it('should toggle theme', () => {
    const initialTheme = service.getCurrentTheme();
    service.toggleTheme();
    const nextTheme = service.getCurrentTheme();
    expect(nextTheme.name).not.toBe(initialTheme.name);
  });

  it('should identify dark mode', () => {
    service.setTheme(service.themes.find(t => t.name === 'dark')!);
    expect(service.isDarkMode()).toBeTrue();
    service.setTheme(service.themes.find(t => t.name === 'light')!);
    expect(service.isDarkMode()).toBeFalse();
  });

  it('should apply theme to DOM', () => {
    const theme: Theme = service.themes.find(t => t.name === 'blue')!;
    service.setTheme(theme);
    expect(testClasses).toContain('blue-theme');
  });

  it('should initialize theme from localStorage', () => {
    (globalThis as any).localStorage.setItem('selectedTheme', 'green');
    const newService = new ThemeService('browser' as any);
    expect(newService.getCurrentTheme().name).toBe('green');
  });
});