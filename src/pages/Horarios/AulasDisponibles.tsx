import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../lib/api';
import { Aula } from '../../types/Aula';
import { useToast } from '../../hooks/useToast';

export default function AulasDisponibles() {
  const [filters, setFilters] = useState({ dia: '', hora_inicio: '', hora_fin: '' });
  const [aulas, setAulas] = useState<Aula[]>([]);
  const { showError } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.get('/aulas/disponibles', { params: filters });
      setAulas(res.data);
    } catch (error) {
      console.error('Error al buscar aulas disponibles', error);
      showError('No se pudieron cargar las aulas disponibles');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Aulas disponibles</h2>
        <form onSubmit={handleSearch} className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Día</label>
            <input
              type="text"
              name="dia"
              value={filters.dia}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              placeholder="Lunes"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hora inicio</label>
            <input
              type="time"
              name="hora_inicio"
              value={filters.hora_inicio}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hora fin</label>
            <input
              type="time"
              name="hora_fin"
              value={filters.hora_fin}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="col-span-3">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>
        </form>
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
              {aulas.map((a) => (
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
      </div>
    </DashboardLayout>
  );
}
