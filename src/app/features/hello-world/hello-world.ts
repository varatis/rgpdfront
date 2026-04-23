import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-hello-world',
  imports: [],
  templateUrl: './hello-world.html',
  styleUrl: './hello-world.scss'
})
export class HelloWorld implements OnInit {
  message = 'Chargement...';
  constructor(private apiService: ApiService) {}

   ngOnInit(): void {
    this.apiService.getHelloMessage().subscribe({
      next: (response) => {
        this.message = response;
      },
      error: (error) => {
        console.error(error);
        this.message = 'Erreur lors de la récupération du message';
      }
    });
  }
}
