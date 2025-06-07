import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import axios from 'axios';

interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  tipo: string;
  creditos: number;
}

export default function MateriasPorPlan() {
  const { id } = useParams();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/planes-estudio/${id}/materias`);
        setMaterias(res.data.materias);
      } catch (err) {
        console.error('Error al cargar materias:', err);
        alert('No se pudieron cargar las materias.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, [id]);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Materias del Plan #{id}</h2>
        <Link
          to={`/materias/crear?plan=${id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Crear nueva materia
        </Link>
      </div>

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
              </tr>
            </thead>
            <tbody>
              {materias.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-2">{m.codigo}</td>
                  <td className="px-4 py-2">{m.nombre}</td>
                  <td className="px-4 py-2">{m.tipo}</td>
                  <td className="px-4 py-2">{m.creditos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
