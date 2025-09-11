import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import apiClient from '../../services/apiClient';
import { useNavigate, Link } from 'react-router-dom';
import { Materia } from '../../types/Materia';
import { useToast } from '../../hooks/useToast';

export default function ListaMaterias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const fetchMaterias = async () => {
    try {
      const res = await apiClient.get('/materias');
      setMaterias(res.data);
    } catch (err) {
      console.error('Error al obtener materias:', err);
    } finally {
      setLoading(false);
    }
  };

  const eliminarMateria = async (id: number) => {
    const confirm = window.confirm('¿Estás seguro de eliminar esta materia?');
    if (!confirm) return;

    try {
      await apiClient.delete(`/materias/${id}`);
      await fetchMaterias(); // recarga sin refrescar la página
      showSuccess('Materia eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar materia:', err);
      showError('Ocurrió un error al eliminar la materia.');
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Materias registradas</h2>
        <Link
          to="/materias/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Nueva materia
        </Link>
      </div>

      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : materias.length === 0 ? (
        <p className="text-center">No hay materias registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Créditos</th>
                <th className="px-4 py-2 text-left">Plan Estudio ID</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materias.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-2">{m.codigo}</td>
                  <td className="px-4 py-2">{m.nombre}</td>
                  <td className="px-4 py-2">{m.tipo}</td>
                  <td className="px-4 py-2">{m.creditos}</td>
                  <td className="px-4 py-2">{m.plan_estudio_id}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      to={`/materias/editar/${m.id}`}
                      className="inline-block bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => eliminarMateria(m.id)}
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
