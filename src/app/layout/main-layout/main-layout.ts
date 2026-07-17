import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ClientSidebar } from '../components/client-sidebar/client-sidebar';
import { CLIENT_NAV_ITEMS } from '../../shared/config/navigation.config';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [ClientSidebar, RouterModule, MatSidenavModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  currentUser: any;
  navItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    // Filtrer les items selon le rôle de l'utilisateur
    return CLIENT_NAV_ITEMS.filter(item => item.roles.includes(user.role));
  });
}
