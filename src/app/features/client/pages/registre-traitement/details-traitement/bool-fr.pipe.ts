import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transforme true/false (boolean ou string) en "Oui" / "Non".
 * Retourne '-' si la valeur est vide ou non reconnue.
 *
 * Usage :
 *   {{ value | boolFr }}
 */
@Pipe({ name: 'boolFr', standalone: true })
export class BoolFrPipe implements PipeTransform {
  transform(value: boolean | string | null | undefined): string {
    if (value == null) return '-';

    if (typeof value === 'boolean') {
      return value ? 'Oui' : 'Non';
    }

    const lower = value.toString().trim().toLowerCase();
    if (lower === 'true' || lower === 'oui') return 'Oui';
    if (lower === 'false' || lower === 'non') return 'Non';

    return value;
  }
}