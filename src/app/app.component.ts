import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'WTP IoT Dashboard';
  
  constructor(private router: Router) {}

  ngOnInit() {
    // Navigate to dashboard by default
    this.router.navigate(['/dashboard']);
  }
}
