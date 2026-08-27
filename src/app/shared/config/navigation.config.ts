import { NavItem } from '../interfaces/navigation.interface';

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Clients',
    route: 'clients',
    icon: 'clients',
    roles: []
  },
  {
    label: 'Administrateurs',
    route: 'administrators',
    icon: 'administrators',
    roles: []
  },
  {
    label: 'Gestion des préconisations',
    route: 'preconisations',
    icon: 'preconisations',
    roles: []
  }
];

export const CLIENT_NAV_ITEMS: NavItem[] = [
  {
    label: 'Compte Client',
    route: 'compte-client',
    icon: 'clients',
    roles: ['admin']
  },
  {
    label: 'Registre de traitement',
    route: 'registre-traitement',
    icon: 'registre',
    roles: ['admin', 'client', 'user', 'superadmin']
  },
  {
    label: 'Gestion des préconisations',
    route: 'suivi-preconisations',
    icon: 'preconisations',
    roles: ['admin', 'user', 'client']
  },
  {
    label: 'Registre des demandes',
    route: 'registre-demandes',
    icon: 'demandes',
    roles: []
  },
  {
    label: 'Recueil de violation',
    route: 'recueil-violation',
    icon: 'violation',
    roles: []
  },
  {
    label: 'Sous-traitant DCP',
    route: 'sous-traitant-dcp',
    icon: 'sous-traitant',
    roles: []
  }
];
