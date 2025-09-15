import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { ClaseProgramada } from '../../types/ClaseProgramada';
import { useAulas } from '../../hooks/useAulas';
import HorarioGrid from '../../components/Horarios/HorarioGrid';

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
        .get<{ clases: ClaseProgramada[] }>(`/horarios/aula/${aulaId}`)
        .then((res) => {
          const valid = res.data.clases.filter(
            (c) =>
              c.hora_inicio &&
              c.hora_fin &&
              c.dia &&
              c.asignacion &&
              c.aula,
          );
          if (valid.length !== res.data.clases.length) {
            console.warn(
              'Datos incompletos en la respuesta de horarios',
              res.data.clases,
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
    if (!aulaId) return;
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
      const start = parseInt(normalizedStart.slice(0, 2), 10);
      const end = parseInt(normalizedEnd.slice(0, 2), 10);
      if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return;
      const rowSpan = end - start;
      const startKey = `${normalizedDay}-${normalizedStart}`;
      map[startKey] = { clase: c, rowSpan };
      for (let h = start + 1; h < end; h++) {
        const fillerKey = `${normalizedDay}-${normalizeTime(`${h}:00`)}`;
        map[fillerKey] = null;
      }
    });
    return map;
  }, [clases]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Horario de {aula ? aula.nombre : 'Aula'}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/horarios')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
            >
              Regresar
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Exportar Excel
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <HorarioGrid clases={clasesGrid} />
        </div>
      </div>
    </DashboardLayout>
  );
}
