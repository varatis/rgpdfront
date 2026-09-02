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

interface ParsedPreconisationHistoryEntry extends PreconisationHistoryEntry {
  time?: number | null;
}

export const PRECONISATION_HISTORY_TITLE = 'Historique des modifications';
const PRECONISATION_HISTORY_SEPARATOR = ' ; ';
const PRECONISATION_HISTORY_EMPTY = '—';
const HISTORY_FIELDS_LABEL = 'Champs modifiés:';
const HISTORY_CHANGES_LABEL = 'Modification:';
const HISTORY_REASON_LABEL = 'Motif de modifications:';
const HISTORY_DATE_PREFIX = /^\d{2}\/\d{2}\/\d{4}(?:,\s*|\s+)\d{2}:\d{2}/u;

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

  const historyLine = [
    formatPreconisationHistoryDate(date),
    `${HISTORY_FIELDS_LABEL} ${fields.length ? fields.join(PRECONISATION_HISTORY_SEPARATOR) : PRECONISATION_HISTORY_EMPTY}`,
    `${HISTORY_CHANGES_LABEL} ${changes.length ? changes.join(PRECONISATION_HISTORY_SEPARATOR) : PRECONISATION_HISTORY_EMPTY}`,
    `${HISTORY_REASON_LABEL} ${noteText || PRECONISATION_HISTORY_EMPTY}`,
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

  return mergePreconisationHistoryEntries(
    groupPreconisationHistoryBlocks(historique).map(parsePreconisationHistoryBlock)
  ).map(({ time, ...entry }) => entry);
}

function groupPreconisationHistoryBlocks(historique: string): string[] {
  const lines = historique
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  return lines.reduce<string[]>((blocks, line) => {
    if (blocks.length === 0 || startsWithHistoryDate(line)) {
      blocks.push(line);
      return blocks;
    }

    blocks[blocks.length - 1] = `${blocks[blocks.length - 1]} || ${line}`;
    return blocks;
  }, []);
}

function parsePreconisationHistoryBlock(block: string): ParsedPreconisationHistoryEntry {
  if (block.includes('||')) {
    return parseStructuredPreconisationHistoryBlock(block);
  }

  const legacyAuthorMatch = /^(?<date>\d{2}\/\d{2}\/\d{4}(?:,\s*|\s+)\d{2}:\d{2})\s*[—-]\s*(?<author>.*?)\s*:\s*(?<reason>.*)$/u.exec(block);
  if (legacyAuthorMatch?.groups) {
    const date = normalizeHistoryDateText(legacyAuthorMatch.groups['date']);
    return {
      date,
      fields: [],
      changes: [],
      reason: normalizeHistorySection(legacyAuthorMatch.groups['reason']),
      time: toHistoryTimestamp(date),
    };
  }

  const legacyReasonMatch = /^(?<date>\d{2}\/\d{2}\/\d{4}(?:,\s*|\s+)\d{2}:\d{2})\s*:\s*(?<reason>.*)$/u.exec(block);
  if (legacyReasonMatch?.groups) {
    const date = normalizeHistoryDateText(legacyReasonMatch.groups['date']);
    return {
      date,
      fields: [],
      changes: [],
      reason: normalizeHistorySection(legacyReasonMatch.groups['reason']),
      time: toHistoryTimestamp(date),
    };
  }

  return {
    date: PRECONISATION_HISTORY_EMPTY,
    fields: [],
    changes: [block],
  };
}

function parseStructuredPreconisationHistoryBlock(block: string): ParsedPreconisationHistoryEntry {
  const segments = block.split('||').map(segment => segment.trim()).filter(Boolean);
  const firstSegment = segments.shift() ?? '';
  const { date, remainder } = extractHistoryDate(firstSegment);

  const entry: ParsedPreconisationHistoryEntry = {
    date: date ?? PRECONISATION_HISTORY_EMPTY,
    fields: [],
    changes: [],
    time: toHistoryTimestamp(date),
  };

  const extraSegments: string[] = [];
  const segmentsToParse = remainder ? [remainder, ...segments] : segments;

  segmentsToParse.forEach(segment => {
    if (segment.startsWith(HISTORY_FIELDS_LABEL)) {
      entry.fields = splitHistorySection(segment.slice(HISTORY_FIELDS_LABEL.length));
      return;
    }

    if (segment.startsWith(HISTORY_CHANGES_LABEL)) {
      entry.changes = splitHistorySection(segment.slice(HISTORY_CHANGES_LABEL.length));
      return;
    }

    if (segment.startsWith(HISTORY_REASON_LABEL)) {
      entry.reason = normalizeHistorySection(segment.slice(HISTORY_REASON_LABEL.length));
      return;
    }

    extraSegments.push(segment);
  });

  if (!entry.reason) {
    const fallbackReason = extraSegments.filter(segment => !isLikelyHistoryAuthor(segment)).join(' ');
    entry.reason = normalizeHistorySection(fallbackReason);
  }

  if (entry.fields.length === 0 && entry.changes.length === 0 && entry.reason && entry.date !== PRECONISATION_HISTORY_EMPTY) {
    return entry;
  }

  if (entry.fields.length === 0 && entry.changes.length === 0 && extraSegments.length > 0) {
    return {
      ...entry,
      changes: [extraSegments.join(' || ')],
    };
  }

  return entry;
}

