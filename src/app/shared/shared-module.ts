import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from './components/button/button';
import { Card } from './components/card/card';
import { FormField } from './components/form-field/form-field';
import { IconLink } from './components/icon-link/icon-link';
import { Loader } from './components/loader/loader';
import { Modal } from './components/modal/modal';
import { Table } from './components/table/table';
import { TreatmentTabsComponent } from './components/tabs/treatmentTabs';
import { DataTable } from './components/data-table/data-table';
import { FilterPanel } from './components/filter-panel/filter-panel';

import { Pagination } from './components/pagination/pagination';
import { Header } from './components/header/header';
import {  PageTabsComponent } from './components/page-tabs/page-tab/page-tab';

const COMPONENTS = [
  Button,
  FormField,
  Loader,
  Modal,
  Card,
  IconLink,
  Table,
  TreatmentTabsComponent,
  DataTable,
  DataView,
  FilterPanel,
  Pagination,
  Header,
  PageTabsComponent
];

@NgModule({
  
  imports: [
    CommonModule,
    ...COMPONENTS
  ],
  exports: COMPONENTS
})
export class SharedModule { }
