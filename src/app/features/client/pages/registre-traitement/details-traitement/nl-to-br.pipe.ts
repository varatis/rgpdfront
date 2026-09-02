import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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