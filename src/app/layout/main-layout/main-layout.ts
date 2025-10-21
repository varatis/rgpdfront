import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';
import { ClientSidebar } from '../components/client-sidebar/client-sidebar';
import { CLIENT_NAV_ITEMS } from '../../shared/config/navigation.config';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [ AdminSidebar,ClientSidebar, RouterModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  currentUser:any;
  navItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    
    // User voit seulement 2 items, client voit tout
    if (user.role === 'user') {
      return CLIENT_NAV_ITEMS.filter(item => item.roles.includes('user'));
    }
    return CLIENT_NAV_ITEMS;
  });
}
