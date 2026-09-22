import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  getPatients(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>('/api/patients');
  }

  getPatient(identifier: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`/api/patients/${identifier}`);
  }

  postPatient(identifier: string, sessionId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `/api/patients/${identifier}/post?session_id=${sessionId}`,
      {}
    );
  }

  generateFromFile(sessionId: string, identifier: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>('/api/observations/from-file', {
      session_id: sessionId,
      identifier,
    });
  }

  generateSynthetic(sessionId: string, identifier: string, count: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>('/api/observations/synthetic', {
      session_id: sessionId,
      identifier,
      count,
    });
  }

  buildBundle(sessionId: string, identifier: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>('/api/bundles/build', {
      session_id: sessionId,
      identifier,
    });
  }

  postBundle(sessionId: string, identifier: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>('/api/bundles/post', {
      session_id: sessionId,
      identifier,
    });
  }
}
