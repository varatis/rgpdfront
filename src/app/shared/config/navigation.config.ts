import { NavItem } from '../interfaces/navigation.interface';

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Connexion front et back',
    route: 'hello-world',
    icon: 'preconisations',
    roles: ['admin']
  },
  {
    label: 'Clients',
    route: '/clients',
    icon: 'clients',
    roles: ['admin']
  },
  {
    label: 'Administrateurs',
    route: '/administrators',
    icon: 'administrators',
    roles: ['admin']
  },
  {
    label: 'Gestion des préconisations',
    route: '/preconisations',
    icon: 'preconisations',
    roles: ['admin']
  }
];

export const CLIENT_NAV_ITEMS: NavItem[] = [
  {
    label: 'Connexion front et back',
    route: 'hello-world',
    icon: 'registre',
    roles: ['admin', 'client', 'user']
  },
  {
    label: 'Compte Client',
    route: 'compte-client',
    icon: 'clients',
    roles: ['client']
  },
  {
    label: 'Registre de traitement',
    route: 'registre-traitement',
    icon: 'registre',
    roles: ['client', 'user']
  },
  {
    label: 'Suivi des préconisations',
    route: 'suivi-preconisations',
    icon: 'suivi',
    roles: ['client', 'user']
  },
  {
    label: 'Registre des demandes',
    route: 'registre-demandes',
    icon: 'demandes',
    roles: ['client', 'user']
  },
  {
    label: 'Recueil de violation',
    route: 'recueil-violation',
    icon: 'violation',
    roles: ['user']
  },
  {
    label: 'Sous-traitant DCP',
    route: 'sous-traitant-dcp',
    icon: 'sous-traitant',
    roles: ['client', 'user']
  }
];