// src/pages/docentes/DocentesList.tsx
import { Link } from 'react-router-dom';
import { useDocentes } from '../../hooks/useDocentes';
import DashboardLayout from '../../layouts/DashboardLayout';
import axios from 'axios';

export default function DocentesList() {
  const { docentes, loading } = useDocentes();

  const handleEliminar = async (id: number) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este docente?');
    if (!confirmar) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/docentes/${id}`);
      window.location.reload(); // O puedes refrescar desde el hook si prefieres
    } catch (error) {
      console.error('Error al eliminar docente:', error);
      alert('No se pudo eliminar el docente.');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Docentes registrados</h2>
        <Link
          to="/docentes/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
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
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">RFC</th>
                <th className="px-4 py-2 text-left">Correo</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map((docente) => (
                <tr key={docente.id} className="border-t">
                  <td className="px-4 py-2">{docente.nombre}</td>
                  <td className="px-4 py-2">{docente.rfc}</td>
                  <td className="px-4 py-2">{docente.correo}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      to={`/docentes/editar/${docente.id}`}
                      className="inline-block bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleEliminar(docente.id)}
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
