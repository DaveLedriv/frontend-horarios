import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import apiClient from '../../services/apiClient';

interface PlanEstudio {
  id: number;
  nombre: string;
  clave: string;
  facultad_id: number;
}

export default function PlanesEstudioList() {
  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPlanes = async () => {
    try {
      const res = await apiClient.get('/planes-estudio');
      setPlanes(res.data);
    } catch (error) {
      console.error('Error al obtener planes de estudio:', error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarPlan = async (id: number) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este plan de estudio?');
    if (!confirmar) return;

    try {
      await apiClient.delete(`/planes-estudio/${id}`);
      await fetchPlanes();
    } catch (error) {
      console.error('Error al eliminar el plan:', error);
      alert('No se pudo eliminar el plan de estudio.');
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Planes de Estudio</h2>
        <Link
          to="/planes-estudio/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Nuevo plan de estudio
        </Link>
      </div>

      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : planes.length === 0 ? (
        <p className="text-center">No hay planes registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Clave</th>
                <th className="px-4 py-2 text-left">Facultad ID</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((plan) => (
                <tr key={plan.id} className="border-t">
                  <td className="px-4 py-2">{plan.nombre}</td>
                  <td className="px-4 py-2">{plan.clave}</td>
                  <td className="px-4 py-2">{plan.facultad_id}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      to={`/planes-estudio/editar/${plan.id}`}
                      className="inline-block bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition text-sm"
                    >
                      Editar
                    </Link>
                    <Link
  to={`/planes-estudio/${plan.id}/materias`}
  className="inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm"
>
  Ver materias
</Link>

                    <button
                      onClick={() => eliminarPlan(plan.id)}
                      className="inline-block bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
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
