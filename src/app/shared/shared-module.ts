import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from './components/button/button';
import { Card } from './components/card/card';
import { FormField } from './components/form-field/form-field';
import { IconLink } from './components/icon-link/icon-link';
import { Loader } from './components/loader/loader';
import { Modal } from './components/modal/modal';
import { Table } from './components/table/table';
import { Tabs } from './components/tabs/tabs';
import { DataTable } from './components/data-table/data-table';

const COMPONENTS = [
  Button,
  FormField,
  Loader,
  Modal,
  Card,
  Tabs,
  IconLink,
  Table,
  Tabs,
  DataTable
];

@NgModule({
  
  imports: [
    CommonModule,
    ...COMPONENTS
  ],
  exports: COMPONENTS
})
export class SharedModule { }
