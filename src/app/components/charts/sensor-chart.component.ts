import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SensorReading, TimeSeriesData, ChartDataPoint } from '../../models/sensor-data.model';

@Component({
  selector: 'app-sensor-chart',
  templateUrl: './sensor-chart.component.html',
  styleUrls: ['./sensor-chart.component.scss']
})
export class SensorChartComponent implements OnChanges {
  @Input() data: SensorReading[] = [];
  @Input() chartType: 'line' | 'bar' | 'pie' | 'gauge' = 'line';
  @Input() parameter: string = '';
  @Input() height: number = 400;
  @Input() showLegend: boolean = true;
  @Input() showXAxis: boolean = true;
  @Input() showYAxis: boolean = true;
  @Input() showGridLines: boolean = true;

  // Chart data for ngx-charts
  chartData: any[] = [];
  timeSeriesData: TimeSeriesData[] = [];
  
  // Chart configuration
  view: [number, number] = [700, 400];
  colorScheme: any = {
    domain: ['#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ff9800', '#ff5722']
  };
  
  // Gauge chart specific
  gaugeData: ChartDataPoint[] = [];
  gaugeMin = 0;
  gaugeMax = 100;
  gaugeUnits = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.updateChartData();
    }
    if (changes['height']) {
      this.view[1] = this.height;
    }
  }

  updateChartData() {
    switch (this.chartType) {
      case 'line':
        this.prepareTimeSeriesData();
        break;
      case 'bar':
        this.prepareBarChartData();
        break;
      case 'pie':
        this.preparePieChartData();
        break;
      case 'gauge':
        this.prepareGaugeData();
        break;
    }
  }

  private prepareTimeSeriesData() {
    if (!this.data.length) {
      this.timeSeriesData = [];
      return;
    }

    // Group data by process stage
    const groupedData = this.data.reduce((groups: any, reading) => {
      const key = reading.processStage || 'unknown';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push({
        name: new Date(reading.timestamp).toLocaleTimeString(),
        value: reading.value,
        timestamp: reading.timestamp
      });
      return groups;
    }, {});

    this.timeSeriesData = Object.keys(groupedData).map(stage => ({
      name: stage,
      series: groupedData[stage].sort((a: any, b: any) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    }));
  }

  private prepareBarChartData() {
    if (!this.data.length) {
      this.chartData = [];
      return;
    }

    // Calculate average values per process stage
    const groupedData = this.data.reduce((groups: any, reading) => {
      const key = reading.processStage || 'unknown';
      if (!groups[key]) {
        groups[key] = { total: 0, count: 0 };
      }
      groups[key].total += reading.value;
      groups[key].count++;
      return groups;
    }, {});

    this.chartData = Object.keys(groupedData).map(stage => ({
      name: stage,
      value: Math.round((groupedData[stage].total / groupedData[stage].count) * 100) / 100
    }));
  }

  private preparePieChartData() {
    if (!this.data.length) {
      this.chartData = [];
      return;
    }

    // Count readings per OEM
    const oemCounts = this.data.reduce((counts: any, reading) => {
      counts[reading.oem] = (counts[reading.oem] || 0) + 1;
      return counts;
    }, {});

    this.chartData = Object.keys(oemCounts).map(oem => ({
      name: oem,
      value: oemCounts[oem]
    }));
  }

  private prepareGaugeData() {
    if (!this.data.length) {
      this.gaugeData = [];
      return;
    }

    // Use the latest reading for gauge
    const latestReading = this.data.reduce((latest, reading) => 
      new Date(reading.timestamp) > new Date(latest.timestamp) ? reading : latest
    );

    // Set gauge range based on thresholds or data range
    if (latestReading.thresholdMin !== undefined && latestReading.thresholdMax !== undefined) {
      this.gaugeMin = latestReading.thresholdMin * 0.8; // Add some buffer
      this.gaugeMax = latestReading.thresholdMax * 1.2;
    } else {
      const values = this.data.map(r => r.value);
      this.gaugeMin = Math.min(...values) * 0.9;
      this.gaugeMax = Math.max(...values) * 1.1;
    }

    this.gaugeUnits = latestReading.unit || '';
    
    this.gaugeData = [{
      name: latestReading.parameterName,
      value: latestReading.value
    }];
  }

  onChartSelect(event: any) {
    console.log('Chart selection:', event);
  }

  getAlertColor(value: number): string {
    if (!this.data.length) return this.colorScheme.domain[0];
    
    const reading = this.data.find(r => r.value === value);
    if (!reading) return this.colorScheme.domain[0];
    
    if (reading.isAlert) {
      return '#f44336'; // Red for alerts
    }
    return this.colorScheme.domain[0];
  }

  formatTooltip = (data: any) => {
    if (this.chartType === 'gauge') {
      return `${data.value} ${this.gaugeUnits}`;
    }
    return `${data.name}: ${data.value}`;
  };

  formatYAxisTick = (value: any) => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toFixed(1);
    }
    return value;
  };

  formatXAxisTick = (value: any) => {
    if (this.chartType === 'line' && typeof value === 'string') {
      // For time series, show shorter time format
      try {
        const date = new Date(value);
        return date.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } catch {
        return value;
      }
    }
    return value;
  };
}
