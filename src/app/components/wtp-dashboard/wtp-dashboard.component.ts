import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { SensorDataService } from '../../services/sensor-data.service';

export interface WTPProcess {
  id: string;
  name: string;
  icon: string;
  color: string;
  kpis: KPI[];
  status: 'normal' | 'warning' | 'critical';
}

export interface KPI {
  name: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  target?: number;
  format?: 'number' | 'percentage' | 'temperature';
  trend?: 'up' | 'down' | 'stable';
}

@Component({
  selector: 'app-wtp-dashboard',
  templateUrl: './wtp-dashboard.component.html',
  styleUrls: ['./wtp-dashboard.component.scss']
})
export class WTPDashboardComponent implements OnInit, OnDestroy {
  
  selectedTabIndex = 0;
  loading = false;
  private refreshSubscription?: Subscription;

  // WTP Process definitions
  wtpProcesses: WTPProcess[] = [
    {
      id: 'raw-water-intake',
      name: 'Raw Water Intake',
      icon: 'water_drop',
      color: '#2196F3',
      status: 'normal',
      kpis: [
        { name: 'Flow Rate', value: 2.14, unit: 'ML/h', min: 0, max: 5, target: 2.5, format: 'number', trend: 'stable' },
        { name: 'Water Level', value: 3.2, unit: 'm', min: 0, max: 5, target: 4, format: 'number', trend: 'down' },
        { name: 'Turbidity', value: 15.8, unit: 'NTU', min: 0, max: 50, target: 10, format: 'number', trend: 'up' },
        { name: 'pH Level', value: 7.2, unit: '', min: 6, max: 8.5, target: 7.5, format: 'number', trend: 'stable' },
        { name: 'Temperature', value: 22.5, unit: '°C', min: 0, max: 40, format: 'temperature', trend: 'stable' }
      ]
    },
    {
      id: 'pretreatment',
      name: 'Pre-Treatment',
      icon: 'filter_alt',
      color: '#FF9800',
      status: 'normal',
      kpis: [
        { name: 'Coagulant Dosage', value: 12.5, unit: 'mg/L', min: 0, max: 30, target: 15, format: 'number', trend: 'stable' },
        { name: 'Screening Efficiency', value: 95.2, unit: '%', min: 0, max: 100, target: 95, format: 'percentage', trend: 'up' },
        { name: 'Mixer Speed', value: 150, unit: 'RPM', min: 0, max: 300, target: 180, format: 'number', trend: 'stable' },
        { name: 'Chemical Feed Rate', value: 8.7, unit: 'L/h', min: 0, max: 20, target: 10, format: 'number', trend: 'down' },
        { name: 'pH After Coagulation', value: 6.8, unit: '', min: 6, max: 8, target: 7, format: 'number', trend: 'stable' }
      ]
    },
    {
      id: 'sedimentation',
      name: 'Sedimentation',
      icon: 'layers',
      color: '#4CAF50',
      status: 'warning',
      kpis: [
        { name: 'Settling Velocity', value: 0.8, unit: 'm/h', min: 0, max: 2, target: 1, format: 'number', trend: 'down' },
        { name: 'Sludge Level', value: 2.1, unit: 'm', min: 0, max: 3, target: 1.5, format: 'number', trend: 'up' },
        { name: 'Overflow Rate', value: 15.2, unit: 'm³/m²/h', min: 0, max: 30, target: 20, format: 'number', trend: 'stable' },
        { name: 'Turbidity Removal', value: 85.5, unit: '%', min: 0, max: 100, target: 90, format: 'percentage', trend: 'down' },
        { name: 'Clarified Water Turbidity', value: 3.2, unit: 'NTU', min: 0, max: 10, target: 2, format: 'number', trend: 'up' }
      ]
    },
    {
      id: 'filtration',
      name: 'Filtration',
      icon: 'filter_list',
      color: '#9C27B0',
      status: 'normal',
      kpis: [
        { name: 'Filter Loading Rate', value: 8.5, unit: 'm/h', min: 0, max: 15, target: 10, format: 'number', trend: 'stable' },
        { name: 'Head Loss', value: 1.2, unit: 'm', min: 0, max: 3, target: 1.5, format: 'number', trend: 'up' },
        { name: 'Backwash Frequency', value: 2, unit: 'times/day', min: 0, max: 6, target: 3, format: 'number', trend: 'stable' },
        { name: 'Filtered Water Turbidity', value: 0.8, unit: 'NTU', min: 0, max: 2, target: 1, format: 'number', trend: 'stable' },
        { name: 'Filter Efficiency', value: 98.2, unit: '%', min: 0, max: 100, target: 95, format: 'percentage', trend: 'up' }
      ]
    },
    {
      id: 'disinfection',
      name: 'Disinfection',
      icon: 'sanitizer',
      color: '#F44336',
      status: 'normal',
      kpis: [
        { name: 'Chlorine Residual', value: 1.47, unit: 'mg/L', min: 0, max: 3, target: 1.5, format: 'number', trend: 'stable' },
        { name: 'Contact Time', value: 30.2, unit: 'min', min: 0, max: 60, target: 30, format: 'number', trend: 'stable' },
        { name: 'UV Dose', value: 40, unit: 'mJ/cm²', min: 0, max: 60, target: 40, format: 'number', trend: 'stable' },
        { name: 'Disinfection Efficiency', value: 99.9, unit: '%', min: 0, max: 100, target: 99.9, format: 'percentage', trend: 'stable' },
        { name: 'E.coli Count', value: 0, unit: 'CFU/100ml', min: 0, max: 10, target: 0, format: 'number', trend: 'stable' }
      ]
    },
    {
      id: 'finished-water',
      name: 'Finished Water',
      icon: 'opacity',
      color: '#00BCD4',
      status: 'normal',
      kpis: [
        { name: 'Storage Level', value: 75.5, unit: '%', min: 0, max: 100, target: 80, format: 'percentage', trend: 'down' },
        { name: 'Distribution Pressure', value: 3.5, unit: 'bar', min: 0, max: 6, target: 4, format: 'number', trend: 'stable' },
        { name: 'Water Quality Index', value: 92.3, unit: '%', min: 0, max: 100, target: 95, format: 'percentage', trend: 'up' },
        { name: 'Total Production', value: 1250, unit: 'kL/day', min: 0, max: 2000, target: 1500, format: 'number', trend: 'up' },
        { name: 'Energy Consumption', value: 0.35, unit: 'kWh/m³', min: 0, max: 1, target: 0.4, format: 'number', trend: 'down' }
      ]
    }
  ];

