import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateFr', standalone: true })
export class DateFrPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '-';

    const datePart = value.trim().slice(0, 10);
    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) return value;

    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
}