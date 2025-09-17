import { http, HttpResponse } from 'msw';
import type {
  CategoryDistributionDatum,
  DashboardStats,
  TrendPoint,
} from '../../types/dashboard';

const statsResponse: DashboardStats = {
  totalUsers: 764,
  totalDocentes: 112,
  activeReservations: 218,
  averageOccupancy: 0.82,
  userGrowth: 6.4,
  docenteGrowth: 2.1,
  reservationGrowth: 4.7,
  occupancyGrowth: 1.3,
};

const userDistributionResponse: CategoryDistributionDatum[] = [
  { label: 'Estudiantes', value: 482 },
  { label: 'Docentes', value: 112 },
  { label: 'Administrativos', value: 54 },
  { label: 'Invitados', value: 37 },
];

const popularTimesResponse: CategoryDistributionDatum[] = [
  { label: '08:00 - 10:00', value: 62 },
  { label: '10:00 - 12:00', value: 88 },
  { label: '12:00 - 14:00', value: 73 },
  { label: '14:00 - 16:00', value: 41 },
  { label: '16:00 - 18:00', value: 28 },
];

const reservationTrendsResponse: TrendPoint[] = [
  { date: '2024-01-08', value: 18 },
  { date: '2024-01-15', value: 24 },
  { date: '2024-01-22', value: 27 },
  { date: '2024-01-29', value: 31 },
  { date: '2024-02-05', value: 29 },
  { date: '2024-02-12', value: 36 },
  { date: '2024-02-19', value: 42 },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const endpoint = (path: string) =>
  new URL(path, API_BASE_URL).toString();

export const dashboardHandlers = [
  http.get(endpoint('/dashboard/stats'), () => HttpResponse.json(statsResponse)),
  http.get('/dashboard/stats', () => HttpResponse.json(statsResponse)),
  http.get(endpoint('/dashboard/user-distribution'), () =>
    HttpResponse.json(userDistributionResponse),
  ),
  http.get('/dashboard/user-distribution', () =>
    HttpResponse.json(userDistributionResponse),
  ),
  http.get(endpoint('/dashboard/popular-times'), () =>
    HttpResponse.json(popularTimesResponse),
  ),
  http.get('/dashboard/popular-times', () => HttpResponse.json(popularTimesResponse)),
  http.get(endpoint('/dashboard/trends'), () =>
    HttpResponse.json(reservationTrendsResponse),
  ),
  http.get('/dashboard/trends', () => HttpResponse.json(reservationTrendsResponse)),
];
