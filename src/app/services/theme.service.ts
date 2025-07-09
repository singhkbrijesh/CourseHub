import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface Theme {
  name: string;
  displayName: string;
  class: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public themes: Theme[] = [
    {
      name: 'light',
      displayName: 'Light',
      class: 'light-theme',
      icon: 'light_mode'
    },
    {
      name: 'dark',
      displayName: 'Dark',
      class: 'dark-theme',
      icon: 'dark_mode'
    },
    {
      name: 'blue',
      displayName: 'Blue',
      class: 'blue-theme',
      icon: 'palette'
    },
    {
      name: 'green',
      displayName: 'Green',
      class: 'green-theme',
      icon: 'eco'
    },
    {
      name: 'purple',
      displayName: 'Purple',
      class: 'purple-theme',
      icon: 'auto_awesome'
    }
  ];

  private currentThemeSubject = new BehaviorSubject<Theme>(this.getDefaultTheme());
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeTheme();
  }

  private getDefaultTheme(): Theme {
    // Return the first theme (light theme) as default
    return {
      name: 'light',
      displayName: 'Light',
      class: 'light-theme',
      icon: 'light_mode'
    };
  }

  private initializeTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('selectedTheme');
      if (savedTheme) {
        const theme = this.themes.find(t => t.name === savedTheme);
        if (theme) {
          this.setTheme(theme);
        }
      } else {
        // Apply default theme if no saved theme
        this.applyThemeToDOM(this.getDefaultTheme());
      }
    }
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  setTheme(theme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      this.applyThemeToDOM(theme);
      localStorage.setItem('selectedTheme', theme.name);
      this.currentThemeSubject.next(theme);
    }
  }

  private applyThemeToDOM(theme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      const body = document.body;
      
      // Remove all theme classes
      this.themes.forEach(t => {
        body.classList.remove(t.class);
      });
      
      // Add new theme class
      body.classList.add(theme.class);
    }
  }

  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const currentIndex = this.themes.findIndex(t => t.name === currentTheme.name);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.setTheme(this.themes[nextIndex]);
  }

  isDarkMode(): boolean {
    return this.getCurrentTheme().name === 'dark';
  }
}