import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import Dashboard from './Dashboard';
import {
  getDashboardStats,
  getPopularTimes,
  getTrends,
  getUserDistribution,
} from '../../services/dashboardApi';

vi.mock('../../layouts/DashboardLayout', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

vi.mock('../../components/charts/UserDistributionChart', () => ({
  default: ({ data }: { data: unknown }) => (
    <div data-testid="user-distribution-chart">{JSON.stringify(data)}</div>
  ),
}));

vi.mock('../../components/charts/PopularTimesChart', () => ({
  default: ({ data }: { data: unknown }) => (
    <div data-testid="popular-times-chart">{JSON.stringify(data)}</div>
  ),
}));

vi.mock('../../components/charts/ReservationTrendsChart', () => ({
  default: ({ data }: { data: unknown }) => (
    <div data-testid="reservation-trends-chart">{JSON.stringify(data)}</div>
  ),
}));

vi.mock('../../services/dashboardApi');

type MockedService = ReturnType<typeof vi.fn>;

const mockedGetDashboardStats = getDashboardStats as unknown as MockedService;
const mockedGetUserDistribution = getUserDistribution as unknown as MockedService;
const mockedGetPopularTimes = getPopularTimes as unknown as MockedService;
const mockedGetTrends = getTrends as unknown as MockedService;

describe('Dashboard page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders stats and charts after loading data', async () => {
    mockedGetDashboardStats.mockResolvedValue({
      totalUsers: 150,
      totalDocentes: 42,
      activeReservations: 28,
      averageOccupancy: 0.78,
      userGrowth: 5.2,
      docenteGrowth: -1.8,
      reservationGrowth: 3.4,
      occupancyGrowth: 1.1,
    });
    mockedGetUserDistribution.mockResolvedValue([
      { label: 'Estudiantes', value: 65 },
      { label: 'Docentes', value: 35 },
    ]);
    mockedGetPopularTimes.mockResolvedValue([
      { label: '08:00 - 10:00', value: 18 },
      { label: '10:00 - 12:00', value: 22 },
    ]);
    mockedGetTrends.mockResolvedValue([
      { date: '2024-01-01', value: 10 },
      { date: '2024-01-02', value: 12 },
    ]);

    render(<Dashboard />);

    await waitFor(() => expect(mockedGetDashboardStats).toHaveBeenCalled());

    expect(screen.getByText('Usuarios registrados')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Docentes activos')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Reservas activas')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();
    expect(screen.getByText('Ocupación promedio')).toBeInTheDocument();
    expect(screen.getByText('78.0%')).toBeInTheDocument();

    expect(screen.getByText(/5\.2%/)).toBeInTheDocument();
    expect(screen.getByText(/1\.8%/)).toBeInTheDocument();

    expect(screen.getByTestId('user-distribution-chart').textContent).toContain(
      'Estudiantes',
    );
    expect(screen.getByTestId('popular-times-chart').textContent).toContain(
      '08:00 - 10:00',
    );
    expect(screen.getByTestId('reservation-trends-chart').textContent).toContain(
      '2024-01-01',
    );
  });

  it('shows an error message when data fetching fails', async () => {
    mockedGetDashboardStats.mockImplementation(() =>
      Promise.reject(new Error('network error')),
    );
    mockedGetUserDistribution.mockResolvedValue([]);
    mockedGetPopularTimes.mockResolvedValue([]);
    mockedGetTrends.mockResolvedValue([]);

    render(<Dashboard />);

    await waitFor(() => expect(mockedGetDashboardStats).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/network error/i),
    );
  });
});
