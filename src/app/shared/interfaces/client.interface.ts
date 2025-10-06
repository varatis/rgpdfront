import { User } from './user.interface';

export interface Client {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  users: User[];
  createdAt: Date;
  updatedAt: Date;
}