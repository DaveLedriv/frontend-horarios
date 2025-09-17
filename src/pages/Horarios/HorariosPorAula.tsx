import { useEffect, useMemo, useState, type SVGProps } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { ClaseProgramada } from '../../types/ClaseProgramada';
import { useAulas } from '../../hooks/useAulas';
import HorarioGrid from '../../components/Horarios/HorarioGrid';
import {
  SLOT_DURATION_MINUTES,
  minutesToTimeKey,
  timeKeyToMinutes,
} from '../../components/Horarios/horarioUtils';
import {
  ClasesApiResponse,
  normalizeClasesResponse,
} from './normalizeClasesResponse';

const BackArrowIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      d="M7.75 4.75 3 9.5l4.75 4.75M3.75 9.5h13.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DownloadIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      d="M10 3.25v9.5m0 0 3.25-3.25M10 12.75 6.75 9.5M4.5 15.75h11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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

const toTwoDigits = (value?: string) => {
  const trimmed = value?.trim() ?? '';
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '00';
  if (digits.length >= 2) return digits.slice(0, 2);
  return digits.padStart(2, '0');
};

export const normalizeDay = (day: string | number | null | undefined): string => {
  if (day === null || day === undefined) return '';
  const original = String(day).trim();
  if (!original) return '';
  const mapped = dayNameMap[original.toLowerCase()];
  return mapped ?? original;
};

export const normalizeTime = (time: string | null | undefined): string => {
  if (!time) return '';
  const trimmed = time.trim();
  if (!trimmed) return '';
  const [hoursRaw, minutesRaw, secondsRaw] = trimmed.split(':');
  const hours = toTwoDigits(hoursRaw);
  const minutes = toTwoDigits(minutesRaw);
  const seconds = toTwoDigits(secondsRaw);
  return `${hours}:${minutes}:${seconds}`;
};

export default function HorariosPorAula() {
  const { aulaId } = useParams();
  const { aulas } = useAulas();
  const [clases, setClases] = useState<ClaseProgramada[]>([]);
  const navigate = useNavigate();

  const aula = aulas.find((a) => String(a.id) === aulaId);

  useEffect(() => {
    if (aulaId) {
      api
        .get<ClasesApiResponse>(`/horarios/aula/${aulaId}`)
        .then((res) => {
          const clasesResponse = normalizeClasesResponse(res.data);
          const valid = clasesResponse.filter(
            (c) =>
              c.hora_inicio &&
              c.hora_fin &&
              c.dia &&
              c.asignacion &&
              c.aula,
          );
          if (valid.length !== clasesResponse.length) {
            console.warn(
              'Datos incompletos en la respuesta de horarios',
              clasesResponse,
            );
            window.alert(
              'La API devolvió datos incompletos para algunas clases. Se omitieron entradas inválidas.',
            );
          }
          setClases(valid);
        })
        .catch((err) => {
          console.error('Error al cargar horarios:', err);
          setClases([]);
        });
    }
  }, [aulaId]);

  const handleExport = async () => {
    if (!aulaId || clases.length === 0) return;
    try {
      const res = await api.get(`/horarios/aula/${aulaId}/excel`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `horario_aula_${aulaId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al exportar a Excel', error);
    }
  };

  const clasesGrid = useMemo(() => {
    const map: Record<string, { clase: ClaseProgramada; rowSpan: number } | null> = {};
    clases.forEach((c) => {
      const normalizedDay = normalizeDay(c.dia);
      const normalizedStart = normalizeTime(c.hora_inicio);
      const normalizedEnd = normalizeTime(c.hora_fin);
      if (!normalizedDay || !normalizedStart || !normalizedEnd) return;

      const startMinutes = timeKeyToMinutes(normalizedStart);
      const endMinutes = timeKeyToMinutes(normalizedEnd);
      if (
        Number.isNaN(startMinutes) ||
        Number.isNaN(endMinutes) ||
        endMinutes <= startMinutes
      ) {
        return;
      }

      let rowSpan = 1;
      const startKey = `${normalizedDay}-${minutesToTimeKey(startMinutes)}`;

      for (
        let minutes = startMinutes + SLOT_DURATION_MINUTES;
        minutes < endMinutes;
        minutes += SLOT_DURATION_MINUTES
      ) {
        const fillerKey = `${normalizedDay}-${minutesToTimeKey(minutes)}`;
        map[fillerKey] = null;
        rowSpan += 1;
      }

      map[startKey] = { clase: c, rowSpan };
    });
    return map;
  }, [clases]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Horario de {aula ? aula.nombre : 'Aula'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/horarios')}
              type="button"
              aria-label="Regresar al listado de horarios"
              className="inline-flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              <BackArrowIcon className="h-4 w-4" />
              Regresar
            </button>
            <button
              onClick={handleExport}
              type="button"
              aria-label="Exportar horario del aula en Excel"
              disabled={clases.length === 0}
              className="inline-flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <DownloadIcon className="h-4 w-4" />
              Exportar Excel
            </button>
          </div>
        </div>
        {clases.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-center text-gray-500">
            No hay clases programadas para este horario.
          </div>
        ) : (
          <HorarioGrid clases={clasesGrid} />
        )}
      </div>
    </DashboardLayout>
  );
}
