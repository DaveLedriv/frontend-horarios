import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { ClaseProgramada } from '../../types/ClaseProgramada';
import { useDocentes } from '../../hooks/useDocentes';

export default function HorariosPorDocente() {
  const { docenteId } = useParams();
  const { docentes } = useDocentes();
  const [clases, setClases] = useState<ClaseProgramada[]>([]);

  const docente = docentes.find((d) => String(d.id) === docenteId);

  useEffect(() => {
    if (docenteId) {
      api
        .get(`/horarios/docente/${docenteId}`)
        .then((res) => setClases(res.data))
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Horario de {docente ? docente.nombre : 'Docente'}
          </h2>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Exportar Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Día</th>
                <th className="px-4 py-2 border">Hora inicio</th>
                <th className="px-4 py-2 border">Hora fin</th>
                <th className="px-4 py-2 border">Materia</th>
                <th className="px-4 py-2 border">Aula</th>
              </tr>
            </thead>
            <tbody>
              {clases.map((c) => (
                <tr key={c.id}>
                  <td className="border px-4 py-2">{c.dia}</td>
                  <td className="border px-4 py-2">{c.hora_inicio}</td>
                  <td className="border px-4 py-2">{c.hora_fin}</td>
                  <td className="border px-4 py-2">{c.asignacion.materia.nombre}</td>
                  <td className="border px-4 py-2">{c.aula.nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
