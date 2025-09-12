import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { ClaseProgramada } from '../../types/ClaseProgramada';
import { useDocentes } from '../../hooks/useDocentes';
import HorarioGrid from '../../components/Horarios/HorarioGrid';

interface HorarioDocenteResponse {
  docente_id: number;
  clases: ClaseProgramada[];
}

export default function HorariosPorDocente() {
  const { docenteId } = useParams();
  const { docentes } = useDocentes();
  const [clases, setClases] = useState<ClaseProgramada[]>([]);
  const navigate = useNavigate();

  const docente = docentes.find((d) => String(d.id) === docenteId);

  useEffect(() => {
    if (docenteId) {
      api
        .get<HorarioDocenteResponse>(`/horarios/docente/${docenteId}`)
        .then((res) => {
          const valid = res.data.clases.filter(
            (c) => c.hora_inicio && c.hora_fin && c.dia,
          );
          if (valid.length !== res.data.clases.length) {
            console.warn('Datos incompletos en la respuesta de horarios', res.data.clases);
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
  }, [docenteId]);

  const handleExport = async () => {
    if (!docenteId) return;
    try {
      const res = await api.get(`/horarios/docente/${docenteId}/excel`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `horario_docente_${docenteId}.xlsx`);
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
      const startStr = c.hora_inicio?.slice(0, 2);
      const endStr = c.hora_fin?.slice(0, 2);
      if (!c.dia || !startStr || !endStr) return;
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return;
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
            Horario de {docente ? docente.nombre : 'Docente'}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/horarios/docentes')}
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
