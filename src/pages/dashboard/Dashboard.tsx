import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import ChartCard from './components/ChartCard';
import KpiCard from './components/KpiCard';
import UserDistributionChart from '../../components/charts/UserDistributionChart';
import PopularTimesChart from '../../components/charts/PopularTimesChart';
import ReservationTrendsChart from '../../components/charts/ReservationTrendsChart';
import {
  getDashboardStats,
  getPopularTimes,
  getTrends,
  getUserDistribution,
} from '../../services/dashboardApi';
import type {
  CategoryDistributionDatum,
  DashboardStats,
  TrendPoint,
} from '../../types/dashboard';

interface DashboardDataBundle {
  stats: DashboardStats;
  distribution: CategoryDistributionDatum[];
  popularTimes: CategoryDistributionDatum[];
  trends: TrendPoint[];
}

const percentageFormatter = (value: number | null) => {
  if (value === null) {
    return '—';
  }

  const normalized = value > 1 ? value : value * 100;
  return `${normalized.toFixed(1)}%`;
};

const fallbackErrorMessage = 'No se pudieron cargar los datos del dashboard.';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userDistribution, setUserDistribution] = useState<
    CategoryDistributionDatum[]
  >([]);
  const [popularTimes, setPopularTimes] = useState<
    CategoryDistributionDatum[]
  >([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async () => {
    const [statsResponse, distributionResponse, popularTimesResponse, trendResponse] =
      await Promise.all([
        getDashboardStats(),
        getUserDistribution(),
        getPopularTimes(),
        getTrends(),
      ]);

    const bundle: DashboardDataBundle = {
      stats: statsResponse,
      distribution: distributionResponse,
      popularTimes: popularTimesResponse,
      trends: trendResponse,
    };

    return bundle;
  }, []);

  const applyDashboardData = useCallback((bundle: DashboardDataBundle) => {
    setStats(bundle.stats);
    setUserDistribution(bundle.distribution);
    setPopularTimes(bundle.popularTimes);
    setTrends(bundle.trends);
    setLastUpdated(new Date());
  }, []);

  const handleError = useCallback((err: unknown) => {
    if (err && typeof err === 'object' && 'message' in err) {
      setError(String((err as { message?: unknown }).message || fallbackErrorMessage));
    } else {
      setError(fallbackErrorMessage);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchDashboardData();
        if (!isMounted) return;
        applyDashboardData(data);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        handleError(err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [applyDashboardData, fetchDashboardData, handleError]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const data = await fetchDashboardData();
      applyDashboardData(data);
      setError(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [applyDashboardData, fetchDashboardData, handleError]);

  const headerSubtitle = useMemo(() => {
    if (!lastUpdated) {
      return 'Consulta el estado general de la plataforma en tiempo real.';
    }

    return `Última actualización: ${lastUpdated.toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })}`;
  }, [lastUpdated]);

  const kpis = useMemo(
    () => [
      {
        title: 'Usuarios registrados',
        value: stats?.totalUsers ?? null,
        trend: stats?.userGrowth ?? null,
      },
      {
        title: 'Docentes activos',
        value: stats?.totalDocentes ?? null,
        trend: stats?.docenteGrowth ?? null,
      },
      {
        title: 'Reservas activas',
        value: stats?.activeReservations ?? null,
        trend: stats?.reservationGrowth ?? null,
      },
      {
        title: 'Ocupación promedio',
        value: stats?.averageOccupancy ?? null,
        trend: stats?.occupancyGrowth ?? null,
        formatter: percentageFormatter,
      },
    ],
    [stats],
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">{headerSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? 'Actualizando…' : 'Actualizar datos'}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              trend={kpi.trend ?? null}
              formatter={kpi.formatter}
              trendLabel="vs. periodo anterior"
              isLoading={loading && stats === null}
            />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <ChartCard
            title="Distribución de usuarios"
            description="Comparativo por perfiles académicos"
            isLoading={loading && userDistribution.length === 0}
          >
            <UserDistributionChart data={userDistribution} />
          </ChartCard>
          <ChartCard
            title="Horarios más solicitados"
            description="Tramos horarios con mayor demanda de reservas"
            isLoading={loading && popularTimes.length === 0}
          >
            <PopularTimesChart data={popularTimes} />
          </ChartCard>
          <ChartCard
            title="Tendencia de reservas"
            description="Evolución de reservas confirmadas por periodo"
            isLoading={loading && trends.length === 0}
          >
            <ReservationTrendsChart data={trends} />
          </ChartCard>
        </section>
      </div>
    </DashboardLayout>
  );
}
