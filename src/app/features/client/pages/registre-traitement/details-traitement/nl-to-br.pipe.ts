import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
/**
 * Pipe réutilisable qui transforme les séparateurs textuels en <br>.
 *
 * Modes disponibles :
 *   'default'  → supprime les tirets de début de ligne, remplace virgules et sauts de ligne par <br>
 *   'newline'  → remplace uniquement les sauts de ligne par <br>
 *   'list'     → supprime les tirets de début de ligne puis joint avec <br>
 *
 * Usage dans un template :
 *   [innerHTML]="value | nlToBr"
 *   [innerHTML]="value | nlToBr:'list'"
 *   [innerHTML]="value | nlToBr:'newline'"
 */
@Pipe({ name: 'nlToBr', standalone: true })
export class NlToBrPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  private static readonly COMMA_OR_NL = /\s*(?:,|\r?\n)\s*/g;
  private static readonly NL_ONLY = /\r?\n/g;
  private static readonly LEADING_DASH = /^\s*-\s*/;

  transform(
    value: string | null | undefined,
    mode: 'default' | 'newline' | 'list' = 'default',
  ): SafeHtml {
    if (!value) return '';

    let html: string;

    switch (mode) {
      case 'list':
        html = value
          .split(/\r?\n/)
          .map(line => line.replace(NlToBrPipe.LEADING_DASH, '').trim())
          .filter(Boolean)
          .join('<br>');
        break;

      case 'newline':
        html = value.replace(NlToBrPipe.NL_ONLY, '<br>');
        break;

      default:
        html = value
          .split(/\r?\n/)
          .map(line => line.replace(NlToBrPipe.LEADING_DASH, '').trim())
          .filter(Boolean)
          .join('\n')
          .replace(NlToBrPipe.COMMA_OR_NL, '<br>');
        break;
    }

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}