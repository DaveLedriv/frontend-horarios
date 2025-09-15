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

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>(DASHBOARD_ENDPOINTS.stats);
  return data;
}

export async function getTrends(): Promise<TrendPoint[]> {
  const { data } = await api.get<TrendPoint[]>(DASHBOARD_ENDPOINTS.trends);
  return data;
}

export async function getUserDistribution(): Promise<CategoryDistributionDatum[]> {
  const { data } = await api.get<CategoryDistributionDatum[]>(
    DASHBOARD_ENDPOINTS.userDistribution,
  );
  return data;
}

export async function getPopularTimes(): Promise<CategoryDistributionDatum[]> {
  const { data } = await api.get<CategoryDistributionDatum[]>(
    DASHBOARD_ENDPOINTS.popularTimes,
  );
  return data;
}

export const dashboardEndpoints = DASHBOARD_ENDPOINTS;
