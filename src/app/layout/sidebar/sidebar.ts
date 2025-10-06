import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
 constructor(
    private router: Router
  ) {}

  logout(): void {
    this.router.navigate(['/auth/login']);
  }
}
