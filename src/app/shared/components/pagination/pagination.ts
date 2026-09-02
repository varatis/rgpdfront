import { Component, input, output, ViewChild } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [MatPaginatorModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  currentPage = input(1);
  totalPages = input(1);
  pageSize = input(10);
  pageSizeOptions = input([5, 10, 25, 50]);
  pageChange = output<number>();
  pageSizeChange = output<number>();

  get length() {
    return Math.max(0, this.totalPages()) * this.pageSize();
  }

  get pageIndex(): number {
    return Math.max(0, this.currentPage() - 1);
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event.pageIndex + 1);
    if (event.pageSize !== this.pageSize()) {
      this.pageSizeChange.emit(event.pageSize);
    }
  }
}
