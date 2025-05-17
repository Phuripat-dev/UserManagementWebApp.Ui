import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDto } from '../models/CreateUserDto.model';
import { UserDto } from '../models/UserDto.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private http: HttpClient) {}

  // Create
  createUser(user: CreateUserDto): Observable<UserDto> {
    return this.http.post<UserDto>(environment.apiBaseUrl, user);
  }

  // Get All
  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(environment.apiBaseUrl);
  }

  // Get by ID
  getUserById(userId: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${environment.apiBaseUrl}/${userId}`);
  }

  // Update
  updateUser(userId: string, user: CreateUserDto): Observable<UserDto> {
    return this.http.put<UserDto>(`${environment.apiBaseUrl}/${userId}`, user);
  }

  // Delete
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/${userId}`);
  }
}
