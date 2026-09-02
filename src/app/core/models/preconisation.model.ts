import { Client } from './client.model';

export type PreconisationSortField = 'libelle' | 'priorite' | 'complexite' | 'etatAvancement';

export interface Preconisation {
  identifiant: string;
  libelle: string;
  priorite?: string;
  prioriteLabel?: string;
  complexite?: string;
  complexiteLabel?: string;
  etatAvancement?: string;
  traitementIdentifiant?: string;
  traitementNom?: string;
  client?: Client;
}

/**
 * Payload attendu par les endpoints POST/PUT du back.
 *
 * Le client est résolu côté interface depuis le groupe Keycloak de
 * l'utilisateur connecté. Le rattachement à un traitement reste facultatif :
 * une préconisation peut être globale au client.
 */
export interface PreconisationWritePayload {
  identifiant?: string;
  libelle: string;
  explication?: string | null;
  risqueEncours?: string | null;
  contraintes?: string | null;
  cout?: string | null;
  priorite?: string | null;
  complexite?: string | null;
  commentaire?: string | null;
  etatAvancement?: string | null;
  client: Client;
  traitementIdentifiant?: string | null;
  traitementIdFonctionnel?: number | null;
  traitementNom?: string | null;
}

export interface PreconisationDetails extends Preconisation {
  explication?: string;
  risqueEncours?: string;
  contraintes?: string;
  cout?: string;
  commentaire?: string;
  traitementIdFonctionnel?: number;
}

export interface ParsedPreconisationCommentaire {
  commentaire?: string;
  historique?: string;
}

export const PRECONISATION_HISTORY_TITLE = 'Historique des modifications';

export function splitPreconisationCommentaire(value?: string | null): ParsedPreconisationCommentaire {
  const text = value?.trim();
  if (!text) {
    return {};
  }

  const marker = PRECONISATION_HISTORY_TITLE;
  const markerIndex = text.indexOf(marker);

  if (markerIndex === -1) {
    return { commentaire: text };
  }

  const commentaire = text.slice(0, markerIndex).trim();
  const historique = text.slice(markerIndex + marker.length).replace(/^[:\s-]+/, '').trim();

  return {
    commentaire: commentaire || undefined,
    historique: historique || undefined,
  };
}

export function buildPreconisationCommentaire(
  commentaire?: string | null,
  historique?: string | null,
): string | null {
  const commentText = commentaire?.trim() || '';
  const historyText = historique?.trim() || '';

  if (!commentText && !historyText) {
    return null;
  }

  if (!historyText) {
    return commentText || null;
  }

  return [commentText, `${PRECONISATION_HISTORY_TITLE} :\n${historyText}`]
    .filter(Boolean)
    .join('\n\n');
}

export function appendPreconisationHistorique(
  commentaire?: string | null,
  note?: string | null,
  auteur?: string | null,
  date: Date = new Date(),
): string | null {
  const parsed = splitPreconisationCommentaire(commentaire);
  const noteText = note?.trim();

  if (!noteText) {
    return buildPreconisationCommentaire(parsed.commentaire, parsed.historique);
  }

  const horodatage = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);

  const entry = [horodatage, auteur?.trim() || null]
    .filter(Boolean)
    .join(' — ');

  const nextHistory = [
    parsed.historique,
    entry ? `${entry} : ${noteText}` : noteText,
  ]
    .filter(Boolean)
    .join('\n');

  return buildPreconisationCommentaire(parsed.commentaire, nextHistory);
}

export function foldLabel(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function prioriteClass(priorite?: string | null): string {
  const normalized = foldLabel(priorite);
  if (!normalized) {
    return 'badge-info';
  }
  if (normalized.includes('tres urgent')) {
    return 'badge-danger';
  }
  if (normalized.includes('peu urgent') || normalized.includes('normal')) {
    return 'badge-info';
  }
  if (normalized.includes('urgent')) {
    return 'badge-alert';
  }
  return 'badge-info';
}

export function complexiteClass(complexite?: string | null): string {
  const normalized = foldLabel(complexite);
  if (!normalized) {
    return 'badge-info';
  }
  if (normalized.includes('tres simple') || (normalized.includes('simple') && !normalized.includes('complexe'))) {
    return 'badge-warning';
  }
  if (normalized.includes('moyen')) {
    return 'badge-alert';
  }
  if (normalized.includes('complexe')) {
    return 'badge-danger';
  }
  return 'badge-info';
}

export function avancementClass(etatAvancement?: string | null): string {
  const normalized = foldLabel(etatAvancement);
  if (!normalized) {
    return 'badge-info';
  }
  if (normalized.includes('realis') || normalized.includes('termin') || normalized === 'fait') {
    return 'badge-success';
  }
  if (normalized.includes('cours')) {
    return 'badge-alert';
  }
  return 'badge-info';
}

export function parseAvancementPercent(value?: string | null): number | null {
  if (!value) {
    return null;
  }
  const match = value.trim().match(/^(\d{1,3})\s*%?$/);
  if (!match) {
    return null;
  }
  const percent = Number(match[1]);
  return Number.isFinite(percent) && percent >= 0 && percent <= 100 ? percent : null;
}

export function displayValue(value?: string | number | null): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return String(value);
}

export function scaleLabel(value?: string | null): string {
  if (value == null || value === '') {
    return '—';
  }
  const stripped = value
    .normalize('NFKC')
    .replace(/^\s*\d+\s*[^\p{L}]+/u, '')
    .trim();
  return stripped || value.trim();
}
