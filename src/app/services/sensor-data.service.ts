import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SensorReading, ProcessStage, DashboardStats } from '../models/sensor-data.model';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  
  private baseUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) { }

  /**
   * Get latest sensor readings
   */
  getLatestReadings(): Observable<SensorReading[]> {
    return this.http.get<SensorReading[]>(`${this.baseUrl}/latest-readings`);
  }

  /**
   * Get readings filtered by OEM
   */
  getReadingsByOem(oem: string): Observable<SensorReading[]> {
    return this.http.get<SensorReading[]>(`${this.baseUrl}/readings/oem/${oem}`);
  }

  /**
   * Get historical data for a specific parameter and process stage
   */
  getHistoricalData(stageId: number, parameter: string, startTime: Date, endTime: Date): Observable<SensorReading[]> {
    const params = new HttpParams()
      .set('stageId', stageId.toString())
      .set('parameter', parameter)
      .set('startTime', startTime.toISOString())
      .set('endTime', endTime.toISOString());
    
    return this.http.get<SensorReading[]>(`${this.baseUrl}/historical`, { params });
  }

  /**
   * Get all alert readings
   */
  getAlerts(): Observable<SensorReading[]> {
    return this.http.get<SensorReading[]>(`${this.baseUrl}/alerts`);
  }

  /**
   * Get recent readings with pagination
   */
  getRecentReadings(page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(`${this.baseUrl}/recent`, { params });
  }

  /**
   * Get available parameters
   */
  getParameters(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/parameters`);
  }

  /**
   * Get all active process stages
   */
  getProcessStages(): Observable<ProcessStage[]> {
    return this.http.get<ProcessStage[]>(`${this.baseUrl}/process-stages`);
  }

  /**
   * Get all OEM manufacturers
   */
  getOems(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/oems`);
  }

  /**
   * Get readings for a specific parameter across all stages
   */
  getReadingsByParameter(parameter: string): Observable<SensorReading[]> {
    return this.http.get<SensorReading[]>(`${this.baseUrl}/readings/parameter/${parameter}`);
  }

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }
}
