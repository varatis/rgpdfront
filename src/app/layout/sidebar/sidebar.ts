import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { computed } from '@angular/core';
import { ADMIN_NAV_ITEMS, CLIENT_NAV_ITEMS } from '../../shared/config/navigation.config';




@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
currentUser: any;
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUser;
  }

   navItems = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return ADMIN_NAV_ITEMS;
      case 'client':
        return CLIENT_NAV_ITEMS;
      case 'user':
        return CLIENT_NAV_ITEMS.filter(item => item.roles.includes('user'));
      default:
        return [];
    }
  });

  logo = computed(() => {
    const user = this.currentUser();
    if (!user) return 'assets/images/creative_logo.png';
    
    if (user.role === 'admin') {
      return 'assets/images/creative_logo.png';
    }
    return user.clientLogo || 'assets/images/creative_logo.png';
  });

  isAdmin = computed(() => this.currentUser()?.role === 'admin');



  getIconPath(iconName: string): string {
    const icons: { [key: string]: string } = {
      'clients': 'M0 20V3.75L5 0L10 3.75V6H20V20H0ZM2 18H4V16H2V18ZM2 14H4V12H2V14ZM2 10H4V8H2V10ZM2 6H4V4H2V6ZM6 6H8V4H6V6ZM6 18H18V8H6V18ZM12 12V10H16V12H12ZM12 16V14H16V16H12ZM8 12V10H10V12H8ZM8 16V14H10V16H8Z',
      'administrators': 'M12 13C11.0167 13 10.1875 12.6625 9.5125 11.9875C8.8375 11.3125 8.5 10.4833 8.5 9.5C8.5 8.51667 8.8375 7.6875 9.5125 7.0125C10.1875 6.3375 11.0167 6 12 6C12.9833 6 13.8125 6.3375 14.4875 7.0125C15.1625 7.6875 15.5 8.51667 15.5 9.5C15.5 10.4833 15.1625 11.3125 14.4875 11.9875C13.8125 12.6625 12.9833 13 12 13ZM12 11C12.4333 11 12.7917 10.8583 13.075 10.575C13.3583 10.2917 13.5 9.93333 13.5 9.5C13.5 9.06667 13.3583 8.70833 13.075 8.425C12.7917 8.14167 12.4333 8 12 8C11.5667 8 11.2083 8.14167 10.925 8.425C10.6417 8.70833 10.5 9.06667 10.5 9.5C10.5 9.93333 10.6417 10.2917 10.925 10.575C11.2083 10.8583 11.5667 11 12 11ZM12 22C9.68333 21.4167 7.77083 20.0875 6.2625 18.0125C4.75417 15.9375 4 13.6333 4 11.1V5L12 2L20 5V11.1C20 13.6333 19.2458 15.9375 17.7375 18.0125C16.2292 20.0875 14.3167 21.4167 12 22ZM12 4.125L6 6.375V11.1C6 12 6.125 12.875 6.375 13.725C6.625 14.575 6.96667 15.375 7.4 16.125C8.1 15.775 8.83333 15.5 9.6 15.3C10.3667 15.1 11.1667 15 12 15C12.8333 15 13.6333 15.1 14.4 15.3C15.1667 15.5 15.9 15.775 16.6 16.125C17.0333 15.375 17.375 14.575 17.625 13.725C17.875 12.875 18 12 18 11.1V6.375L12 4.125ZM12 17C11.4 17 10.8167 17.0667 10.25 17.2C9.68333 17.3333 9.14167 17.5167 8.625 17.75C9.10833 18.25 9.63333 18.6833 10.2 19.05C10.7667 19.4167 11.3667 19.7 12 19.9C12.6333 19.7 13.2333 19.4167 13.8 19.05C14.3667 18.6833 14.8917 18.25 15.375 17.75C14.8583 17.5167 14.3167 17.3333 13.75 17.2C13.1833 17.0667 12.6 17 12 17Z',
      'preconisations': 'M8 18V12H10V14H18V16H10V18H8ZM0 16V14H6V16H0ZM4 12V10H0V8H4V6H6V12H4ZM8 10V8H18V10H8ZM12 6V0H14V2H18V4H14V6H12ZM0 4V2H10V4H0Z',
      'registre': 'M7 25.6667C6.02778 25.6667 5.20139 25.3264 4.52083 24.6458C3.84028 23.9653 3.5 23.1389 3.5 22.1667V18.6667H7V2.33333H24.5V22.1667C24.5 23.1389 24.1597 23.9653 23.4792 24.6458C22.7986 25.3264 21.9722 25.6667 21 25.6667H7ZM21 23.3333C21.3306 23.3333 21.6076 23.2215 21.8312 22.9979C22.0549 22.7743 22.1667 22.4972 22.1667 22.1667V4.66666H9.33333V18.6667H19.8333V22.1667C19.8333 22.4972 19.9451 22.7743 20.1688 22.9979C20.3924 23.2215 20.6694 23.3333 21 23.3333ZM10.5 10.5V8.16666H21V10.5H10.5ZM10.5 14V11.6667H21V14H10.5ZM7 23.3333H17.5V21H5.83333V22.1667C5.83333 22.4972 5.94514 22.7743 6.16875 22.9979C6.39236 23.2215 6.66944 23.3333 7 23.3333ZM7 23.3333H5.83333H17.5H7Z',
      'suivi': 'M9 11l3 3L22 4',
      'demandes': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
      'violation': 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
      'sous-traitant': 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'
    };
    return icons[iconName] || '';
  }

  logout(): void {
    this.authService.logout();
  }

}
