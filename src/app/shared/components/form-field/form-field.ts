import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss'
})
export class FormField {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
  @Input() required = false;
  @Input() disabled = false;

  // ✅ La ligne qu'il manquait
  @Input() value = '';

  @Input() errorState = false;
  @Input() errorMessage = '';
  @Input() hint = '';

  @Input() appearance: 'fill' | 'outline' = 'outline';

  // ✅ Correction du type : on enlève 'never' car ce n'est pas une valeur valide pour Material
  @Input() floatLabel: 'always' | 'auto' = 'auto';

  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
}
