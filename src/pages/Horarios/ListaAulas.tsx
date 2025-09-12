import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAulas } from '../../hooks/useAulas';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function ListaAulas() {
  const { aulas, loading } = useAulas();
  const [search, setSearch] = useState('');

  const filtered = aulas.filter(
    (a) =>
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.ubicacion.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Aulas</h2>
        <input
          type="text"
          placeholder="Buscar aula..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg"
        />
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState message="No se encontraron aulas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Aula</th>
                  <th className="px-4 py-2 border">Ubicación</th>
                  <th className="px-4 py-2 border">Capacidad</th>
                  <th className="px-4 py-2 border">Horario</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td className="border px-4 py-2">{a.nombre}</td>
                    <td className="border px-4 py-2">{a.ubicacion}</td>
                    <td className="border px-4 py-2">{a.capacidad}</td>
                    <td className="border px-4 py-2 text-center">
                      <Link
                        to={`/horarios/aula/${a.id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Ver horario
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
