import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { ClaseProgramada } from '../../types/ClaseProgramada';
import { useAulas } from '../../hooks/useAulas';
import HorarioGrid from '../../components/Horarios/HorarioGrid';

export default function HorariosPorAula() {
  const { aulaId } = useParams();
  const { aulas } = useAulas();
  const [clases, setClases] = useState<ClaseProgramada[]>([]);

  const aula = aulas.find((a) => String(a.id) === aulaId);

  useEffect(() => {
    if (aulaId) {
      api
        .get(`/horarios/aula/${aulaId}`)
        .then((res) => setClases(res.data))
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
      const start = parseInt(c.hora_inicio.slice(0, 2), 10);
      const end = parseInt(c.hora_fin.slice(0, 2), 10);
      const rowSpan = end - start;
      const startKey = `${c.dia}-${c.hora_inicio}`;
      map[startKey] = { clase: c, rowSpan };
      for (let h = start + 1; h < end; h++) {
        const fillerKey = `${c.dia}-${h.toString().padStart(2, '0')}:00:00`;
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
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Exportar Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <HorarioGrid clases={clasesGrid} />
        </div>
      </div>
    </DashboardLayout>
  );
}
