import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../lib/api';
import {
  dashboardEndpoints,
  getDashboardStats,
  getPopularTimes,
  getTrends,
  getUserDistribution,
} from './dashboardApi';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

type GetMock = ReturnType<typeof vi.fn>;

const mockedGet = api.get as unknown as GetMock;

describe('dashboardApi', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('fetches dashboard stats', async () => {
    const stats = {
      totalUsers: 125,
      totalDocentes: 32,
      activeReservations: 58,
      averageOccupancy: 0.86,
    };

    mockedGet.mockResolvedValueOnce({ data: stats });

    const result = await getDashboardStats();

    expect(mockedGet).toHaveBeenCalledWith(dashboardEndpoints.stats);
    expect(result).toEqual(stats);
  });

  it('fetches trends data', async () => {
    const trends = [
      { date: '2024-01-01', value: 10 },
      { date: '2024-01-02', value: 12 },
    ];

    mockedGet.mockResolvedValueOnce({ data: trends });

    const result = await getTrends();

    expect(mockedGet).toHaveBeenCalledWith(dashboardEndpoints.trends);
    expect(result).toEqual(trends);
  });

  it('fetches user distribution', async () => {
    const distribution = [
      { label: 'Estudiantes', value: 65 },
      { label: 'Docentes', value: 35 },
    ];

    mockedGet.mockResolvedValueOnce({ data: distribution });

    const result = await getUserDistribution();

    expect(mockedGet).toHaveBeenCalledWith(dashboardEndpoints.userDistribution);
    expect(result).toEqual(distribution);
  });

  it('fetches popular times', async () => {
    const popularTimes = [
      { label: '08:00 - 10:00', value: 18 },
      { label: '10:00 - 12:00', value: 22 },
    ];

    mockedGet.mockResolvedValueOnce({ data: popularTimes });

    const result = await getPopularTimes();

    expect(mockedGet).toHaveBeenCalledWith(dashboardEndpoints.popularTimes);
    expect(result).toEqual(popularTimes);
  });
});
