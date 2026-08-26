import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

export interface HeaderAction {
  label: string;
  icon?: string;
  action: string;
  color?: 'primary' | 'default';
  testId?: string;
}
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header {
  @Input() title = '';
  @Input() icon = '';
  @Input() actions: HeaderAction[] = [];
  @Output() actionClick = new EventEmitter<string>();

    constructor(private sanitizer: DomSanitizer) {}


    isSvg(value: string): boolean {
    return value.trim().startsWith('<svg');
  }

  getSafeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  onClick(action: string) {
    this.actionClick.emit(action);
  }
}
