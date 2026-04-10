import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Time } from '../models/time.model';

@Injectable({
  providedIn: 'root'
})
export class TimesService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTimes(): Observable<Time[]> {
    return this.http.get<Time[]>(`${this.apiUrl}/times`);
  }
}
