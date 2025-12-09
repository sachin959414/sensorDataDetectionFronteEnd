import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { interval, Subscription } from 'rxjs';
import { SensorDataService } from '../../services/sensor-data.service';
import { SensorReading, ProcessStage, DashboardStats } from '../../models/sensor-data.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  // Data properties
  latestReadings: SensorReading[] = [];
  processStages: ProcessStage[] = [];
  oems: string[] = [];
  parameters: string[] = [];
  dashboardStats: DashboardStats | null = null;
  alerts: SensorReading[] = [];

  // Filter properties
  selectedOem: string = 'all';
  selectedParameter: string = 'all';
  filteredReadings: SensorReading[] = [];

  // UI state
  loading = true;
  error: string | null = null;

  // Subscription for real-time updates
  private refreshSubscription?: Subscription;

  // Chart data
  chartData: any[] = [];
  chartColorScheme: any = {
    domain: ['#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b']
  };

  constructor(private sensorDataService: SensorDataService) {}

  ngOnInit() {
    this.loadInitialData();
    this.startRealTimeUpdates();
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  private async loadInitialData() {
    try {
      this.loading = true;
      
      // Load all required data
      await Promise.all([
        this.loadLatestReadings(),
        this.loadProcessStages(),
        this.loadOems(),
        this.loadParameters(),
        this.loadDashboardStats(),
        this.loadAlerts()
      ]);
      
    } catch (error) {
      this.error = 'Failed to load dashboard data';
      console.error('Error loading dashboard data:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadLatestReadings() {
    try {
      this.latestReadings = await this.sensorDataService.getLatestReadings().toPromise() || [];
      this.applyFilters();
      this.updateChartData();
    } catch (error) {
      console.error('Error loading latest readings:', error);
    }
  }

  private async loadProcessStages() {
    try {
      this.processStages = await this.sensorDataService.getProcessStages().toPromise() || [];
    } catch (error) {
      console.error('Error loading process stages:', error);
    }
  }

  private async loadOems() {
    try {
      this.oems = await this.sensorDataService.getOems().toPromise() || [];
    } catch (error) {
      console.error('Error loading OEMs:', error);
    }
  }

  private async loadParameters() {
    try {
      this.parameters = await this.sensorDataService.getParameters().toPromise() || [];
    } catch (error) {
      console.error('Error loading parameters:', error);
    }
  }

  private async loadDashboardStats() {
    try {
      this.dashboardStats = await this.sensorDataService.getDashboardStats().toPromise() || null;
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  }

  private async loadAlerts() {
    try {
      this.alerts = await this.sensorDataService.getAlerts().toPromise() || [];
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }

  private startRealTimeUpdates() {
    // Refresh data every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadLatestReadings();
      this.loadDashboardStats();
      this.loadAlerts();
    });
  }

  onOemFilterChange(event: MatSelectChange) {
    this.selectedOem = event.value;
    this.applyFilters();
  }

  onParameterFilterChange(event: MatSelectChange) {
    this.selectedParameter = event.value;
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.latestReadings];

    // Apply OEM filter
    if (this.selectedOem !== 'all') {
      filtered = filtered.filter(reading => reading.oem === this.selectedOem);
    }

    // Apply parameter filter
    if (this.selectedParameter !== 'all') {
      filtered = filtered.filter(reading => reading.parameterName === this.selectedParameter);
    }

    this.filteredReadings = filtered;
    this.updateChartData();
  }

  private updateChartData() {
    // Prepare data for charts (group by parameter)
    const parameterGroups = this.filteredReadings.reduce((groups: any, reading) => {
      if (!groups[reading.parameterName]) {
        groups[reading.parameterName] = [];
      }
      groups[reading.parameterName].push(reading);
      return groups;
    }, {});

    this.chartData = Object.keys(parameterGroups).map(param => ({
      name: param,
      value: parameterGroups[param].length,
      data: parameterGroups[param]
    }));
  }

  refreshData() {
    this.loadLatestReadings();
  }

  getAlertSeverityColor(reading: SensorReading): string {
    if (!reading.isAlert) return 'primary';
    
    // Determine severity based on how far outside thresholds
    const value = reading.value || 0;
    const min = reading.thresholdMin;
    const max = reading.thresholdMax;
    
    if (min && value < min) {
      const deviation = Math.abs((value - min) / min);
      return deviation > 0.2 ? 'warn' : 'accent';
    }
    
    if (max && value > max) {
      const deviation = Math.abs((value - max) / max);
      return deviation > 0.2 ? 'warn' : 'accent';
    }
    
    return 'accent';
  }

  getStatusIcon(reading: SensorReading): string {
    return reading.isAlert ? 'warning' : 'check_circle';
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }
}
