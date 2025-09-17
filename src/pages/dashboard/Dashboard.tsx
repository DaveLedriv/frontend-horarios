import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import KpiCard from './components/KpiCard';
import api from '../../lib/api';
import { ClaseProgramada } from '../../types/ClaseProgramada';
import {
  getDayOrder,
  normalizeClasesResponse,
  normalizeDay,
  parseTimeToMinutes,
  toTimeLabel,
} from '../../utils/horarios';

interface DashboardSummary {
  docentes: number;
  materias: number;
  aulas: number;
  asignaciones: number;
  planes: number;
  facultades: number;
  clasesProgramadas: number;
}

interface UpcomingClassRow {
  id: number;
  dia: string;
  horario: string;
  materia: string;
  docente: string;
  aula: string;
}

const fallbackErrorMessage = 'No se pudieron cargar los datos del dashboard.';
const partialWarningMessage = 'Algunos datos no respondieron. Mostramos la información disponible.';

const requestLabels = [
  'docentes',
  'materias',
  'aulas',
  'asignaciones',
  'clases programadas',
  'planes de estudio',
  'facultades',
] as const;

type SettledAxios = PromiseSettledResult<{ data: unknown }>;

const extractArray = <T,>(result: SettledAxios): T[] => {
  if (result.status !== 'fulfilled') {
    return [];
  }

  const { data } = result.value;
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const candidates = ['results', 'items', 'data', 'value'];

    for (const key of candidates) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value as T[];
      }
    }
  }

  return [];
};

const sortClasses = (classes: ClaseProgramada[]) =>
  [...classes].sort((a, b) => {
    const dayDiff = getDayOrder(a.dia) - getDayOrder(b.dia);
    if (dayDiff !== 0) {
      return dayDiff;
    }

    return parseTimeToMinutes(a.hora_inicio) - parseTimeToMinutes(b.hora_inicio);
  });

const selectUpcomingClasses = (classes: ClaseProgramada[]) =>
  sortClasses(classes).slice(0, 8);

const formatTimeRange = (
  start: string | null | undefined,
  end: string | null | undefined,
): string => {
  const startLabel = toTimeLabel(start);
  const endLabel = toTimeLabel(end);

  if (!startLabel && !endLabel) {
    return 'Sin horario asignado';
  }
  if (!endLabel) {
    return `${startLabel} en adelante`;
  }
  if (!startLabel) {
    return `Hasta ${endLabel}`;
  }
  return `${startLabel} - ${endLabel}`;
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<ClaseProgramada[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [partialWarning, setPartialWarning] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setPartialWarning(false);

    const requests = [
      api.get('/docentes'),
      api.get('/materias'),
      api.get('/aulas'),
      api.get('/asignaciones'),
      api.get('/clases-programadas'),
      api.get('/planes-estudio'),
      api.get('/facultades'),
    ] as const;

    try {
      const results = (await Promise.allSettled(requests)) as SettledAxios[];

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Error al cargar ${requestLabels[index]}`, result.reason);
        }
      });

      const allFailed = results.every((res) => res.status === 'rejected');
      const someFailed = results.some((res) => res.status === 'rejected');

      if (allFailed) {
        setSummary(null);
        setUpcomingClasses([]);
        setError(fallbackErrorMessage);
        setPartialWarning(false);
        setLastUpdated(null);
        return;
      }

      const [docentesRes, materiasRes, aulasRes, asignacionesRes, clasesRes, planesRes, facultadesRes] = results;

      const docentes = extractArray(docentesRes);
      const materias = extractArray(materiasRes);
      const aulas = extractArray(aulasRes);
      const asignaciones = extractArray(asignacionesRes);
      const planes = extractArray(planesRes);
      const facultades = extractArray(facultadesRes);

      const clasesRaw =
        clasesRes.status === 'fulfilled'
          ? normalizeClasesResponse(clasesRes.value.data)
          : [];

      const sanitizedClasses = clasesRaw.filter((c) => c.dia && c.hora_inicio && c.hora_fin);
      const orderedClasses = selectUpcomingClasses(sanitizedClasses);

      setSummary({
        docentes: docentes.length,
        materias: materias.length,
        aulas: aulas.length,
        asignaciones: asignaciones.length,
        planes: planes.length,
        facultades: facultades.length,
        clasesProgramadas: sanitizedClasses.length,
      });
      setUpcomingClasses(orderedClasses);
      setError(null);
      setPartialWarning(someFailed);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error al cargar el dashboard', err);
      setSummary(null);
      setUpcomingClasses([]);
      setError(fallbackErrorMessage);
      setPartialWarning(false);
      setLastUpdated(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const headerSubtitle = useMemo(() => {
    if (!lastUpdated) {
      return 'Consulta el estado general de la plataforma en tiempo real.';
    }

    return `Última actualización: ${lastUpdated.toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })}`;
  }, [lastUpdated]);

  const metrics = useMemo(() => {
    if (!summary) {
      return [] as { key: string; title: string; value: number }[];
    }

    return [
      { key: 'docentes', title: 'Docentes registrados', value: summary.docentes },
      { key: 'materias', title: 'Materias activas', value: summary.materias },
      { key: 'asignaciones', title: 'Asignaciones creadas', value: summary.asignaciones },
      { key: 'clases', title: 'Clases programadas', value: summary.clasesProgramadas },
      { key: 'aulas', title: 'Aulas disponibles', value: summary.aulas },
      { key: 'planes', title: 'Planes de estudio', value: summary.planes },
      { key: 'facultades', title: 'Facultades registradas', value: summary.facultades },
    ];
  }, [summary]);

  const upcomingRows: UpcomingClassRow[] = useMemo(
    () =>
      upcomingClasses.map((clase) => ({
        id: clase.id,
        dia: normalizeDay(clase.dia) || 'Sin día',
        horario: formatTimeRange(clase.hora_inicio, clase.hora_fin),
        materia: clase.asignacion?.materia?.nombre ?? 'Sin materia',
        docente: clase.asignacion?.docente?.nombre ?? 'Sin docente',
        aula: clase.aula?.nombre ?? 'Sin aula',
      })),
    [upcomingClasses],
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
            {loading ? 'Actualizando…' : 'Actualizar datos'}
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

        {!error && partialWarning && (
          <div
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
          >
            {partialWarningMessage}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <KpiCard
              key={metric.key}
              title={metric.title}
              value={metric.value}
              isLoading={loading && !summary}
            />
          ))}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Próximas clases programadas</h2>
              <p className="text-sm text-gray-500">
                Vista rápida de los bloques registrados en la semana.
              </p>
            </div>
          </div>

          {loading && upcomingRows.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              Cargando información de las clases…
            </div>
          ) : upcomingRows.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              No hay clases programadas registradas.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Día</th>
                    <th className="px-4 py-3">Horario</th>
                    <th className="px-4 py-3">Materia</th>
                    <th className="px-4 py-3">Docente</th>
                    <th className="px-4 py-3">Aula</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {upcomingRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.dia}</td>
                      <td className="px-4 py-3 text-gray-700">{row.horario}</td>
                      <td className="px-4 py-3 text-gray-700">{row.materia}</td>
                      <td className="px-4 py-3 text-gray-700">{row.docente}</td>
                      <td className="px-4 py-3 text-gray-700">{row.aula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
