import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import axios from 'axios';

interface Asignacion {
  id: number;
  docente: { id: number; nombre: string };
  materia: { id: number; nombre: string };
}

export default function AsignacionesList() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAsignaciones = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/asignaciones`);
      setAsignaciones(res.data);
    } catch (err) {
      console.error('Error al cargar asignaciones:', err);
      alert('No se pudieron cargar las asignaciones.');
    } finally {
      setLoading(false);
    }
  };

  const eliminarAsignacion = async (id: number) => {
    const confirm = window.confirm('¿Estás seguro de eliminar esta asignación?');
    if (!confirm) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/asignaciones/${id}`);
      await fetchAsignaciones();
    } catch (err) {
      console.error('Error al eliminar asignación:', err);
      alert('No se pudo eliminar la asignación.');
    }
  };

  useEffect(() => {
    fetchAsignaciones();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Asignaciones</h2>
        <Link
          to="/asignaciones/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Nueva asignación
        </Link>
      </div>

      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : asignaciones.length === 0 ? (
        <p className="text-center">No hay asignaciones registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Docente</th>
                <th className="px-4 py-2 text-left">Materia</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2">{a.docente.nombre}</td>
                  <td className="px-4 py-2">{a.materia.nombre}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      to={`/asignaciones/editar/${a.id}`}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => eliminarAsignacion(a.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
