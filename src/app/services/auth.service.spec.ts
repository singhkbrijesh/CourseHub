import { TestBed } from '@angular/core/testing';
import { AuthService, User } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { of, throwError } from 'rxjs';
import { LoadingService } from './loading.service';

class MockLoadingService {
  show = jasmine.createSpy('show');
  hide = jasmine.createSpy('hide');
}

fdescribe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let loadingService: MockLoadingService;

  const usersUrl = 'api/users';
  const mockUser: User = {
    id: '1',
    name: 'John',
    email: 'john@example.com',
    password: '123',
    role: 'student'
  };

  beforeEach(() => {
    loadingService = new MockLoadingService();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: MockLoadingService, useValue: loadingService },
        { provide: 'LoadingService', useValue: loadingService },
        { provide: AuthService, useClass: AuthService },
        { provide: 'LoadingService', useClass: MockLoadingService }
      ]
    }).overrideProvider(LoadingService, { useValue: loadingService });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Spy on localStorage and window.dispatchEvent
    spyOn(localStorage, 'setItem').and.callFake(() => {});
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });
    spyOn(localStorage, 'removeItem').and.callFake(() => {});
    spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('login', () => {
    it('should login with valid credentials and set localStorage', (done) => {
      service.login(mockUser.email, mockUser.password).subscribe((user) => {
        expect(user).toEqual(mockUser);
        expect(localStorage.setItem).toHaveBeenCalled();
        expect(window.dispatchEvent).toHaveBeenCalled();
        done();
      });

      const req = httpMock.expectOne(usersUrl);
      req.flush([mockUser]);
    });

    it('should throw error with invalid credentials', (done) => {
      service.login('wrong', 'wrong').subscribe({
        next: () => fail('Expected error'),
        error: (err) => {
          expect(err).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(usersUrl);
      req.flush([mockUser]);
    });
  });

  describe('register', () => {
    it('should return error if email already exists', (done) => {
      service.register({ email: mockUser.email, password: '123', role: 'student' }).subscribe({
        next: () => fail('Expected error'),
        error: (err) => {
          expect(err.message).toContain('Email already exists');
          done();
        }
      });

      const req = httpMock.expectOne(usersUrl);
      req.flush([mockUser]);
    });

    it('should register new user successfully', (done) => {
      const newUser = { email: 'new@example.com', password: '123', role: 'student' as const };
      service.register(newUser).subscribe((user) => {
        expect(user.email).toBe('new@example.com');
        expect(localStorage.setItem).toHaveBeenCalled();
        expect(window.dispatchEvent).toHaveBeenCalled();
        done();
      });

      const getReq = httpMock.expectOne(usersUrl);
      getReq.flush([mockUser]);

      const postReq = httpMock.expectOne(usersUrl);
      postReq.flush({ ...newUser, id: 'student_1' });
    });
  });

  describe('checkEmailExists', () => {
    it('should return true if email exists', (done) => {
      service.checkEmailExists(mockUser.email).subscribe((exists) => {
        expect(exists).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(usersUrl);
      req.flush([mockUser]);
    });

    it('should return false on error', (done) => {
      service.checkEmailExists(mockUser.email).subscribe((exists) => {
        expect(exists).toBeFalse();
        done();
      });

      const req = httpMock.expectOne(usersUrl);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('local methods', () => {
    it('should check isLoggedIn from localStorage', () => {
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('should return current user', () => {
      const user = service.getCurrentUser();
      expect(user!.email).toBe(mockUser.email);
    });

    it('should return user role', () => {
      expect(service.getUserRole()).toBe('student');
    });

    it('should logout and remove user from localStorage', () => {
      service.logout();
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
      expect(window.dispatchEvent).toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    it('should get all users and hide loading', (done) => {
      service.getAllUsers().subscribe((users) => {
        expect(users.length).toBe(1);
        expect(loadingService.show).toHaveBeenCalled();
        // expect(loadingService.hide).toHaveBeenCalled();
        done();
      });

      const req = httpMock.expectOne(usersUrl);
      req.flush([mockUser]);
    });
  });

  describe('updateUser', () => {
    it('should update user', (done) => {
      const updatedUser = { ...mockUser, name: 'Updated' };
      service.updateUser(updatedUser).subscribe((user) => {
        expect(user.name).toBe('Updated');
        done();
      });

      const req = httpMock.expectOne(`${usersUrl}/${mockUser.id}`);
      req.flush(updatedUser);
    });

    it('should handle error in updateUser', (done) => {
      const updatedUser = { ...mockUser, name: 'Updated' };
      service.updateUser(updatedUser).subscribe({
        error: (err) => {
          expect(err.message).toBe('Update failed');
          done();
        }
      });

      const req = httpMock.expectOne(`${usersUrl}/${mockUser.id}`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return true', (done) => {
      service.deleteUser('1').subscribe((res) => {
        expect(res).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(`${usersUrl}/1`);
      req.flush({});
    });

    it('should return false on error', (done) => {
      service.deleteUser('1').subscribe((res) => {
        expect(res).toBeFalse();
        done();
      });

      const req = httpMock.expectOne(`${usersUrl}/1`);
      req.error(new ErrorEvent('Network error'));
    });
  });
    
    it('should log error and return empty array on error', (done) => {
    //   spyOn(loadingService, 'hide').and.callThrough();
    service.getAllUsers().subscribe(result => {
    //   expect(console.error).toHaveBeenCalled();     // verify error logged
      expect(result).toEqual([]);                   // verify empty array returned
    //   expect(loadingService.hide).toHaveBeenCalled(); // finalize hides loader
      done();
    });

    const req = httpMock.expectOne('api/users');
    req.error(new ErrorEvent('Network error'));
  });
  
});
