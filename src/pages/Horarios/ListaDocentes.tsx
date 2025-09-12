import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useDocentes } from '../../hooks/useDocentes';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function ListaDocentes() {
  const { docentes, loading } = useDocentes();
  const [search, setSearch] = useState('');

  const filtered = docentes.filter(
    (d) =>
      d.nombre.toLowerCase().includes(search.toLowerCase()) ||
      d.numero_empleado.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex space-x-4 mb-4">
          <Link
            to="/horarios"
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Aulas
          </Link>
          <Link
            to="/horarios/docentes"
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Docentes
          </Link>
        </div>
        <h2 className="text-2xl font-bold mb-4">Docentes</h2>
        <input
          type="text"
          placeholder="Buscar docente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg"
        />
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState message="No se encontraron docentes." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">Número</th>
                  <th className="px-4 py-2 border">Horario</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id}>
                    <td className="border px-4 py-2">{d.nombre}</td>
                    <td className="border px-4 py-2">{d.numero_empleado}</td>
                    <td className="border px-4 py-2 text-center">
                      <Link
                        to={`/horarios/docente/${d.id}`}
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