  // Overview KPIs for the main dashboard
  overviewKPIs: KPI[] = [
    { name: 'Overall Efficiency', value: 94.2, unit: '%', target: 95, format: 'percentage' },
    { name: 'Total Flow Rate', value: 2.14, unit: 'ML/h', target: 2.5, format: 'number' },
    { name: 'Energy Efficiency', value: 88.7, unit: '%', target: 90, format: 'percentage' },
    { name: 'Water Quality Score', value: 92.3, unit: '', target: 95, format: 'number' },
    { name: 'Active Alarms', value: 2, unit: '', target: 0, format: 'number' },
    { name: 'System Availability', value: 99.2, unit: '%', target: 99.5, format: 'percentage' }
  ];

  constructor(private sensorDataService: SensorDataService) {}

  ngOnInit() {
    this.startRealTimeUpdates();
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  private startRealTimeUpdates() {
    // Update KPIs every 10 seconds
    this.refreshSubscription = interval(10000).subscribe(() => {
      this.updateKPIs();
    });
  }

  private updateKPIs() {
    // Simulate real-time data updates
    this.wtpProcesses.forEach(process => {
      process.kpis.forEach(kpi => {
        // Add small random variations to simulate real data
        const variation = (Math.random() - 0.5) * 0.1;
        kpi.value = Math.max(0, kpi.value + variation);
        
        // Update trend
        if (variation > 0.05) kpi.trend = 'up';
        else if (variation < -0.05) kpi.trend = 'down';
        else kpi.trend = 'stable';
      });
      
      // Update process status based on KPI values
      this.updateProcessStatus(process);
    });
  }

  private updateProcessStatus(process: WTPProcess) {
    let criticalCount = 0;
    let warningCount = 0;
    
    process.kpis.forEach(kpi => {
      if (kpi.max && kpi.value > kpi.max * 0.9) criticalCount++;
      else if (kpi.target && Math.abs(kpi.value - kpi.target) > kpi.target * 0.1) warningCount++;
    });
    
    if (criticalCount > 0) process.status = 'critical';
    else if (warningCount > 0) process.status = 'warning';
    else process.status = 'normal';
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      default: return 'check_circle';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'critical': return '#F44336';
      case 'warning': return '#FF9800';
      default: return '#4CAF50';
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  formatKPIValue(kpi: KPI): string {
    switch (kpi.format) {
      case 'percentage':
        return `${kpi.value.toFixed(1)}${kpi.unit}`;
      case 'temperature':
        return `${kpi.value.toFixed(1)}${kpi.unit}`;
      default:
        return `${kpi.value.toFixed(kpi.value < 10 ? 2 : 1)} ${kpi.unit}`;
    }
  }

  getKPIProgressValue(kpi: KPI): number {
    if (kpi.max) {
      return (kpi.value / kpi.max) * 100;
    }
    return kpi.format === 'percentage' ? kpi.value : 50;
  }

  getKPIStatus(kpi: KPI): string {
    if (kpi.max && kpi.value > kpi.max * 0.9) return 'critical';
    if (kpi.target && Math.abs(kpi.value - kpi.target) > kpi.target * 0.15) return 'warning';
    return 'normal';
  }

  getTrendColor(trend?: string): string {
    switch (trend) {
      case 'up': return '#4CAF50';
      case 'down': return '#F44336';
      default: return '#9E9E9E';
    }
  }

  getStatIcon(statName: string): string {
    switch (statName.toLowerCase()) {
      case 'overall efficiency': return 'trending_up';
      case 'total flow rate': return 'water_drop';
      case 'energy efficiency': return 'electric_bolt';
      case 'water quality score': return 'water_damage';
      case 'active alarms': return 'warning';
      case 'system availability': return 'check_circle';
      default: return 'analytics';
    }
  }

  getProcessEmoji(processId: string): string {
    switch (processId) {
      case 'raw-water-intake': return '🚰';
      case 'pretreatment': return '🔍';
      case 'sedimentation': return '🏺';
      case 'filtration': return '🗳️';
      case 'disinfection': return '🧪';
      case 'finished-water': return '💧';
      default: return '⚙️';
    }
  }

  getTrendEmoji(trend?: string): string {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  }

  getTrendDescription(trend?: string): string {
    switch (trend) {
      case 'up': return 'Increasing';
      case 'down': return 'Decreasing';
      default: return 'Stable';
    }
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getActiveAlarmsCount(): number {
    return this.wtpProcesses.filter(process => process.status !== 'normal').length;
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
