import { NavItem } from '../interfaces/navigation.interface';

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Clients',
    route: '/admin/clients',
    icon: 'clients',
    roles: ['admin']
  },
  {
    label: 'Administrateurs',
    route: '/admin/administrators',
    icon: 'administrators',
    roles: ['admin']
  },
  {
    label: 'Gestion des préconisations',
    route: '/admin/preconisations',
    icon: 'preconisations',
    roles: ['admin']
  }
];

export const CLIENT_NAV_ITEMS: NavItem[] = [
{
    label: 'Compte Client',
    route: '/client/compte-client',
    icon: 'clients',
    roles: ['client']
  },
  {
    label: 'Registre de traitement',
    route: 'client/registre-traitement',
    icon: 'registre',
    roles: ['client', 'user']
  },
  {
    label: 'Suivi des préconisations',
    route: 'client/suivi-preconisations',
    icon: 'suivi',
    roles: ['client', 'user']
  },
  {
    label: 'Registre des demandes',
    route: '/registre-demandes',
    icon: 'demandes',
    roles: ['client']
  },
  {
    label: 'Recueil de violation',
    route: '/recueil-violation',
    icon: 'violation',
    roles: ['client']
  },
  {
    label: 'Sous-traitant DCP',
    route: '/sous-traitant-dcp',
    icon: 'sous-traitant',
    roles: ['client']
  }
];