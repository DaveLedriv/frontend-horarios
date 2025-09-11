import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Facultad } from '../../types/Facultad';

export default function FacultadesList() {
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFacultades = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/facultades`);
      setFacultades(res.data);
    } catch (error) {
      console.error('Error al obtener facultades:', error);
      alert('No se pudieron cargar las facultades.');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: number) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar esta facultad?');
    if (!confirmar) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/facultades/${id}`);
      await fetchFacultades(); // recargar la lista
    } catch (error) {
      console.error('Error al eliminar facultad:', error);
      alert('No se pudo eliminar la facultad.');
    }
  };

  useEffect(() => {
    fetchFacultades();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Facultades registradas</h2>
        <Link
          to="/facultades/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Nueva facultad
        </Link>
      </div>

      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : facultades.length === 0 ? (
        <p className="text-center">No hay facultades registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facultades.map((facultad) => (
                <tr key={facultad.id} className="border-t">
                  <td className="px-4 py-2">{facultad.nombre}</td>
                  <td className="px-4 py-2">{facultad.descripcion}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      to={`/facultades/editar/${facultad.id}`}
                      className="inline-block bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleEliminar(facultad.id)}
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
