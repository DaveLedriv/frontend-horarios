// src/pages/Asignaciones/AsignacionesPorDocente.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import apiClient from '../../services/apiClient';
import { useDocentes } from '../../hooks/useDocentes';

interface Asignacion {
  id: number;
  materia: { id: number; nombre: string };
  docente: { id: number; nombre: string };
}

export default function AsignacionesPorDocente() {
  const { docentes, loading: loadingDocentes } = useDocentes();
  const [docenteId, setDocenteId] = useState('');
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSelectDocente = async (id: string) => {
    setDocenteId(id);
    setLoading(true);
    try {
      const res = await apiClient.get(`/asignaciones/docente/${id}`);
      setAsignaciones(res.data);
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      alert('No se pudieron cargar las asignaciones del docente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-4">Asignaciones por Docente</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona un docente</label>
        <select
          value={docenteId}
          onChange={(e) => handleSelectDocente(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          disabled={loadingDocentes}
        >
          <option value="">Selecciona...</option>
          {docentes.map((docente) => (
            <option key={docente.id} value={docente.id}>
              {docente.nombre}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center">Cargando asignaciones...</p>
      ) : (
        asignaciones.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Materia</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asignaciones.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-4 py-2">{a.materia.nombre}</td>
                    <td className="px-4 py-2 space-x-2">
                      <Link
                        to={`/asignaciones/${a.id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm"
                      >
                        Ver detalle
                      </Link>
                      <Link
                        to={`/asignaciones/editar/${a.id}`}
                        className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition text-sm"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </DashboardLayout>
  );
}
