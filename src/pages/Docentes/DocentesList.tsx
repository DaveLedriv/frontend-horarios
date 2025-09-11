import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import axios from 'axios';
import { Docente } from '../../types/Docente';
import { useToast } from '../../hooks/useToast';


export default function DocentesList() {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const fetchDocentes = async () => {
    try {
      const res = await api.get('/docentes');
      setDocentes(res.data);
    } catch (err) {
      console.error('Error al cargar docentes:', err);
      showError('No se pudieron cargar los docentes.');
    } finally {
      setLoading(false);
    }
  };

  const eliminarDocente = async (id: number) => {
    const confirm = window.confirm('¿Estás seguro de eliminar este docente?');
    if (!confirm) return;

    try {
      await api.delete(`/docentes/${id}`);
      await fetchDocentes();
      showSuccess('Docente eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar docente:', err);
      showError('No se pudo eliminar el docente.');
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Docentes</h2>
        <Link
          to="/docentes/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Nuevo docente
        </Link>
      </div>

      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : docentes.length === 0 ? (
        <p className="text-center">No hay docentes registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Correo</th>
                <th className="px-4 py-2">Número Empleado</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-2">{d.nombre}</td>
                  <td className="px-4 py-2">{d.correo}</td>
                  <td className="px-4 py-2">{d.numero_empleado}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      to={`/docentes/editar/${d.id}`}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition text-sm"
                    >
                      Editar
                    </Link>
                    <Link
                      to={`/asignaciones/docente/${d.id}`}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
                    >
                      Ver asignaciones
                    </Link>
                    <button
                      onClick={() => eliminarDocente(d.id)}
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
