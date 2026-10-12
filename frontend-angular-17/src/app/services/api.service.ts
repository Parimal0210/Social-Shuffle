import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { AuthResponse, LoginCredentials, RegisterCredentials, ShuffleEvent, Game, Participant, Registration } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://social-shuffle-backend.onrender.com/api';

  constructor(private http: HttpClient) {}

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Auth endpoints
  login(creds: LoginCredentials): Observable<AuthResponse | null> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, creds).pipe(
      catchError(() => of(null))
    );
  }

  register(data: RegisterCredentials): Observable<AuthResponse | null> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, data).pipe(
      catchError(() => of(null))
    );
  }

  // Events endpoints
  getEvents(): Observable<ShuffleEvent[]> {
    return this.http.get<ShuffleEvent[]>(`${this.baseUrl}/events`).pipe(
      catchError(() => of([]))
    );
  }

  // Games endpoints
  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.baseUrl}/games`).pipe(
      catchError(() => of([]))
    );
  }

  // Participants
  getParticipants(): Observable<Participant[]> {
    return this.http.get<Participant[]>(`${this.baseUrl}/participants`).pipe(
      catchError(() => of([]))
    );
  }

  // Registrations
  getRegistrations(): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${this.baseUrl}/registrations`).pipe(
      catchError(() => of([]))
    );
  }

  checkIn(regId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/registrations/${regId}/check-in`, {}).pipe(
      catchError(() => of(null))
    );
  }

  createRegistration(reg: Partial<Registration>): Observable<any> {
    return this.http.post(`${this.baseUrl}/registrations`, reg).pipe(
      catchError(() => of(null))
    );
  }
}
