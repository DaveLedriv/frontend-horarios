// src/pages/Materias/MateriasPorPlan.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import apiClient from '../../services/apiClient';
import axios from 'axios';
import { Materia } from '../../types/Materia';
import { useToast } from '../../hooks/useToast';

export default function MateriasPorPlan() {
  const { id } = useParams<{ id: string }>();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const fetchMaterias = async () => {
    try {
      const res = await apiClient.get(`/planes-estudio/${id}/materias`);
      setMaterias(res.data.materias);
    } catch (err) {
      console.error('Error al cargar materias:', err);
      showError('No se pudieron cargar las materias.');
    } finally {
      setLoading(false);
    }
  };

  const eliminarMateria = async (materiaId: number) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar esta materia?');
    if (!confirmar) return;

    try {
      await apiClient.delete(`/materias/${materiaId}`);
      await fetchMaterias();
      showSuccess('Materia eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar materia:', err);
      showError('No se pudo eliminar la materia.');
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, [id]);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/planes-estudio"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver a planes de estudio
        </Link>
        <div className="space-x-2">
          <Link
            to={`/materias/crear?plan=${id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Crear nueva materia
          </Link>
          <Link
            to={`/asignaciones/crear?plan=${id}`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
          >
            Asignar materia a docente
          </Link>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-center">Materias del Plan #{id}</h2>

      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : materias.length === 0 ? (
        <p className="text-center">No hay materias registradas para este plan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">Código</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Créditos</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materias.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-2">{m.codigo}</td>
                  <td className="px-4 py-2">{m.nombre}</td>
                  <td className="px-4 py-2">{m.tipo}</td>
                  <td className="px-4 py-2">{m.creditos}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      to={`/materias/editar/${m.id}`}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => eliminarMateria(m.id)}
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
