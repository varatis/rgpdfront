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

export interface PreconisationHistoryEntry {
  date: string;
  fields: string[];
  changes: string[];
  reason?: string;
}

export const PRECONISATION_HISTORY_TITLE = 'Historique des modifications';
const PRECONISATION_HISTORY_SEPARATOR = ' ; ';
const PRECONISATION_HISTORY_EMPTY = '—';

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
  fields: string[] = [],
  changes: string[] = [],
  date: Date = new Date(),
): string | null {
  const parsed = splitPreconisationCommentaire(commentaire);
  const noteText = note?.trim();

  if (!noteText && fields.length === 0 && changes.length === 0) {
    return buildPreconisationCommentaire(parsed.commentaire, parsed.historique);
  }

  const horodatage = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);

  const historyLine = [
    horodatage,
    `Champs modifiés: ${fields.length ? fields.join(PRECONISATION_HISTORY_SEPARATOR) : PRECONISATION_HISTORY_EMPTY}`,
    `Modification: ${changes.length ? changes.join(PRECONISATION_HISTORY_SEPARATOR) : PRECONISATION_HISTORY_EMPTY}`,
    `Motif de modifications: ${noteText || PRECONISATION_HISTORY_EMPTY}`,
  ].join(' || ');

  const nextHistory = [parsed.historique, historyLine]
    .filter(Boolean)
    .join('\n');

  return buildPreconisationCommentaire(parsed.commentaire, nextHistory);
}

export function parsePreconisationHistoriqueEntries(value?: string | null): PreconisationHistoryEntry[] {
  const historique = splitPreconisationCommentaire(value).historique?.trim();
  if (!historique) {
    return [];
  }

  return historique
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(parsePreconisationHistoryLine);
}

function parsePreconisationHistoryLine(line: string): PreconisationHistoryEntry {
  const structuredMatch = /^(?<date>\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})\s*\|\|\s*Champs modifiés:\s*(?<fields>.*?)\s*\|\|\s*Modification:\s*(?<changes>.*?)\s*\|\|\s*Motif de modifications:\s*(?<reason>.*)$/u.exec(line);
  if (structuredMatch?.groups) {
    return {
      date: structuredMatch.groups['date'],
      fields: splitHistorySection(structuredMatch.groups['fields']),
      changes: splitHistorySection(structuredMatch.groups['changes']),
      reason: normalizeHistorySection(structuredMatch.groups['reason']),
    };
  }

  const legacyMatch = /^(?<date>\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})\s*:\s*(?<reason>.*)$/u.exec(line);
  if (legacyMatch?.groups) {
    return {
      date: legacyMatch.groups['date'],
      fields: [],
      changes: [],
      reason: normalizeHistorySection(legacyMatch.groups['reason']),
    };
  }

  return {
    date: '—',
    fields: [],
    changes: [line],
  };
}

function splitHistorySection(value?: string | null): string[] {
  const normalized = normalizeHistorySection(value);
  if (!normalized) {
    return [];
  }

  return normalized.split(PRECONISATION_HISTORY_SEPARATOR).map(part => part.trim()).filter(Boolean);
}

function normalizeHistorySection(value?: string | null): string | undefined {
  const normalized = value?.trim();
  return !normalized || normalized === PRECONISATION_HISTORY_EMPTY ? undefined : normalized;
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
