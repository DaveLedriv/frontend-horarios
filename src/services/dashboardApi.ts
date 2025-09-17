import api from '../lib/api';
import {
  CategoryDistributionDatum,
  DashboardStats,
  TrendPoint,
} from '../types/dashboard';

const DASHBOARD_ENDPOINTS = {
  stats: '/dashboard/stats',
  trends: '/dashboard/trends',
  userDistribution: '/dashboard/user-distribution',
  popularTimes: '/dashboard/popular-times',
} as const;

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isDashboardStats = (data: unknown): data is DashboardStats => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const record = data as Record<string, unknown>;
  const requiredFields: Array<keyof DashboardStats> = [
    'totalUsers',
    'totalDocentes',
    'activeReservations',
    'averageOccupancy',
  ];

  const optionalFields: Array<keyof DashboardStats> = [
    'userGrowth',
    'docenteGrowth',
    'reservationGrowth',
    'occupancyGrowth',
  ];

  const requiredValid = requiredFields.every((field) => isNumber(record[field]));

  const optionalValid = optionalFields.every((field) => {
    const value = record[field];
    return value === undefined || value === null || isNumber(value);
  });

  return requiredValid && optionalValid;
};

const isCategoryDistributionDatum = (
  value: unknown,
): value is CategoryDistributionDatum => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.label === 'string' && isNumber(record.value);
};

const isCategoryDistribution = (
  data: unknown,
): data is CategoryDistributionDatum[] =>
  Array.isArray(data) && data.every(isCategoryDistributionDatum);

const isTrendPoint = (value: unknown): value is TrendPoint => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.date === 'string' && isNumber(record.value);
};

const isTrendSeries = (data: unknown): data is TrendPoint[] =>
  Array.isArray(data) && data.every(isTrendPoint);

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<unknown>(DASHBOARD_ENDPOINTS.stats);
  if (!isDashboardStats(data)) {
    throw new Error('Respuesta inválida para las estadísticas del dashboard');
  }
  return data;
}

export async function getTrends(): Promise<TrendPoint[]> {
  const { data } = await api.get<unknown>(DASHBOARD_ENDPOINTS.trends);
  if (!isTrendSeries(data)) {
    throw new Error('Respuesta inválida para la tendencia de reservas');
  }
  return data;
}

export async function getUserDistribution(): Promise<CategoryDistributionDatum[]> {
  const { data } = await api.get<unknown>(DASHBOARD_ENDPOINTS.userDistribution);
  if (!isCategoryDistribution(data)) {
    throw new Error('Respuesta inválida para la distribución de usuarios');
  }
  return data;
}

export async function getPopularTimes(): Promise<CategoryDistributionDatum[]> {
  const { data } = await api.get<unknown>(DASHBOARD_ENDPOINTS.popularTimes);
  if (!isCategoryDistribution(data)) {
    throw new Error('Respuesta inválida para los horarios populares');
  }
  return data;
}

export const dashboardEndpoints = DASHBOARD_ENDPOINTS;
