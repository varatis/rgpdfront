import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  dropOrder?: number;
}

export interface TableSort {
  field: string;
  direction: 'asc' | 'desc';
}

const AUTO_COLUMN_MIN_WIDTH = 220;

const DETAIL_COLUMN_WIDTH = 40;

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  columns = input.required<TableColumn[]>();
  data = input.required<any[]>();
  trackKey = input<string>('id');
  rowClick = output<any>();
  sortChange = output<TableSort>();

  readonly sortField = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  private readonly destroyRef = inject(DestroyRef);
  private readonly container = viewChild<ElementRef<HTMLElement>>('container');

  /** Largeur du conteneur ; `0` tant qu'elle n'a pas été mesurée (aucune colonne masquée). */
  private readonly availableWidth = signal(0);

  /**
   * Colonnes réellement affichées : tant que la table ne tient pas dans son conteneur, on
   * retire la colonne la moins prioritaire (`dropOrder`). Le seuil de bascule vient donc
   * des largeurs déclarées par la page, et non de points de rupture fixes.
   */
  readonly visibleColumns = computed<TableColumn[]>(() => {
    const columns = this.columns();
    const available = this.availableWidth();

    if (!available) {
      return columns;
    }

    const hidden = new Set<string>();
    const droppable = columns
      .filter((column) => column.dropOrder)
      .sort((a, b) => a.dropOrder! - b.dropOrder!);

    for (const column of droppable) {
      const remaining = columns.filter((candidate) => !hidden.has(candidate.key));

      // Une colonne reste toujours affichée, même si elle déborde : une liste sans aucune
      // colonne ne dirait plus rien des lignes.
      if (remaining.length <= 1 || this.requiredWidth(remaining) <= available) {
        break;
      }

      hidden.add(column.key);
    }

    return hidden.size ? columns.filter((column) => !hidden.has(column.key)) : columns;
  });

  /**
   * Largeur minimale de la table, colonnes masquées déduites. Sans elle,
   * `table-layout: fixed` réduit toutes les colonnes proportionnellement dès que la place
   * manque et les colonnes `auto` tombent à quelques pixels ; avec elle, le conteneur
   * défile horizontalement — dernier recours quand il n'y a plus rien à masquer.
   */
  readonly tableMinWidth = computed(() => this.requiredWidth(this.visibleColumns()));

  constructor() {
    afterNextRender(() => {
      const element = this.container()?.nativeElement;

      if (!element || typeof ResizeObserver === 'undefined') {
        return;
      }

      const observer = new ResizeObserver(([entry]) =>
        this.availableWidth.set(entry.contentRect.width)
      );

      observer.observe(element);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  /** Largeur explicite : `auto` (ou absent) laisse la colonne absorber la place restante. */
  columnWidth(column: TableColumn): string | null {
    return column.width && column.width !== 'auto' ? column.width : null;
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) {
      return;
    }

    const direction: 'asc' | 'desc' =
      this.sortField() === column.key && this.sortDirection() === 'asc' ? 'desc' : 'asc';

    this.sortField.set(column.key);
    this.sortDirection.set(direction);
    this.sortChange.emit({ field: column.key, direction });
  }

  /** Place occupée par ces colonnes, colonne chevron comprise. */
  private requiredWidth(columns: TableColumn[]): number {
    return columns.reduce(
      (total, column) => total + (this.parsePixelWidth(column.width) ?? AUTO_COLUMN_MIN_WIDTH),
      DETAIL_COLUMN_WIDTH
    );
  }

  /** `null` pour `auto`, un pourcentage ou toute unité non exprimée en pixels. */
  private parsePixelWidth(width?: string): number | null {
    const match = width?.trim().match(/^(\d+(?:\.\d+)?)px$/);
    return match ? Number(match[1]) : null;
  }
}
