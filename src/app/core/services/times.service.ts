import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Time, TimeDetail } from '../models/time.model';

@Injectable({
  providedIn: 'root'
})
export class TimesService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTimes(): Observable<Time[]> {
    return this.http.get<Time[]>(`${this.apiUrl}/times`);
  }

  getTimeById(id: number): Observable<TimeDetail> {
    return this.http.get<TimeDetail>(`${this.apiUrl}/times/${id}`);
  }

  createTime(nome: string): Observable<Time> {
    return this.http.post<Time>(`${this.apiUrl}/times`, { nome });
  }

  updateTime(id: number, nome: string): Observable<Time> {
    return this.http.patch<Time>(`${this.apiUrl}/times/${id}`, { nome });
  }

  deleteTime(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/times/${id}`);
  }
}