function mergePreconisationHistoryEntries(
  entries: ParsedPreconisationHistoryEntry[],
): ParsedPreconisationHistoryEntry[] {
  const merged: ParsedPreconisationHistoryEntry[] = [];

  for (let index = 0; index < entries.length; index += 1) {
    const current = entries[index];
    const next = entries[index + 1];

    if (next && canMergePreconisationHistoryEntries(current, next)) {
      const detailEntry = hasPreconisationHistoryDetails(current) ? current : next;
      const reasonEntry = hasPreconisationHistoryDetails(current) ? next : current;

      merged.push({
        ...detailEntry,
        reason: detailEntry.reason ?? reasonEntry.reason,
      });
      index += 1;
      continue;
    }

    merged.push(current);
  }

  return merged;
}

function canMergePreconisationHistoryEntries(
  first: ParsedPreconisationHistoryEntry,
  second: ParsedPreconisationHistoryEntry,
): boolean {
  const firstHasDetails = hasPreconisationHistoryDetails(first);
  const secondHasDetails = hasPreconisationHistoryDetails(second);
  const firstReasonOnly = !firstHasDetails && !!first.reason;
  const secondReasonOnly = !secondHasDetails && !!second.reason;

  if (!((firstHasDetails && secondReasonOnly) || (secondHasDetails && firstReasonOnly))) {
    return false;
  }

  if (first.time == null || second.time == null) {
    return false;
  }

  return Math.abs(first.time - second.time) <= 60_000;
}

function hasPreconisationHistoryDetails(entry: ParsedPreconisationHistoryEntry): boolean {
  return entry.fields.length > 0 || entry.changes.length > 0;
}

function extractHistoryDate(segment: string): { date?: string; remainder?: string } {
  const match = /^(?<date>\d{2}\/\d{2}\/\d{4}(?:,\s*|\s+)\d{2}:\d{2})(?<remainder>.*)$/u.exec(segment.trim());
  if (!match?.groups) {
    return {};
  }

  return {
    date: normalizeHistoryDateText(match.groups['date']),
    remainder: match.groups['remainder'].trim().replace(/^[—:-]+\s*/u, '') || undefined,
  };
}

function startsWithHistoryDate(line: string): boolean {
  return HISTORY_DATE_PREFIX.test(line.trim());
}

function splitHistorySection(value?: string | null): string[] {
  const normalized = normalizeHistorySection(value);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(PRECONISATION_HISTORY_SEPARATOR)
    .map(part => part.trim())
    .filter(Boolean);
}

function normalizeHistorySection(value?: string | null): string | undefined {
  const normalized = value?.trim();
  return !normalized || normalized === PRECONISATION_HISTORY_EMPTY ? undefined : normalized;
}

function normalizeHistoryDateText(value?: string | null): string {
  const match = /^(?<day>\d{2})\/(?<month>\d{2})\/(?<year>\d{4})(?:,\s*|\s+)(?<hour>\d{2}):(?<minute>\d{2})$/u.exec(value?.trim() ?? '');
  if (!match?.groups) {
    return value?.trim() || PRECONISATION_HISTORY_EMPTY;
  }

  return `${match.groups['day']}/${match.groups['month']}/${match.groups['year']} ${match.groups['hour']}:${match.groups['minute']}`;
}

function toHistoryTimestamp(value?: string | null): number | null {
  const match = /^(?<day>\d{2})\/(?<month>\d{2})\/(?<year>\d{4})\s+(?<hour>\d{2}):(?<minute>\d{2})$/u.exec(normalizeHistoryDateText(value));
  if (!match?.groups) {
    return null;
  }

  const day = Number(match.groups['day']);
  const month = Number(match.groups['month']);
  const year = Number(match.groups['year']);
  const hour = Number(match.groups['hour']);
  const minute = Number(match.groups['minute']);
  const timestamp = new Date(year, month - 1, day, hour, minute).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

function formatPreconisationHistoryDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

function isLikelyHistoryAuthor(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) {
    return true;
  }

  return !normalized.includes(':') && !normalized.includes(' ') && normalized === normalized.toUpperCase();
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
