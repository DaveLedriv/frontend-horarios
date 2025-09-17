import { ClaseProgramada } from '../types/ClaseProgramada';

const dayNameMap: Record<string, string> = {
  '1': 'Lunes',
  '2': 'Martes',
  '3': 'Miércoles',
  '4': 'Jueves',
  '5': 'Viernes',
  '6': 'Sábado',
  '7': 'Domingo',
  lunes: 'Lunes',
  martes: 'Martes',
  miércoles: 'Miércoles',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sábado: 'Sábado',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

const dayOrderMap: Record<string, number> = {
  lunes: 1,
  martes: 2,
  miércoles: 3,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sábado: 6,
  sabado: 6,
  domingo: 7,
};

const classCollectionKeys = ['clases', 'horarios', 'results', 'items', 'data'];

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const hasScheduleFields = (record: Record<string, unknown>): boolean => {
  const dia = record.dia as string | number | null | undefined;
  const horaInicio = record.hora_inicio as string | null | undefined;
  const horaFin = record.hora_fin as string | null | undefined;

  const hasDay =
    dia !== undefined && dia !== null && String(dia).trim().length > 0;
  const hasStart =
    horaInicio !== undefined && horaInicio !== null && String(horaInicio).trim().length > 0;
  const hasEnd =
    horaFin !== undefined && horaFin !== null && String(horaFin).trim().length > 0;

  return hasDay && (hasStart || hasEnd);
};

const isClaseRecord = (value: unknown): value is Record<string, unknown> => {
  if (!isObject(value)) {
    return false;
  }

  if (hasScheduleFields(value)) {
    return true;
  }

  const asignacion = value.asignacion as Record<string, unknown> | null | undefined;
  const aula = value.aula as Record<string, unknown> | null | undefined;

  return Boolean(asignacion || aula);
};

const isNumericKeyMap = (record: Record<string, unknown>): boolean => {
  const keys = Object.keys(record);
  return keys.length > 0 && keys.every((key) => /^\d+$/u.test(key));
};

const toTwoDigits = (value?: string) => {
  const trimmed = value?.trim() ?? '';
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '00';
  if (digits.length >= 2) return digits.slice(0, 2);
  return digits.padStart(2, '0');
};

export const normalizeDay = (
  day: string | number | null | undefined,
): string => {
  if (day === null || day === undefined) return '';
  const original = String(day).trim();
  if (!original) return '';
  const mapped = dayNameMap[original.toLowerCase()];
  if (mapped) return mapped;
  if (original.length === 1 && /\d/.test(original)) {
    const byIndex = dayNameMap[original];
    if (byIndex) return byIndex;
  }
  return original;
};

export const normalizeTime = (
  time: string | null | undefined,
): string => {
  if (!time) return '';
  const trimmed = time.trim();
  if (!trimmed) return '';
  const [hoursRaw, minutesRaw, secondsRaw] = trimmed.split(':');
  const hours = toTwoDigits(hoursRaw);
  const minutes = toTwoDigits(minutesRaw);
  const seconds = toTwoDigits(secondsRaw);
  return `${hours}:${minutes}:${seconds}`;
};

const sanitizeDay = (day: string | number | null | undefined) => {
  const normalized = normalizeDay(day);
  if (normalized) {
    return normalized;
  }
  return day == null ? '' : String(day).trim();
};

const sanitizeTime = (time: string | null | undefined) => {
  const normalized = normalizeTime(time);
  return normalized || '';
};

export const toTimeLabel = (time: string | null | undefined): string => {
  const normalized = normalizeTime(time);
  return normalized ? normalized.slice(0, 5) : '';
};

export const getDayOrder = (
  day: string | number | null | undefined,
): number => {
  const normalized = normalizeDay(day);
  if (!normalized) return Number.POSITIVE_INFINITY;
  const key = normalized.toLowerCase();
  return dayOrderMap[key] ?? Number.POSITIVE_INFINITY;
};

export const parseTimeToMinutes = (
  time: string | null | undefined,
): number => {
  const normalized = normalizeTime(time);
  if (!normalized) return Number.POSITIVE_INFINITY;
  const [hoursStr, minutesStr] = normalized.split(':');
  const hours = Number.parseInt(hoursStr ?? '0', 10);
  const minutes = Number.parseInt(minutesStr ?? '0', 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Number.POSITIVE_INFINITY;
  }
  return hours * 60 + minutes;
};

const extractFirstArray = (value: unknown, visited = new WeakSet<object>()): unknown[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (!isObject(value)) {
    return [];
  }

  if (visited.has(value)) {
    return [];
  }
  visited.add(value);

  if (isClaseRecord(value)) {
    return [value];
  }

  if (isNumericKeyMap(value)) {
    const numericValues = Object.values(value);
    const claseValues = numericValues.filter(isClaseRecord);
    if (claseValues.length > 0) {
      return claseValues;
    }
  }

  for (const key of classCollectionKeys) {
    if (!(key in value)) continue;
    const nested = extractFirstArray(value[key], visited);
    if (nested.length > 0) {
      return nested;
    }
  }

  const directValues = Object.values(value);
  const claseValues = directValues.filter(isClaseRecord);
  if (claseValues.length > 0) {
    return claseValues;
  }

  for (const nested of directValues) {
    const result = extractFirstArray(nested, visited);
    if (result.length > 0) {
      return result;
    }
  }

  return [];
};

const sanitizeClase = (input: unknown): ClaseProgramada | null => {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const clase = input as ClaseProgramada;
  return {
    ...clase,
    dia: sanitizeDay((clase as { dia?: string | number | null }).dia ?? ''),
    hora_inicio: sanitizeTime((clase as { hora_inicio?: string | null }).hora_inicio ?? ''),
    hora_fin: sanitizeTime((clase as { hora_fin?: string | null }).hora_fin ?? ''),
  };
};

export type ClasesApiResponse =
  | ClaseProgramada[]
  | Record<string, unknown>
  | null
  | undefined;

export const normalizeClasesResponse = (
  data: unknown,
): ClaseProgramada[] => {
  if (!data) {
    return [];
  }

  const rawItems = extractFirstArray(data);

  if (rawItems.length === 0 && Array.isArray(data)) {
    rawItems.push(...data);
  }

  return rawItems
    .map(sanitizeClase)
    .filter((clase): clase is ClaseProgramada => Boolean(clase))
    .map((clase) => ({
      ...clase,
      dia: sanitizeDay(clase.dia),
      hora_inicio: sanitizeTime(clase.hora_inicio),
      hora_fin: sanitizeTime(clase.hora_fin),
    }));
};