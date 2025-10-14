import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClientSidebar } from '../components/client-sidebar/client-sidebar';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterModule, ClientSidebar],
  template: `
    <div class="layout-container">
      <app-client-sidebar></app-client-sidebar>
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
export class ClientLayout {

}
