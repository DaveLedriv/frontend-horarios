import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  tipo: string;
  creditos: number;
  plan_estudio_id: number;
}

export default function ListaMaterias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMaterias = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/materias`);
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
      await axios.delete(`${import.meta.env.VITE_API_URL}/materias/${id}`);
      await fetchMaterias(); // recarga
    } catch (err) {
      console.error('Error al eliminar materia:', err);
      alert('Ocurrió un error al eliminar la materia.');
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Materias Existentes</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="w-full bg-white text-sm shadow rounded">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">Código</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Créditos</th>
              <th className="px-4 py-2">Plan Estudio ID</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((m) => (
              <tr key={m.id} className="border-b">
                <td className="px-4 py-2">{m.codigo}</td>
                <td className="px-4 py-2">{m.nombre}</td>
                <td className="px-4 py-2">{m.tipo}</td>
                <td className="px-4 py-2">{m.creditos}</td>
                <td className="px-4 py-2">{m.plan_estudio_id}</td>
               <td className="px-4 py-2 space-x-2">
  <button
    onClick={() => navigate(`/materias/editar/${m.id}`)}
    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
  >
    📝 Editar
  </button>
  <button
    onClick={() => eliminarMateria(m.id)}
    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
  >
    🗑️ Eliminar
  </button>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}
