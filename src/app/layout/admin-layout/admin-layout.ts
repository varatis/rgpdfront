import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, AdminSidebar],
  template: `
    <div class="layout-container">
      <app-admin-sidebar></app-admin-sidebar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      min-height: 100vh;
      background: #F9FAFB;
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class AdminLayout {

}
