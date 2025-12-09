export interface SensorReading {
  id?: number;
  processStage?: string;
  stageName?: string;
  oem: string;
  parameterName: string;
  value: number;
  unit: string;
  timestamp: string;
  isAlert: boolean;
  sensorId?: string;
  equipmentName?: string;
  thresholdMin?: number;
  thresholdMax?: number;
}

export interface ProcessStage {
  id: number;
  stageName: string;
  oem: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalReadings: number;
  recentAlerts?: number;
  alertCount?: number;
  activeStages: number;
  totalParameters?: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  timestamp?: string;
}

export interface TimeSeriesData {
  name: string;
  series: ChartDataPoint[];
}

export interface AlertSummary {
  parameterName: string;
  alertCount: number;
  processStages: string[];
}
